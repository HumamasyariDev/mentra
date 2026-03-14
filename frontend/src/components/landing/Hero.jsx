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

    // --- ENTRANCE ANIMATION ---
    const introTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    introTl.fromTo('.hero-title-word', 
      { y: 200, opacity: 0, rotateZ: 15, scale: 0.5 },
      { y: 0, opacity: 1, rotateZ: 0, scale: 1, duration: 2, stagger: 0.05 }
    )
    .fromTo(['.hero-subtitle', '.hero-actions'], 
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2 }, 
      "-=1.5"
    )
    .fromTo('.glass-layer',
      { z: -2000, opacity: 0, rotationX: 60, rotationY: -60 },
      { z: (i) => i * 60, opacity: 1, rotationX: 10, rotationY: -10, duration: 2.5, stagger: 0.2, ease: 'power4.out' },
      "-=2"
    );

    // --- "WARP DRIVE" SCROLL TRIGGER ---
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current, // Pin the outer container
        start: 'top top',
        end: '+=1500', // Scroll duration
        scrub: 1.5,
        pin: true,
        // pinSpacing is true by default, keeping it
      }
    });

    // Text gets sucked backwards into a void
    scrollTl.to('.hero-title-word', { 
      z: -2000, 
      rotationZ: 'random(-45, 45)', 
      opacity: 0, 
      filter: 'blur(20px)', 
      stagger: 0.02,
      ease: 'power2.in'
    }, 0);
    
    scrollTl.to('.hero-subtitle, .hero-actions', { 
      z: -1000, opacity: 0, filter: 'blur(10px)', ease: 'power2.in'
    }, 0);

    // The 3D Glass layers fly forwards past the camera
    scrollTl.to('.glass-layer', { 
      z: 2000, // Blow past the camera
      rotationX: 'random(-45, 45)',
      rotationY: 'random(-45, 45)',
      opacity: 0, 
      filter: 'blur(30px)',
      stagger: 0.1,
      ease: 'power3.in'
    }, 0);

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={containerRef} className="hero-pin-wrapper">
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
        </div>
      </div>

      <div className="hero-3d-scene">
        <div className="glass-layer layer-base"></div>
        <div className="glass-layer layer-grid"></div>
        {/* Removed the weird layer-ui boxes that looked broken */}
      </div>
    </section>
  );
}
