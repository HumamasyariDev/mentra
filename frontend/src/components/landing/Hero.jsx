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
  const contentRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const btn1Ref = useMagneticHover(0.5);

  const titleLines = [
    { text: "Level Up", highlight: false },
    { text: "Your Work.", highlight: true }
  ];

  const fragments = Array.from({ length: 15 });

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // --- ENTRANCE ANIMATION ---
    const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    introTl.fromTo('.hero-title-letter', 
      { y: 150, opacity: 0, rotateX: 90, scale: 0.8 },
      { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.5, stagger: 0.02 } 
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2 }, 
      "-=1.2"
    );

    gsap.set('.glass-fragment', {
      x: () => gsap.utils.random(-800, 800),
      y: () => gsap.utils.random(-600, 600),
      z: () => gsap.utils.random(-1500, 500),
      rotationX: () => gsap.utils.random(-180, 180),
      rotationY: () => gsap.utils.random(-180, 180),
      rotationZ: () => gsap.utils.random(-180, 180),
      scale: () => gsap.utils.random(0.3, 1.2),
      opacity: 0
    });

    introTl.to('.glass-fragment', {
      opacity: () => gsap.utils.random(0.3, 0.8),
      duration: 2,
      stagger: 0.05
    }, "-=1.5");

    gsap.to('.glass-fragment', {
      rotationX: "+=360",
      rotationY: "+=180",
      rotationZ: "+=90",
      duration: () => gsap.utils.random(30, 50),
      repeat: -1,
      ease: "none"
    });

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // 3D Parallax tracking on the ENTIRE container (content + scene)
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;
    
    const content = contentRef.current;
    const scene = sceneRef.current;

    // Content moves subtly opposite to mouse for parallax depth
    const xToContent = gsap.quickTo(content, "x", { duration: 1, ease: "power3.out" });
    const yToContent = gsap.quickTo(content, "y", { duration: 1, ease: "power3.out" });
    
    // Scene moves more aggressively to follow the mouse
    const xToScene = gsap.quickTo(scene, "x", { duration: 1.5, ease: "power3.out" });
    const yToScene = gsap.quickTo(scene, "y", { duration: 1.5, ease: "power3.out" });
    const rotXScene = gsap.quickTo(scene, "rotationX", { duration: 1.5, ease: "power3.out" });
    const rotYScene = gsap.quickTo(scene, "rotationY", { duration: 1.5, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5); 
      const yPos = (e.clientY / innerHeight - 0.5); 
      
      // Move content opposite to cursor
      xToContent(xPos * -30);
      yToContent(yPos * -30);

      // Move scene to follow cursor
      xToScene(xPos * 60); 
      yToScene(yPos * 60);
      rotXScene(yPos * -15); // Tilt up/down
      rotYScene(xPos * 15);  // Tilt left/right
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <section ref={containerRef} className="hero-wrapper" style={{ overflow: 'hidden', perspective: '1500px' }}>
      <div className="hero-glow"></div>
      
      {/* 3D Fragment Field sitting behind the text */}
      <div ref={sceneRef} className="hero-3d-scene">
        {fragments.map((_, i) => (
          <div key={i} className={`glass-fragment fragment-${i}`}></div>
        ))}
      </div>

      <div ref={contentRef} className="hero-content">
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

    </section>
  );
}
