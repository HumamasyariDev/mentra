import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const textContainerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const btn1Ref = useMagneticHover(0.5);

  const titleLines = [
    { text: "Level Up", highlight: false },
    { text: "Your Work.", highlight: true }
  ];

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // --- ENTRANCE ANIMATION (Mind-blowing Letters) ---
    const introTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    // Super aggressive 3D letter fly-in
    introTl.fromTo('.hero-title-letter', 
      { y: 300, z: 500, opacity: 0, rotateX: -90, rotateY: 45, scale: 0.2 },
      { y: 0, z: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1, duration: 1.5, stagger: 0.03 } 
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 50, opacity: 0, filter: 'blur(20px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2 }, 
      "-=1.2"
    );

    // --- CLEAN PARALLAX SCROLL (No broken weird boxes) ---
    // Instead of deep Z-space explosions that break, we do a gorgeous blur/sink effect
    gsap.to(textContainerRef.current, {
      y: 300,
      opacity: 0,
      scale: 0.8,
      filter: 'blur(20px)',
      scrollTrigger: {
        trigger: containerRef.current, 
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // Make the background glow expand massively as you scroll away
    gsap.to('.hero-glow', {
      scale: 2,
      opacity: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={containerRef} className="hero-wrapper" style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="hero-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 60%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      
      <div ref={textContainerRef} className="hero-content" style={{ position: 'relative', zIndex: 10, textAlign: 'center', perspective: '2000px' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(4rem, 10vw, 10rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95, marginBottom: '1.5rem', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {line.text.split('').map((char, j) => (
                <span key={j} className={`hero-title-letter ${line.highlight ? 'hero-title-highlight' : ''}`} style={{ display: 'inline-block', willChange: 'transform, opacity, filter', transformStyle: 'preserve-3d' }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          ))}
        </h1>
        <p className="hero-subtitle" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          Turn your daily tasks into an epic journey. Build habits, earn XP, and watch your virtual forest come alive with every checked box.
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" ref={btn1Ref} className="hero-btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 700, color: '#020617', background: '#fff', borderRadius: '100px', textDecoration: 'none' }}>
            Start Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
