import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function Hero() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const titleLines = [
    { text: "Level Up", highlight: false },
    { text: "Your Work.", highlight: true }
  ];

  useGSAP(() => {
    if (prefersReducedMotion) {
      gsap.to('.hero-content, .hero-3d-scene', { opacity: 1, duration: 0.5 });
      return;
    }

    // --- ENTRANCE ANIMATION (Words) ---
    const introTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    introTl.fromTo('.hero-title-word', 
      { y: 120, opacity: 0, rotateZ: 5, scale: 0.9 },
      { y: 0, opacity: 1, rotateZ: 0, scale: 1, duration: 1.5, stagger: 0.05 }
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 30, opacity: 0, filter: 'blur(5px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.2 }, 
      "-=1"
    )
    // Beautiful 3D glass layers entrance
    .fromTo('.glass-layer',
      { y: 300, opacity: 0, rotationX: 50, rotationY: -30, scale: 0.8 },
      { y: 0, opacity: 1, rotationX: 20, rotationY: -15, scale: 1, duration: 2.5, stagger: 0.15, ease: 'expo.out' },
      "-=1.5"
    );

    // --- CONTINUOUS FLOATING ---
    gsap.to(sceneRef.current, {
      y: -30,
      rotationZ: 2,
      duration: 5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Cosmic Button Pulse
    gsap.to('.hero-btn-primary', {
      boxShadow: "0 0 40px rgba(255, 255, 255, 0.4)",
      scale: 1.02,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
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
      const xPos = (e.clientX / innerWidth - 0.5) * 30 - 15; // Offset by default -15
      const yPos = (e.clientY / innerHeight - 0.5) * -30 + 20; // Offset by default 20
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
    <section ref={containerRef} className="hero-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '10rem', paddingBottom: '5rem', position: 'relative', overflow: 'hidden' }}>
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
        <div className="hero-actions" style={{ position: 'relative', zIndex: 50 }}>
          <Link to="/register" className="hero-btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
            Start Your Journey
          </Link>
          <a href="#how-it-works" className="hero-btn-outline" onClick={scrollToHowItWorks} style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
            See How It Works
          </a>
        </div>
      </div>

      <div ref={sceneRef} className="hero-3d-scene" style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}>
        <div className="glass-layer layer-base"></div>
        <div className="glass-layer layer-grid"></div>
      </div>
    </section>
  );
}
