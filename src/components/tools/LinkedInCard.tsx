import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {  Linkedin as LinkedinIcon, MapPin, Users  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface LinkedInProfileData {
  name: string;
  profile_url: string;
  location: string;
  headline: string;
  connections: string;
}

interface LinkedInCardProps {
  output: LinkedInProfileData;
}

export const LinkedInCard: React.FC<LinkedInCardProps> = ({ output }) => {
  
  console.log(`LinkedInCard rendering with output: ${JSON.stringify(output)}`)
  
  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-primary">LinkedIn Profile</CardTitle>
        <LinkedinIcon className="h-6 w-6 text-secondary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-main">{output.name}</h3>
          <CardDescription className="text-muted">{output.headline}</CardDescription>
        </div>
        
        <div className="flex flex-col space-y-2">
          {output.location && (
            <div className="flex items-center text-sm text-secondary">
              <MapPin className="h-4 w-4 mr-2" />
              {output.location}
            </div>
          )}
          {output.connections && (
            <div className="flex items-center text-sm text-secondary">
              <Users className="h-4 w-4 mr-2" />
              {output.connections} connections
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary-hover text-white transition-colors"
          onClick={() => window.open(output.profile_url, '_blank', 'noopener,noreferrer')}
        >
          <LinkedinIcon className="h-4 w-4 mr-2" />
          View on LinkedIn
        </Button>
      </CardContent>
    </Card>
  );
};

export const LinkedInCardSkeleton = () => {
  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <Skeleton className="h-6 w-32 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </CardTitle>
        <Skeleton className="h-7 w-7 rounded-sm animate-pulse bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full animate-pulse bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.7s_ease-in-out_infinite]" />
            <Skeleton className="h-4 w-48 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-sm animate-pulse bg-gradient-to-r from-green-300 via-green-400 to-green-300 bg-[length:200%_100%] animate-[shimmer_1.9s_ease-in-out_infinite]" />
            <Skeleton className="h-4 w-36 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-sm animate-pulse bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 bg-[length:200%_100%] animate-[shimmer_2.1s_ease-in-out_infinite]" />
            <Skeleton className="h-4 w-32 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2.2s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-12 rounded-full animate-pulse bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
            <Skeleton className="h-6 w-16 rounded-full animate-pulse bg-gradient-to-r from-green-200 via-green-300 to-green-200 bg-[length:200%_100%] animate-[shimmer_2.1s_ease-in-out_infinite]" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md animate-pulse bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
        </div>
      </CardContent>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </Card>
  );
};
