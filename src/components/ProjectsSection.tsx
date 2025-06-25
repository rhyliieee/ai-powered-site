import React from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/portfolioData';

interface ProjectsSectionProps {
  reference: React.RefObject<HTMLElement | null>;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ reference }) => {
  return (
    <section ref={reference} id="projects" className="py-16 md:py-24 bg-app font-actor transition-colors duration-500">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-16 font-montserrat">
          Featured Work & Projects
        </h2>
        <p className="text-xl text-secondary font-actor text-center max-w-3xl mx-auto mb-12">
              Innovative AI solutions that solve real-world problems
        </p>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {projectsData.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
