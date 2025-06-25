import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github as GithubIcon, Star, Code, MapPin} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

interface GithubProfileData {
  name: string;
  username: string;
  profile_url: string;
  location: string;
  bio: string;
  num_repos: number;
  repo: string;
}

interface GithubCardProps {
  output: GithubProfileData;
}

// interface GithubRepoData {
//   repo_name: string;
//   repo_url: string;
//   file_name: string;
//   file_path: string;
//   file_content: string;
// }

// interface GithubRepoCardProps {
//   repos: GithubRepoData[];
// }

export const GithubCard: React.FC<GithubCardProps> = ({ output }) => {
  
  console.log(`GithubCard rendering with output: ${JSON.stringify(output)}`)
  
  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-primary">GitHub Profile</CardTitle>
        <GithubIcon className="h-6 w-6 text-secondary" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-main">{output.name || output.username}</h3>
          <CardDescription className="text-muted">@{output.username}</CardDescription>
          {output.bio && (
            <p className="text-sm text-secondary mt-1">{output.bio}</p>
          )}
        </div>

        <div className="space-y-1.5 mt-3">
          {output.location && (
            <div className="flex items-center text-sm text-secondary">
              <MapPin className="h-4 w-4 mr-2" />
              {output.location}
            </div>
          )}
          <div className="flex items-center text-sm text-secondary">
            <Code className="h-4 w-4 mr-2" />
            {output.num_repos} repositories
          </div>
          <div className="flex items-center text-sm text-secondary">
            <Star className="h-4 w-4 mr-2" />
            <a 
              href={output.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline"
            >
              Featured Repository
            </a>
          </div>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white transition-colors mt-4"
          onClick={() => window.open(output.profile_url, '_blank', 'noopener,noreferrer')}
        >
          <GithubIcon className="h-4 w-4 mr-2" />
          View on GitHub
        </Button>
      </CardContent>
    </Card>
  );
};

// export const GithubRepoCard: React.FC<GithubRepoCardProps> = ({ repos }) => {
//   console.log(`GithubRepoCard rendering with repos: ${JSON.stringify(repos)}`);

//   if (!repos || repos.length === 0) {
//     return null; // Or a message indicating no repositories found
//   }

//   return (
//     <div className="space-y-4"> {/* Container for multiple repo cards */}
//       {repos.map((repo, index) => (
//         <Card key={index} className="bg-surface-elevated text-main border-border-soft shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg font-bold text-primary">
//               <a 
//                 href={repo.repo_url} 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="hover:underline"
//               >
//                 {repo.repo_name}
//               </a>
//             </CardTitle>
//             <CardDescription className="text-muted">{repo.file_name} ({repo.file_path})</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {/* Apply 'prose' classes for basic markdown styling. Ensure @tailwindcss/typography is installed if these styles don't apply. */}
//             <div className="prose prose-sm dark:prose-invert max-w-none text-secondary"> 
//               <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                 {repo.file_content}
//               </ReactMarkdown>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };

export const GithubCardSkeleton = () => {
  return (
    <Card className="bg-surface-elevated text-main border-border-soft shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <Skeleton className="h-6 w-32 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </CardTitle>
        <Skeleton className="h-7 w-7 rounded-md animate-pulse bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full animate-pulse bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]" />
            <Skeleton className="h-7 w-48 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.7s_ease-in-out_infinite]" />
          </div>
          <Skeleton className="h-4 w-32 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-64 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.9s_ease-in-out_infinite]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full animate-pulse bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
          <Skeleton className="h-5 w-20 rounded-full animate-pulse bg-gradient-to-r from-green-200 via-green-300 to-green-200 bg-[length:200%_100%] animate-[shimmer_2.1s_ease-in-out_infinite]" />
          <Skeleton className="h-5 w-18 rounded-full animate-pulse bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 bg-[length:200%_100%] animate-[shimmer_2.2s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4 rounded-sm animate-pulse bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-[length:200%_100%] animate-[shimmer_1.7s_ease-in-out_infinite]" />
              <Skeleton className="h-4 w-8 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4 rounded-sm animate-pulse bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 bg-[length:200%_100%] animate-[shimmer_1.9s_ease-in-out_infinite]" />
              <Skeleton className="h-4 w-6 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2.1s_ease-in-out_infinite]" />
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