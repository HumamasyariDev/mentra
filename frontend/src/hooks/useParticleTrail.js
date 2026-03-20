import { useState, useCallback, useRef, useEffect } from 'react';

const DEFAULT_COSMIC_COLORS = ['#ffffff', '#f0f9ff', '#bae6fd', '#c084fc', '#818cf8', '#fdf4ff'];
const DEFAULT_MAX_PARTICLES = 150;
const DEFAULT_SPAWN_INTERVAL = 12; // spawn slightly faster for a denser tail
const DEFAULT_LIFETIME_DURATION = 1200; // longer lifetime to see the drift
const DEFAULT_PARTICLE_MIN_SIZE = 1.0;
const DEFAULT_PARTICLE_MAX_SIZE = 3.5;
const DEFAULT_INITIAL_OPACITY_MIN = 0.6;
const DEFAULT_INITIAL_OPACITY_MAX = 1.0;
const MIN_SPAWN_DISTANCE = 1;

const useParticleTrail = ({
  enabled = true,
  viewportState = null, // legacy
  panZoomRef = null,    // use this for live updates during drag
  containerRef = null,
  maxParticles = DEFAULT_MAX_PARTICLES,
  spawnInterval = DEFAULT_SPAWN_INTERVAL,
  lifetimeDuration = DEFAULT_LIFETIME_DURATION,
  cosmicColors = DEFAULT_COSMIC_COLORS,
} = {}) => {
  const [particles, setParticles] = useState([]);
  const [isEnabled, setEnabled] = useState(enabled);

  // Refs for tracking state without triggering re-renders
  const lastSpawnTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const particleIdRef = useRef(0);
  const listenerAttachedRef = useRef(false);

  /**
   * Calculate opacity for a particle based on its age
   */
  const getParticleOpacity = useCallback((particle, currentTime = Date.now()) => {
    const age = currentTime - particle.createdAt;
    // Exponential fade out looks more natural (like glowing embers fading)
    const progress = age / lifetimeDuration;
    const opacity = Math.max(0, 1 - Math.pow(progress, 1.5));
    return opacity;
  }, [lifetimeDuration]);

  /**
   * Calculate distance between two points
   */
  const calculateDistance = useCallback((p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Get random color from cosmic palette
   */
  const getRandomColor = useCallback(() => {
    return cosmicColors[Math.floor(Math.random() * cosmicColors.length)];
  }, [cosmicColors]);

  /**
   * Spawn a new particle at cursor position
   */
  const spawnParticle = useCallback((x, y, currentTime = Date.now()) => {
    // Add random drift velocity so they spread out like magical dust
    const vx = (Math.random() - 0.5) * 1.5;
    const vy = (Math.random() - 0.5) * 1.5 - 0.5; // slight upward drift tendency

    const newParticle = {
      id: particleIdRef.current++,
      x,
      y,
      vx,
      vy,
      opacity: DEFAULT_INITIAL_OPACITY_MIN + Math.random() * (DEFAULT_INITIAL_OPACITY_MAX - DEFAULT_INITIAL_OPACITY_MIN),
      color: getRandomColor(),
      createdAt: currentTime,
      lifetimeMs: lifetimeDuration + (Math.random() * 500 - 250), // vary lifetime slightly
      size: DEFAULT_PARTICLE_MIN_SIZE + Math.random() * (DEFAULT_PARTICLE_MAX_SIZE - DEFAULT_PARTICLE_MIN_SIZE),
    };
    return newParticle;
  }, [getRandomColor, lifetimeDuration]);

  /**
   * Update particles: cleanup expired, adjust opacities, update positions
   */
  const updateParticles = useCallback((currentTime = Date.now()) => {
    setParticles((prevParticles) => {
      // Filter out expired particles
      const activeParticles = prevParticles.filter((particle) => {
        const age = currentTime - particle.createdAt;
        return age <= particle.lifetimeMs;
      });

      // Update opacities and positions for remaining particles
      const updatedParticles = activeParticles.map((particle) => {
        const opacity = getParticleOpacity(particle, currentTime);
        // Apply velocity (drift)
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;
        
        return { 
          ...particle, 
          opacity, 
          x: newX, 
          y: newY,
          // Add a tiny bit of drag/friction
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
        };
      });

      return updatedParticles;
    });
  }, [getParticleOpacity]);

  /**
   * Handle mouse move event
   */
  const handleMouseMove = useCallback((e) => {
    if (!isEnabled) return;

    const currentTime = Date.now();
    let x = e.clientX;
    let y = e.clientY;

    // Convert screen coordinates to SVG viewBox coordinates
    if (containerRef && containerRef.current) {
      const svgElement = containerRef.current;
      const point = svgElement.createSVGPoint();
      point.x = x;
      point.y = y;
      
      const screenCTM = svgElement.getScreenCTM();
      if (screenCTM) {
        const svgP = point.matrixTransform(screenCTM.inverse());
        
        // Use live pan/zoom from ref if available, otherwise use viewportState prop
        if (panZoomRef && panZoomRef.current) {
          x = (svgP.x - panZoomRef.current.x) / panZoomRef.current.scale;
          y = (svgP.y - panZoomRef.current.y) / panZoomRef.current.scale;
        } else if (viewportState && viewportState.pan && viewportState.zoom) {
          x = (svgP.x - viewportState.pan.x) / viewportState.zoom;
          y = (svgP.y - viewportState.pan.y) / viewportState.zoom;
        } else {
          x = svgP.x;
          y = svgP.y;
        }
      }
    } else if (panZoomRef && panZoomRef.current) {
      x = (x - panZoomRef.current.x) / panZoomRef.current.scale;
      y = (y - panZoomRef.current.y) / panZoomRef.current.scale;
    } else if (viewportState && viewportState.pan && viewportState.zoom) {
      x = (x - viewportState.pan.x) / viewportState.zoom;
      y = (y - viewportState.pan.y) / viewportState.zoom;
    }

    // Check if enough time has passed and cursor moved far enough
    const timeSinceLastSpawn = currentTime - lastSpawnTimeRef.current;
    const distance = calculateDistance({ x, y }, lastMousePosRef.current);

    if (timeSinceLastSpawn >= spawnInterval && distance >= MIN_SPAWN_DISTANCE) {
      // Spawn new particle
      setParticles((prevParticles) => {
        const newParticles = [...prevParticles, spawnParticle(x, y, currentTime)];

        // Enforce max particles limit
        if (newParticles.length > maxParticles) {
          // Remove oldest particles
          const excess = newParticles.length - maxParticles;
          return newParticles.slice(excess);
        }

        return newParticles;
      });

      lastSpawnTimeRef.current = currentTime;
      lastMousePosRef.current = { x, y };
    }
  }, [isEnabled, panZoomRef, viewportState, spawnInterval, calculateDistance, spawnParticle, maxParticles, containerRef]);

  /**
   * We now attach to the SVG via onMouseMove prop directly or window as fallback
   */
  useEffect(() => {
    // If containerRef is provided, we expect the component to use the returned handleMouseMove
    // Otherwise, attach to document
    if (!containerRef?.current && !listenerAttachedRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      listenerAttachedRef.current = true;

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        listenerAttachedRef.current = false;
      };
    }
  }, [handleMouseMove, containerRef]);

  /**
   * Clear all particles
   */
  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  return {
    particles,
    setParticles,
    updateParticles,
    isEnabled,
    setEnabled,
    clearParticles,
    handleMouseMove, // Expose for direct attachment
  };
};

export default useParticleTrail;
