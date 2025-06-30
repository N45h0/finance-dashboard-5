import { useState, useEffect } from 'react';

export const useHashNavigation = () => {
  const [activeRoute, setActiveRoute] = useState(window.location.hash || '#/resumen');

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(window.location.hash || '#/resumen');
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return activeRoute;
};