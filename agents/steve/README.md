# Steve Agent Documentation

## Introduction

**Steve** is a virtual front desk agent designed for Jomar Talambayan's professional portfolio website. Its primary objective is to assist visitors in gaining a solid, fact-based understanding of Jomar's professional experience, skills, and projects. Steve operates with precision, logic, and a focus on providing accurate, verifiable information, embodying a "Socratic-Guide" persona that is inquisitive, structured, helpful, and formal.

## Architecture Overview

The Steve agent is built using a combination of **LangChain**, **LangGraph**, and **FastAPI**.

*   **LangChain** is used for integrating various tools and defining the agent's behavior.
*   **LangGraph** orchestrates the complex conversational flow, managing state, tool invocation, and decision-making.
*   **FastAPI** provides the web interface for interacting with the agent, offering both streaming and non-streaming chat capabilities.

## Key Components

### 1. Agent Core (`agent.py`)

The `agent.py` file defines the core LLM-powered agents:

*   **`create_steve_agent`**: Initializes the main conversational agent. It binds a selected Large Language Model (LLM) (Mistral, Gemini, or DeepSeek) with a set of specialized tools and a prompt template, enabling it to understand queries and decide on appropriate actions (tool use or direct response).
*   **`create_memory_agent`**: Initializes a separate LLM-powered agent responsible for summarizing the conversation history. This helps Steve maintain context over longer interactions without exceeding token limits.

### 2. Tools (`tools/` directory)

Steve has access to a specialized toolset, each designed for a specific purpose:

*   **`linkedin_profile` (`linkedin.py`)**:
    *   **Purpose**: Retrieves high-level public LinkedIn profile details of Jomar Talambayan (e.g., name, headline, connections, profile URL).
    *   **Use Case**: Answering general inquiries about Jomar's professional network or providing a link to his profile.

*   **`github_profile` (`github.py`)**:
    *   **Purpose**: Fetches high-level GitHub profile information (e.g., bio, number of repositories, profile URL).
    *   **Use Case**: Providing a quick overview of Jomar's coding activities or GitHub presence.

*   **`github_repo` (`github.py`)**:
    *   **Purpose**: Provides comprehensive answers to queries about Jomar Talambayan's *featured* GitHub repositories by analyzing their `README.md` content. This tool internally uses another specialized agent (`_create_github_repo_agent`).
    *   **Use Case**: Deep dives into specific coding projects, revealing technical implementations and technologies used.

*   **`context_retriever` (`retriever.py`)**:
    *   **Purpose**: Performs semantic search over Jomar's resume and curriculum vitae using GroundX.
    *   **Use Case**: This is the primary tool for answering in-depth questions about Jomar's professional history, specific work experiences, technical/soft skills, trainings, certifications, and education. It demonstrates Jomar's experience with vector databases and information retrieval.

*   **`weather_data` (`weather.py`)**:
    *   **Purpose**: Retrieves current weather data for a specified city and region using an external geocoding and weather API.
    *   **Use Case**: Demonstrating Jomar's ability to integrate with external APIs, used only when a user explicitly asks for the weather.

### 3. LangGraph Workflow (`graph.py`)

The `graph.py` defines the state machine that orchestrates Steve's behavior:

*   **`GenerativeUIState`**: A `TypedDict` that defines the state of the graph, including `messages` (conversation history), `summary` (summarized memory), `retrieved_context` (from `context_retriever`), and `result` (final plain text response).
*   **Nodes**:
    *   **`summarization_node`**: Conditionally summarizes the conversation history to maintain context and manage memory efficiently.
    *   **`steve_agent_node`**: The core decision-making node where the `create_steve_agent` is invoked. It processes the user's query, current memory, and retrieved context to decide whether to call a tool or provide a direct answer.
    *   **`invoke_tools_node`**: Executes the tool calls requested by the `steve_agent_node` and returns the tool's output.
*   **Edges**: Define the flow between nodes based on conditions:
    *   The conversation starts with `summarization_node`.
    *   From `summarization_node`, it always proceeds to `steve_agent_node`.
    *   After `steve_agent_node`, a conditional edge (`should_invoke_tools`) checks if a tool call was made. If yes, it routes to `invoke_tools_node`; otherwise, it ends the conversation.
    *   After `invoke_tools_node`, a conditional edge (`route_after_tools`) checks which tool was used. If `context-retriever` was used, it loops back to `summarization_node` (and then `steve_agent_node`) for RAG; otherwise, it ends the conversation.

### 4. Helper Utilities (`helper.py`)

*   **`CacheManager`**: A singleton class that provides an in-memory cache for storing frequently accessed objects like loaded prompts and initialized agents, improving performance by avoiding redundant loading/initialization.
*   **`load_prompts`**: A utility function to load prompts from a YAML file (`prompts.yaml`).
*   **`visualize_graph`**: A function to display a visual representation of the LangGraph workflow, useful for debugging and understanding the agent's flow.

### 5. API Endpoints (`endpoint.py`)

The Steve agent exposes its functionality via a FastAPI server:

*   **`/ai/steve/v1/health` (GET)**: A simple health check endpoint to verify the API and agent initialization status.
*   **`/ai/steve/v1/chat/no-stream` (POST)**:
    *   **Purpose**: Provides a non-streaming chat interface. The API waits for the entire response to be generated before sending it back.
    *   **Response**: Newline-delimited JSON (NDJSON) containing events like `agent_tool_call`, `tool_output`, and `final_response`.
*   **`/ai/steve/v1/chat/stream-tokens` (POST)**:
    *   **Purpose**: Provides a streaming chat interface, sending back LLM tokens as they are generated, along with other events.
    *   **Response**: Newline-delimited JSON (NDJSON) containing events like `token` (for LLM output chunks), `agent_tool_call`, `tool_output`, and `final_response`.
*   **API Key Security**: All endpoints are protected by an API key (`RHYLIIEEE-API-KEY`) for authentication.

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/rhyliieee/personal-site.git
    cd personal-site/personal_website/rhyliieee-website/agents/steve
    ```
2.  **Install dependencies**:
    (Assumes `requirements.txt` exists in the root of `rhyliieee-website` or `agents/steve`)
    ```bash
    pip install -r requirements.txt
    ```
3.  **Environment Variables**: Create a `.env` file in the `rhyliieee-website` directory (or where `dotenv` loads from) and populate it with necessary API keys:
    *   `MISTRAL_API_KEY`
    *   `GOOGLE_API_KEY`
    *   `OPENROUTER_API_KEY`
    *   `GROUNDX_API_KEY`
    *   `GROUNDX_BUCKET_ID`
    *   `GEOCODE_API_KEY`
    *   `GITHUB_TOKEN` (for `github-repo` tool)
    *   `STEVE_AGENT_API_KEYS` (comma-separated list of allowed API keys for the Steve API)

    Example `.env` content:
    ```env
    MISTRAL_API_KEY="your_mistral_api_key"
    GOOGLE_API_KEY="your_google_api_key"
    OPENROUTER_API_KEY="your_openrouter_api_key"
    GROUNDX_API_KEY="your_groundx_api_key"
    GROUNDX_BUCKET_ID="your_groundx_bucket_id"
    GEOCODE_API_KEY="your_geocode_api_key"
    GITHUB_TOKEN="your_github_personal_access_token"
    STEVE_AGENT_API_KEYS="key1,key2,mysecretkey"
    ```

4.  **Prompts Configuration**: The agent's persona and behavior are heavily influenced by the prompts defined in `prompts.yaml`. You can modify these to fine-tune Steve's responses.

## Running the Server

To start the FastAPI server, navigate to the `rhyliieee-website` directory and run:

```bash
python -m agents.steve.start_server
```

The server will typically run on `http://0.0.0.0:8000`.

## Usage Example (API Call)

You can interact with the Steve agent using tools like `curl` or any HTTP client.

**Example using `curl` for streaming tokens:**

```bash
curl -X POST "http://localhost:8000/ai/steve/v1/chat/stream-tokens" \
     -H "accept: application/x-ndjson" \
     -H "RHYLIIEEE-API-KEY: your_api_key_here" \
     -H "Content-Type: application/json" \
     -d '{
           "message": "Tell me about Jomar Talambayan''s professional experience.",
           "thread_id": "user-session-123"
         }'
```
