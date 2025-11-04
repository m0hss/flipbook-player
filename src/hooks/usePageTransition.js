import { useState, useEffect } from 'react';

/**
 * Custom hook for page transition delays
 * @param {number} delay - Delay in milliseconds before showing the page (default: 500)
 * @returns {boolean} showPage - Boolean indicating whether to show the page
 */
const usePageTransition = (delay = 500) => {
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPage(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showPage;
};

export default usePageTransition;
