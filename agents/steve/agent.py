import logging
from agents.steve.helper import CacheManager, load_prompts
from agents.steve.config import (
    PROMPTS_PATH, 
    MISTRAL_API_KEY, 
    GOOGLE_API_KEY, 
    GEMINI_2POINT5_MODEL, 
    GEMINI_2POINT0_MODEL,
    MISTRAL_MODEL_NAME,
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    DEEPSEEK_MODEL_NAME
)
from agents.steve.tools.linkedin import linkedin_profile
from agents.steve.tools.github import github_profile, github_repo
from agents.steve.tools.retriever import context_retriever
from agents.steve.tools.weather import weather_data
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSerializable
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_mistralai import ChatMistralAI
from langchain_google_genai import ChatGoogleGenerativeAI

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Initialize Logger
logger = logging.getLogger(__name__)

# Initialize CacheManager
cache_manager = CacheManager()

# Create Steve Agent
def create_steve_agent(model: Literal["mistral", "gemini-2.5", "gemini-2.0", "gemma", "deepseek"] = "gemini-2.0") -> RunnableSerializable:
    
    # Load and set prompts if not in cache
    if not cache_manager.has("prompts"):
        cache_manager.set("prompts", load_prompts(PROMPTS_PATH))
    
    # Initialize prompts
    steve_agent_sys_prompt = cache_manager.get("prompts")["steve_sys_prompt"]
    steve_agent_human_prompt = cache_manager.get("prompts")["steve_human_prompt"]
            
    if not cache_manager.has("steve_prompt"):
        # Attach prompts to a prompt template
        cache_manager.set(
            "steve_prompt", 
            ChatPromptTemplate.from_messages
            (
                [
                    ("system", steve_agent_sys_prompt),
                    ("human", steve_agent_human_prompt)
                ]
            )    
        )
    
    steve_prompt = cache_manager.get("steve_prompt")
    
    # Initialize LLM
    if model == "mistral":
        steve_llm = ChatMistralAI(
            api_key=MISTRAL_API_KEY,
            model=MISTRAL_MODEL_NAME
        )
        logger.info("---MISTRAL LARGE LOADED AS LLM FOR STEVE---")
    elif model == "deepseek":
        steve_llm = ChatOpenAI(
            api_key=OPENROUTER_API_KEY,
            model=DEEPSEEK_MODEL_NAME,
            base_url=OPENROUTER_BASE_URL
        )
        logger.info("---DEEPSEEK V3 LOADED AS LLM FOR STEVE---")
    else:
        GEMINI_MODEL_NAME = GEMINI_2POINT5_MODEL if model == "gemini-2.5" else GEMINI_2POINT0_MODEL 
                
        steve_llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL_NAME,
                api_key=GOOGLE_API_KEY,
                temperature=0.2
            )
        logger.info(f"---{model.upper()} FLASH LOADED AS LLM FOR STEVE---")
    
    # Compile the tools
    tools_list = [linkedin_profile, github_profile, github_repo, context_retriever, weather_data]
    
    try:
        # Bind tools with steve_llm
        steve_llm_with_tools = steve_llm.bind_tools(tools_list)
        
        # Chain the prompt with steve
        steve_agent_chain = steve_prompt | steve_llm_with_tools
        
        logger.info("Steve Agent Chained!")
        
        return steve_agent_chain
    except Exception as e:
        logger.error("An error occured in `create_steve_agent`.")
        raise RuntimeError(f"Error in `create_steve_agent`: {str(e)}")

# Create Memory Agent
def create_memory_agent(
    model: Literal["mistral", "deepseek", "gemini-2.0"] = "mistral",
    prompt_type: Literal["steve_memory_agent_sys_prompt_default", "steve_memory_agent_sys_prompt_new"] = "steve_memory_agent_sys_prompt_default"
) -> RunnableSerializable:
    
    # Load and set prompts if not in cache
    if not cache_manager.has("prompts"):
        cache_manager.set("prompts", load_prompts(PROMPTS_PATH))
    
    # Load the memory prompt
    steve_memory_agent_sys_prompt = cache_manager.get("prompts")[prompt_type]
    steve_memory_prompt = ChatPromptTemplate.from_messages([
        ("system", steve_memory_agent_sys_prompt)
    ])
    
    # Load the LLM for steve memory agent
    if model == "mistral":
        memory_agent = ChatMistralAI(
        api_key=MISTRAL_API_KEY,
        model=MISTRAL_MODEL_NAME,
        temperature=0
    )
        logger.info("---MISTRAL LARGE LOADED AS LLM FOR MEMORY---")
    
    elif model == "deepseek":
        memory_agent = ChatOpenAI(
            api_key=OPENROUTER_API_KEY,
            model=DEEPSEEK_MODEL_NAME,
            base_url=OPENROUTER_BASE_URL,
            temperature=0
        )
        logger.info("---DEEPSEEK V3 LOADED AS LLM FOR MEMORY---")
    else:
        memory_agent = ChatGoogleGenerativeAI(
                model=GEMINI_2POINT0_MODEL,
                api_key=GOOGLE_API_KEY,
                temperature=0
            )
        logger.info(f"---GEMINI 2.0 FLASH LOADED AS LLM FOR STEVE---")
    
    # Chain the prompt and the LLM
    steve_memory_agent = steve_memory_prompt | memory_agent | StrOutputParser()
    
    return steve_memory_agent




if __name__ == "__main__":
    steve_agent = create_steve_agent()
    # steve_agent_response = steve_agent.invoke({
    #     "$query": "Hello! How are you?",
    #     "$memory": "No memory available.",
    #     "$context": "No context available."
    # })
    # print(f"\n\nRaw Response: {steve_agent_response}\n\n")
    steve_prompt = cache_manager.get("steve_prompt")
    print(
        steve_prompt.invoke({
        "$query": "Can you share Jomar professional experience?",
        "$context": "",
        "$memory": ""
        })
    )
    