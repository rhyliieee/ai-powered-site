import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'tool_output' | 'agent_tool_call' | 'error';
  content?: string; // For user/agent messages
  toolName?: string; // For tool_output
  toolArgs?: any; // For tool_output
  output?: any; // For tool_output
  toolCallId?: string; // For tool_output
  toolCalls?: Array<{ name: string; args: any }>; // For agent_tool_call
}

const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI server URL
const API_KEY = 'steve_58a00ca0_7d95_4318_8daa_bbbf859c1fcb'; // IMPORTANT: Replace with your actual API key from STEVE_AGENT_API_KEYS

export const useChatNoStream = () => {
  // State for managing chat messages, input field value, loading state, and thread ID
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string>(() => localStorage.getItem('steve_chat_thread_id') || `thread-${Date.now()}`);

  // Save threadId to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('steve_chat_thread_id', threadId);
  }, [threadId]);

  // Handler for sending messages and processing streaming responses
  const sendMessage = useCallback(async (message: string) => {
    // Don't send empty messages or while already loading
    if (message.trim() === '' || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, type: 'user', content: message.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true); // Start loading state

    try {
      // Make API request to chat endpoint
      const response = await fetch(`${API_BASE_URL}/ai/steve/v1/chat/no-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'RHYLIIEEE-API-KEY': API_KEY,
        },
        body: JSON.stringify({ message: message.trim(), thread_id: threadId }),
      });

      // Handle non-200 responses
      if (!response.ok || !response.body) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown error'}`);
      }

      // Set up stream reading
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // Process stream chunks
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log('Raw chunk:', chunk);

        // Decode chunk and split into lines
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        // Process each complete line
        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            // Parse JSON and create appropriate message type
            const data = JSON.parse(line);
            const newMessage: ChatMessage = { id: `${data.type}-${Date.now()}`, type: data.type };

            // Handle different message types
            if (data.type === 'final_response') {
              newMessage.content = data.content;
              newMessage.type = 'agent'; // Treat final_response as agent message
            } else if (data.type === 'tool_output') {
              newMessage.toolName = data.tool_name;
              newMessage.toolArgs = data.tool_args;
              newMessage.output = data.output;
              newMessage.toolCallId = data.tool_call_id;
            } else if (data.type === 'agent_tool_call') {
              newMessage.toolCalls = data.tool_calls;
            } else if (data.type === 'error') {
              newMessage.content = `Error: ${data.content}`;
            }

            // Add new message to chat
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } catch (e) {
            // Handle JSON parsing errors
            console.error('Error parsing JSON stream chunk:', e, line);
            setMessages((prevMessages) => [...prevMessages, { id: `error-${Date.now()}`, type: 'error', content: `Failed to parse response: ${line}` }]);
          }
        }
      }
      // Process any remaining data in buffer after stream ends
      if (buffer.trim() !== '') {
        try {
          // Parse and handle final message
          const data = JSON.parse(buffer);
          const newMessage: ChatMessage = { id: `${data.type}-${Date.now()}`, type: data.type };
          if (data.type === 'final_response') {
            newMessage.content = data.content;
            newMessage.type = 'agent';
          } else if (data.type === 'tool_output' && data.tool_name !== "context-retriever") {
            newMessage.toolName = data.tool_name;
            newMessage.toolArgs = data.tool_args;
            newMessage.output = data.output;
            newMessage.toolCallId = data.tool_call_id;
          } else if (data.type === 'agent_tool_call') {
            newMessage.toolCalls = data.tool_calls;
          } else if (data.type === 'error') {
            newMessage.content = `Error: ${data.content}`;
          }
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (e) {
          // Handle JSON parsing errors in final buffer
          console.error('Error parsing final JSON buffer:', e, buffer);
          setMessages((prevMessages) => [...prevMessages, { id: `error-${Date.now()}`, type: 'error', content: `Failed to parse final response: ${buffer}` }]);
        }
      }

    } catch (error) {
      // Handle network/API errors
      console.error('Fetch error:', error);
      setMessages((prevMessages) => [...prevMessages, { id: `error-${Date.now()}`, type: 'error', content: `Network or API error: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }, [isLoading, threadId]);

  // Return hook interface
  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    sendMessage,
    threadId, // Expose threadId if needed for debugging or display
  };
};