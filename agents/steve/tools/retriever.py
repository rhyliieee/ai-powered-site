import os
from dotenv import load_dotenv
from langchain_core.tools import tool
from agents.steve.tools._utils import GroundXClient
from agents.steve.tools._types import ContextRetrieverInput, ContextRetrieverOutput
import logging

# Load Environment Variables
load_dotenv()

# Initialize Logger
logger = logging.getLogger(__name__)

# Initialized GroundXClient
groundx_api_key = os.getenv("GROUNDX_API_KEY")
groundx_bucket_id = os.getenv("GROUNDX_BUCKET_ID")
groundx_client = GroundXClient(api_key=groundx_api_key, bucket_id=groundx_bucket_id)

@tool("context-retriever", args_schema=ContextRetrieverInput)
def context_retriever(query: str) -> ContextRetrieverOutput:
    """
    Tool to perform semantic search over Jomar's resume and curriculum vitae based on the user's query.

    Args:
        query (str): The user's question or query about Jomar.

    Returns:
        str: Relevant information to provide context to answer the user's query.
    """
    
    logger.info("---Using the `context-retriever` tool.---")
    retrieved_context = groundx_client._semantic_search(query=query)
    
    return ContextRetrieverOutput(retrieved_context=retrieved_context)

if __name__ == "__main__":
    query = "Tell me about Jomar's technical experience, especially in AI related tasks."
    context = context_retriever.invoke({"query": query})
    print(f"\n\nRetrieved Context: {context}")
    