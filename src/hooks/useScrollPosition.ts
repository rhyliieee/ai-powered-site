// filepath: c:\Users\jomar\Downloads\personal-site\personal_website\rhyliieee-website\src\hooks\useScrollPosition.ts
import { useEffect, useState } from 'react';

const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollY;
};

export default useScrollPosition;