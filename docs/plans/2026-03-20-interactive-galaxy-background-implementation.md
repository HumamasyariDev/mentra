# Interactive Galaxy Background Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an immersive, interactive galaxy background for the dashboard map with parallax animation, clickable debris physics, and cursor particle trails — all at 60fps.

**Architecture:** Canvas layer (galaxy parallax) + SVG layer (interactive debris + particle trail) integrated into existing MapViewport. Physics managed via custom hooks, cleanup via lifecycle tracking.

**Tech Stack:** React (hooks), SVG, HTML5 Canvas, requestAnimationFrame, GSAP (for debris physics)

---

## Overview & Execution Strategy

This plan breaks the feature into 6 focused tasks:

1. **Setup & Foundation** — Create GalaxyCanvas component + canvas rendering structure
2. **Galaxy Animation** — Implement galaxy visual + rotation animation
3. **Galaxy Parallax** — Add parallax effect based on pan/zoom state
4. **Debris System** — Build DebrisManager hook + spawn/lifecycle logic
5. **Debris Physics & Interaction** — Add click handlers, split behavior, physics
6. **Cursor Particle Trail** — Implement particle spawning + fade animation

Each task is 5-10 minutes of focused work.

---

## Task 1: Setup & Create GalaxyCanvas Component

**Files:**
- Create: `frontend/src/components/dashboard/GalaxyCanvas.jsx`
- Create: `frontend/src/styles/components/dashboard/GalaxyCanvas.css`
- Modify: `frontend/src/components/dashboard/MapViewport.jsx` (add GalaxyCanvas import + render)

**Step 1: Create GalaxyCanvas component file**

```jsx
// frontend/src/components/dashboard/GalaxyCanvas.jsx
import React, { useEffect, useRef } from 'react';
import '../../styles/components/dashboard/GalaxyCanvas.css';

export const GalaxyCanvas = ({ panState, scale, viewBoxWidth = 2000, viewBoxHeight = 1400 }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    // Animation loop
    const animate = () => {
      rotationRef.current += 0.0005; // Slow rotation (~0.5°/sec at 60fps)
      
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Save context state
      ctx.save();

      // Apply parallax translation
      const parallaxFactor = 0.4;
      const parallaxX = (panState?.x || 0) * parallaxFactor;
      const parallaxY = (panState?.y || 0) * parallaxFactor;
      ctx.translate(parallaxX, parallaxY);

      // Draw galaxy at center
      drawGalaxy(ctx, canvasWidth, canvasHeight, rotationRef.current);

      ctx.restore();

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [panState]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = canvasRef.current.offsetWidth * dpr;
        canvasRef.current.height = canvasRef.current.offsetHeight * dpr;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="galaxy-canvas" />;
};

// Galaxy rendering function
function drawGalaxy(ctx, width, height, rotation) {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height) / 1.5;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  // Core glow
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 0.3);
  coreGradient.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
  coreGradient.addColorStop(0.5, 'rgba(200, 100, 200, 0.4)');
  coreGradient.addColorStop(1, 'rgba(100, 50, 200, 0.1)');

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, maxRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Spiral arms
  drawSpiralArm(ctx, maxRadius, 0, 'rgba(100, 150, 255, 0.3)');
  drawSpiralArm(ctx, maxRadius, Math.PI, 'rgba(150, 100, 200, 0.3)');

  ctx.restore();
}

// Helper function to draw spiral arms
function drawSpiralArm(ctx, maxRadius, angleOffset, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 40;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * Math.PI * 2 + angleOffset;
    const radius = (i / 100) * maxRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

**Step 2: Create GalaxyCanvas CSS file**

```css
/* frontend/src/styles/components/dashboard/GalaxyCanvas.css */

.galaxy-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: block;
}
```

**Step 3: Update MapViewport.jsx to include GalaxyCanvas**

Find the MapViewport return statement and add GalaxyCanvas before the SVG:

```jsx
// Around line 236 in MapViewport.jsx
return (
  <div ref={containerRef} className="map-viewport">
    {/* Galaxy canvas parallax background */}
    <GalaxyCanvas panState={panZoomState.current} scale={panZoomState.current.scale} />
    
    {/* Existing SVG */}
    <svg
      ref={svgRef}
      viewBox="0 0 2000 1400"
      className="map-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ... existing content ... */}
    </svg>

    {/* ... rest of component ... */}
  </div>
);
```

Also add import at top of MapViewport.jsx:

```jsx
import { GalaxyCanvas } from './GalaxyCanvas';
```

**Step 4: Update MapViewport.css to ensure SVG is on top**

```css
/* Add to frontend/src/styles/components/dashboard/MapViewport.css */

.map-svg {
  position: relative;
  z-index: 10; /* Ensure SVG is above canvas */
}
```

**Step 5: Test setup**

Run the frontend dev server:
```bash
cd frontend && npm run dev
```

Expected result: Black background with rotating galaxy visible behind the existing planets. Galaxy moves when you pan (parallax effect visible).

**Step 6: Commit**

```bash
git add frontend/src/components/dashboard/GalaxyCanvas.jsx
git add frontend/src/styles/components/dashboard/GalaxyCanvas.css
git add frontend/src/components/dashboard/MapViewport.jsx
git add frontend/src/styles/components/dashboard/MapViewport.css
git commit -m "feat: add galaxy canvas with parallax animation"
```

---

## Task 2: Refine Galaxy Visual & Rotation

**Files:**
- Modify: `frontend/src/components/dashboard/GalaxyCanvas.jsx` (improve drawGalaxy function)

**Step 1: Enhanced galaxy rendering**

Replace the `drawGalaxy` function with more realistic rendering:

```jsx
function drawGalaxy(ctx, width, height, rotation) {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.max(width, height) / 1.5;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  // Outer halo (dark blue/purple)
  const haloGradient = ctx.createRadialGradient(0, 0, maxRadius * 0.5, 0, 0, maxRadius);
  haloGradient.addColorStop(0, 'rgba(20, 30, 80, 0)');
  haloGradient.addColorStop(0.7, 'rgba(50, 30, 100, 0.15)');
  haloGradient.addColorStop(1, 'rgba(30, 20, 60, 0.05)');

  ctx.fillStyle = haloGradient;
  ctx.beginPath();
  ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
  ctx.fill();

  // Core glow (bright white/yellow)
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius * 0.35);
  coreGradient.addColorStop(0, 'rgba(255, 240, 150, 0.9)');
  coreGradient.addColorStop(0.3, 'rgba(220, 100, 200, 0.6)');
  coreGradient.addColorStop(0.7, 'rgba(100, 50, 180, 0.3)');
  coreGradient.addColorStop(1, 'rgba(50, 20, 100, 0.1)');

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, maxRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Spiral arms (2 arms at 180°)
  drawSpiralArm(ctx, maxRadius, 0, 'rgba(100, 150, 255, 0.25)', 50);
  drawSpiralArm(ctx, maxRadius, Math.PI, 'rgba(150, 100, 200, 0.25)', 50);

  ctx.restore();
}

function drawSpiralArm(ctx, maxRadius, angleOffset, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = t * Math.PI * 3 + angleOffset; // 1.5 rotations per arm
    const radius = t * maxRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

**Step 2: Test visuals**

```bash
cd frontend && npm run dev
```

Expected: Galaxy should have more realistic colors (yellow core → purple → blue halo), with visible spiral arms rotating slowly.

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/GalaxyCanvas.jsx
git commit -m "refine: improve galaxy visual quality and spiral arms"
```

---

## Task 3: Add Debris Manager Hook

**Files:**
- Create: `frontend/src/hooks/useDebrisManager.js`
- Modify: `frontend/src/components/dashboard/MapViewport.jsx` (integrate debris into SVG)

**Step 1: Create useDebrisManager hook**

```jsx
// frontend/src/hooks/useDebrisManager.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useDebrisManager = (maxDebris = 10) => {
  const [debrisItems, setDebrisItems] = useState([]);
  const debrisIdRef = useRef(0);
  const spawnIntervalRef = useRef(null);

  // Spawn new debris periodically
  const spawnDebris = useCallback(() => {
    setDebrisItems((prev) => {
      if (prev.length >= maxDebris) return prev;

      const newDebris = {
        id: debrisIdRef.current++,
        x: Math.random() * 2000,
        y: Math.random() * 1400,
        vx: (Math.random() - 0.5) * 2, // velocity
        vy: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: 30 + Math.random() * 40,
        type: Math.floor(Math.random() * 3), // 3 debris types
        opacity: 0.7,
        createdAt: Date.now(),
        lifetime: 8000 + Math.random() * 4000, // 8-12 seconds
      };

      return [...prev, newDebris];
    });
  }, [maxDebris]);

  // Handle debris click (split into 2 pieces)
  const handleDebrisClick = useCallback((id, x, y, e) => {
    e.stopPropagation();

    setDebrisItems((prev) => {
      const debris = prev.find((d) => d.id === id);
      if (!debris) return prev;

      // Remove clicked debris
      const remaining = prev.filter((d) => d.id !== id);

      // Create 2 smaller pieces
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + Math.PI;
      const speed = 3;

      const piece1 = {
        id: debrisIdRef.current++,
        x: debris.x,
        y: debris.y,
        vx: Math.cos(angle1) * speed,
        vy: Math.sin(angle1) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: debris.size * 0.6,
        type: debris.type,
        opacity: 0.7,
        createdAt: Date.now(),
        lifetime: 3000, // Shorter lifetime for split pieces
        isSplit: true,
      };

      const piece2 = {
        ...piece1,
        id: debrisIdRef.current++,
        vx: Math.cos(angle2) * speed,
        vy: Math.sin(angle2) * speed,
      };

      return [...remaining, piece1, piece2];
    });
  }, []);

  // Update debris positions and lifetimes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setDebrisItems((prev) => {
        const now = Date.now();
        return prev
          .map((debris) => {
            const age = now - debris.createdAt;
            const progress = age / debris.lifetime;

            if (progress >= 1) return null; // Remove expired debris

            return {
              ...debris,
              x: debris.x + debris.vx * 0.016, // ~60fps update
              y: debris.y + debris.vy * 0.016,
              rotation: debris.rotation + debris.rotationSpeed,
              opacity: 0.7 * (1 - Math.max(0, progress - 0.8) / 0.2), // Fade out last 20%
              vy: debris.vy + 0.05, // Slight gravity
            };
          })
          .filter((d) => d !== null);
      });
    }, 16); // ~60fps

    return () => clearInterval(updateInterval);
  }, []);

  // Spawn debris periodically
  useEffect(() => {
    spawnDebris();
    spawnIntervalRef.current = setInterval(spawnDebris, 2000);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [spawnDebris]);

  return { debrisItems, handleDebrisClick };
};
```

**Step 2: Test hook creation**

```bash
cd frontend && npm run dev
```

No visible changes yet (debris not rendered). Just verify no console errors.

**Step 3: Commit**

```bash
git add frontend/src/hooks/useDebrisManager.js
git commit -m "feat: add useDebrisManager hook for debris lifecycle"
```

---

## Task 4: Render Debris in SVG Layer

**Files:**
- Modify: `frontend/src/components/dashboard/MapViewport.jsx` (add debris rendering)
- Modify: `frontend/src/styles/components/dashboard/Island.css` (add debris styling)

**Step 1: Import and integrate debris manager**

In MapViewport.jsx, add import at top:

```jsx
import { useDebrisManager } from '../../hooks/useDebrisManager';
```

In the MapViewport component function, add hook call:

```jsx
export const MapViewport = ({ onIslandClick }) => {
  // ... existing code ...
  const { debrisItems, handleDebrisClick } = useDebrisManager(10);
  // ... rest of code ...
};
```

**Step 2: Add debris rendering to SVG**

In the SVG, add debris group after the transform group (inside MapViewport return, before closing `</svg>`):

```jsx
{/* Debris layer */}
<g className="debris-layer">
  {debrisItems.map((debris) => (
    <g
      key={debris.id}
      className="debris-piece"
      onClick={(e) => handleDebrisClick(debris.id, debris.x, debris.y, e)}
      style={{
        transform: `translate(${debris.x}, ${debris.y}) rotate(${debris.rotation}rad)`,
        opacity: debris.opacity,
      }}
    >
      <DebrisVisual debris={debris} />
    </g>
  ))}
</g>
```

**Step 3: Create DebrisVisual component**

Add to MapViewport.jsx (or separate file):

```jsx
function DebrisVisual({ debris }) {
  const debrisShapes = [
    // Type 0: Triangle
    <polygon
      points="0,-15 15,15 -15,15"
      fill="rgba(100, 150, 200, 0.8)"
      stroke="rgba(150, 200, 255, 0.6)"
      strokeWidth="2"
    />,
    // Type 1: Jagged polygon
    <polygon
      points="0,-18 12,-8 18,0 12,12 0,15 -12,12 -18,0 -12,-8"
      fill="rgba(150, 100, 200, 0.8)"
      stroke="rgba(200, 150, 255, 0.6)"
      strokeWidth="2"
    />,
    // Type 2: Asymmetric shape
    <polygon
      points="0,-12 10,-6 15,3 8,12 -5,10 -12,2"
      fill="rgba(100, 200, 150, 0.8)"
      stroke="rgba(150, 255, 200, 0.6)"
      strokeWidth="2"
    />,
  ];

  return (
    <g className="debris-shape">
      {/* Glow filter */}
      <defs>
        <filter id={`debris-glow-${debris.id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Debris shape */}
      <g
        filter={`url(#debris-glow-${debris.id})`}
        style={{ cursor: 'pointer' }}
      >
        {debrisShapes[debris.type]}
      </g>
    </g>
  );
}
```

**Step 4: Add CSS styling**

```css
/* Add to frontend/src/styles/components/dashboard/Island.css */

.debris-layer {
  z-index: 15; /* Between stars and planets */
}

.debris-piece {
  cursor: pointer;
  transition: opacity 0.1s ease-out;
}

.debris-piece:hover {
  opacity: 1 !important;
}

.debris-shape {
  pointer-events: auto;
}
```

**Step 5: Test debris rendering**

```bash
cd frontend && npm run dev
```

Expected: Debris pieces should spawn and move around the map, clickable, fading in/out. Clicking debris should split it into two smaller pieces.

**Step 6: Commit**

```bash
git add frontend/src/components/dashboard/MapViewport.jsx
git add frontend/src/styles/components/dashboard/Island.css
git commit -m "feat: render interactive debris with click-to-split physics"
```

---

## Task 5: Add Cursor Particle Trail

**Files:**
- Create: `frontend/src/hooks/useParticleTrail.js`
- Modify: `frontend/src/components/dashboard/MapViewport.jsx` (integrate particles)

**Step 1: Create useParticleTrail hook**

```jsx
// frontend/src/hooks/useParticleTrail.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useParticleTrail = (svgRef) => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);

  const handleMouseMove = useCallback(
    (e) => {
      if (!svgRef.current) return;

      const now = Date.now();
      // Spawn particle every 15-20ms
      if (now - lastSpawnTimeRef.current < 15) return;
      lastSpawnTimeRef.current = now;

      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;

      try {
        const svgP = point.matrixTransform(svg.getScreenCTM().inverse());

        const particle = {
          id: particleIdRef.current++,
          x: svgP.x,
          y: svgP.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 + 0.3, // Drift downward
          size: 2 + Math.random() * 3,
          opacity: 0.8,
          createdAt: now,
          lifetime: 800 + Math.random() * 200, // 800-1000ms
        };

        setParticles((prev) => [...prev, particle]);
      } catch (error) {
        // Ignore errors during coordinate transformation
      }
    },
    [svgRef]
  );

  // Update particle lifetimes and remove expired ones
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setParticles((prev) => {
        const now = Date.now();
        return prev
          .map((p) => {
            const age = now - p.createdAt;
            const progress = age / p.lifetime;

            if (progress >= 1) return null;

            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              opacity: 0.8 * (1 - progress), // Fade out
              vy: p.vy + 0.1, // Slight gravity
            };
          })
          .filter((p) => p !== null);
      });
    }, 16);

    return () => clearInterval(updateInterval);
  }, []);

  // Add/remove mouse move listener
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('mousemove', handleMouseMove);
    return () => svg.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, svgRef]);

  return { particles };
};
```

**Step 2: Integrate particles into MapViewport**

Add import at top:

```jsx
import { useParticleTrail } from '../../hooks/useParticleTrail';
```

Add hook call in component:

```jsx
const { particles } = useParticleTrail(svgRef);
```

Add particle rendering in SVG (after debris layer):

```jsx
{/* Particle trail layer */}
<g className="particles-layer">
  {particles.map((particle) => (
    <circle
      key={particle.id}
      cx={particle.x}
      cy={particle.y}
      r={particle.size}
      fill="rgba(255, 255, 255, 0.6)"
      opacity={particle.opacity}
      className="particle"
      pointerEvents="none"
    >
      {/* Optional: Add glow effect */}
      <defs>
        <filter id={`particle-glow-${particle.id}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
    </circle>
  ))}
</g>
```

**Step 3: Add particle CSS styling**

```css
/* Add to frontend/src/styles/components/dashboard/Island.css */

.particles-layer {
  z-index: 20; /* Above debris, below planets */
  pointer-events: none;
}

.particle {
  filter: drop-shadow(0 0 2px rgba(150, 200, 255, 0.8));
}
```

**Step 4: Test particle trail**

```bash
cd frontend && npm run dev
```

Expected: Moving cursor over the map should leave a trail of fading stardust particles. Particles should fade out smoothly.

**Step 5: Commit**

```bash
git add frontend/src/hooks/useParticleTrail.js
git add frontend/src/components/dashboard/MapViewport.jsx
git add frontend/src/styles/components/dashboard/Island.css
git commit -m "feat: add cursor particle trail with fade animation"
```

---

## Task 6: Testing & Final Optimization

**Files:**
- Modify: `frontend/src/components/dashboard/GalaxyCanvas.jsx` (performance tweaks)
- Modify: `frontend/src/components/dashboard/MapViewport.jsx` (verify z-index layering)

**Step 1: Verify z-index layering**

Check that:
- ✓ Planets are always clickable (not blocked by debris)
- ✓ UI elements (hamburger, exp bar) are always clickable
- ✓ Debris fades naturally as you pan
- ✓ Particles don't interfere with interactions

Test by:
```bash
cd frontend && npm run dev
```

- Click planets → should zoom/navigate normally
- Click on UI elements → should respond normally
- Pan the map → debris should fade in/out at edges
- Hover over debris → should show cursor pointer
- Click debris → should split into 2 pieces

**Step 2: Performance profiling**

Open DevTools Performance tab:
- Record 10 seconds of interaction
- Check frame rate (should maintain ~60fps)
- Look for jank in galaxy animation or particle updates

If performance issues:
- Reduce particle lifetime to reduce DOM size
- Reduce debris max count
- Optimize drawGalaxy function

**Step 3: Browser compatibility test**

Test in:
- Chrome/Edge (modern)
- Firefox (modern)
- Safari (if possible)

Expected: Smooth 60fps on all modern browsers.

**Step 4: Mobile responsiveness**

Test on small viewport:
```bash
# DevTools → Toggle device toolbar
```

Expected: Canvas resizes correctly, debris positions responsive, no layout shifts.

**Step 5: Final visual polish**

Adjust debris opacity/colors if needed. Current values:
- Debris opacity: 0.7
- Particle opacity: 0.8 (fading)
- Glow blur: 3px (debris), 1.5px (particles)

Fine-tune in `useDebrisManager.js` and `useParticleTrail.js` if needed.

**Step 6: Build for production**

```bash
cd frontend && npm run build
```

Expected: No errors, bundle size reasonable.

**Step 7: Final commit**

```bash
git add frontend/src/components/dashboard/GalaxyCanvas.jsx
git add frontend/src/components/dashboard/MapViewport.jsx
git commit -m "test: verify 60fps performance and z-index layering"
```

---

## Summary

### What Gets Built
✅ Animated Milky Way galaxy with parallax (Canvas layer)  
✅ Interactive debris with physics split behavior (SVG layer)  
✅ Cursor particle trail with fade animation  
✅ 60fps performance maintained  
✅ No UI blocking/occlusion  

### Key Files Created
- `GalaxyCanvas.jsx` + `GalaxyCanvas.css`
- `useDebrisManager.js`
- `useParticleTrail.js`

### Key Files Modified
- `MapViewport.jsx` (integrate all 3 systems)
- `MapViewport.css` (z-index layering)
- `Island.css` (debris + particle styling)

### Tech Used
- React hooks (useState, useEffect, useCallback, useRef)
- HTML5 Canvas + requestAnimationFrame (galaxy)
- SVG rendering (debris, particles)
- requestAnimationFrame for 60fps updates

---

## Next Steps (After Implementation)

Once all tasks are complete:
1. Replace placeholder SVG debris with real assets
2. Add sound effects for debris splits (optional)
3. Adjust spawn rates/physics based on testing
4. Consider difficulty levels (more debris on harder modes)

---

**Ready to implement?**

**Plan saved to `docs/plans/2026-03-20-interactive-galaxy-background-design.md`**

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review code between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach would you prefer?
