from typing import List, Annotated, Any
from pydantic import BaseModel, Field

class ContextRetrieverInput(BaseModel):
    """
    Input model for the `context_retriever` tool.
    """
    query: str = Field(
        ..., 
        description="User's query the `context_retriever` tool will use to perform semantic search over GroundX which contains Jomar's resume and curriculum vitae."
        )

class WeatherDataInput(BaseModel):
    """
    Input model for the weather tool.
    This model defines the required parameters for fetching weather data.
    """
    city: str = Field(..., description="The name of the city or town to get the weather for.")
    region: str = Field(..., description="The name of the province or region of the city to get the weather for.")
    country: str = Field(
        default="ph",
        description="The two letter country code (default is 'ph' for Philippines) to get the weather for."
    )

class RequestWeatherDataParams(BaseModel):
    latitude: Annotated[float, "Latitude coordinate of the location to get weather data for."]
    longitude: Annotated[float, "Longitude coordinate of the location to get weather data for."]
    hourly: List[str] = Field(default=["temperature_2m", "rain"], description="A list of weather variables which should be returned.")
    timezone: str = Field(default="auto", description="The timezone of the location to get weather data for.")
    weather_model: str = Field(default="jma_seamless", description="The weather model to use for in requesting weather data.")

class WeatherDataOutput(BaseModel):
    city: str
    region: str
    country: str
    currentTime: Any
    currentTemperature: float
    currentRain: float

class GithubProfileOutput(BaseModel):
    name: str
    username: str
    profile_url: str
    location: str
    bio: str
    num_repos: int
    repo: str

class GithubRepoOutput(BaseModel):
    repo_name: str
    repo_url: str
    file_name: str
    file_path: str
    file_content: str
    

class LinkedInProfileOutput(BaseModel):
    name: str
    profile_url: str
    location: str
    headline: str
    connections: str

class ContextRetrieverOutput(BaseModel):
    retrieved_context: str