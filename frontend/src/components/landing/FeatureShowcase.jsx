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

  const titleWords = "Everything you need.".split(" ");

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    // Simplified Fly-In and Snap Grid
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1500', 
          scrub: 1.2, 
          pin: true,
          pinSpacing: true, 
        }
      });

      const cards = gsap.utils.toArray('.bento-card');

      // Set initial state: Fly in from below and slightly in front (Z)
      gsap.set(cards, { 
        y: 600,
        z: 300,
        rotationX: -45,
        opacity: 0,
        scale: 0.9
      });

      // 1. Premium Word-Split Title reveal
      tl.fromTo('.feature-title-word', 
        { y: 60, opacity: 0, rotateX: -45 }, 
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 
        0
      );

      // 2. Simple Fly-In and Snap
      tl.to(cards, { 
        y: 0, 
        z: 0, 
        rotationX: 0, 
        opacity: 1, 
        scale: 1,
        duration: 1.5, 
        ease: 'power3.out', 
        stagger: 0.15 
      }, 0.3);

      // 3. Subtle grid pop at the end
      tl.to('.bento-grid', { scale: 1.02, duration: 0.5, ease: 'sine.inOut' }, ">-0.3");
      tl.to('.bento-grid', { scale: 1, duration: 0.5, ease: 'sine.inOut' });
    });

    // 3D Magnetic Hover Tilt
    const cards = gsap.utils.toArray('.bento-card');
    cards.forEach(card => {
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const relX = (e.clientX - left - width / 2) / (width / 2); 
        const relY = -(e.clientY - top - height / 2) / (height / 2);
        xTo(relX * 10);
        yTo(relY * -10); 
      });
      
      card.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  // CSS Variable Mouse Tracking for Glow Effect
  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <h2 className="landing-section-heading" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {titleWords.map((word, i) => (
            <span key={i} className="feature-title-word" style={{ display: 'inline-block' }}>
              <span className={i === 2 ? 'hero-title-highlight' : 'feature-title-default'}>
                {word}
              </span>
              {i < titleWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
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
