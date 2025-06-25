import React from 'react';
// import BookingModal  from './BookingModal';
import { scrollToRef } from '../utils/scrollUtils';
import { professionalProfile } from '../data/portfolioData';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  reference: React.RefObject<HTMLElement | null>;
  projectsRef: React.RefObject<HTMLElement | null>;
  contactRef: React.RefObject<HTMLElement | null>;
  aboutRef: React.RefObject<HTMLElement | null>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ reference, contactRef, projectsRef, aboutRef }) => {
  // const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <section
      ref={reference}
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center text-center p-8 pt-24 md:pt-16 font-actor bg-app transition-colors duration-500"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-primary mb-4 leading-tight">
          {professionalProfile.name}
        </h1>
        <h2 className="text-2xl md:text-3xl text-secondary mb-6 font-roboto">
          {professionalProfile.headline}
        </h2>
        <p className="text-lg text-muted mb-10 leading-relaxed">
          {professionalProfile.summary}
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
          <button
            onClick={() => scrollToRef(projectsRef)}
            className="w-full sm:w-auto bg-primary text-app font-bold py-3 px-8 rounded-lg shadow-md hover:bg-primary-hover hover:text-app transition-all transform hover:scale-105 text-lg font-montserrat"
          >
            Explore My Work
          </button>
          <button
            onClick={() => scrollToRef(contactRef)}
            // onClick={() => setIsBookingModalOpen(true)}
            className="w-full sm:w-auto bg-transparent border-2 border-primary text-primary font-bold py-3 px-8 rounded-lg shadow-sm hover:bg-primary-hover hover:text-app transition-all transform hover:scale-105 text-lg font-montserrat"
          >
            Connect with Me
          </button>
        </div>
      </div>
      
      {/* QUICK STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary font-montserrat">15+</div>
          <div className="text-muted font-actor">AI/ML Certifications</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary font-montserrat">3+</div>
          <div className="text-muted font-actor">Featured Projects</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary font-montserrat">Healthcare</div>
          <div className="text-muted font-actor">AI Specialization</div>
        </div>
      </div>

      {/* Chevron Button with click functionality */}
      <div
        onClick={() => scrollToRef(aboutRef)}
        className="cursor-pointer hover:opacity-75 transition-opacity mt-4"
      >
        <ChevronDown className="w-8 h-8 mx-auto animate-bounce text-primary" />
      </div>

      {/* Booking Modal */}
      {/* <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      /> */}
      
    </section>
  );
};

export default HeroSection;