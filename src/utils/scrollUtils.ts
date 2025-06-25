import React from 'react';

/**
 * Smoothly scrolls to a given ref, accounting for a sticky navbar height.
 * @param ref - The React ref of the element to scroll to.
 * @param offset - Optional offset from the top (e.g., navbar height). Defaults to 60.
 */
export const scrollToRef = (ref: React.RefObject<HTMLElement | null>, offset: number = 60): void => {
  if (ref.current) {
    const elementPosition = ref.current.offsetTop;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};