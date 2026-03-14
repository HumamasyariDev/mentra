import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

export default function Hero() {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const btn1Ref = useMagneticHover(0.3);
  const btn2Ref = useMagneticHover(0.3);

  useGSAP(() => {
    if (prefersReducedMotion) {
      gsap.to('.landing-hero-content > *', { opacity: 1, y: 0, duration: 0.5 });
      gsap.to('.landing-hero-visual', { opacity: 1, duration: 0.5 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.landing-hero-tagline', { x: -60, opacity: 0, duration: 1 })
      .from('.landing-hero-subtitle', { x: -40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.landing-hero-cta', { y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)' }, '-=0.4')
      .from('.landing-hero-badge', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.landing-hero-visual', { x: 60, opacity: 0, duration: 1 }, '-=1.2');

    // Infinite Float
    gsap.to('.landing-hero-shape', {
      y: -15,
      rotation: 'random(-5, 5)',
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.4, from: 'random' },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // Cursor Parallax Background
  useEffect(() => {
    if (prefersReducedMotion || !visualRef.current) return;
    
    const shapes = visualRef.current.querySelectorAll('.landing-hero-shape');
    const xTo = gsap.quickTo(shapes, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(shapes, "y", { duration: 0.8, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5) * 40; // max 20px
      const yPos = (e.clientY / innerHeight - 0.5) * 40;
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
    <section ref={containerRef} className="landing-hero">
      <div className="landing-hero-content">
        <h1 className="landing-hero-tagline">
          Productivity that grows with you
        </h1>
        <p className="landing-hero-subtitle">
          Complete tasks. Earn XP. Level up. Watch your forest come alive.
        </p>
        <div className="landing-hero-actions">
          <Link to="/register" ref={btn1Ref} className="landing-hero-cta landing-btn-primary block">
            Get Started
          </Link>
          <a
            href="#how-it-works"
            ref={btn2Ref}
            className="landing-hero-cta landing-btn-outline block"
            onClick={scrollToHowItWorks}
          >
            See How It Works
          </a>
        </div>
        <p className="landing-hero-badge">Built with React, Laravel &amp; AI</p>
      </div>

      <div ref={visualRef} className="landing-hero-visual">
        <div className="landing-hero-shape landing-hero-shape-1" />
        <div className="landing-hero-shape landing-hero-shape-2" />
        <div className="landing-hero-shape landing-hero-shape-3" />
        <div className="landing-hero-shape landing-hero-shape-4" />
        <div className="landing-hero-shape landing-hero-shape-5" />
      </div>
    </section>
  );
}
