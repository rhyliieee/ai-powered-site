import React, { useState } from 'react';
import { Github, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-xl shadow-light-lg dark:shadow-dark-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-light-xl dark:hover:shadow-dark-xl border border-soft">
      <img
        src={project.imageUrl || `https://placehold.co/600x400/B8A9FF/6320EE?text=${encodeURIComponent(project.title)}`}
        alt={`${project.title} preview`}
        className="w-full h-56 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://placehold.co/600x400/B3C0A4/505168?text=Image+Not+Found`;
          target.alt = `${project.title} image not found`;
        }}
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-main mb-2 font-montserrat">{project.title}</h3>
        <p className="text-sm text-primary font-semibold mb-3 font-roboto">{project.category}</p>
        <p className="text-secondary mb-4 text-sm leading-relaxed flex-grow">{project.description}</p>

        {isExpanded && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-main mb-1 font-roboto">Key Features:</h4>
            <ul className="list-disc list-inside text-sm text-secondary space-y-1">
              {project.keyFeatures.map((feature, idx) => <li key={idx}>{feature}</li>)}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-md font-semibold text-main mb-2 font-roboto">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, idx) => (
              <span key={idx} className="bg-app text-secondary text-xs px-3 py-1 rounded-full font-medium border border-soft">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-soft">
          <div className="flex justify-between items-center">
            <div className="space-x-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-main hover:text-primary transition-colors"
                  title={`View ${project.title} on GitHub`}
                >
                  <Github size={22} /> <span className="ml-1 text-sm hidden sm:inline">GitHub</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-main hover:text-primary transition-colors"
                  title={`View live demo of ${project.title}`}
                >
                  <Briefcase size={22} /> <span className="ml-1 text-sm hidden sm:inline">Live Demo</span>
                </a>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-main hover:text-primary transition-colors flex items-center text-sm"
              aria-expanded={isExpanded}
              aria-controls={`project-details-${project.id}`}
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
              {isExpanded ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;