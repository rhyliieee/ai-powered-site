# Rhyliieee Personal Website

This repository contains the frontend code for a modern, interactive personal portfolio website. It showcases professional experience, projects, and skills, featuring an integrated AI chat assistant powered by a custom FastAPI backend.

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Setup and Installation](#setup-and-installation)
    -   [Prerequisites](#prerequisites)
    -   [Frontend Setup](#frontend-setup)
    -   [Backend Setup (FastAPI)](#backend-setup-fastapi)
-   [Usage](#usage)
-   [AI Chat Assistant](#ai-chat-assistant)
    -   [Functionality](#functionality)
    -   [Rate Limiting](#rate-limiting)
    -   [Custom Tool Outputs](#custom-tool-outputs)
-   [Theming](#theming)
-   [Deployment Notes](#deployment-notes)
-   [Contact](#contact)

## Features

*   **Dynamic Portfolio Sections**: Dedicated sections for Hero, About, Projects, Skills, Experience, and Contact.
*   **Responsive Design**: Optimized for various screen sizes using Tailwind CSS.
*   **Interactive UI Components**: Utilizes Shadcn UI for accessible and customizable components.
*   **Light/Dark Mode Toggle**: Seamless theme switching for enhanced user experience.
*   **AI Chat Assistant (Steve)**: An integrated chatbot powered by a FastAPI backend, capable of answering questions about the portfolio content and performing tool-assisted actions.
*   **Tool Integration**: The AI assistant can invoke external tools (e.g., Weather, GitHub Profile, LinkedIn Profile) and display their outputs as rich, interactive cards.
*   **Smooth Scrolling**: Navigation links provide smooth transitions to different sections.
*   **CV Download**: Direct download link for the professional CV.

## Tech Stack

*   **Frontend Framework**: React (with Vite for fast development)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI
*   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
*   **Routing**: (Implicit, via scroll-to-section)
*   **API Communication**: `fetch` API for interacting with the backend.
*   **Markdown Rendering**: `react-markdown` with `remark-gfm` and `rehype-sanitize` for safe and rich text display.
*   **Icons**: Lucide React

## Project Structure

```
rhyliieee-website/
├── public/
│   ├── steve-avatar.png
│   └── cv.pdf
├── src/
│   ├── App.tsx                 # Main application component
│   ├── index.css               # Tailwind CSS imports
│   ├── main.tsx                # Entry point for React app
│   ├── components/             # Reusable UI components
│   │   ├── AboutSection.tsx
│   │   ├── ChatUI.tsx          # AI Chat Assistant UI
│   │   ├── ContactSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── NavBar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ToolOutputDisplay.tsx # Renders specific tool output cards
│   │   ├── ui/                 # Shadcn UI components
│   │   └── tools/              # Custom tool output components (e.g., GithubCard, LinkedInCard, WeatherCard)
│   ├── data/                   # Static data for portfolio sections (e.g., portfolioData.ts)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChatNoStream.ts  # Hook for non-streaming chat (currently used)
│   │   └── useChatStream.ts    # Hook for streaming chat (alternative)
│   ├── types.ts                # TypeScript type definitions
│   └── utils/                  # Utility functions (e.g., scrollUtils.ts)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation (this file)
```

## Setup and Installation

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or Yarn
*   A running FastAPI backend for the AI assistant (refer to its documentation for setup). Ensure the API key and base URL match the frontend configuration.

### Frontend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd rhyliieee-website
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure API Base URL and Key:**
    Open `src/hooks/useChatNoStream.ts` (and `useChatStream.ts` if you plan to switch) and update `API_BASE_URL` and `API_KEY` to match your FastAPI backend.
    ```typescript
    // filepath: src/hooks/useChatNoStream.ts
    const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI server URL
    const API_KEY = 'your_actual_api_key'; // IMPORTANT: Replace with your actual API key from STEVE_AGENT_API_KEYS
    ```
    **Note**: For production, it's highly recommended to use environment variables for `API_KEY` and `API_BASE_URL` instead of hardcoding them. Vite supports `.env` files.

4.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically run on `http://localhost:5173`.

### Backend Setup (FastAPI)

This frontend relies on a separate FastAPI backend for the AI chat assistant. You will need to set up and run that project independently. Key considerations for the backend:

*   It should expose a `/ai/steve/v1/chat/no-stream` (or `/ai/steve/v1/chat/stream-tokens`) endpoint.
*   It must implement API key authentication, expecting a header like `RHYLIIEEE-API-KEY`.
*   It should be configured to handle CORS requests from your frontend's origin (`http://localhost:5173` in development).
*   The backend should be capable of integrating with various tools (e.g., weather, GitHub, LinkedIn) and returning structured JSON responses for tool outputs.

## Usage

Navigate through the website using the navigation bar or by scrolling. The AI chat assistant is available at the bottom of the screen.

## AI Chat Assistant

The website features an AI chat assistant named "Steve" that can provide information about the portfolio, projects, and skills.

### Functionality

*   **Conversational AI**: Engages in natural language conversations.
*   **Tool Invocation**: Can call external tools (e.g., `weather-data`, `github-profile`, `linkedin-profile`) to retrieve real-time information.
*   **Streaming Responses**: (Currently using `useChatNoStream` which processes the full response at once, but `useChatStream` is available for token-by-token streaming if the backend supports it).
*   **Persistent Thread**: Maintains conversation history using `localStorage` via a `threadId`.

### Rate Limiting

To prevent abuse and manage API costs, the chat assistant implements a client-side rate limit:

*   **Limit**: Users are allowed `10` messages within a `1-hour` window.
*   **Cooldown**: If the limit is reached, a cooldown period of `1 hour` is enforced before more messages can be sent.
*   **Network Identifier**: The limit is tracked per network identifier (IP address, fetched via `api.ipify.org`). This is stored in `localStorage`.

### Custom Tool Outputs

When the AI assistant invokes a tool, the `ToolOutputDisplay` component (`src/components/ToolOutputDisplay.tsx`) intelligently renders a specific React component based on the `toolName`.

*   **`weather-data`**: Renders `WeatherCard` (`src/components/tools/WeatherCard.tsx`)
*   **`github-profile`**: Renders `GithubCard` (`src/components/tools/GithubCard.tsx`)
*   **`linkedin-profile`**: Renders `LinkedInCard` (`src/components/tools/LinkedInCard.tsx`)

Each tool card also has a corresponding `Skeleton` component for displaying loading states.

## Theming

The website supports both light and dark modes. The theme state is managed in `App.tsx` and passed down to `Layout.tsx` and `Navbar.tsx`. The `useEffect` hook in `App.tsx` toggles the `dark` class on the `document.documentElement` to apply Tailwind CSS dark mode styles.

## Deployment Notes

*   **Environment Variables**: For production deployments, ensure `API_BASE_URL` and `API_KEY` are managed securely using environment variables (e.g., `.env` files with Vite, or platform-specific configurations).
*   **CORS**: Your FastAPI backend must be configured to allow CORS requests from your deployed frontend's domain.
*   **CV Path**: Verify that the `professionalProfile.cvUrl` in `src/data/portfolioData.ts` points to the correct public path of your CV (e.g., `/cv.pdf` if placed in the `public` folder).
*   **Image Optimization**: Consider optimizing images in the `public` folder for faster loading times.

## Contact

For any questions or collaborations, please refer to the contact information provided on the website or reach out via the GitHub repository.
