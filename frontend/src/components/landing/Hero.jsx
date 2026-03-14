import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

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
    if (prefersReducedMotion) {
      gsap.to('.hero-content, .hero-3d-scene', { opacity: 1, duration: 0.5 });
      return;
    }

    // --- ENTRANCE ANIMATION (Words instead of letters to fix spacing) ---
    const introTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    introTl.fromTo('.hero-title-word', 
      { y: 150, opacity: 0, rotateZ: 10, scale: 0.9 },
      { y: 0, opacity: 1, rotateZ: 0, scale: 1, duration: 1.5, stagger: 0.05 }
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2 }, 
      "-=1"
    )
    // Beautiful 3D glass layers entrance
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

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="hero-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '10rem', paddingBottom: '5rem', position: 'relative' }}>
      <div className="hero-glow"></div>
      
      <div className="hero-content">
        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line">
              {line.text.split(' ').map((word, j) => (
                <span key={j} className={`hero-title-word ${line.highlight ? 'hero-title-highlight' : ''}`}>
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
          <a href="#how-it-works" className="hero-btn-outline" onClick={scrollToHowItWorks}>
            See How It Works
          </a>
        </div>
      </div>

      <div ref={sceneRef} className="hero-3d-scene">
        <div className="glass-layer layer-base"></div>
        <div className="glass-layer layer-grid"></div>
      </div>
    </section>
  );
}
