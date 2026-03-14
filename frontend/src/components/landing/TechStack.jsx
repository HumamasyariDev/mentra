import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Code, Database, Bot, Sparkles, Server, BarChart3, Layers } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TECH = [
  { label: 'React 19', icon: Code },
  { label: 'Laravel 12', icon: Server },
  { label: 'Puter.js AI', icon: Bot },
  { label: 'GSAP', icon: Sparkles },
  { label: 'Supabase', icon: Database },
  { label: 'TanStack Query', icon: BarChart3 },
  { label: 'Tailwind CSS', icon: Layers },
];

export default function TechStack() {
  const marqueeRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Infinite Marquee
    gsap.to('.tech-marquee-content', {
      xPercent: -50, // Move halfway (since we duplicate the array once)
      ease: 'none',
      duration: 20,
      repeat: -1,
    });
  }, { scope: marqueeRef, dependencies: [prefersReducedMotion] });

  // Duplicate the array to create a seamless loop
  const marqueeItems = [...TECH, ...TECH];

  return (
    <section className="landing-section" style={{ padding: '4rem 0' }}>
      <div className="tech-marquee" ref={marqueeRef}>
        <div className="tech-marquee-content">
          {marqueeItems.map((item, i) => (
            <div key={i} className="tech-item">
              <item.icon />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
