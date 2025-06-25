import logging
from pathlib import Path
import os
import re
import requests
from http.client import HTTPConnection
from urllib.parse import urlencode
import pandas as pd
from groundx import GroundX
import openmeteo_requests
import requests_cache
from retry_requests import retry
from typing import Dict, Any, Literal
from agents.steve.tools._types import RequestWeatherDataParams
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSerializable
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
import yaml
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
OPENROUTER_BASE_URL= "https://openrouter.ai/api/v1"
DEEPSEEK_MODEL_NAME = "deepseek/deepseek-chat-v3-0324:free"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# DEFINE GEOCODE API KEY
GEOCODE_API_KEY = os.getenv("GEOCODE_API_KEY")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Initialize logger
logger = logging.getLogger(__name__)

class RequestWeatherData:
    DEFAULT_CACHE_EXPIRY = 3600
    DEFAULT_RETRIES = 5
    DEFAULT_BACKOFF_FACTOR = 0.2
    API_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, cache_expiry: int = DEFAULT_CACHE_EXPIRY,
                 retries: int = DEFAULT_RETRIES,
                 backoff_factor: float = DEFAULT_BACKOFF_FACTOR):
        self.cache_session = requests_cache.CachedSession('.cache', expire_after=cache_expiry)
        self.retry_session = retry(self.cache_session, retries=retries, backoff_factor=backoff_factor)
        self.openmeteo_client = openmeteo_requests.Client(session=self.retry_session)
        self.url = self.API_URL
    
    def request_data(self, params: RequestWeatherDataParams) -> Dict[str, Any]:
        if not params:
            raise ValueError("Failed to request Weather Data. Check parameter value, and try again.")
        
        try:
            client_responses = self.openmeteo_client.weather_api(self.url, params=params.model_dump())
            
            if not client_responses or not client_responses[0]:
                logger.error("Weather API did not return any valid data in the client_responses list.")
                raise ValueError("Weather API did not return any data.")
            
            requested_data = client_responses[0]
            hourly_weather_data = requested_data.Hourly()
            
            # Extract timezone information and coordinates from the API response
            api_timezone_bytes = requested_data.Timezone()
            api_timezone_str = api_timezone_bytes.decode('utf-8')
            latitude = requested_data.Latitude()
            longitude = requested_data.Longitude()
            
            logger.info(f"API forecast timezone: {api_timezone_str}")
            
            # Ensure hourly data exist
            if not hourly_weather_data:
                logger.error("Hourly weather data object is empty.")
                raise ValueError("Hourly weather data not found in the response.")
            
            hourly_temperature = hourly_weather_data.Variables(0).ValuesAsNumpy()
            hourly_rain = hourly_weather_data.Variables(1).ValuesAsNumpy()
            
            # Ensure temperature and rain arrays are not empty before creating DataFrame
            if hourly_temperature.size == 0 or hourly_rain.size == 0:
                logger.error("Temperature or rain data is empty after API call.")
                raise ValueError("Missing hourly temperature or rain data in the response.")
            
            hourly_data = {"date": pd.date_range(
                    start = pd.to_datetime(hourly_weather_data.Time(), unit = "s", utc = True),
                    end = pd.to_datetime(hourly_weather_data.TimeEnd(), unit = "s", utc = True),
                    freq = pd.Timedelta(seconds = hourly_weather_data.Interval()),
                    inclusive = "left"
                ),
                "temperature": hourly_temperature,
                "rain": hourly_rain
            }
           
            hourly_dataframe = pd.DataFrame(data = hourly_data)
            # print(f"Hourly Data: {hourly_dataframe[:30]}")
            
            # --- Logic to get current day and time forecast ---
            # 1. Get current time in local system timezone (not necessarily UTC)
            local_system_now = pd.Timestamp.now()

            # 2. Convert current local system time to the API's forecast timezone
            try:
                # Localize the current system time to the API's specific timezone
                current_time_in_api_tz = local_system_now.tz_localize(api_timezone_str, ambiguous=True, nonexistent='shift_forward')
            except Exception as e:
                logger.warning(f"Failed to localize current time to API timezone '{api_timezone_str}'. Falling back to UTC comparison. Error: {e}")
                # Fallback to UTC if timezone localization fails
                current_time_in_api_tz = pd.Timestamp.now(tz='UTC')
            
            # Filter for forecast entries that are on or before this aligned current time
            relevant_forecasts = hourly_dataframe[hourly_dataframe['date'] <= current_time_in_api_tz]

            if relevant_forecasts.empty:
                logger.warning(
                    f"No forecast data found for current or past hours relative to {current_time_in_api_tz}. "
                    "This might happen if the current time is before the start of the forecast. "
                    "Returning the very first forecast point available."
                )
                if not hourly_dataframe.empty:
                    selected_forecast = hourly_dataframe.iloc[0]
                else:
                    raise ValueError("No hourly forecast data available at all to select from.")
            else:
                selected_forecast = relevant_forecasts.iloc[-1]
            
            # Convert the UTC timestamp to the API's local timezone for display
            display_time = selected_forecast['date'].tz_convert(api_timezone_str)
            
            #str(selected_forecast['date'])
            return {
                "currentTime": str(display_time),
                "currentTemperature": round(float(selected_forecast['temperature']), 3), 
                "currentRain": round(float(selected_forecast['rain']), 3),
                "latitude": latitude,
                "longitude": longitude
            }
        except IndexError as ie:
            logger.error(f"IndexError when processing weather data. This might mean unexpected data structure or missing variables. Error: {ie}", exc_info=True)
            raise ValueError(f"Failed to parse weather data structure: {ie}") from ie
        except Exception as e:
            raise Exception(f"An error occured during Weather Request Data: {str(e)}")


class GroundXClient:
    def __init__(self, api_key: str, bucket_id: int) -> GroundX:
        """Initialize GroundX client.

        Args:
            api_key (str): GroundX api key
            bucket_id (int): GroundX bucket id

        Returns:
            GroundX: GroundX client to use the groundx api and perform semantic search.
        """
        if not api_key or not bucket_id:
            logger.error("GroundX API key or Bucket ID is not provided.")
        
        self.bucket_id = bucket_id
        self.groundx_client = GroundX(api_key=api_key)
        logger.info("GroundX Client Initialized.")
        
    def _semantic_search(self, query: str, top_k: int = 10) -> str:
        """Perform semantic search based on the provided query on GroundX 
        and return Jomar's relevant information.

        Args:
            query (str): The query that will be used to perform semantic search.
            top_k (int, optional): Number of top documents to include as context. Defaults to 10.

        Returns:
            str: Semantically retrieved context to support an answer.
        """
        
        context = self.groundx_client.search.content(
            query=query,
            id=self.bucket_id,
            n=top_k
        )
        
        if not context:
            logger.warning("No context retrieved from GroundX")
            return "No context retrieved from GroundX which supports the current query."
        
        logger.info("Context successfully retrieved from GroundX.")
        
        cleaned_context = _context_cleaner(context.search.text)
        return cleaned_context
    
def _context_cleaner(context: str) -> str:
    """Removes specific sentences from context using regex.

    Args:
        context (str): The context to clean.

    Returns:
        str: The cleaned context.
    """
    
    # Regex to match and remove "Retrieved Context: The following text excerpts" until "pdf':"
    cleaned_string = re.sub(r"Retrieved Context: The following text excerpts.*?pdf':\s*", "", context, flags=re.DOTALL)
    
    # Regex to match and remove "Text excerpt from page" until the first ":"
    cleaned_string = re.sub(r"Text excerpt from page.*?:", "", cleaned_string)
    
    # Regex to match and remove "LU:AA-FO-61" until the first newline
    cleaned_string = re.sub(r"LU:AA-FO-61.*?\n", "", cleaned_string)
    
    # This regex looks for 3 or more newline characters and replaces them with two.
    cleaned_string = re.sub(r"\n{3,}", "\n\n", cleaned_string)
    
    return cleaned_string.strip()

def _request_geocode_location(latitude: float, longitude: float) -> Dict[str, Any]:
    
    logging.info(f"Requesting Geocode Location of {latitude}, {longitude}")
    geocode_url = f"https://geocode.maps.co/reverse?lat={latitude}&lon={longitude}&api_key={GEOCODE_API_KEY}"

    geocode_response = requests.get(geocode_url)
    
    if not geocode_response.ok:
        logger.error(f"Geocode API request failed: {geocode_response.status_code} - {geocode_response.text}")
        raise ValueError("Failed to fetch geocode data.")
    
    logger.info("Geocode API successfully fetched data.")
    geocode_response_json = geocode_response.json()
    return geocode_response_json
    
def _request_geocode_coordinates(location: str, country: str = "Philippines") -> Dict[str, Any]:
     
    logging.info(f"Requesting Geocode Coordinates of {location}.")
    geocode_url = f"https://geocode.maps.co/search?q={location}, {country}&api_key={GEOCODE_API_KEY}"
        
    geocode_response = requests.get(geocode_url)
    
    if not geocode_response.ok:
        logger.error(f"Geocode API request failed: {geocode_response.status_code} - {geocode_response.text}")
        raise ValueError("Failed to fetch geocode data.")
    
    logger.info("Geocode API successfully fetched data.")
    geocode_response_json = geocode_response.json()
        
    return geocode_response_json[0]

# FUNCTION TO LOAD PROMPTS
def load_prompts(path: Path) -> dict:
    """Load prompts from a yaml file.

    Args:
        path (Path): Path to `prompts.yaml`

    Returns:
        dict: Prompt Name - Prompt Value pair
    
        example output:
            {"sys_prompt" : "You are a helpful agent."}
    """
    with open(path, 'r') as file:
        prompts = yaml.safe_load(file)
    
    logger.info(f"---PROMPTS LOADED FROM {path}---")
    return prompts

def _create_github_repo_agent(model: Literal["mistral", "deepseek", "gemini-2.0"] = "deepseek") -> RunnableSerializable:
    
    # Load and set prompts 
    prompts = load_prompts(Path("agents/steve/prompts.yaml"))    
    
    # Load the memory prompt
    github_repo_agent_sys_prompt = prompts["steve_github_repo_agent_sys_prompt"]
    github_repo_agent_prompt = ChatPromptTemplate.from_messages([
        ("system", github_repo_agent_sys_prompt)
    ])
    
    # Load the LLM for github repo agent
    github_repo_agent = ChatOpenAI(
        api_key=OPENROUTER_API_KEY,
        model=DEEPSEEK_MODEL_NAME,
        base_url=OPENROUTER_BASE_URL,
        temperature=0
    )
    logger.info("---DEEPSEEK V3 LOADED AS LLM FOR MEMORY---")
    
    # Chain the prompt and the LLM
    steve_github_repo_agent = github_repo_agent_prompt | github_repo_agent | StrOutputParser()
    
    return steve_github_repo_agent  

if __name__ == "__main__":
    # params = RequestWeatherDataParams(
    #     latitude=14.6042,
    #     longitude=120.9822
    # )

    # weather_data_client = RequestWeatherData().request_data(params=params)
    # print(weather_data_client)
    
    latitude = 14.6760
    longitude = 121.0437
    location = "Davao, City, Davao del Sur"
    location = _request_geocode_coordinates(location=location)
    print(location)