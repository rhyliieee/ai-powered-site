import os
import logging
import requests
from dotenv import load_dotenv
from langchain_core.tools import tool
from agents.steve.tools._utils import RequestWeatherData, _request_geocode_coordinates, _request_geocode_location
from agents.steve.tools._types import RequestWeatherDataParams, WeatherDataInput, WeatherDataOutput

# Initialize logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# DEFINE GEOCODE API KEY
GEOCODE_API_KEY = os.getenv("GEOCODE_API_KEY")

@tool("weather-data", args_schema=WeatherDataInput, return_direct=True)
def weather_data(city: str, region: str, country: str = "ph") -> WeatherDataOutput:
    """
    Get the current weather data for a specified city and province.

    Args:
        city (str): The name of the city or town to get the weather for.
        region (str): The name of the province or region of the city to get the weather for.
        country (str, optional): The two letter country code to get the weather for. Defaults to 'ph'.

    Returns:
        dict: A dictionary containing the current weather data for the specified location.
    """
        
    # Extract Lat and Long data from response
    geocode_data_coordinates = _request_geocode_coordinates(location=f"{city}, {region}", country=country)
    latt = geocode_data_coordinates["lat"]
    longt = geocode_data_coordinates["lon"]
    request_weather_params = RequestWeatherDataParams(
        latitude=float(latt),
        longitude=float(longt)
    )
    
    requested_weather_data = RequestWeatherData().request_data(params=request_weather_params)
    
    location_latt = requested_weather_data["latitude"]
    location_longt = requested_weather_data["longitude"]
    geocode_data_location = _request_geocode_location(latitude=location_latt, longitude=location_longt)
    
    geocode_address = geocode_data_location["address"]
    
    requested_weather_data["city"] = city
    requested_weather_data["region"] = geocode_address.get("state") if geocode_address.get("state") else geocode_address.get("region")
    requested_weather_data["country"] = country
    
    return WeatherDataOutput(**requested_weather_data)
 

if __name__ == "__main__":
    request_params = {
        "location": "Cainta, Rizal",
        "country": "ph"
    }
    weather_data_response = weather_data.invoke(request_params)
    print(weather_data_response)