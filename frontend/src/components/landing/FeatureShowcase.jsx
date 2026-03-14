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

    let mm = gsap.matchMedia();

    // The "Big Bang" 3D Unfold
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#features-pin',
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1.5
        }
      });

      // Set extreme initial 3D state
      gsap.set('.bento-grid', { 
        rotationX: 60, 
        rotationZ: -45, 
        scale: 0.3, 
        y: 500, 
        z: -1500 
      });
      
      // Cards start exploded randomly in space
      gsap.set('.bento-card', { 
        z: () => gsap.utils.random(1000, 3000), 
        x: () => gsap.utils.random(-1000, 1000),
        y: () => gsap.utils.random(-1000, 1000),
        rotationX: () => gsap.utils.random(-90, 90),
        rotationY: () => gsap.utils.random(-90, 90),
        opacity: 0 
      });

      // 1. Grid sweeps into view flat
      tl.to('.bento-grid', { 
        rotationX: 0, 
        rotationZ: 0, 
        scale: 1, 
        y: 0, 
        z: 0, 
        duration: 2, 
        ease: 'power3.inOut' 
      }, 0);

      // 2. Cards slam into their exact grid slots
      tl.to('.bento-card', { 
        z: 0, x: 0, y: 0, rotationX: 0, rotationY: 0,
        opacity: 1, 
        duration: 1.5, 
        ease: 'expo.out', 
        stagger: 0.1 
      }, 0.5);

      // 3. Title reveals above it
      tl.fromTo('.features-title', { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.5);
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  // CSS Variable Mouse Tracking for Glow Effect (Runs independently of scroll)
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
    <section ref={sectionRef} id="features-pin" className="features-pin-wrapper">
      <h2 className="features-title">Everything you need.</h2>
      
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
    </section>
  );
}
