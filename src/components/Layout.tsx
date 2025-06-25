import React, { useRef, useState, useEffect } from 'react';
import ChatAssistant from './ChatUI';
import Navbar from './NavBar';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import { professionalProfile } from '../data/portfolioData'; // For CV preload

const Layout: React.FC<{ theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void }> = ({ theme, setTheme }) => {
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isChatUiVisible, setIsChatUiVisible] = useState(true); 

  const sectionRefs = {
    hero: heroRef,
    about: aboutRef,
    projects: projectsRef,
    skills: skillsRef,
    experience: experienceRef,
    contact: contactRef,
  };

  useEffect(() => {
    // Preload CV for smoother download if possible (browser dependent)
    // Ensure the CV URL is correct and accessible from the public folder
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = professionalProfile.cvUrl; // Ensure this path is correct, e.g., "/cv.pdf"
    link.as = 'fetch'; 
    link.crossOrigin = 'anonymous'; // Important for preloading resources
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsChatUiVisible(!entry.isIntersecting); 
      },
      { root: null, rootMargin: '0px', threshold: 0.1 } 
    );

    if (footerRef.current) {
      footerObserver.observe(footerRef.current);
    }

    return () => {
      if (heroRef.current) heroObserver.unobserve(heroRef.current);
      if (footerRef.current) footerObserver.unobserve(footerRef.current);
    };
  }, []);


  return (
    <div className={`antialiased bg-app text-main font-roboto transition-colors duration-500 ${theme}`}>
      <Navbar refs={sectionRefs} theme={theme} setTheme={setTheme} isHeroInView={isHeroInView} />
      <main>
        <HeroSection reference={heroRef} projectsRef={projectsRef} contactRef={contactRef} aboutRef={aboutRef} />
        <AboutSection reference={aboutRef} />
        <ProjectsSection reference={projectsRef} />
        <SkillsSection reference={skillsRef} />
        <ExperienceSection reference={experienceRef} />
        <ContactSection reference={contactRef} />
        <ChatAssistant isVisible={isChatUiVisible} />
      </main>
      <Footer reference={footerRef} /> 
    </div>
  );
};

export default Layout;