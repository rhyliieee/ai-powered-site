import React from 'react';
import { valuePropositionData } from '../data/portfolioData';

interface AboutSectionProps {
  reference: React.RefObject<HTMLElement | null>;
}

const AboutSection: React.FC<AboutSectionProps> = ({ reference }) => {
  return (
    <section ref={reference} id="about" className="py-16 md:py-24 bg-app text-main font-actor transition-colors duration-500">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-montserrat text-primary">
          Why Work With Me?
        </h2>
        <p className="text-xl text-secondary font-actor max-w-3xl mx-auto text-center mb-12">
              I bridge the gap between cutting-edge AI research and practical business solutions, 
              with a proven track record in healthcare technology and startup innovation.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {valuePropositionData.map((item, index) => (
            <div
              key={index}
              className="bg-surface p-6 rounded-lg shadow-light-md text-center transform hover:scale-105 transition-all duration-300 flex flex-col border border-soft"
            >
              <item.icon className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-2 font-roboto text-main">{item.title}</h3>
              <p className="text-md leading-relaxed flex-grow text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;