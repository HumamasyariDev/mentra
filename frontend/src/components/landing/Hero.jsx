import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const btn1Ref = useMagneticHover(0.5);

  const titleLines = [
    { text: "Level Up", highlight: false },
    { text: "Your Work.", highlight: true }
  ];

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // --- ENTRANCE ANIMATION (Letters) ---
    const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    introTl.fromTo('.hero-title-letter', 
      { y: 150, opacity: 0, rotateX: 90, scale: 0.8 },
      { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.5, stagger: 0.02 } // Fast letter stagger
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2 }, 
      "-=1.2"
    )
    .fromTo('.glass-layer',
      { y: 200, opacity: 0, rotationX: 45, rotationY: -20 },
      { y: 0, opacity: 1, rotationX: 10, rotationY: -10, duration: 2, stagger: 0.15, ease: 'expo.out' },
      "-=1.5"
    );

    // --- CONTINUOUS FLOATING ---
    gsap.to(sceneRef.current, {
      y: -20,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // 3D Parallax tracking on the assembled card
  useEffect(() => {
    if (prefersReducedMotion || !sceneRef.current) return;
    
    const el = sceneRef.current;
    const xTo = gsap.quickTo(el, "rotationY", { duration: 1, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 1, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5) * 30; // Max 15 deg
      const yPos = (e.clientY / innerHeight - 0.5) * -30; // Invert Y
      xTo(xPos);
      yTo(yPos);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <section ref={containerRef} className="hero-wrapper">
      <div className="hero-glow"></div>
      
      <div className="hero-content">
        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line">
              {line.text.split('').map((char, j) => (
                <span key={j} className={`hero-title-letter ${line.highlight ? 'hero-title-highlight' : ''}`} style={{ display: 'inline-block' }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          ))}
        </h1>
        <p className="hero-subtitle">
          Turn your daily tasks into an epic journey. Build habits, earn XP, and watch your virtual forest come alive with every checked box.
        </p>
        <div className="hero-actions">
          <Link to="/register" ref={btn1Ref} className="hero-btn-primary">
            Start Your Journey
          </Link>
        </div>
      </div>

      <div ref={sceneRef} className="hero-3d-scene">
        <div className="glass-layer layer-base"></div>
        <div className="glass-layer layer-grid"></div>
      </div>
    </section>
  );
}
