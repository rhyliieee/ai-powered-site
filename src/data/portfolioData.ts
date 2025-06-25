import type { 
    ProfessionalProfile,
    ValuePropositionItem,
    Project,
    SkillCategory
 } from '../types/index';
import { 
    Lightbulb, 
    Code, 
    Users,
    Briefcase,
    Brain, 
    Zap, 
    Database, 
    Network,
    Cloud, 
    Github, 
    ExternalLink  
} from 'lucide-react';

export const professionalProfile: ProfessionalProfile = {
  name: "Jomar Talambayan",
  headline: "Generative AI Engineer | Building Smarter AI for Healthcare & Beyond",
  summary: "Bridging cutting-edge AI with real-world challenges, especially in healthcare. Focused on innovative EHR solutions powered by Multi-Agent Systems, automated patient note summarization, and advanced RAG chatbots.",
  email: "talambayanjomar037@gmail.com",
  linkedin: "https://www.linkedin.com/in/jomar-talambayan-52730227a",
  github: "https://github.com/rhyliieee", // Primary GitHub profile
  cvUrl: "(MAY-STX)_talambayan_jomar_CV.pdf", // Assuming CV is in public folder (prefix with /)
};

export const valuePropositionData: ValuePropositionItem[] = [
  {
    title: "AI Expertise for Impact",
    description: "Deep expertise in Generative AI, NLP, and Multi-Agent Systems with a strong focus on creating practical healthcare applications and scalable, human-centered tools.",
    icon: Lightbulb,
  },
  {
    title: "Full-Stack Development",
    description: "Proficient in building end-to-end solutions, from Python-based AI backends (FastAPI, LangGraph) to modern frontends (React, TypeScript).",
    icon: Code,
  },
  {
    title: "Collaborative Innovator",
    description: "A curious and proactive team player dedicated to data privacy, compliance, and turning ambitious ideas into intelligent, real-world solutions.",
    icon: Users,
  },
];

export const projectsData: Project[] = [
  {
    id: "jobjigsaw",
    title: "JobJigSaw Suite",
    category: "AI-Powered Recruitment Automation",
    description: "An intelligent suite featuring an AI Resume Analyzer (RAR) to rank candidates against job descriptions and a Job Description Writer (JDW) to generate compelling job postings, streamlining the recruitment lifecycle.",
    keyFeatures: [
      "AI-driven resume scoring and ranking (RAR)",
      "Automated, professional job description generation (JDW)",
      "Multi-LLM Support (Groq, Mistral, OpenAI)",
      "FastAPI backend with Streamlit UI",
    ],
    techStack: ["Python", "FastAPI", "LangGraph", "Pydantic", "Streamlit", "Docker", "LLMs"],
    githubUrl: "https://github.com/rhyliieee/JobJigSaw",
    imageUrl: "https://placehold.co/600x400/505168/EAEFD3?text=JobJigSaw+Suite",
  },
  {
    id: "eyomnai",
    title: "EyomnAI",
    category: "Intelligent EMR for Ophthalmology",
    description: "Advanced Electronic Medical Records (EMR) software for eye clinics, leveraging LLMs and multi-agent systems for intelligent assistance, SOAP note summarization, and automated data extraction from IDs.",
    keyFeatures: [
      "RAG Chatbot for medical queries",
      "Automated SOAP note summarization",
      "Intelligent data extraction from identification cards",
      "Multi-Agent System Architecture",
    ],
    techStack: ["Python", "FastAPI", "LangGraph", "Mistral LLM", "Docker", "Google Cloud Firestore", "RAG"],
    githubUrl: "https://github.com/csharpmastr/EyomnAI",
    imageUrl: "https://placehold.co/600x400/505168/EAEFD3?text=EyomnAI",
  },
  {
    id: "jobjigsaw-lark",
    title: "JobJigSaw - Lark Base Frontend",
    category: "Enterprise Integration",
    description: "A responsive frontend interface (React, TypeScript) enabling seamless interaction with the JobJigSaw backend directly within the Lark Base environment for efficient job and candidate management.",
    keyFeatures: [
      "Manage job openings within Lark Base",
      "Upload resumes & trigger AI analysis (RAR)",
      "View and save candidate rankings and insights",
      "Built with Vite and Tailwind CSS",
    ],
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Lark Base SDK", "Node.js"],
    githubUrl: "https://github.com/rhyliieee/JobJigSaw-Lark",
    imageUrl: "https://placehold.co/600x400/505168/EAEFD3?text=Lark+Frontend",
  },
];

export const skillCategoriesData: SkillCategory[] = [
  {
    name: "AI & Machine Learning",
    skills: [
      { name: "Generative AI", level: 95, icon: Brain },
      { name: "Multi-Agent Systems", level: 90, icon: Users },
      { name: "LangChain/LangGraph", level: 90, icon: Code },
      { name: "Transformers & LLMs", level: 85, icon: Zap },
      { name: "RAG & Vector DBs", level: 85, icon: Database }
    ]
  },
  {
    name: "Programming",
    skills: [
      { name: "Python", level: 95, icon: Code },
      { name: "JavaScript/TypeScript", level: 80, icon: Code },
      { name: "C#", level: 85, icon: Code },
      { name: "React", level: 80, icon: Code },
      { name: "ASP.NET", level: 75, icon: Code }
    ]
  },
  {
    name: "Cloud & Tools",
    skills: [
      { name: "Modal Deployment", level: 85, icon: Cloud },
      { name: "Google Colab", level: 90, icon: Cloud },
      { name: "Git/GitHub", level: 85, icon: Github },
      { name: "API Integration", level: 85, icon: ExternalLink }
    ]
  },
  {
    name: "Databases & Data",
    skills: [
      { name: "SQL (PostgreSQL, MySQL)", level: 85, icon: Database },
      { name: "NoSQL (Firebase, MongoDB)", level: 90, icon: Cloud },
      { name: "VectorDB (ChromaDB, Pinecone)", level: 90, icon: Database },
      { name: "GraphDB (Neo4j)", level: 80, icon: Network }
    ]
  }
];

export const experienceData = [
  {
    title: "Artificial Intelligence Intern",
    company: "Direc Business Technologies Inc.",
    location: "Quezon City, Philippines",
    period: "February 2025 - April 2025",
    type: "Internship",
    achievements: [
      "Developed Resume Analyzer and Reranker (RAR) tool with 85% accuracy",
      "Implemented full-stack AI integrations and API enhancements",
      "Delivered AI literacy sessions to R&D team",
      "Explored QA automation with low-code platforms"
    ]
  },
  {
    title: "Social Media Manager",
    company: "Kombe Kontracting",
    location: "Ontario, Canada (Remote)",
    period: "February 2021 - April 2023",
    type: "Full-time",
    achievements: [
      "Managed social media accounts and client database",
      "Created engaging content and graphics",
      "Collaborated with executive and development teams"
    ]
  }
];

export const educationData = {
  degree: "Bachelor of Science in Computer Science",
  specialization: "Data Science",
  institution: "Laguna University",
  period: "2021 - 2024"
};

export const certificationData = [
  "How Transformer LLMs Work - DeepLearning.AI (Feb 2025)",
  "Introduction to LangGraph - LangChain Academy (Jan 2025)",
  "Multi AI Agent Systems with crewAI - DeepLearning.AI (Nov 2024)",
  "Generative AI with Large Language Models - DeepLearning.AI (Jul 2024)",
  "Google Data Analytics Professional Certificate"
];
