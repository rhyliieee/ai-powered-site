import React from 'react';
import { WeatherCard, WeatherCardSkeleton } from './tools/WeatherCard'; 
import { GithubCard, GithubCardSkeleton } from './tools/GithubCard';
import { LinkedInCard, LinkedInCardSkeleton } from './tools/LinkedInCard';

interface ToolOutputDisplayProps {
  toolName: string;
  toolArgs: any;
  output: any;
  toolCallId: string;
  isLoading?: boolean;
}

const ToolOutputDisplay: React.FC<ToolOutputDisplayProps> = ({ toolName, toolArgs, output, toolCallId, isLoading = false }) => {
    
  // Render different React components based on `toolName`.
  switch (toolName) {
    case 'weather-data':
      return isLoading ? <WeatherCardSkeleton /> : <WeatherCard output={output} />;
    case 'github-profile': // Assuming this is the name your agent uses for the github tool
      return isLoading ? <GithubCardSkeleton /> : <GithubCard output={output} />;
    case 'linkedin-profile': // Assuming this is the name your agent uses for the linkedin tool
      return isLoading ? <LinkedInCardSkeleton /> : <LinkedInCard output={output} />;
    case 'github-repo':
      return;
    default:
      // Fallback for unknown tools or if you want to show raw output
      return (
        <div className="bg-surface-elevated p-3 rounded-lg shadow-sm border border-border-soft text-sm text-muted my-2">
          <p className="font-bold text-primary">Tool Invoked: {toolName}</p>
          <p className="text-secondary">Arguments: {JSON.stringify(toolArgs)}</p>
          <p className="text-main">Output:</p>
          <pre className="whitespace-pre-wrap break-words bg-surface p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(output, null, 2)}
          </pre>
          <p className="text-xs text-muted mt-1">Tool Call ID: {toolCallId}</p>
        </div>
      );
  }
};

export default ToolOutputDisplay;