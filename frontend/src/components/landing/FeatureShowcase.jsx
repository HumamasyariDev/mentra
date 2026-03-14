import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Timer, Calendar, Smile, Bot, BrainCircuit } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Bot, title: 'AI Productivity Assistant', desc: 'Your personal AI coach powered by Puter.js. Get instant motivation, study tips, or help breaking down complex projects into manageable chunks.' },
  { icon: CheckSquare, title: 'Smart Tasks', desc: 'More than just a checklist. Kanban boards, calendar views, and smart prioritization.' },
  { icon: Timer, title: 'Pomodoro Companion', desc: 'Focus sessions with immersive themes. Feed your virtual cat by staying focused on your work.' },
  { icon: BrainCircuit, title: 'AI Agent', desc: 'Just chat naturally. Our agent understands context and creates tasks, schedules, and quizzes for you automatically.' },
  { icon: Smile, title: 'Mood Tracking', desc: 'Log daily energy levels to understand your personal productivity rhythms over time.' },
  { icon: Calendar, title: 'Schedules & Habits', desc: 'Build lasting routines with daily, weekly, and monthly recurring schedules.' },
];

export default function FeatureShowcase() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Elegant Cascading Entrance
    gsap.from('.features-title', {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
    });

    gsap.from('.bento-card', {
      y: 100,
      scale: 0.9,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'back.out(1.5)',
      scrollTrigger: { 
        trigger: gridRef.current, 
        start: 'top 75%' 
      }
    });

    // 3D Magnetic Hover Tilt (Ultra smooth, keeps layout intact)
    const cards = gsap.utils.toArray('.bento-card');
    cards.forEach(card => {
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const relX = (e.clientX - left - width / 2) / (width / 2); 
        const relY = -(e.clientY - top - height / 2) / (height / 2);
        
        xTo(relX * 10);
        yTo(relY * 10);
      });
      
      card.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  // CSS Variable Mouse Tracking for Glow Effect
  const handleMouseMove = (e) => {
    for (const card of gridRef.current.children) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <section ref={sectionRef} id="features" className="features-section">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 className="features-title" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          Everything you need.
        </h2>
        
        <div ref={gridRef} className="bento-grid" onMouseMove={handleMouseMove}>
          {FEATURES.map((feature, i) => (
            <div key={i} className="bento-card">
              <div className="bento-content">
                <div className="bento-icon">
                  <feature.icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
