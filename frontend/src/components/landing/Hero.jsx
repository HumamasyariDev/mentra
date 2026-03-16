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

  // More fragments for a truly dense field
  const fragments = Array.from({ length: 22 });

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // ENTRANCE: Words rotate and slide up tightly
    tl.fromTo('.hero-title-word', 
      { y: 120, opacity: 0, rotateX: -60, filter: 'blur(10px)' },
      { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.5, stagger: 0.1 }
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2 }, 
      "-=1"
    );

    // Initial 3D scatter: randomized depth and rotation
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
    tl.to('.glass-fragment', {
      opacity: () => gsap.utils.random(0.2, 0.5),
      duration: 2.5,
      stagger: { amount: 2, from: "random" }
    }, "-=1.5");

    // Hyper-space constant motion
    gsap.to('.glass-fragment', {
      rotationY: "+=360",
      rotationX: "+=180",
      duration: () => gsap.utils.random(30, 60),
      repeat: -1,
      ease: "none"
    });

    // SCROLL PARALLAX: Hyperspace effect
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

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // Deep Mouse Tracking
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
      
      {/* Immersive 3D Grid-less Field */}
      <div ref={sceneRef} className="hero-3d-scene" style={{ transformStyle: 'preserve-3d' }}>
        {fragments.map((_, i) => (
          <div key={i} className="glass-fragment"></div>
        ))}
      </div>

      <div className="hero-content">
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
        </div>
      </div>
    </section>
  );
}
