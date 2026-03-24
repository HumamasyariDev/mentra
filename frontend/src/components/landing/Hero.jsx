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

  const fragments = Array.from({ length: 22 });

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const master = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // ENTRANCE: Cinematic word reveal with stagger
    master
      .fromTo('.hero-title-word',
        { y: 120, opacity: 0, rotateX: -60, filter: 'blur(10px)' },
        { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.5, stagger: 0.1 }
      )
      .fromTo('.hero-subtitle',
        { y: 30, opacity: 0, filter: 'blur(5px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2 },
        "-=1"
      )
      .fromTo('.hero-actions',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' },
        "-=0.8"
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

    // Glass fragments: scattered 3D field
    gsap.set('.glass-fragment', {
      x: () => gsap.utils.random(-1200, 1200),
      y: () => gsap.utils.random(-800, 800),
      z: () => gsap.utils.random(-2500, 200),
      rotationX: () => gsap.utils.random(-180, 180),
      rotationY: () => gsap.utils.random(-180, 180),
      rotationZ: () => gsap.utils.random(-45, 45),
      scale: () => gsap.utils.random(0.4, 1.5),
      opacity: 0
    });

    // Fade in with variance
    master.to('.glass-fragment', {
      opacity: () => gsap.utils.random(0.15, 0.4),
      duration: 2.5,
      stagger: { amount: 2, from: "random" }
    }, "-=2");

    // Constant hyper-space rotation
    gsap.to('.glass-fragment', {
      rotationY: "+=360",
      rotationX: "+=180",
      duration: () => gsap.utils.random(30, 60),
      repeat: -1,
      ease: "none"
    });

    // Scroll parallax: hyperspace warp
    gsap.to('.glass-fragment', {
      z: 2500,
      opacity: 0,
      filter: 'blur(50px)',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    });

    // Hero content fade on scroll
    gsap.to('.hero-content', {
      y: -150,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Scroll indicator bounce
    gsap.to('.hero-scroll-chevron', {
      y: 6,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // Deep Mouse Tracking for 3D scene
  useEffect(() => {
    if (prefersReducedMotion || !sceneRef.current) return;
    
    const el = sceneRef.current;
    const xTo = gsap.quickTo(el, "rotationY", { duration: 2.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 2.5, ease: "power3.out" });
    const xMoveTo = gsap.quickTo(el, "x", { duration: 2.5, ease: "power3.out" });
    const yMoveTo = gsap.quickTo(el, "y", { duration: 2.5, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth - 0.5);
      const yNorm = (e.clientY / innerHeight - 0.5);
      
      xTo(xNorm * 15);
      yTo(yNorm * -15);
      xMoveTo(xNorm * -100);
      yMoveTo(yNorm * -100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <section ref={containerRef} className="hero-wrapper" style={{ overflow: 'hidden', perspective: '1500px' }}>
      <div className="hero-glow"></div>
      
      {/* Immersive 3D Glass Fragment Field */}
      <div ref={sceneRef} className="hero-3d-scene" style={{ transformStyle: 'preserve-3d' }}>
        {fragments.map((_, i) => (
          <div key={i} className="glass-fragment"></div>
        ))}
      </div>

      <div className="hero-content">
        {/* Logo badge */}
        <div className="hero-badge">
          <div className="hero-badge-glow" />
          <span className="hero-badge-icon">M</span>
          <span className="hero-badge-text">Mentra &mdash; Your Productivity Universe</span>
        </div>

        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line" style={{ gap: '0.3em' }}>
              {line.text.split(' ').map((word, j) => (
                <span 
                  key={j} 
                  className={`hero-title-word ${line.highlight ? 'hero-title-highlight' : ''}`}
                >
                  {word}
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
          <a href="#features" className="hero-btn-secondary" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Explore Features
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator">
          <span className="hero-scroll-text">Scroll to explore</span>
          <svg className="hero-scroll-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
