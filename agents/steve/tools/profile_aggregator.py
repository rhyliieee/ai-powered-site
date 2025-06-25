from pydantic import BaseModel, Field
from typing import Optional
from langchain_core.tools import tool
import logging

from github import github_profile 
from weather import weather_data
from linkedin import linkedin_profile

# Initialize Logging
logger = logging.getLogger(__name__)

class ProfileAggregatorInput(BaseModel):
    github_username: Optional[str] = Field(default="rhyliieee", description="The GitHub username. Defaults to your pre-configured username if not provided.")
    linkedin_username: Optional[str] = Field(default="", description="The LinkedIn username (default: 'Jomar Talambayan').")

@tool("profile-aggregator", args_schema=ProfileAggregatorInput, return_direct=True)
def profile_aggregator(
    github_username: str = "rhyliieee",
    linkedin_username: str = "Jomar Talambayan",
) -> dict:
    """Aggregates GitHub and LinkedIn information for a profile card."""
    
    profile_data = {}

    try:
        gh_data_result = github_profile.invoke({"username": github_username}) # Simplified: assumes username can be repo for user profile page
        if isinstance(gh_data_result, str): # Error occurred
             profile_data["github_data"] = {"error": gh_data_result, "username": github_username}
        else:
             profile_data["github_data"] = {**gh_data_result, "username": github_username}

    except Exception as e:
        profile_data["github_data"] = {"error": str(e), "username": github_username}

    try:
        linkedin_data_result = linkedin_profile.invoke({"username": linkedin_username})
        if isinstance(linkedin_data_result, str):
            profile_data["linkedin_data"] = {"error": linkedin_data_result}
        else:
            profile_data["linkedin_data"] = linkedin_data_result
    except Exception as e:
        profile_data["linkedin_data"] = {"error": str(e), "username": linkedin_username}
        
    return profile_data

if __name__ == "__main__":
    params = {
        "city": "Santa Cruz"
    }
    profile_data = profile_aggregator.invoke("")
    print(profile_data)