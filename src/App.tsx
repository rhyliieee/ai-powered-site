import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import './index.css'; // Assuming your Tailwind base styles are imported here or in main.tsx

const App: React.FC = () => {
  // Light/dark mode state (default: light)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
        <Layout theme={theme} setTheme={setTheme} />
    </div>
  );
};

export default App;