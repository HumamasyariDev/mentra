import React, { useEffect, useRef, useCallback } from 'react';
import '../../styles/components/dashboard/GalaxyCanvas.css';

/** Check if user prefers reduced motion */
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const GalaxyCanvas = ({
  viewportState = { pan: { x: 0, y: 0 }, zoom: 1 },
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastViewportRef = useRef(viewportState);
  
  // Interactive network particles state
  const bgParticlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Shooting stars state
  const shootingStarsRef = useRef([]);
  const nextShootingStarTimeRef = useRef(0);

  // Initialize background stardust particles
  const initParticles = useCallback((width, height) => {
    const particleCount = Math.floor((width * height) / 20000); // Balanced particle count for performance
    const newParticles = [];
    const colors = ['#ffffff', '#e0f2fe', '#c084fc', '#fdf4ff', '#818cf8']; // Spacey colors

    for (let i = 0; i < particleCount; i++) {
      // Determine if it's a "near" or "far" star for parallax layering
      const depth = Math.random();
      
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // Slower, graceful drift
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + (depth > 0.8 ? 1.0 : 0.2), // Some larger bright ones
        color: colors[Math.floor(Math.random() * colors.length)],
        originalAlpha: Math.random() * 0.6 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005, // For twinkling
        pulsePhase: Math.random() * Math.PI * 2,
        depth: depth // 0 to 1
      });
    }
    bgParticlesRef.current = newParticles;
  }, []);

  // Spawn a new shooting star
  const spawnShootingStar = useCallback((width, height) => {
    // Random angle between -35 and -15 degrees (similar to auth's -25deg)
    const angle = (-15 - Math.random() * 20) * (Math.PI / 180);
    // Start from a random position along the top or left edge
    const startFromLeft = Math.random() > 0.4;
    const x = startFromLeft ? -50 : Math.random() * width * 0.6;
    const y = startFromLeft ? Math.random() * height * 0.5 : -20;

    return {
      x,
      y,
      angle,
      speed: 6 + Math.random() * 8,         // px per frame
      length: 80 + Math.random() * 100,      // trail length in px
      life: 1.0,                              // 1.0 = full, fades to 0
      decay: 0.008 + Math.random() * 0.006,  // how fast it fades
      // Purple-ish tones matching auth: rgba(167,139,250) and rgba(196,181,253)
      color: Math.random() > 0.5
        ? { r: 167, g: 139, b: 250 }
        : { r: 196, g: 181, b: 253 },
      width: 1.2 + Math.random() * 0.8,
    };
  }, []);

  // Draw interactive starfield
  const drawNetwork = useCallback((ctx, width, height, panX, panY) => {
    const reducedMotion = prefersReducedMotion();

    // Clear canvas
    ctx.fillStyle = '#050814'; // Deep void
    ctx.fillRect(0, 0, width, height);

    // Subtle background nebula gradient for depth
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    bgGradient.addColorStop(0, 'rgba(40, 20, 80, 0.15)'); // Soft cosmic purple
    bgGradient.addColorStop(0.5, 'rgba(10, 20, 50, 0.1)'); // Deep blue
    bgGradient.addColorStop(1, 'rgba(5, 8, 20, 1)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // ── Enhanced ambient glow patches (matching auth's asymmetric nebula) ──
    const glowPatches = [
      { x: 0.15, y: 0.85, rx: 0.50, ry: 0.50, color: [167, 139, 250], alpha: 0.07 },
      { x: 0.85, y: 0.15, rx: 0.40, ry: 0.30, color: [56, 189, 248],  alpha: 0.05 },
      { x: 0.60, y: 1.10, rx: 0.60, ry: 0.40, color: [192, 132, 252], alpha: 0.04 },
      { x: 0.05, y: 0.25, rx: 0.35, ry: 0.25, color: [52, 232, 187],  alpha: 0.035 },
      { x: 0.90, y: 0.70, rx: 0.30, ry: 0.30, color: [139, 92, 246],  alpha: 0.04 },
    ];

    for (const glow of glowPatches) {
      const cx = glow.x * width;
      const cy = glow.y * height;
      const r = Math.max(glow.rx * width, glow.ry * height);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${glow.color[0]}, ${glow.color[1]}, ${glow.color[2]}, ${glow.alpha})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const particles = bgParticlesRef.current;
    const mouseConnectionDist = 200;

    // Apply parallax offset to particles
    const baseParallax = 0.25;

    // Draw mouse glow
    if (mouseRef.current.x > -500) {
      const mouseGlow = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 300
      );
      mouseGlow.addColorStop(0, 'rgba(100, 150, 255, 0.08)');
      mouseGlow.addColorStop(0.5, 'rgba(150, 100, 255, 0.03)');
      mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGlow;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      // Update position (drift)
      p1.x += p1.vx;
      p1.y += p1.vy;
      p1.pulsePhase += p1.pulseSpeed; // Update twinkle

      // Wrap around screen
      if (p1.x < -100) p1.x = width + 100;
      if (p1.x > width + 100) p1.x = -100;
      if (p1.y < -100) p1.y = height + 100;
      if (p1.y > height + 100) p1.y = -100;

      // Depth-based parallax - closer stars move more
      const layerParallax = baseParallax * (0.5 + p1.depth * 1.5);
      let screenX = p1.x + (panX * layerParallax);
      let screenY = p1.y + (panY * layerParallax);

      // Keep on screen seamlessly
      screenX = ((screenX % width) + width) % width;
      screenY = ((screenY % height) + height) % height;

      // Check mouse interaction
      const dxMouse = screenX - mouseRef.current.x;
      const dyMouse = screenY - mouseRef.current.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      // Twinkle logic
      const twinkle = Math.sin(p1.pulsePhase) * 0.3; // -0.3 to 0.3
      let currentAlpha = p1.originalAlpha + twinkle;
      let currentRadius = p1.radius;

      // Mouse proximity effects
      if (distMouse < mouseConnectionDist) {
        const influence = 1 - distMouse / mouseConnectionDist;
        
        // Stars get brighter near mouse
        currentAlpha += influence * 0.6;
        
        // Very slight repulsion (gentle cosmic breeze)
        if (distMouse < 100) {
          p1.vx += dxMouse * 0.00005;
          p1.vy += dyMouse * 0.00005;
        }

        // Draw very faint magical connection lines to close stars (constellation effect)
        // Only for "foreground" stars to reduce clutter
        if (p1.depth > 0.5) {
          for (let j = i + 1; j < particles.length; j += 4) { // check fewer particles for performance
            const p2 = particles[j];
            if (p2.depth <= 0.5) continue;

            let p2ScreenX = p2.x + (panX * layerParallax);
            let p2ScreenY = p2.y + (panY * layerParallax);
            p2ScreenX = ((p2ScreenX % width) + width) % width;
            p2ScreenY = ((p2ScreenY % height) + height) % height;

            const dx = screenX - p2ScreenX;
            const dy = screenY - p2ScreenY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 60) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(180, 200, 255, ${(1 - dist / 60) * 0.15 * influence})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(screenX, screenY);
              ctx.lineTo(p2ScreenX, p2ScreenY);
              ctx.stroke();
            }
          }
        }
      }

      // Clamp alpha
      currentAlpha = Math.max(0.05, Math.min(1, currentAlpha));

      // Draw particle (Star)
      ctx.beginPath();
      ctx.fillStyle = p1.color;
      ctx.globalAlpha = currentAlpha;
      ctx.arc(screenX, screenY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Add a glow to larger stars
      if (p1.depth > 0.8 && currentAlpha > 0.5) {
        ctx.globalAlpha = currentAlpha * 0.3;
        ctx.arc(screenX, screenY, currentRadius * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      
      // Speed limits (friction)
      const maxSpeed = 0.5;
      const currentSpeed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
      if (currentSpeed > maxSpeed) {
        p1.vx = (p1.vx / currentSpeed) * maxSpeed;
        p1.vy = (p1.vy / currentSpeed) * maxSpeed;
      } else if (currentSpeed > 0.2) {
        // Friction to return to slow drift
        p1.vx *= 0.99;
        p1.vy *= 0.99;
      }
    }

    // ── Shooting Stars ──
    // Spawn new shooting stars periodically (skip if reduced motion)
    if (!reducedMotion) {
      const now = performance.now();
      // Initialize next spawn time on first frame (3s initial delay)
      if (nextShootingStarTimeRef.current === 0) {
        nextShootingStarTimeRef.current = now + 3000;
      }

      if (now >= nextShootingStarTimeRef.current) {
        shootingStarsRef.current.push(spawnShootingStar(width, height));
        // Occasionally spawn a second one for variety
        if (Math.random() > 0.7) {
          shootingStarsRef.current.push(spawnShootingStar(width, height));
        }
        // Schedule next spawn 6-12 seconds from now
        nextShootingStarTimeRef.current = now + 6000 + Math.random() * 6000;
      }

      // Update and draw shooting stars
      const activeStars = [];
      for (const star of shootingStarsRef.current) {
        // Move along angle
        star.x += Math.cos(star.angle) * star.speed;
        star.y -= Math.sin(star.angle) * star.speed;
        star.life -= star.decay;

        if (star.life <= 0) continue;
        activeStars.push(star);

        // Draw the shooting star as a gradient line (matching auth purple tones)
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y + Math.sin(star.angle) * star.length;

        const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.3, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.life * 0.3})`);
        grad.addColorStop(0.7, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.life * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${star.life * 0.9})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = star.width;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();

        // Small bright head glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.life * 0.6})`;
        ctx.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      shootingStarsRef.current = activeStars;
    }

    ctx.globalAlpha = 1;
  }, [spawnShootingStar]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewport = lastViewportRef.current;
    
    drawNetwork(
      ctx, 
      canvas.width, 
      canvas.height, 
      viewport.pan.x, 
      viewport.pan.y
    );

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawNetwork]);

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        initParticles(rect.width, rect.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, initParticles]);

  // Track mouse position for interactions
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };
    
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  // Update viewport reference without causing re-renders
  useEffect(() => {
    lastViewportRef.current = viewportState;
  }, [viewportState]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Canvas layer - Interactive Particle Network */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          backgroundColor: '#050814',
        }}
      />

      {/* Vignette overlay — darkened edges matching auth */}
      <div className="galaxy-vignette" aria-hidden="true" />

      {/* Orbital rings — slow-rotating decorative circles matching auth */}
      <div className="galaxy-orbital-ring galaxy-orbital-ring--1" aria-hidden="true" />
      <div className="galaxy-orbital-ring galaxy-orbital-ring--2" aria-hidden="true" />
      <div className="galaxy-orbital-ring galaxy-orbital-ring--3" aria-hidden="true" />
    </div>
  );
};

export default React.memo(GalaxyCanvas);
