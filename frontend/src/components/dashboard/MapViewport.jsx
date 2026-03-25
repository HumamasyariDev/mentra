import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Island, ISLANDS } from './Island';
import GalaxyCanvas from './GalaxyCanvas';
import useParticleTrail from '../../hooks/useParticleTrail';
import '../../styles/components/dashboard/MapViewport.css';

export const MapViewport = ({ onIslandClick, dashboardData }) => {
  const svgRef = useRef(null);
  const groupRef = useRef(null);
  const containerRef = useRef(null);
  const isZooming = useRef(false);
  const [isZoomingState, setIsZoomingState] = React.useState(false);
  const animationFrameRef = useRef(null);
  const rafThrottleRef = useRef(null);
  const pendingMouseMoveRef = useRef(null);

  // Pan and zoom state
  const panZoomState = useRef({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Initialize particle trail hook
  const {
    particles,
    updateParticles,
    handleMouseMove,
  } = useParticleTrail({
    enabled: true,
    panZoomRef: panZoomState,
    containerRef: svgRef,
    maxParticles: 80,
  });

  // Initialize GSAP context
  useGSAP(
    () => {
      if (!svgRef.current || !groupRef.current || !containerRef.current) {
        return;
      }

      // Mouse wheel zoom
      const handleWheel = (e) => {
        e.preventDefault();
        if (isZooming.current) return;
        
        // Get mouse coordinates in SVG viewBox space
        const point = svgRef.current.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const svgP = point.matrixTransform(svgRef.current.getScreenCTM().inverse());

        let currentScale = panZoomState.current.scale;
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        // Adjust clamp to allow zooming in further (up to 4x)
        const newScale = gsap.utils.clamp(0.5, 4, currentScale * zoomFactor);

        // Find where the mouse is in the group's local coordinate system
        const groupX = (svgP.x - panZoomState.current.x) / currentScale;
        const groupY = (svgP.y - panZoomState.current.y) / currentScale;

        // Calculate new pan to keep the mouse point stationary
        const scaleDiff = newScale - currentScale;
        let newX = panZoomState.current.x - (groupX * scaleDiff);
        let newY = panZoomState.current.y - (groupY * scaleDiff);

        // Apply boundary limits
        // The viewBox is 2000x1400.
        // Allow reasonable panning but prevent showing too much empty void.
        // Using tolerance-based bounds that scale with zoom level
        const tolerance = 300;
        const minX = -tolerance * newScale;
        const maxX = tolerance * newScale;
        const minY = -tolerance * newScale;
        const maxY = tolerance * newScale;

        newX = gsap.utils.clamp(minX, maxX, newX);
        newY = gsap.utils.clamp(minY, maxY, newY);

        // Animate to new zoom level
        gsap.to(panZoomState.current, {
          x: newX,
          y: newY,
          scale: newScale,
          duration: 0.3,
          onUpdate: () => {
            updateTransform();
          },
        });
      };

      // Pan on drag
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartPanX = 0;
      let dragStartPanY = 0;

      const handleMouseDown = (e) => {
        if (e.button !== 0 || isZooming.current) return; // Left mouse button only, disable if animating
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartPanX = panZoomState.current.x;
        dragStartPanY = panZoomState.current.y;
      };

      const handleMouseMove = (e) => {
        if (!isDragging || isZooming.current) return;

        // Store event for RAF processing instead of immediate processing
        pendingMouseMoveRef.current = e;

        // Only schedule RAF callback if not already scheduled
        if (!rafThrottleRef.current) {
          rafThrottleRef.current = requestAnimationFrame(() => {
            const event = pendingMouseMoveRef.current;
            if (event && isDragging) {
              // Calculate delta in SVG viewBox units
              const pointStart = svgRef.current.createSVGPoint();
              pointStart.x = dragStartX;
              pointStart.y = dragStartY;
              const svgPStart = pointStart.matrixTransform(svgRef.current.getScreenCTM().inverse());
              
              const pointCurrent = svgRef.current.createSVGPoint();
              pointCurrent.x = event.clientX;
              pointCurrent.y = event.clientY;
              const svgPCurrent = pointCurrent.matrixTransform(svgRef.current.getScreenCTM().inverse());
              
              const deltaX = (svgPCurrent.x - svgPStart.x);
              const deltaY = (svgPCurrent.y - svgPStart.y);

              let newPanX = dragStartPanX + deltaX;
              let newPanY = dragStartPanY + deltaY;

              // Apply boundary limits during drag
              const currentScale = panZoomState.current.scale;
              const tolerance = 300;
              const minX = -tolerance * currentScale;
              const maxX = tolerance * currentScale;
              const minY = -tolerance * currentScale;
              const maxY = tolerance * currentScale;
              
              newPanX = gsap.utils.clamp(minX, maxX, newPanX);
              newPanY = gsap.utils.clamp(minY, maxY, newPanY);

              panZoomState.current.x = newPanX;
              panZoomState.current.y = newPanY;

              updateTransform();
            }
            rafThrottleRef.current = null;
          });
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      // Update transform using SVG attributes, not CSS transforms
      const updateTransform = () => {
        if (groupRef.current) {
          const transformString = `translate(${panZoomState.current.x}, ${panZoomState.current.y}) scale(${panZoomState.current.scale})`;
          groupRef.current.setAttribute('transform', transformString);
        }
      };

      // Attach event listeners
      svgRef.current.addEventListener('wheel', handleWheel, { passive: false });
      svgRef.current.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      {/* Initial animation: zoom in from 1.0 to 1.2 for full view */}
      gsap.fromTo(
        panZoomState.current,
        { scale: 1.0, x: 0, y: 0 },
        {
          scale: 1.0,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            updateTransform();
          },
        }
      );

      return () => {
        svgRef.current?.removeEventListener('wheel', handleWheel);
        svgRef.current?.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (rafThrottleRef.current) {
          cancelAnimationFrame(rafThrottleRef.current);
        }
      };
    },
    { scope: containerRef }
  );

  // Animation loop for debris and particles physics
  useEffect(() => {
    const animate = () => {
      // Update particles: fade and cleanup
      updateParticles(Date.now());
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateParticles]);

  const handleIslandClick = (island) => {
    if (isZooming.current) return;
    
    // Animate camera zooming into the planet before navigating
    isZooming.current = true;
    setIsZoomingState(true);
    
    const targetScale = 4;
    
    // Get the actual center of the SVG viewport in screen space
    const svgRect = svgRef.current.getBoundingClientRect();
    const screenCenterX = svgRect.left + svgRect.width / 2;
    const screenCenterY = svgRect.top + svgRect.height / 2;
    
    // Convert screen center to viewBox coordinates using inverse CTM
    const point = svgRef.current.createSVGPoint();
    point.x = screenCenterX;
    point.y = screenCenterY;
    const screenCTM = svgRef.current.getScreenCTM();
    if (!screenCTM) return;
    
    const viewBoxCenter = point.matrixTransform(screenCTM.inverse());
    
    // Island position (island.x, island.y) is already the center of the planet circle
    
    // To center island on screen after zooming:
    // With transform: translate(x, y) scale(s)
    // Island at (island.x, island.y) appears at (x + island.x*s, y + island.y*s)
    // We want it to appear at viewBox screen center: (viewBoxCenter.x, viewBoxCenter.y)
    // So: x = viewBoxCenter.x - island.x*s
    const targetX = viewBoxCenter.x - (island.x * targetScale);
    const targetY = viewBoxCenter.y - (island.y * targetScale);


    gsap.to(panZoomState.current, {
      x: targetX,
      y: targetY,
      scale: targetScale,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (groupRef.current) {
          const transformString = `translate(${panZoomState.current.x}, ${panZoomState.current.y}) scale(${panZoomState.current.scale})`;
          groupRef.current.setAttribute('transform', transformString);
        }
      },
      onComplete: () => {
        // Log final state after zoom completes
        if (onIslandClick) {
          onIslandClick(island);
        }
      }
    });
  };

  return (
    <div ref={containerRef} className="map-viewport">
      {/* GalaxyCanvas - renders behind the main SVG viewport */}
      <GalaxyCanvas
        viewportState={{
          pan: { x: panZoomState.current.x, y: panZoomState.current.y },
          zoom: panZoomState.current.scale,
        }}
        viewBoxWidth={2000}
        viewBoxHeight={1400}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 2000 1400"
        className="map-svg"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
      >
        <defs />

        {/* Background is now the GalaxyCanvas - this SVG is transparent for islands/particles */}
        <rect width="2000" height="1400" fill="none" />

        {/* Transform group for pan/zoom */}
        <g ref={groupRef}>
          {/* Particles group - moved inside transform group so it stays on map when panning */}
          <g id="particles-layer" style={{ pointerEvents: 'none' }}>
            {particles.map((particle) => (
              <circle
                key={`particle-${particle.id}`}
                cx={particle.x}
                cy={particle.y}
                r={particle.size || 1.5}
                fill={particle.color || '#a78bfa'}
                opacity={particle.opacity}
              />
            ))}
          </g>

          {/* Islands */}
          {ISLANDS.map((island) => (
            <g
              key={island.id}
              onClick={() => handleIslandClick(island)}
              className={`island ${island.id}-island${isZoomingState ? ' island-zooming' : ''}`}
              style={{
                transformOrigin: `${island.x}px ${island.y}px`,
              }}
            >
              <Island island={island} dashboardData={dashboardData} isZooming={isZoomingState} />
            </g>
          ))}
        </g>
      </svg>

      {/* Controls hint */}
      <div className="map-controls-hint">
        <p>Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  );
};
