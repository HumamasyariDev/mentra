import { useCallback, useRef, useEffect } from 'react';

const DEFAULT_COSMIC_COLORS = ['#ffffff', '#f0f9ff', '#bae6fd', '#c084fc', '#818cf8', '#fdf4ff'];
const DEFAULT_MAX_PARTICLES = 150;
const DEFAULT_SPAWN_INTERVAL = 12;
const DEFAULT_LIFETIME_DURATION = 1200;
const DEFAULT_PARTICLE_MIN_SIZE = 1.0;
const DEFAULT_PARTICLE_MAX_SIZE = 3.5;
const DEFAULT_INITIAL_OPACITY_MIN = 0.6;
const DEFAULT_INITIAL_OPACITY_MAX = 1.0;
const MIN_SPAWN_DISTANCE = 1;

/**
 * Optimized particle trail hook.
 * Uses refs instead of useState to avoid React re-renders on every animation frame.
 * The SVG <g> element is mutated directly via DOM for zero-cost rendering.
 */
const useParticleTrail = ({
  enabled = true,
  viewportState = null,
  panZoomRef = null,
  containerRef = null,
  maxParticles = DEFAULT_MAX_PARTICLES,
  spawnInterval = DEFAULT_SPAWN_INTERVAL,
  lifetimeDuration = DEFAULT_LIFETIME_DURATION,
  cosmicColors = DEFAULT_COSMIC_COLORS,
} = {}) => {
  // All particle data lives in refs — no React re-renders
  const particlesRef = useRef([]);
  const isEnabledRef = useRef(enabled);
  const lastSpawnTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const particleIdRef = useRef(0);
  const listenerAttachedRef = useRef(false);
  // Reference to the SVG <g> element for direct DOM mutation
  const particleGroupRef = useRef(null);

  /**
   * Spawn a new particle at cursor position
   */
  const spawnParticle = useCallback((x, y, currentTime = Date.now()) => {
    const vx = (Math.random() - 0.5) * 1.5;
    const vy = (Math.random() - 0.5) * 1.5 - 0.5;

    return {
      id: particleIdRef.current++,
      x,
      y,
      vx,
      vy,
      opacity: DEFAULT_INITIAL_OPACITY_MIN + Math.random() * (DEFAULT_INITIAL_OPACITY_MAX - DEFAULT_INITIAL_OPACITY_MIN),
      color: cosmicColors[Math.floor(Math.random() * cosmicColors.length)],
      createdAt: currentTime,
      lifetimeMs: lifetimeDuration + (Math.random() * 500 - 250),
      size: DEFAULT_PARTICLE_MIN_SIZE + Math.random() * (DEFAULT_PARTICLE_MAX_SIZE - DEFAULT_PARTICLE_MIN_SIZE),
      element: null, // will hold the SVG circle DOM node
    };
  }, [cosmicColors, lifetimeDuration]);

  /**
   * Update particles: fade, move, cleanup expired — all via direct DOM mutation.
   * Called from requestAnimationFrame in MapViewport.
   */
  const updateParticles = useCallback((currentTime = Date.now()) => {
    const particles = particlesRef.current;
    const group = particleGroupRef.current;
    if (!group) return;

    let writeIdx = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const age = currentTime - p.createdAt;

      if (age > p.lifetimeMs) {
        // Remove expired particle from DOM
        if (p.element && p.element.parentNode) {
          p.element.parentNode.removeChild(p.element);
        }
        continue;
      }

      // Update opacity (exponential fade)
      const progress = age / p.lifetimeMs;
      p.opacity = Math.max(0, 1 - Math.pow(progress, 1.5));

      // Apply velocity (drift with friction)
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Update the DOM element directly (no React reconciliation)
      if (p.element) {
        p.element.setAttribute('cx', p.x);
        p.element.setAttribute('cy', p.y);
        p.element.setAttribute('opacity', p.opacity);
      }

      particles[writeIdx++] = p;
    }
    particles.length = writeIdx;
  }, []);

  /**
   * Handle mouse move event — spawns particles
   */
  const handleMouseMove = useCallback((e) => {
    if (!isEnabledRef.current) return;

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

    // Check spawn conditions
    const timeSinceLastSpawn = currentTime - lastSpawnTimeRef.current;
    const dx = x - lastMousePosRef.current.x;
    const dy = y - lastMousePosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (timeSinceLastSpawn >= spawnInterval && distance >= MIN_SPAWN_DISTANCE) {
      const group = particleGroupRef.current;
      if (group) {
        const newParticle = spawnParticle(x, y, currentTime);

        // Create SVG circle element directly in DOM (no React)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', newParticle.x);
        circle.setAttribute('cy', newParticle.y);
        circle.setAttribute('r', newParticle.size);
        circle.setAttribute('fill', newParticle.color);
        circle.setAttribute('opacity', newParticle.opacity);
        group.appendChild(circle);
        newParticle.element = circle;

        particlesRef.current.push(newParticle);

        // Enforce max particles limit
        while (particlesRef.current.length > maxParticles) {
          const oldest = particlesRef.current.shift();
          if (oldest.element && oldest.element.parentNode) {
            oldest.element.parentNode.removeChild(oldest.element);
          }
        }
      }

      lastSpawnTimeRef.current = currentTime;
      lastMousePosRef.current = { x, y };
    }
  }, [panZoomRef, viewportState, spawnInterval, spawnParticle, maxParticles, containerRef]);

  /**
   * Attach to document if no containerRef
   */
  useEffect(() => {
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
   * Sync enabled prop to ref
   */
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  /**
   * Clear all particles
   */
  const clearParticles = useCallback(() => {
    const group = particleGroupRef.current;
    if (group) {
      while (group.firstChild) {
        group.removeChild(group.firstChild);
      }
    }
    particlesRef.current = [];
  }, []);

  return {
    particleGroupRef,  // Attach this to a <g> element
    updateParticles,
    isEnabled: enabled,
    setEnabled: (val) => { isEnabledRef.current = val; },
    clearParticles,
    handleMouseMove,
  };
};

export default useParticleTrail;
