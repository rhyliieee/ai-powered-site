import uvicorn
from fastapi import FastAPI, Request, Response, Security, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from contextlib import asynccontextmanager
from typing_extensions import Callable, AsyncGenerator
from dotenv import load_dotenv
import os
import json
import asyncio
import logging

from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, AIMessageChunk
from langgraph.graph.state import CompiledStateGraph

from agents.steve._types import ChatInput
from agents.steve.helper import CacheManager, visualize_graph
from agents.steve.config import STEVE_AGENT_API_KEYS

# LOAD ENVIRONMENT VARIABLES 
load_dotenv()

# INITIALIZE CACHE MANAGER
cache_manager = CacheManager()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_langgraph_app() -> CompiledStateGraph:
    """
    Import and initialize LangGraph application.
    This is separated to avoid circular imports and to allow for dynamic loading.
    """

    try:
        from agents.steve.graph import create_steve_graph
        
        # Create and return the graph
        return create_steve_graph()
    # except ImportError:
    #     # For development/testing, return a placeholder
    #     print("WARNING: Using mock LangGraph application!")
    except Exception as e:
        raise RuntimeError(f"---ERROR IN 'create_langgraph_app': {str(e)}---")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        cache_manager.set('compiled_steve_graph',create_langgraph_app())
        logging.info("LangGraph application initialized successfully.")
        yield 
    except Exception as e:
        logger.warning(f"Failed to initialize LangGraph application: {e}")
        yield 

# INITIALIZE FASTAPI APPLICATION
app = FastAPI(
    title="Steve Agent API",
    description="API for the Steve LangGraph Agent with streaming capabilities.",
    version="1.0.0",
    lifespan=lifespan
)

# SECURITY HEADERS MIDDLEWARE
@app.middleware("https")
async def add_security_headers(request: Request, call_next: Callable) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CONFIGURE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API KEY SECURITY
API_KEY_NAME = "RHYLIIEEE-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

# CONFIGURE DEFAULT OR ALLOWED API KEYS
API_KEYS = STEVE_AGENT_API_KEYS

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header in API_KEYS:
        return api_key_header
    raise HTTPException(
        status_code=403,
        detail="INVALID API KEY"
    )

# DEFINE ROOT ENDPOINT
@app.get("/ai")
def root(api_key: str = Depends(get_api_key)):
    return {"Welcome": "You are now inside Rhyliieee's AI API."}

@app.get("/ai/steve/v1/health")
async def health_check(api_key: str = Depends(get_api_key)):
    """Health check endpoint"""
    return {"status": "ok", "agent_initialized": cache_manager.has("compiled_steve_graph")}

async def generate_response_nostream(message: str, thread_id: str):
    """
    Generator function to stream responses from Steve agent.
    Each yielded item is a JSON string followed by a newline, suitable for SSE or NDJSON.
    """
    steve_graph: CompiledStateGraph = cache_manager.get("compiled_steve_graph")
    
    if steve_graph is None:
        logger.warning("Steve Agent Graph not initialized.")
        yield json.dumps({
            "type": "error",
            "content": "Steve Agent not initialized."
        }) + "\n"
        return
    
    visualize_graph(steve_graph.get_graph().draw_mermaid_png())
    
    config = {"configurable": {"thread_id": thread_id}}
    
    # Set initial message to Steve
    input_messages = [HumanMessage(content=message)]
    
    try:
        # Stream updates from the graph, including custom events
        async for event in steve_graph.astream(
            {"messages": input_messages}, 
            config, 
            stream_mode=["updates", "custom"]
        ):
            # logger.info(f"Event type: {type(event)}\n\n Received event: {event}\n\n")
            if isinstance(event, tuple) and len(event) == 2:
                key, value = event

                if key == "custom":
                    # logger.info(f"Yielding custom event: {value}\n")
                    # Custom events from nodes (e.g., tool outputs, final responses) using get_stream_writer()
                    yield json.dumps(value) + "\n"
                elif key == "updates":
                    logger.info(f"Yielding state update events: {value}\n")
                    # Block that captures state updates.
                    if "result" in value and value.get("result") is not None:
                        # Captures the final plain text response if not already sent by custom
                        yield json.dumps({"type": "final_response", "content": value.get("result")}) + "\n"
                    # Example: if you want to stream node transitions for debugging/UI
                    # if isinstance(value, dict) and len(value) == 1:
                    #     node_name = list(value.keys())[0]
                    #     yield json.dumps({"type": "node_transition", "node": node_name}) + "\n"
            else:
                logger.warning("Direct yield tool output.")    
        
        # Log full graph state for debugging
        logger.info(f"\n\nFull Graph State: \n{steve_graph.get_state(config)}\n\n")             
                    
    except Exception as e:
        logger.info(f"Error during streaming: {e}", exc_info=True)
        yield json.dumps({"type": "error", "content": f"An error occurred: {str(e)}"}) + "\n"
        
@app.post("/ai/steve/v1/chat/no-stream")
async def chat_stream_endpoint(request: Request, chat_input: ChatInput, api_key: str = Depends(get_api_key)):
    """
    API endpoint for streaming chat responses from Steve Agent.
    The response will be newline-delimited JSON (NDJSON).
    """
    logger.info(f"Received chat request for thread_id: {chat_input.thread_id}")
    return StreamingResponse(
        generate_response_nostream(chat_input.message, chat_input.thread_id),
        media_type="application/x-ndjson"
    )
    
async def generate_response_stream_with_tokens(message: str, thread_id: str) -> AsyncGenerator[str, None]:
    """
    Generator function to stream LLM tokens and other events from the Steve agent.
    This uses astream_events to get more granular updates, including raw LLM tokens.
    """
    steve_graph: CompiledStateGraph = cache_manager.get("compiled_steve_graph")

    if steve_graph is None:
        logger.warning("Steve Agent Graph not initialized.")
        yield json.dumps({"type": "error", "content": "Steve Agent not initialized."}) + "\n"
        return

    config = {"configurable": {"thread_id": thread_id}}
    input_messages = [HumanMessage(content=message)]

    try:
        # Invoke the graph to get the final state
        async for msg_type, value in steve_graph.astream(
            {"messages": input_messages},
            config,
            stream_mode=["messages", "custom"]
        ):
            
            if msg_type == "messages":
                chunk, metadata = value
                
                if isinstance(chunk, AIMessageChunk) and chunk.content:
                    # Stream LLM tokens as they are generated
                    
                    logger.info(f"Yielding token chunk: {chunk.content}\n and Metadata: {metadata}\n\n")
                    yield json.dumps({
                        "type": "token",
                        "content": chunk.content
                    }) + "\n"
            
            elif msg_type == "custom":
                # Custom events from nodes (e.g., tool outputs, final responses)
                logger.info(f"Yielding custom event: {value}\n")
                yield json.dumps(value) + "\n"
                
    except Exception as e:
        logger.error(f"Error during token streaming: {e}", exc_info=True)
        yield json.dumps({"type": "error", "content": f"An error occurred: {str(e)}"}) + "\n"

@app.post("/ai/steve/v1/chat/stream-tokens")
async def chat_stream_tokens_endpoint(request: Request, chat_input: ChatInput, api_key: str = Depends(get_api_key)):
    """
    API endpoint for streaming granular events, including LLM tokens,
    tool usage, and custom events from Steve Agent.
    """
    logger.info(f"Received token stream request for thread_id: {chat_input.thread_id}")
    return StreamingResponse(
        generate_response_stream_with_tokens(chat_input.message, chat_input.thread_id),
        media_type="application/x-ndjson"
    )

# @app.post("/ai/steve/v1/chat")
# async def chat_endpoint(chat_input: ChatInput, api_key: str = Depends(get_api_key)):
#     """
#     API endpoint for non-streaming chat requests to Steve Agent.
#     Returns the final response as a JSON object.
#     """
#     logger.info(f"Received non-streaming chat request for thread_id: {chat_input.thread_id}")
    
#     steve_graph: CompiledStateGraph = cache_manager.get("compiled_steve_graph")
    
#     if steve_graph is None:
#         logger.warning("Steve Agent Graph not initialized for non-streaming request.")
#         raise HTTPException(
#             status_code=503,
#             detail="Steve Agent not initialized. Please try again later."
#         )
    
#     config = {"configurable": {"thread_id": chat_input.thread_id}}
#     input_messages = [HumanMessage(content=chat_input.message)]
    
#     try:
#         # Invoke the graph to get the final state
#         async for events in steve_graph.astream(
#             {"messages": input_messages},
#             config,
#             stream_mode=["messages", "custom"]
#         ):
            
#             if isinstance(events, tuple) and len(events) == 2:
#                 key, value = events

#                 if key == "custom":
#                     logger.info(f"Yielding custom event: {value}\n")
#                     # Custom events from nodes (e.g., tool outputs, final responses) using get_stream_writer()
#                     yield json.dumps(value) + "\n"
#                 elif key == "messages":
#                     logger.info(f"Yielding Messages event: {value}\n")
#                     msg, metadata = key
                    
#                     if msg.content and (metadata["langgraph_node"] == "should_invoke_tools" or metadata["langgraph_node"] == "route_after_tools"):
#                         yield json.dumps({
#                             "type": "final_response",
#                             "content": msg.content,
#                             "metadata": metadata
#                         })
#             else:
#                 logger.warning("Direct yield tool output.")    
        
#     except Exception as e:
#         logger.error(f"Error during non-streaming chat: {e}", exc_info=True)
#         raise HTTPException(
#             status_code=500,
#             detail=f"An error occurred during processing: {str(e)}"
#         )

# ERROR HANDLER FOR INVALID API KEYS
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    ) 

def run_server() -> None:
    """Runs the FastAPI server."""
    
    logger.info("Running FastAPI server...")
    # Run the FastAPI server using uvicorn
    uvicorn.run(
        app="agents.steve.endpoint:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
    