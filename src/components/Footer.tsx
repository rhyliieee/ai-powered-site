import React from 'react';
import { professionalProfile } from '../data/portfolioData';

interface FooterProps {
  reference?: React.RefObject<HTMLElement | null>; 
}

const Footer: React.FC<FooterProps> = ({ reference }) => {
  return (
    <footer 
      ref={reference} // Assign the ref here
      className="bg-light-surface dark:bg-dark-surface text-light-text-muted dark:text-dark-text-muted text-center p-8 font-actor border-t border-light-border-soft dark:border-dark-border-soft transition-colors duration-500"
    >
      <p className="text-sm">
        © {new Date().getFullYear()} {professionalProfile.name}. All rights reserved.
      </p>
      <p className="text-xs mt-1">
        Built with React, TypeScript, Tailwind CSS & Vite.
      </p>
    </footer>
  );
};

export default Footer;