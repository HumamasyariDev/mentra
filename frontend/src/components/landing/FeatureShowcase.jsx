import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Timer, Calendar, Smile, Bot, BrainCircuit } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: CheckSquare, title: 'Task Management', desc: 'List, calendar, and kanban views. Complete tasks to earn XP.' },
  { icon: Timer, title: 'Pomodoro Timer', desc: 'Focus sessions with themes and a virtual cat companion.' },
  { icon: Calendar, title: 'Schedules', desc: 'Daily, weekly, and monthly routines that build habits.' },
  { icon: Smile, title: 'Mood Tracking', desc: 'Log mood and energy levels. See weekly patterns.' },
  { icon: Bot, title: 'AI Chat', desc: 'Productivity assistant powered by AI. Get tips and motivation.' },
  { icon: BrainCircuit, title: 'AI Agent', desc: 'Create tasks through conversation. Your intelligent productivity partner.' },
];

export default function FeatureShowcase() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Awwwards 3D Flip Entrance
    gsap.from('.landing-feature-card', {
      rotationX: -45, 
      y: 80, 
      opacity: 0, 
      transformPerspective: 1000,
      duration: 1, 
      stagger: 0.15, 
      ease: 'expo.out',
      scrollTrigger: { 
        trigger: sectionRef.current, 
        start: 'top 75%' 
      }
    });

    // 3D Magnetic Hover Tilt
    const cards = gsap.utils.toArray('.landing-feature-card');
    cards.forEach(card => {
      // Create quickTo instances for performance
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power2.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power2.out" });
      const zTo = gsap.quickTo(card, "z", { duration: 0.4, ease: "power2.out" });
      const iconTo = gsap.quickTo(card.querySelector('.landing-feature-icon'), "scale", { duration: 0.4, ease: "back.out(2)" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        // Calculate relative position (-1 to 1)
        const relX = (e.clientX - left - width / 2) / (width / 2); 
        const relY = -(e.clientY - top - height / 2) / (height / 2);
        
        // Apply tilts (max 12 degrees)
        xTo(relX * 12);
        yTo(relY * 12);
        zTo(20); // Lift toward user
        iconTo(1.15); // Pop icon
        gsap.set(card, { transformPerspective: 1000 });
      });
      
      card.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
        zTo(0);
        iconTo(1);
      });
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="features" className="landing-section">
      <h2 className="landing-section-heading">Everything you need to stay productive</h2>
      <div className="landing-features-grid" style={{ perspective: '1000px' }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="landing-feature-card" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <div className="landing-feature-icon" style={{ transform: 'translateZ(30px)' }}>
              <Icon size={24} />
            </div>
            <h3 className="landing-feature-title" style={{ transform: 'translateZ(20px)' }}>{title}</h3>
            <p className="landing-feature-desc" style={{ transform: 'translateZ(10px)' }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
