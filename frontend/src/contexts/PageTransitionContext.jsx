import React, { createContext, useContext, useState, useCallback } from 'react';

const PageTransitionContext = createContext();

export function PageTransitionProvider({ children }) {
  const [fadeOut, setFadeOut] = useState(false);

  const triggerFadeOut = useCallback(() => {
    setFadeOut(true);
  }, []);

  const triggerFadeIn = useCallback(() => {
    setFadeOut(false);
  }, []);

  return (
    <PageTransitionContext.Provider value={{ fadeOut, triggerFadeOut, triggerFadeIn }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
}
