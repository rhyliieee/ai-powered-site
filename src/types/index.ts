import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Skill {
  name: string;
  level: number;
  icon?: React.ElementType;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface ValuePropositionItem {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface ProfessionalProfile {
  name: string;
  headline: string;
  summary: string;
  email: string;
  linkedin: string;
  github: string;
  cvUrl: string;
}

export interface SectionRefs {
  hero: React.RefObject<HTMLElement | null>;
  about: React.RefObject<HTMLElement | null>;
  projects: React.RefObject<HTMLElement | null>;
  skills: React.RefObject<HTMLElement | null>;
  experience: React.RefObject<HTMLElement | null>;
  contact: React.RefObject<HTMLElement | null>;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  type: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  specialization: string;
  institution: string;
  period: string;
}
