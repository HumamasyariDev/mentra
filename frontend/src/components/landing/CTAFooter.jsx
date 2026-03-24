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
  const prefersReducedMotion = useReducedMotion();
  const ctaBtnRef = useMagneticHover(0.4);

  useGSAP(() => {
    if (prefersReducedMotion) {
      gsap.to('.huge-cta-letter', { backgroundSize: '100% 100%' });
      gsap.to('.cta-button-wrapper', { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=1500',
        scrub: 1,
        pin: true,
        pinSpacing: true
      }
    });

    // Each letter fills individually with gradient — staggered wave
    tl.to('.huge-cta-letter', {
      backgroundSize: '100% 100%',
      ease: 'none',
      duration: 2,
      stagger: 0.15
    })
    // Subtle scale pulse on completion
    .to('.huge-cta-text', {
      scale: 1.02,
      duration: 0.3,
      ease: 'sine.inOut',
    })
    .to('.huge-cta-text', {
      scale: 1,
      duration: 0.3,
      ease: 'sine.inOut',
    })
    // Reveal the button below
    .to('.cta-button-wrapper', {
      opacity: 1,
      y: -30,
      ease: 'power2.out',
      duration: 0.5
    }, "-=0.3");

    // CTA button cosmic pulse
    gsap.to('.cta-primary-btn', {
      boxShadow: "0 0 60px rgba(167, 139, 250, 0.4), 0 0 120px rgba(124, 58, 237, 0.15)",
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  const letters = 'MENTRA'.split('');

  return (
    <div ref={sectionRef}>
      <section className="cta-section-inner">
        {/* Cosmic radial backdrop */}
        <div className="cta-cosmic-glow" />

        <h2 className="huge-cta-text">
          {letters.map((letter, i) => (
            <span key={i} className="huge-cta-letter">{letter}</span>
          ))}
        </h2>
        
        <p className="cta-tagline">Your Productivity Universe Awaits</p>
        
        <div className="cta-button-wrapper">
          <Link to="/register" ref={ctaBtnRef} className="cta-primary-btn">
            Create Free Account
          </Link>
          <div className="cta-login-link-wrapper">
            <Link to="/login" className="cta-login-link">
              Already have an account? Log in &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
