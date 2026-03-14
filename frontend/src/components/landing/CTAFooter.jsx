import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

export default function CTAFooter() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const ctaBtnRef = useMagneticHover(0.4);

  useGSAP(() => {
    if (prefersReducedMotion) {
      gsap.to('.huge-cta-text', { backgroundSize: '100% 100%' });
      gsap.to('.cta-button-wrapper', { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=2000', // Much longer text fill
        scrub: 1,
        pin: true,
        pinSpacing: true
      }
    });

    tl.to('.huge-cta-text', {
      backgroundSize: '100% 100%',
      ease: 'none',
      duration: 1
    });

    tl.to('.cta-button-wrapper', {
      opacity: 1,
      y: -30,
      ease: 'power2.out',
      duration: 0.3
    }, "-=0.2");

    gsap.to('.landing-cta-button', {
      scale: 1.05,
      boxShadow: "0 10px 40px rgba(255, 255, 255, 0.2)",
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <div ref={sectionRef}>
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0) 0%, var(--bg-base) 100%)' }}>
        
        <h2 ref={textRef} className="huge-cta-text">
          START<br/>GROWING
        </h2>
        
        <div className="cta-button-wrapper">
          <Link to="/register" ref={ctaBtnRef} className="hero-btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.25rem' }}>
            Create Free Account
          </Link>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
              Already have an account? Log in &rarr;
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
