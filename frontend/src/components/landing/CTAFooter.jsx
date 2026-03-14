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
    if (!prefersReducedMotion) {
      // Entrance
      gsap.from('.landing-cta-content > *', {
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      // Cosmic Pulse on the button
      gsap.to('.landing-cta-button', {
        scale: 1.03,
        boxShadow: "0 10px 30px rgba(255, 255, 255, 0.4)",
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });

      // Breathing background gradient
      gsap.to(sectionRef.current, {
        backgroundPosition: "100% 100%",
        duration: 12,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} className="landing-cta" style={{ backgroundSize: '200% 200%' }}>
      <div className="landing-cta-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="landing-cta-heading">Ready to grow?</h2>
        <p className="landing-cta-subtitle">Start building productive habits today.</p>
        <Link to="/register" ref={ctaBtnRef} className="landing-cta-button">
          Get Started &mdash; It's Free
        </Link>
        <Link to="/login" className="landing-cta-login">
          Already have an account? Log in
        </Link>
      </div>
    </section>
  );
}
