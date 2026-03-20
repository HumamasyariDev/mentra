import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../contexts/PageTransitionContext';
import '../styles/layouts/AppLayout.css';

/**
 * Global transition wrapper that handles all page transitions
 * Sits at the root level and manages a single overlay for all navigation
 * 
 * Flow:
 * 1. User clicks planet on dashboard → zoom animation plays (1.2s)
 * 2. After zoom, floating UI and content fade out
 * 3. triggerFadeOut() is called → overlay fades to black (0.5s)
 * 4. Navigation happens → new page loads
 * 5. TransitionWrapper detects location change and calls triggerFadeIn()
 * 6. Overlay fades from black to transparent (0.5s)
 */
export function TransitionWrapper({ children }) {
  const { fadeOut, triggerFadeIn } = usePageTransition();
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);

  // When location changes, fade in the new page if we were faded out
  useEffect(() => {
    const prevLocation = prevLocationRef.current;
    const currentLocation = location.pathname;
    
    // If we're navigating and overlay is faded out to black, fade it in
    if (prevLocation !== currentLocation && fadeOut) {
      triggerFadeIn();
    }
    // If we're navigating but weren't faded out, just ensure overlay is transparent
    else if (prevLocation !== currentLocation && !fadeOut) {
      // Already transparent, no action needed
    }
    
    prevLocationRef.current = currentLocation;
  }, [location.pathname, fadeOut, triggerFadeIn]);

  return (
    <>
      {/* Global transition overlay */}
      <div
        className={`app-layout-transition-overlay ${fadeOut ? "app-layout-overlay-fade-out" : "app-layout-overlay-fade-in"}`}
      />
      {children}
    </>
  );
}
