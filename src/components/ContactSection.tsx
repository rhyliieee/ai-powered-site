import React from 'react';
import { Linkedin, Github, Mail, Download } from 'lucide-react';
import { professionalProfile } from '../data/portfolioData';

interface ContactSectionProps {
  reference: React.RefObject<HTMLElement | null>;
}

const ContactSection: React.FC<ContactSectionProps> = ({ reference }) => {
  return (
    <section ref={reference} id="contact" className="py-16 md:py-24 bg-app text-main font-actor transition-colors duration-500">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 font-montserrat text-primary">Let's Build Something Amazing!</h2>
        <p className="text-lg mb-8 leading-relaxed text-secondary">
          Ready to transform your ideas into intelligent solutions? Let's connect and discuss your next project.
        </p>
        <div className="flex justify-center space-x-6 mb-10">
          <a
            href={`mailto:${professionalProfile.email}`}
            className="text-main border-2 hover:text-primary transition-colors hover:border-primary border-soft rounded-full hover:bg-primary-hover p-2"
            title={`Email ${professionalProfile.name}`}
          >
            <Mail size={36} />
          </a>
          <a
            href={professionalProfile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-main border-2 hover:text-primary transition-colors hover:border-primary border-soft rounded-full hover:bg-primary-hover p-2"
            title={`${professionalProfile.name} on LinkedIn`}
          >
            <Linkedin size={36} />
          </a>
          <a
            href={professionalProfile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-main border-2 hover:text-primary transition-colors hover:border-primary border-soft rounded-full hover:bg-primary-hover p-2"
            title={`${professionalProfile.name} on GitHub`}
          >
            <Github size={36} />
          </a>
        </div>
        <a
          href={professionalProfile.cvUrl}
          target="_blank"
          download
          className="bg-primary text-app font-bold py-3 px-8 rounded-lg shadow-md hover:bg-secondary-hover transition-all transform hover:scale-105 text-lg inline-flex items-center font-montserrat"
        >
          <Download size={20} className="mr-2" /> Download CV
        </a>
      </div>
    </section>
  );
};

export default ContactSection;