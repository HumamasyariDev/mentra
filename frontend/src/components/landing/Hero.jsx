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

  // Create an array for our massive 3D fragment field
  const fragments = Array.from({ length: 15 });

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // --- ENTRANCE ANIMATION ---
    const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Word by word reveal (not letter by letter)
    introTl.fromTo('.hero-title-word', 
      { y: 150, opacity: 0, rotateZ: 10, scale: 0.8 },
      { y: 0, opacity: 1, rotateZ: 0, scale: 1, duration: 1.5, stagger: 0.1 } 
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2 }, 
      "-=1"
    );

    // Initial random scatter of the 3D fragments
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

    // Fade them in and start continuous orbital rotation
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

  // 3D Parallax tracking on the entire scene based on mouse
  useEffect(() => {
    if (prefersReducedMotion || !sceneRef.current) return;
    
    const el = sceneRef.current;
    const xTo = gsap.quickTo(el, "rotationY", { duration: 1.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 1.5, ease: "power3.out" });
    const xMoveTo = gsap.quickTo(el, "x", { duration: 1.5, ease: "power3.out" });
    const yMoveTo = gsap.quickTo(el, "y", { duration: 1.5, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5); 
      const yPos = (e.clientY / innerHeight - 0.5); 
      
      xTo(xPos * 15); // Max 7.5 deg
      yTo(yPos * -15); 
      xMoveTo(xPos * -60); // Parallax shift
      yMoveTo(yPos * -60);
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

      <div className="hero-content">
        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line">
              {line.text.split(' ').map((word, j) => (
                <span key={j} className={`hero-title-word ${line.highlight ? 'hero-title-highlight' : ''}`} style={{ display: 'inline-block' }}>
                  {word}&nbsp;
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
