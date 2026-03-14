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
      { z: -2000, opacity: 0, rotationX: 60, rotationY: -60 },
      { z: (i) => i * 60, opacity: 1, rotationX: 10, rotationY: -10, duration: 2.5, stagger: 0.2, ease: 'power4.out' },
      "-=2"
    );

    // --- WARP DRIVE SCROLL TRIGGER ---
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current, 
        start: 'top top',
        end: '+=1500', 
        scrub: 1.5,
        pin: true,
      }
    });

    scrollTl.to('.hero-title-letter', { 
      z: -2000, 
      rotationZ: 'random(-90, 90)', 
      opacity: 0, 
      filter: 'blur(30px)', 
      stagger: 0.01,
      ease: 'power2.in'
    }, 0);
    
    scrollTl.to('.hero-subtitle, .hero-actions', { 
      z: -1500, opacity: 0, filter: 'blur(20px)', ease: 'power2.in'
    }, 0);

    scrollTl.to('.glass-layer', { 
      z: 2000, 
      rotationX: 'random(-45, 45)',
      rotationY: 'random(-45, 45)',
      opacity: 0, 
      filter: 'blur(40px)',
      stagger: 0.1,
      ease: 'power3.in'
    }, 0);

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={containerRef} id="hero-pin" className="hero-pin-wrapper">
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

      <div className="hero-3d-scene">
        <div className="glass-layer layer-base"></div>
        <div className="glass-layer layer-grid"></div>
      </div>
    </section>
  );
}
