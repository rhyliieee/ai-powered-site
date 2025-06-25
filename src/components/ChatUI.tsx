import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, ChevronUp, ChevronDown, Mic, MicOff, X, MessageCircle, Minimize2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import ToolOutputDisplay from './ToolOutputDisplay';
import { useChatNoStream } from '@/hooks/useChatNoStream';

// Constants for rate limiting
const MESSAGE_LIMIT = 10;
const COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to get network identifier
const getNetworkIdentifier = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

// Interface for message limit
interface MessageLimit {
  count: number;          // how many messages in the current window
  timestamp: number;    // timestamp when this 1-hour window began
  cooldownEnd: number;   // optional—only set when limit is hit
}


interface ChatAssistantProps {
  isVisible: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isVisible }) => {
  const { messages, inputValue, setInputValue, isLoading, sendMessage } = useChatNoStream();
  const [isComponentRendered, setIsComponentRendered] = useState<boolean>(false);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [messageLimit, setMessageLimit] = useState<MessageLimit | null>(null);
  const [networkId, setNetworkId] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  // const [skeletonToolOutputIds, setSkeletonToolOutputIds] = useState<string[]>([]);
  const [loadingToolOutputId, setLoadingToolOutputId] = useState<string | null>(null);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Identify network
  useEffect(() => {
    const identifyNetwork = async () => {
      const id = await getNetworkIdentifier();
      setNetworkId(id);
    };
    identifyNetwork();
  }, []);

  // Load message limit from localStorage
  useEffect(() => {
    if (networkId) {
      const storedLimit = localStorage.getItem(`chat-limit-${networkId}`);
      if (storedLimit) {
        const limit = JSON.parse(storedLimit);
        // Only use stored limit if cooldown hasn't expired
        if (limit.cooldownEnd > Date.now()) {
          setMessageLimit(limit);
          // setTimeRemaining(limit.cooldownEnd - Date.now());
          setMessageLimit(null);
          localStorage.removeItem(`chat-limit-${networkId}`);
        } else {
          // Clear expired limit
          localStorage.removeItem(`chat-limit-${networkId}`);
          setMessageLimit(null);
          setTimeRemaining(0);
        }
      }
    }
  }, [networkId]);

  // Timer for limit cooldown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            // Reset limits when timer expires
            setMessageLimit(null);
            localStorage.removeItem(`chat-limit-${networkId}`);
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, networkId]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle skeleton loading for tool_output messages
  //  useEffect(() => {
  //   messages.forEach(msg => {
  //     // Only process tool_output messages that are not already in the skeleton list
  //     if (msg.type === 'tool_output' && msg.id && !skeletonToolOutputIds.includes(msg.id)) {
  //       setSkeletonToolOutputIds(prev => [...prev, msg.id]); // Add to show skeleton
  //       setTimeout(() => {
  //         setSkeletonToolOutputIds(prev => prev.filter(id => id !== msg.id)); // Remove after 2 seconds
  //       }, 2000); // 2 seconds delay
  //     }
  //   });
  // }, [messages]); 

  useEffect(() => {
    // Find the latest tool_output message
    const latestToolOutput = [...messages].reverse().find(msg => msg.type === 'tool_output');
    if (latestToolOutput && latestToolOutput.id !== loadingToolOutputId) {
      setLoadingToolOutputId(latestToolOutput.id);
      setIsSkeletonLoading(true);
      setTimeout(() => {
        setIsSkeletonLoading(false);
      }, 2000);
    }
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Check if Custom Component is rendered
  useEffect(() => {
    setIsComponentRendered(true);
    return () => setIsComponentRendered(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat expands
  useEffect(() => {
    if (isChatExpanded && !isMobile) {
      inputRef.current?.focus();
    }
  }, [isChatExpanded, isMobile]);

  // Message handling with rate limiting
  const handleSendMessage = () => {
    if (inputValue.trim()) {
        const currentTime = Date.now();
        let newLimit: MessageLimit;

        // Check if a message limit exists and if the current time is within the cooldown period
        if (messageLimit && (currentTime - messageLimit.timestamp) < COOLDOWN_PERIOD) {
            // If the user is still within the cooldown period and has reached the limit
            if (messageLimit.count >= MESSAGE_LIMIT) {
                setShowLimitAlert(true);
                setTimeout(() => setShowLimitAlert(false), 3000);
                return;
            } else {
                // Increment the message count
                newLimit = {
                    ...messageLimit,
                    count: messageLimit.count + 1
                };
            }
        } else {
            // If no limit exists or the cooldown period has expired, create a new limit
            newLimit = {
                count: 1,
                timestamp: currentTime,
                cooldownEnd: currentTime // This will be updated if the limit is reached
            };
        }

        console.log(`Limits: ${JSON.stringify(newLimit)}`);

        // If the message limit is reached, set the cooldown
        if (newLimit.count >= MESSAGE_LIMIT) {
            newLimit.cooldownEnd = currentTime + COOLDOWN_PERIOD;
            setTimeRemaining(COOLDOWN_PERIOD);
        }

        // Save the updated limits
        setMessageLimit(newLimit);
        localStorage.setItem(`chat-limit-${networkId}`, JSON.stringify(newLimit));

        // Send the message
        sendMessage(inputValue);
    }
  };

  // Format time remaining for cooldown
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (!isChatExpanded && !isMobile) {
        setIsChatExpanded(true);
      }
      handleSendMessage();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleChatExpansion = () => {
    setIsChatExpanded((prev) => !prev);
    if (!isChatExpanded && !isMobile) {
      setIsInputFocused(true);
    } else if (!isMobile) {
      setIsInputFocused(false);
    }
  };

  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => {
    if (!isChatExpanded && !isMobile) {
      setIsInputFocused(false);
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      // Start voice recognition
      setIsListening(true);
      // TODO: Implement actual voice recognition
    } else {
      // Stop voice recognition
      setIsListening(false);
    }
  };

  // Determine styling based on device and state
  const getChatContainerStyles = () => {
    if (isMobile) {
      return isChatExpanded 
        ? 'fixed inset-0 z-50 bg-app' 
        : 'fixed bottom-4 right-4 z-40 w-16 h-16';
    } else {
      return `fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-in-out ${
        isChatExpanded ? 'w-full max-w-2xl h-[85vh]' : 'w-full max-w-lg h-auto'
      }`;
    }
  };

  const getChatBoxStyles = () => {
    const baseOpacity = isInputFocused || isChatExpanded ? 'bg-app' : 'bg-app/95';
    const baseShadow = isInputFocused || isChatExpanded ? 'shadow-2xl shadow-glow-purple' : 'shadow-lg';
    
    if (isMobile && !isChatExpanded) {
      return `${baseOpacity} ${baseShadow} rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300`;
    }
    
    return `${baseOpacity} ${baseShadow} rounded-xl border border-border-main transition-all duration-300`;
  };

  useEffect(() => {
    if (isMobile) return; // Don't handle outside clicks on mobile

    const handleOutsideClick = (event: MouseEvent) => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer && !event.composedPath().includes(chatContainer)) {
        if (isChatExpanded) {
          toggleChatExpansion();
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isChatExpanded) {
        toggleChatExpansion();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isChatExpanded, isMobile]);

  if (!isVisible) return null;

  // Mobile bubble view when collapsed
  if (isMobile && !isChatExpanded) {
    return (
      <div className={getChatContainerStyles()}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleChatExpansion}
                className={`w-full h-full ${getChatBoxStyles()} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200`}
                size="icon"
              >
                <MessageCircle className="h-8 w-8 text-primary" />
                {messages.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-app min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {messages.filter(m => m.type === 'agent').length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Chat with Steve</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Full chat interface
  return (
    <div id="chat-container" className={getChatContainerStyles()}>
      <Card className={`flex flex-col h-full ${getChatBoxStyles()} border-0`}>
        {/* Header section */}
        {isChatExpanded && (
          <div className="flex justify-between items-center p-4 border-b border-border-soft bg-surface-elevated rounded-t-xl">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/steve-avatar.png" alt="Steve" />
                <AvatarFallback className="bg-primary text-app font-bold">S</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-primary font-montserrat">Steve Assistant</h3>
                <p className="text-xs text-muted">
                  {isLoading ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isVoiceMode && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {isListening ? 'Listening...' : 'Voice Mode'}
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleChatExpansion}
                      className="text-muted hover:text-primary"
                    >
                      {isMobile ? <Minimize2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMobile ? 'Minimize' : 'Close'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Messages section */}
        {isChatExpanded && (
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src="/steve-avatar.png" alt="Steve" />
                      <AvatarFallback className="bg-primary text-app font-bold text-xl">S</AvatarFallback>
                    </Avatar>
                    <h4 className="text-lg font-semibold text-primary mb-2">Hello! I'm Steve</h4>
                    <p className="text-muted mb-4">Your AI assistant ready to help with questions about Jomar's profile, projects, or anything else.</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline" className="text-xs">Profile Info</Badge>
                      <Badge variant="outline" className="text-xs">Projects</Badge>
                      <Badge variant="outline" className="text-xs">General Help</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Tool output message */}
                  {msg.type === 'tool_output' && msg.toolName && msg.output && (
                    <div className="w-full">
                      <ToolOutputDisplay
                        toolName={msg.toolName}
                        toolArgs={msg.toolArgs}
                        output={msg.output}
                        toolCallId={msg.toolCallId || ''}
                        isLoading={msg.id === loadingToolOutputId && isSkeletonLoading}
                      />
                    </div>
                  )}

                  {/* User message */}
                  {msg.type === 'user' && (
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <Card className="bg-primary text-app shadow-md">
                        <CardContent className="p-3">
                          {msg.content}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Agent message */}
                  {msg.type === 'agent' && (
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                        <AvatarImage src="/steve-avatar.png" alt="Steve" />
                        <AvatarFallback className="bg-primary text-app text-xs font-bold">S</AvatarFallback>
                      </Avatar>
                      <Card className="bg-surface-elevated shadow-md">
                        <CardContent className="p-3">            
                          <ReactMarkdown 
                            rehypePlugins={[remarkGfm, rehypeSanitize]}
                            components={{
                              // Add wrapper div to apply styles
                              div: ({node, ...props}) => <div className="prose prose-invert max-w-none" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-4" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                              code: ({node, ...props}) => <code className="bg-primary/10 rounded px-1" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Tool call message */}
                  {msg.type === 'agent_tool_call' && msg.toolCalls && (
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                        <AvatarImage src="/steve-avatar.png" alt="Steve" />
                        <AvatarFallback className="bg-primary text-app text-xs font-bold">S</AvatarFallback>
                      </Avatar>
      
                      <Card className="bg-surface-elevated/50 border-dashed">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 bg-primary rounded-full ${
                              isComponentRendered ? '' : 'animate-pulse'
                            }`}></div>
                            <span className="text-xs text-muted italic">
                              {isComponentRendered ? 'Used' : 'Using'} {msg.toolCalls.map(tc => tc.name).join(', ')}...
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>                    
                  )}

                  {/* Render ToolOutputDisplay with isLoading true for tool calls */}
                  {/* {msg.type === 'agent_tool_call' && msg.toolName && (
                    <div className='w-full' >
                      <ToolOutputDisplay 
                       toolName={msg.toolName}
                       toolArgs={msg.toolArgs}
                       output={null}
                       toolCallId={msg.toolCallId || ''}
                       isLoading={true}
                       />
                    </div>
                  )} */}

                  {/* Error message */}
                  {msg.type === 'error' && (
                    <Card className="bg-red-500/10 border-red-500/20 max-w-[85%]">
                      <CardContent className="p-3">
                        <div className="text-sm text-red-500">{msg.content}</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                    <AvatarImage src="/steve-avatar.png" alt="Steve" />
                    <AvatarFallback className="bg-primary text-app text-xs font-bold">S</AvatarFallback>
                  </Avatar>
                  <Card className="bg-surface-elevated shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-muted">Steve is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input section */}
        <div className={`p-4 flex flex-col space-y-2 ${isChatExpanded ? 'border-t border-border-soft bg-surface-elevated/50' : ''}`}>
          
          {/* Alert for message limit */}
          {showLimitAlert && (
            <Alert variant="destructive" className="mb-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Message limit reached. Please wait {formatTimeRemaining(timeRemaining)} before sending more messages.
              </AlertDescription>
            </Alert>
          )}

          {/* Input row with buttons */}
          <div className="flex items-center space-x-2">
          {/* Expand/collapse button for desktop */}
          {!isMobile && !isChatExpanded && messages.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChatExpansion}
                    className="text-primary hover:bg-primary-hover hover:text-app flex-shrink-0"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expand chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Input field */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={
                timeRemaining > 0 
                  ? `Please wait ${formatTimeRemaining(timeRemaining)} before sending more messages`
                  : isListening 
                    ? "Listening..." 
                    : isLoading 
                      ? "Steve is thinking..." 
                      : "Ask Steve anything..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleEnterPress}
              className={`bg-surface-elevated text-main border-border-main focus-visible:ring-primary focus-visible:ring-offset-0 pr-12 ${
                isInputFocused || isChatExpanded ? 'opacity-100' : 'opacity-90'
              } ${isListening ? 'ring-2 ring-primary animate-pulse' : ''}`}
              disabled={isLoading || isListening || timeRemaining > 0}
            />
            {isVoiceMode && (
              <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 text-primary text-xs">
                Voice
              </Badge>
            )}
          </div>

          {/* Voice/Mic button */}
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={isVoiceMode ? "default" : "outline"}
                onClick={toggleVoiceMode}
                className={`flex-shrink-0 ${
                  isVoiceMode 
                    ? 'bg-primary text-app hover:bg-primary-hover' 
                    : 'border-border-main text-primary hover:bg-primary-hover hover:text-app'
                } ${isListening ? 'animate-pulse' : ''}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVoiceMode ? 'Disable voice mode' : 'Enable voice mode'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

          {/* Send button */}
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                onClick={handleSendMessage}
                className="bg-primary text-app hover:bg-primary-hover flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={inputValue.trim() === '' || isLoading || isListening || timeRemaining > 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

          {/* Desktop collapse button */}
          {!isMobile && isChatExpanded && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChatExpansion}
                    className="text-primary hover:bg-primary-hover hover:text-app flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collapse chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
          </div>

          {/* Message counter and timer */}
          {messageLimit && (
            <div className="flex justify-between items-center text-xs text-muted px-1">
              <span>Messages: {messageLimit.count}/{MESSAGE_LIMIT}</span>
              {timeRemaining > 0 && (
                <span className="text-primary font-medium">
                  Cooldown: {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </div>
          )}

        </div>
      </Card>
    </div>
  );
};

export default ChatAssistant;