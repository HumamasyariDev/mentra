import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import '../../styles/components/dashboard/GalaxyCanvas.css';
import { getDeviceTierOnce } from '../../hooks/useDeviceTier';

/** Check if user prefers reduced motion */
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Quality presets per device tier */
const QUALITY_PRESETS = {
  low: {
    particleDivisor: 60000,   // ~35 particles on 1920x1080
    enableConstellations: false,
    enableNebulaGlow: false,
    enableMouseGlow: false,
    enableShootingStars: false,
    enableStarGlow: false,
    canvasScale: 0.5,          // render at half resolution
    targetFps: 30,
  },
  mid: {
    particleDivisor: 35000,   // ~59 particles on 1920x1080
    enableConstellations: false,
    enableNebulaGlow: true,
    enableMouseGlow: true,
    enableShootingStars: true,
    enableStarGlow: false,
    canvasScale: 0.75,
    targetFps: 45,
  },
  high: {
    particleDivisor: 20000,   // ~103 particles on 1920x1080
    enableConstellations: true,
    enableNebulaGlow: true,
    enableMouseGlow: true,
    enableShootingStars: true,
    enableStarGlow: true,
    canvasScale: 1,
    targetFps: 60,
  },
};

const GalaxyCanvas = ({
  viewportState = { pan: { x: 0, y: 0 }, zoom: 1 },
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastViewportRef = useRef(viewportState);
  const lastFrameTimeRef = useRef(0);
  
  // Device tier and quality preset (computed once)
  const quality = useMemo(() => {
    if (prefersReducedMotion()) return QUALITY_PRESETS.low;
    const tier = getDeviceTierOnce();
    return QUALITY_PRESETS[tier];
  }, []);

  // Interactive network particles state
  const bgParticlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Shooting stars state
  const shootingStarsRef = useRef([]);
  const nextShootingStarTimeRef = useRef(0);

  // Initialize background stardust particles
  const initParticles = useCallback((width, height) => {
    const particleCount = Math.floor((width * height) / quality.particleDivisor);
    const newParticles = [];
    const colors = ['#ffffff', '#e0f2fe', '#c084fc', '#fdf4ff', '#818cf8'];

    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random();
      
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + (depth > 0.8 ? 1.0 : 0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        originalAlpha: Math.random() * 0.6 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
        depth: depth,
      });
    }
    bgParticlesRef.current = newParticles;
  }, [quality.particleDivisor]);

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
    // Clear canvas
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, width, height);

    // Subtle background nebula gradient for depth
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    bgGradient.addColorStop(0, 'rgba(40, 20, 80, 0.15)');
    bgGradient.addColorStop(0.5, 'rgba(10, 20, 50, 0.1)');
    bgGradient.addColorStop(1, 'rgba(5, 8, 20, 1)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Nebula glow patches (expensive — skip on low-end)
    if (quality.enableNebulaGlow) {
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
    }

    const particles = bgParticlesRef.current;
    const mouseConnectionDist = 200;
    const baseParallax = 0.25;

    // Mouse glow (skip on low-end)
    if (quality.enableMouseGlow && mouseRef.current.x > -500) {
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

    // Batch stars by color to reduce fillStyle changes
    // Group particles and draw them
    const doConstellations = quality.enableConstellations;
    const doStarGlow = quality.enableStarGlow;
    const doMouseInteraction = quality.enableMouseGlow;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      // Update position (drift)
      p1.x += p1.vx;
      p1.y += p1.vy;
      p1.pulsePhase += p1.pulseSpeed;

      // Wrap around screen
      if (p1.x < -100) p1.x = width + 100;
      if (p1.x > width + 100) p1.x = -100;
      if (p1.y < -100) p1.y = height + 100;
      if (p1.y > height + 100) p1.y = -100;

      // Depth-based parallax
      const layerParallax = baseParallax * (0.5 + p1.depth * 1.5);
      let screenX = p1.x + (panX * layerParallax);
      let screenY = p1.y + (panY * layerParallax);
      screenX = ((screenX % width) + width) % width;
      screenY = ((screenY % height) + height) % height;

      // Twinkle
      const twinkle = Math.sin(p1.pulsePhase) * 0.3;
      let currentAlpha = p1.originalAlpha + twinkle;

      // Mouse proximity effects (skip distance check entirely on low-end)
      if (doMouseInteraction) {
        const dxMouse = screenX - mouseRef.current.x;
        const dyMouse = screenY - mouseRef.current.y;
        // Use squared distance to avoid sqrt
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;

        if (distMouseSq < mouseConnectionDist * mouseConnectionDist) {
          const distMouse = Math.sqrt(distMouseSq);
          const influence = 1 - distMouse / mouseConnectionDist;
          currentAlpha += influence * 0.6;

          if (distMouse < 100) {
            p1.vx += dxMouse * 0.00005;
            p1.vy += dyMouse * 0.00005;
          }

          // Constellation lines (O(n) reduced — skip on mid/low)
          if (doConstellations && p1.depth > 0.5) {
            for (let j = i + 1; j < particles.length; j += 4) {
              const p2 = particles[j];
              if (p2.depth <= 0.5) continue;

              let p2ScreenX = p2.x + (panX * layerParallax);
              let p2ScreenY = p2.y + (panY * layerParallax);
              p2ScreenX = ((p2ScreenX % width) + width) % width;
              p2ScreenY = ((p2ScreenY % height) + height) % height;

              const dx = screenX - p2ScreenX;
              const dy = screenY - p2ScreenY;
              // Squared distance check first (avoid sqrt)
              if (dx * dx + dy * dy < 3600) { // 60*60
                const dist = Math.sqrt(dx * dx + dy * dy);
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
      }

      // Clamp alpha
      currentAlpha = Math.max(0.05, Math.min(1, currentAlpha));

      // Draw star
      ctx.beginPath();
      ctx.fillStyle = p1.color;
      ctx.globalAlpha = currentAlpha;
      ctx.arc(screenX, screenY, p1.radius, 0, Math.PI * 2);
      ctx.fill();

      // Star glow for large foreground stars (skip on low/mid)
      if (doStarGlow && p1.depth > 0.8 && currentAlpha > 0.5) {
        ctx.globalAlpha = currentAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p1.radius * 3, 0, Math.PI * 2);
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
        p1.vx *= 0.99;
        p1.vy *= 0.99;
      }
    }

    // Shooting Stars (skip on low-end or reduced motion)
    if (quality.enableShootingStars && !prefersReducedMotion()) {
      const now = performance.now();
      if (nextShootingStarTimeRef.current === 0) {
        nextShootingStarTimeRef.current = now + 3000;
      }

      if (now >= nextShootingStarTimeRef.current) {
        shootingStarsRef.current.push(spawnShootingStar(width, height));
        if (Math.random() > 0.7) {
          shootingStarsRef.current.push(spawnShootingStar(width, height));
        }
        nextShootingStarTimeRef.current = now + 6000 + Math.random() * 6000;
      }

      const activeStars = [];
      for (const star of shootingStarsRef.current) {
        star.x += Math.cos(star.angle) * star.speed;
        star.y -= Math.sin(star.angle) * star.speed;
        star.life -= star.decay;

        if (star.life <= 0) continue;
        activeStars.push(star);

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

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.life * 0.6})`;
        ctx.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      shootingStarsRef.current = activeStars;
    }

    ctx.globalAlpha = 1;
  }, [spawnShootingStar, quality]);

  // Animation loop with FPS throttling
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FPS throttling
    const frameInterval = 1000 / quality.targetFps;
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < frameInterval) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

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
  }, [drawNetwork, quality.targetFps]);

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = quality.canvasScale;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Render at reduced resolution for low-end devices
        canvas.width = Math.round(rect.width * scale);
        canvas.height = Math.round(rect.height * scale);
        initParticles(canvas.width, canvas.height);
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
  }, [animate, initParticles, quality.canvasScale]);

  // Track mouse position for interactions (skip on low-end where mouse effects are disabled)
  useEffect(() => {
    if (!quality.enableMouseGlow) return;

    const scale = quality.canvasScale;
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: (e.clientX - rect.left) * scale,
          y: (e.clientY - rect.top) * scale,
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
  }, [quality.enableMouseGlow, quality.canvasScale]);

  // Update viewport reference without causing re-renders
  useEffect(() => {
    lastViewportRef.current = viewportState;
  }, [viewportState]);

  // Hide orbital rings on low-end (CSS animation cost)
  const showOrbitalRings = quality.enableNebulaGlow;

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

      {/* Orbital rings — slow-rotating decorative circles matching auth (skip on low-end) */}
      {showOrbitalRings && (
        <>
          <div className="galaxy-orbital-ring galaxy-orbital-ring--1" aria-hidden="true" />
          <div className="galaxy-orbital-ring galaxy-orbital-ring--2" aria-hidden="true" />
          <div className="galaxy-orbital-ring galaxy-orbital-ring--3" aria-hidden="true" />
        </>
      )}
    </div>
  );
};

export default React.memo(GalaxyCanvas);
