import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { scrollToRef } from '../utils/scrollUtils';
import { professionalProfile } from '../data/portfolioData';
import type { SectionRefs } from '../types';

interface NavbarProps {
  refs: SectionRefs;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  isHeroInView: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ refs, theme, setTheme, isHeroInView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: "Home", ref: refs.hero },
    { name: "Why Me?", ref: refs.about },
    { name: "Projects", ref: refs.projects },
    { name: "Skills", ref: refs.skills },
    { name: "Experience", ref: refs.experience },
    { name: "Contact", ref: refs.contact },
  ];

  const handleScrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    scrollToRef(ref);
    if (isOpen) setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 bg-app/80 backdrop-blur-md border-b border-soft transition-all duration-500 ${isHeroInView ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
      <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-8">
        <a
          href="#hero"
          onClick={e => { e.preventDefault(); handleScrollToRef(refs.hero); }}
          className="text-xl text-secondary md:text-2xl font-bold font-montserrat text-main hover:text-primary transition-colors"
        >
          {professionalProfile.name.split(' ')[0]}
        </a>
        <div className="hidden md:flex items-center space-x-2">
          {navLinks.map(link => (
            <button
              key={link.name}
              onClick={() => handleScrollToRef(link.ref)}
              className="px-3 py-2 rounded font-actor text-main hover:bg-primary-hover hover:text-app transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-2 p-2 rounded-full bg-surface-elevated hover:bg-secondary-hover transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </div>
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-main p-2 focus:outline-none"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-app border-t border-soft shadow-lg transition-colors duration-500">
          <div className="flex flex-col py-2">
            {navLinks.map(link => (
              <button
                key={link.name}
                onClick={() => handleScrollToRef(link.ref)}
                className="w-full text-left px-6 py-4 font-actor text-main hover:bg-surface-elevated hover:text-primary transition-colors"
              >
                {link.name}
              </button>
            ))}
            <button
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="mx-6 my-2 p-2 rounded-full bg-surface-elevated hover:bg-primary transition-colors self-start"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;