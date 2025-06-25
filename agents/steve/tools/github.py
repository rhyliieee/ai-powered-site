import os
from dotenv import load_dotenv
import requests
import base64 # for decoding github content
from langgraph.config import get_stream_writer
from langchain_core.tools import tool
import logging
from agents.steve.tools._types import GithubProfileOutput, GithubRepoOutput
from agents.steve.tools._utils import _create_github_repo_agent

# Load environment variables
load_dotenv()

# Initialize logger
logger = logging.getLogger(__name__)

# Constants for github details
GITHUB_PROFILE_URL = "https://github.com/rhyliieee"
GITHUB_USERNAME = "rhyliieee"
GITHUB_NAME = "Jomar Talambayan"
LOCATION = "Laguna, Philippines"
GITHUB_NUM_REPOS = 7
GITHUB_REPO = "https://github.com/rhyliieee?tab=repositories"
GITHUB_BIO = "Generative AI Engineer | Building Smarter AI for Healthcare and Beyond"

FEATURED_REPO_NAMES = ["JobJigSaw", "JobJigSaw-Lark", "Eyomn"]
GET_REPO_CONTENT_ENDPOINT = """https://api.github.com/repos/{USERNAME}/{REPO}/contents/{PATH}"""
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


@tool("github-profile")
def github_profile(username: str = GITHUB_USERNAME) -> GithubProfileOutput:
    """
    Get Github profile details of Jomar Talambayan.
    
    Returns:
        dict: A dictionary containing Github profile details.
    """
    logger.info("Returning fetched Github data.")
    return GithubProfileOutput(
        name = GITHUB_NAME,
        username = username,
        profile_url = GITHUB_PROFILE_URL,
        location = LOCATION,
        bio = GITHUB_BIO,
        num_repos = GITHUB_NUM_REPOS,
        repo = GITHUB_REPO
    )

@tool("github-repo", return_direct=True)
def github_repo(query: str) -> str:
    """
    Get comprehensive answer to a query about Jomar Talambayan's featured Github repositories.  

    Args:
        query (str): The query to ask the agent about Jomar's featured Github repositories.

    Returns:
        str: The agent's response to the query.
    """
    
    # Create the github repo agent
    github_repo_agent = _create_github_repo_agent()
    
    # Invoke the agent
    agent_response = github_repo_agent.invoke({
        "$query": query
    })
    
    logger.info(f"Github Repository Agent Responded.")
    
    return agent_response

# @tool("github-repo", return_direct=True)
# def github_repo(username: str = GITHUB_USERNAME) -> Union[List[GithubRepoOutput], str]:
#     """
#     Get the README.md content of featured github repositories of Jomar Talambayan.

#     Args:
#         username (str, optional): The username of Jomar Talambayan's Github profile. Defaults to GITHUB_USERNAME.

#     Raises:
#         ValueError: If the GITHUB_TOKEN secret is missing.

#     Returns:
#         Union[List[GithubRepoOutput], str]: A list of dictionaries containing the content of featured repositories. If an error occurs, returns an error message.
#     """
#     if not os.environ.get("GITHUB_TOKEN"):
#         raise ValueError("Missing GITHUB_TOKEN secret.")

#     headers = {
#         "Accept": "application/vnd.github+json",
#         "Authorization": f"Bearer {GITHUB_TOKEN}",
#         "X-GitHub-Api-Version": "2022-11-28",
#     }
    
#     # Placeholder for API responses
#     featured_repo_contents = []

#     for repo in FEATURED_REPO_NAMES:
#         url = GET_REPO_CONTENT_ENDPOINT.format(
#             USERNAME=username, REPO=repo, PATH="README.md"
#         )
        
#         try:
#             response = requests.get(url, headers=headers)
#             response.raise_for_status()
#             repo_data = response.json()
                    
#             # Retrieve the content of the repo
#             encoded_content = repo_data.get("content")
            
#             # Encode the content to bytes
#             encoded_bytes = encoded_content.encode('utf-8')
            
#             # Decode the content from base64 to a string
#             decoded_bytes = base64.b64decode(encoded_bytes)
            
#             # Convert bytes to string
#             decoded_content = decoded_bytes.decode('utf-8')
                        
#             repo_content = {
#                 "repo_name": repo,
#                 "repo_url": repo_data.get("html_url"),
#                 "file_name": repo_data.get("name"),
#                 "file_path": repo_data.get("path"),
#                 "file_content": decoded_content
#             }
            
#             featured_repo_contents.append(GithubRepoOutput(**repo_content))
#         except requests.exceptions.RequestException as err:
#             logger.warning(f"Error fetching repository {repo}: {err}")
#             return "There was an error fetching the repository. Please check the owner and repo names."

#     logger.info(f"{len(featured_repo_contents)} Featured Repository Contents Retrieved.")
#     return featured_repo_contents

if __name__ == "__main__":
    params = {
        # "username": "rhyliieee",
        "query": "Provide a comprehensive summary of Jomar's featured repos."
    }
    # gh_data = github_profile.invoke(params)
    repo_data = github_repo.invoke(params)
    print(repo_data)