import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, Database, Bot, Sparkles, Server, BarChart3 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const TECH = [
  { label: 'React 19', icon: Code },
  { label: 'Laravel 12', icon: Server },
  { label: 'Puter.js AI', icon: Bot },
  { label: 'GSAP', icon: Sparkles },
  { label: 'Supabase', icon: Database },
  { label: 'TanStack Query', icon: BarChart3 },
];

export default function TechStack() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { 
        trigger: sectionRef.current, 
        start: 'top 85%' 
      }
    });

    // Aggressive Elastic Pop
    tl.from('.landing-tech-pill', {
      y: 40, 
      opacity: 0, 
      scale: 0.5,
      rotation: 'random(-15, 15)',
      duration: 0.8, 
      stagger: { each: 0.05, from: "center" }, 
      ease: 'elastic.out(1, 0.5)'
    })
    // Icon spin
    .from('.landing-tech-pill svg', {
      rotation: -180, 
      scale: 0, 
      opacity: 0,
      duration: 0.6, 
      stagger: { each: 0.05, from: "center" }, 
      ease: 'back.out(2)'
    }, "<0.2");

    // Add continuous slow rotation to the GSAP icon specifically just for fun
    gsap.to('.landing-tech-pill:nth-child(4) svg', {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "linear"
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} className="landing-section">
      <h2 className="landing-section-heading">Built with modern tools</h2>
      <div className="landing-tech-grid">
        {TECH.map(({ label, icon: Icon }) => (
          <div key={label} className="landing-tech-pill" style={{ willChange: 'transform, opacity' }}>
            <Icon />
            {label}
          </div>
        ))}
      </div>
      <p className="landing-tech-tagline" style={{ opacity: 0.7 }}>
        Full-stack productivity platform with AI-powered features and real-time gamification.
      </p>
    </section>
  );
}
