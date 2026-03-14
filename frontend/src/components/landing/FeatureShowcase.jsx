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

    // Elegant 3D Cascade Assembly (No messy explosions that break DOM)
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1500', // Sane scroll duration
          scrub: 1, 
          pin: true,
          pinSpacing: true, 
        }
      });

      const cards = gsap.utils.toArray('.bento-card');

      // 1. Initial State: Folded down and away
      gsap.set(cards, { 
        y: 400,
        z: -500,
        rotationX: -60,
        opacity: 0,
        scale: 0.8
      });

      // 2. Cascade them into place cleanly
      tl.to(cards, {
        y: 0,
        z: 0,
        rotationX: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.1,
        ease: 'power3.out',
        duration: 1
      });

      // 3. Highlight Shockwave Flash
      tl.to('.big-bang-flash', {
        opacity: 0.8,
        scale: 2,
        duration: 0.3,
        ease: "power2.inOut"
      });

      tl.to('.big-bang-flash', {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    // 3D Magnetic Hover Tilt (runs independently)
    const cards = gsap.utils.toArray('.bento-card');
    cards.forEach(card => {
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const zTo = gsap.quickTo(card, "z", { duration: 0.6, ease: "power3.out" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const relX = (e.clientX - left - width / 2) / (width / 2); 
        const relY = -(e.clientY - top - height / 2) / (height / 2);
        xTo(relX * 10);
        yTo(relY * -10); 
        zTo(20); 
      });
      
      card.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
        zTo(0);
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
    <section ref={sectionRef} id="features" className="features-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      
      {/* Shockwave flash element */}
      <div className="big-bang-flash" style={{ zIndex: 0 }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <h2 className="landing-section-heading" style={{ marginBottom: '4rem' }}>
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
