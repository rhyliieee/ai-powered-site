from typing import TypedDict, Optional, List, Annotated, Any
from pydantic import BaseModel
import logging
from datetime import datetime

from langchain_core.messages import HumanMessage, AIMessage, RemoveMessage, ToolMessage, AnyMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import START, END, StateGraph, add_messages
from langgraph.config import get_stream_writer
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph
from langchain_core.runnables import RunnableSerializable
from langchain_mistralai import ChatMistralAI

from agents.steve.agent import create_steve_agent, create_memory_agent
from agents.steve.tools.linkedin import linkedin_profile
from agents.steve.tools.github import github_profile, github_repo
from agents.steve.tools.retriever import context_retriever
from agents.steve.tools.weather import weather_data
from agents.steve.helper import CacheManager, visualize_graph

# Configure basic logging
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

class GenerativeUIState(TypedDict, total=False):
    input: Annotated[str, "Visitor's query."]
    messages: Annotated[Optional[list[AnyMessage]], add_messages]
    summary: Annotated[Optional[str], "Conversation summary of the current session."]
    retrieved_context: Annotated[Optional[str], "Retrieved relevant info to help answer the current query."]
    result: Annotated[Optional[str], "Plain text response of Steve if no tool was used."]
    # tool_calls: Annotated[Optional[List[dict]], "List of parsed tool calls."]
    # tool_result: Annotated[Optional[dict], "Result of a tool call."]

def summarization_node(state: GenerativeUIState) -> GenerativeUIState:
    
    try:
        # Get existing summary and messages
        summary = state.get("summary")
        messages_state: list = state.get("messages")
        
        messages = [m for m in messages_state if not isinstance(m, ToolMessage)]
        
        if messages and len(messages) > 6 and not isinstance(messages[-1], HumanMessage):
            
            logger.info("Preparing messages for Summarization.")
            
            # Obtain last 4 messages
            # last_four_message = messages[-4:]
            
            logger.info(f"Messages to be summarized: {messages}")
            
            # Load and set memory_agent if not in cache
            if not cache_manager.has("steve_memory_agent"):
                cache_manager.set("steve_memory_agent", create_memory_agent(model="gemini-2.0"))
            
            if summary:
                steve_memory_agent: RunnableSerializable = cache_manager.get("steve_memory_agent")
                new_summary = steve_memory_agent.invoke({
                    "$summary": summary,
                    "$messages": messages
                })
                
            else:
                steve_memory_agent: RunnableSerializable = create_memory_agent(model="gemini-2.0", prompt_type="steve_memory_agent_sys_prompt_new")
                new_summary = steve_memory_agent.invoke({
                    "$messages": messages
                })
                        
            logger.info("New summarized memory added.")
            # Delete all except for the most 2 recent message\
            delete_messages = [RemoveMessage(id=m.id) for m in messages]
            return {
                "messages": delete_messages,
                "summary": new_summary
            }
        
        logger.info("Memory Summarization not applicable.")
        return {"messages": messages}
    except Exception as e:
        logger.error("Error occured.")
        raise RuntimeError(f"An error occured in `summarization_node`: {str(e)}")

def steve_agent_node(state: GenerativeUIState) -> GenerativeUIState:
    
    # Get the stream writer
    stream_writer = get_stream_writer()
    
    # Get state variables
    messages = state["messages"]
    summary = state.get("summary")
    # visitor_query = messages[-1] if isinstance(messages[-1], HumanMessage) else state.get("input")
    
    # Find the last human message from messages
    visitor_query = next(
        (m for m in reversed(messages) if isinstance(m, HumanMessage)),
        state.get("input")
    )
    
    # Find the last tool message from messages
    last_tool_message = next(
        (m for m in reversed(messages) if isinstance(m, ToolMessage)),
        None
    )
    
    context = last_tool_message.content if last_tool_message else ""
    
    # Retrieve Steve from Cache or Build it 
    if not cache_manager.has("steve_agent"):
        cache_manager.set("steve_agent", create_steve_agent(model="mistral"))
    
    steve_agent: RunnableSerializable = cache_manager.get("steve_agent")
    
    print(f"\n\nCurrent Context: {context}\n\n")
    
    if len(messages) > 1:
        # Prepare Steve's memory
        if summary and summary is not None:
            memory = state["summary"] + "\n" + "\n".join([f'[Steve]: {m.content}' if isinstance(m, AIMessage) else f'[Visitor]: {m.content}' for m in messages if m.content != "" and not isinstance(m, ToolMessage)])
        else:
            memory = f"\n\n".join([f'[Steve]: {m.content}' if isinstance(m, AIMessage) else f'[Visitor]: {m.content}' for m in messages if m.content != "" and not isinstance(m, ToolMessage)])
    else:
        memory = ""
    print(f"\n\nCurrent Memory: {memory}\n\n")
        
    steve_response = steve_agent.invoke({
        "$query": visitor_query,
        "$context": context,
        "$memory": memory
    })
        
    if not isinstance(steve_response, AIMessage):
        logger.error("Invalid Result from model. Expected AIMessage.")
        raise ValueError(f"Error in `steve_agent_node`: AIMessage expected from steve_agent, but {type(steve_response)} object was returned.")
       
    if isinstance(steve_response.tool_calls, list) and len(steve_response.tool_calls) > 0:
        logger.info("Steve Agent performs a tool call.")
        
        # Emit custom event for tool calls
        stream_writer({
            "type": "agent_tool_call",
            "tool_calls": [{"name": tc["name"], "args": tc["args"]} for tc in steve_response.tool_calls]
        })
        
        return {#"tool_calls": steve_response, 
                "messages": [steve_response], 
                "input": visitor_query}
    else:
        logger.info("Steve Agent directly answer's the query with plain text.")
        
        # Emit custom event for final plain text response
        stream_writer({
            "type": "final_response",
            "content": str(steve_response.content)
        })
        
        return {"result": str(steve_response.content),
                "messages": [steve_response],
                "input": visitor_query}

def should_invoke_tools(state: GenerativeUIState) -> str:
    """
    Decision node after the agent: checks for tool calls.
    - If it has tool calls, route to the tool invocation node.
    - Otherwise, the agent has produced a final answer, so end the graph execution.
    
    Returns:
       - "invoke_tools" if tool calls are present
       - END if no tool calls are present
    """
    logger.info("---DECISION: SHOULD INVOKE TOOLS?---")
    last_message = state["messages"][-1]
    
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        logger.info("Routing to tool invocation.")
        return "invoke_tools"
    
    logger.info("No tool calls. Routing to END.")
    return END

def route_after_tools(state: GenerativeUIState) -> str:
    """
    Decision node after tool invocation: routes based on which tool was called.
    - If the tool was the `context-retriever`, route back to steve agent for RAG.
    - Otherwise, route to END
    
    Returns:
        - "invoke_steve_agent" if tool used was `context-retriever`.
        - END otherwise
    """
    logger.info("---DECISION: ROUTE AFTER TOOLS?---")
    # The `invoke_tools_node` puts the tool's message in `tool_result`
    # tool_name = state.get("tool_result").tool_name
    tool_name = state["messages"][-1].tool_name
    
    # Get the stream writer
    stream_writer = get_stream_writer()
    
    if tool_name == "context-retriever":
        logger.info("Context retrieved. Routing back to steve agent for RAG.")
        return "invoke_steve_agent"
    
    if tool_name == "github-repo":
        logger.info("Github repo retrieved. Routing to END.")
        
        last_tool_message = next(
            (m for m in reversed(state["messages"]) if isinstance(m, ToolMessage)),
            None
        )
        
        github_repo_agent_response = last_tool_message.content if last_tool_message else ""
        
        # Emit custom event for final plain text response
        stream_writer({
            "type": "final_response",
            "content": str(github_repo_agent_response)
        })
        
        return END
    
    logger.info("Non-RAG tool finished. Routing to END.")
    return END

def invoke_tools_node(state: GenerativeUIState) -> GenerativeUIState:
    """
    Invokes the tools requested by the agent in the previous step.
    The results are returned as ToolMessage objects.
    """
    # Get state variables
    # tool_calls: list = state.get("tool_calls").tool_calls
    last_message = state["messages"][-1]
    tool_calls = last_message.tool_calls
    
    # Create a tool mapping
    tools_map = {
        "github-profile": github_profile,
        "github-repo": github_repo,
        "linkedin-profile": linkedin_profile,
        "context-retriever": context_retriever,
        "weather-data": weather_data
    }
    
    tool_messages = []
    stream_writer = get_stream_writer() # Get stream writer
    
    for call in tool_calls:
        tool_name = call["name"]
        logger.info(f"Invoking tool: {tool_name} with args: {call['args']}")
        
        selected_tool = tools_map[tool_name]
        tool_output: BaseModel | List[Any] = selected_tool.invoke(call["args"])
        
        if tool_name not in ["context-retriever", "github-repo"]:
            # Emit custom event for tool output to the frontend
            stream_writer({
                "type": "tool_output",
                "output": tool_output.model_dump(),
                "tool_name": tool_name,
                "tool_args": call["args"],
                "tool_call_id": call["id"]
            })
        
        if tool_name == "github-repo":
            
            tool_messages.append(
                ToolMessage(content=tool_output, tool_name=tool_name, tool_call_id=call["id"])
            )
            
            # # Emit custom event for github-repo tool output to the frontend
            # stream_writer({
            #     "type": "tool_output",
            #     "output": repo_contents,
            #     "tool_name": tool_name,
            #     "tool_args": call["args"],
            #     "tool_call_id": call["id"]
            # })
        
        if tool_name != "github-repo":
            # Format tool output content for better readability
            formatted_tool_output = "\n".join([
                f"{key}: {value}" for key, value in tool_output.model_dump().items()
            ])
        
            tool_messages.append(
                ToolMessage(content=formatted_tool_output, tool_name=tool_name, tool_call_id=call["id"])
            )
            
            return {
                "messages": tool_messages,
                "result": formatted_tool_output
            }
    
    # These ToolMessages will be appended to the state by `add_messages`
    # and will be available in the next call to the `steve_agent_node`.
    return {
        # "tool_result": tool_messages[0], 
        "messages": tool_messages
        # "messages": [m for m in state["messages"] if m.content != ""]
    }

def create_steve_graph() -> CompiledStateGraph:
    
    workflow = StateGraph(GenerativeUIState)
    
    # Node definition for the workflow
    workflow.add_node("steve_agent_node", steve_agent_node)
    workflow.add_node("invoke_tools_node", invoke_tools_node)
    workflow.add_node("summarization_node", summarization_node)
    
    # Edge definition for the workflow
    workflow.add_edge(START, "summarization_node")
    workflow.add_edge("summarization_node", "steve_agent_node")
    workflow.add_conditional_edges(
        "steve_agent_node",
        should_invoke_tools,
        {
            "invoke_tools": "invoke_tools_node", 
            END: END
         }
    )
    workflow.add_conditional_edges(
        "invoke_tools_node",
        route_after_tools,
        {
            "invoke_steve_agent": "summarization_node",
            END: END
        }
    )
    
    checkpointer = MemorySaver()
    
    steve_graph = workflow.compile(checkpointer=checkpointer)
    
    return steve_graph
   
if __name__ == "__main__":
    # --- Example 1: A query that should trigger the 'linkedin_profile' tool ---
    print("--- Running Example 1: LinkedIn Profile ---")
    query1 = "Can you tell me about Jomar's professional headline?"
    query2 = "What's the weather like in Cainta, Rizal?"
    query3 = "Can you share Jomar's professional experience?"
    query4 = "How can I contact Jomar for an interview?"
    query5 = "Hi, I'm Rhyle, a Senior Software Engineer at Accenture, and I want to know Jomar's experience when it comes to building AI-Powered Applications."
    query6 = "Can you recall my name and career title?"
    
    config = {
        "configurable": {
            "thread_id": "thread-1"
        }
    }
    
    steve_agent = create_steve_graph()
    response = steve_agent.invoke({
        "messages": [HumanMessage(content=query5)]
    }, config)
    print(f"\n\nFirst Output: {response.get("result")}")
    
    second_response = steve_agent.invoke({
        "messages": [HumanMessage(content=query6)]
    }, config)
    print(f"\n\nSecond Output: {second_response.get("result")}")
    print(f"\n\nFull response: {second_response}")
    
    # messages = second_response.get("messages")
    # messages_history = "\n".join([f'[Steve]: {m.content}' if isinstance(m, AIMessage) else f'[Visitor]: {m.content}' for m in messages if m.content != ""])
    
    # with open("steve_response.txt", "a") as file:
    #     file.write(f"{datetime.now()} | {messages_history}\n")
    
    # print(f"\n\nResponse Type: {type(second_response)}")
    # current_state = steve_agent.get_state(config)
    # print(f"\n\nFinal State: {current_state}\n\nValues: {current_state.values}")

    # Visualize graph
    graph_bytes = steve_agent.get_graph().draw_mermaid_png()
    visualize_graph(graph_bytes)
    
    # The 'invoke' method sends the input into the graph
    # for event in steve_agent.stream({"input": query2}, config):
    #     for key, value in event.items():
    #         print(f"Node: '{key}'")
    #         # Print the final response from the agent
    #         if key == "steve_agent_node":
    #              print(f"  Final Response: {value['messages'][-1].content}")
    # print("\n" + "="*50 + "\n")
    # print(f"\n\nFull response: {value}\n\n")
    