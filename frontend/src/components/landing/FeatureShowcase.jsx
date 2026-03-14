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

    // The Ultimate "Orbital Assembly" Grid
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=2500', // Massive scroll duration for the sequence
          scrub: 1.5, // Super smooth
          pin: true,
          pinSpacing: true, // ESSENTIAL so it doesn't break the forest below it!
        }
      });

      const cards = gsap.utils.toArray('.bento-card');

      // Set extreme initial 3D states
      gsap.set(cards, { 
        z: () => gsap.utils.random(-2000, 2000), 
        x: () => gsap.utils.random(-1500, 1500),
        y: () => gsap.utils.random(-1500, 1500),
        rotationX: () => gsap.utils.random(-180, 180),
        rotationY: () => gsap.utils.random(-180, 180),
        rotationZ: () => gsap.utils.random(-90, 90),
        opacity: 0,
        scale: 0.1
      });

      // 1. The Title slowly fades in and floats up
      tl.fromTo('.features-title', 
        { y: 100, opacity: 0, scale: 0.8 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 
        0
      );

      // 2. The Great Orbital Assembly
      cards.forEach((card, i) => {
        // Cards sweep into a chaotic floating holding pattern
        tl.to(card, {
          z: () => gsap.utils.random(-500, 500),
          x: () => gsap.utils.random(-500, 500),
          y: () => gsap.utils.random(-500, 500),
          rotationX: () => gsap.utils.random(-45, 45),
          rotationY: () => gsap.utils.random(-45, 45),
          rotationZ: () => gsap.utils.random(-20, 20),
          opacity: 0.5,
          scale: 0.5,
          duration: 1.5,
          ease: 'power1.inOut'
        }, 0.2 + (i * 0.1)); // Stagger the initial approach
      });

      // 3. The Collapse into the Perfect Grid
      tl.to(cards, { 
        z: 0, 
        x: 0, 
        y: 0, 
        rotationX: 0, 
        rotationY: 0,
        rotationZ: 0,
        opacity: 1, 
        scale: 1,
        duration: 2, 
        ease: 'power4.inOut', 
        stagger: 0.1 
      }, 1.5); // Starts after the holding pattern

      // 4. A final celebratory pulse on the entire grid
      tl.to('.bento-grid', { scale: 1.05, duration: 0.5, ease: 'sine.inOut' }, ">-0.5");
      tl.to('.bento-grid', { scale: 1, duration: 0.5, ease: 'sine.inOut' });
      
      // Leave some dead space at the end of the timeline so the user can admire the assembled grid
      tl.to({}, {duration: 0.5});
    });

    // 3D Magnetic Hover Tilt (runs independently)
    const cards = gsap.utils.toArray('.bento-card');
    cards.forEach(card => {
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const relX = (e.clientX - left - width / 2) / (width / 2); 
        const relY = -(e.clientY - top - height / 2) / (height / 2);
        xTo(relX * 15);
        yTo(relY * -15); // Correctly inverted for natural feel
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
    <section ref={sectionRef} id="features" className="features-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
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
