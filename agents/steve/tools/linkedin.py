from langchain_core.tools import tool
import logging
from agents.steve.tools._types import LinkedInProfileOutput

# Initialize logger
logger = logging.getLogger(__name__)

# Placeholder for linkedin details
LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jomar-talambayan-52730227a/"
LINKEDIN_NAME = "Jomar Talambayan"
LINKEDIN_LOCATION = "Santa Cruz, Laguna, Philippines"
LINKEDIN_HEADLINE = "Generative AI Engineer | Building Smarter AI for Healthcare and Beyond"
LINKEDIN_CONNECTIONS = "152 connections"

@tool("linkedin-profile")
def linkedin_profile(username: str = LINKEDIN_NAME) -> LinkedInProfileOutput:
    """
    Get LinkedIn profile details of Jomar Talambayan.
    
    Returns:
        dict: A dictionary containing LinkedIn profile details.
    """
    logger.info("Returning fetched LinkedIn data.")
    
    return LinkedInProfileOutput(
        name = username if username != "" else LINKEDIN_NAME,
        profile_url = LINKEDIN_PROFILE_URL,
        location = LINKEDIN_LOCATION,
        headline = LINKEDIN_HEADLINE,
        connections = LINKEDIN_CONNECTIONS
    )
    
    # return {
    #     "name": username if username != "" else LINKEDIN_NAME,
    #     "profile_url": LINKEDIN_PROFILE_URL,
    #     "location": LINKEDIN_LOCATION,
    #     "headline": LINKEDIN_HEADLINE,
    #     "connections": LINKEDIN_CONNECTIONS
    # }

if __name__ == "__main__":
    print(linkedin_profile.invoke(""))