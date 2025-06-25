import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cloud, Thermometer, MapPin, Droplets, Clock } from 'lucide-react';

interface WeatherData {
  currentRain: number;
  currentTime: string;
  currentTemperature: number;
  city: string;
  region: string;
  country: string;
}

interface WeatherCardProps {
  output: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ output }) => {
  
  console.log('WeatherCard rendering with output:', output);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-primary">Current Weather</CardTitle>
        <Cloud className="h-6 w-6 text-secondary" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature and Location Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-main flex items-center">
              <Thermometer className="h-8 w-8 mr-2 text-primary" />
              {output.currentTemperature}°C
            </div>
            <div className="flex items-center text-sm text-secondary">
              <Droplets className="h-4 w-4 mr-1" />
              {output.currentRain}% rain
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {output.city}, {output.region.toUpperCase()}, {output.country.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Time Section */}
        <div className="flex items-center text-xs text-muted pt-2 border-t border-border-soft">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated: {formatDate(output.currentTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const WeatherCardSkeleton = () => {
  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <Skeleton className="h-6 w-32 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </CardTitle>
        <Skeleton className="h-8 w-8 rounded-full animate-pulse bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-36 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
            <Skeleton className="h-6 w-20 rounded-full animate-pulse bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
          </div>
          <Skeleton className="h-4 w-52 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-4 w-16 rounded-full animate-pulse bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200 bg-[length:200%_100%] animate-[shimmer_1.7s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-20 rounded-full animate-pulse bg-gradient-to-r from-green-200 via-green-300 to-green-200 bg-[length:200%_100%] animate-[shimmer_1.9s_ease-in-out_infinite]" />
        </div>
        <Skeleton className="h-3 w-44 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2.1s_ease-in-out_infinite]" />
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