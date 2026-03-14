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

    // The True "Big Bang" Orbital Assembly
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current, // Pin the outer wrapper
          start: 'top top',
          end: '+=3000', // Massive scroll duration for the sequence
          scrub: 1.5, 
          pin: true,
          pinSpacing: true, 
        }
      });

      const cards = gsap.utils.toArray('.bento-card');

      // 1. Initial State: The Singularity (everything compressed to a tiny dot far away)
      gsap.set(cards, { 
        z: -5000, 
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        opacity: 0,
        scale: 0.01
      });

      // Show Title
      tl.fromTo('.features-title', 
        { y: 100, opacity: 0, scale: 0.8 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 
        0
      );

      // 2. The Big Bang: Explode outwards past the camera
      tl.to(cards, {
        z: () => gsap.utils.random(500, 2000), // Fly super close/past the camera
        x: () => gsap.utils.random(-2000, 2000),
        y: () => gsap.utils.random(-2000, 2000),
        rotationX: () => gsap.utils.random(-360, 360),
        rotationY: () => gsap.utils.random(-360, 360),
        rotationZ: () => gsap.utils.random(-180, 180),
        opacity: 1,
        scale: () => gsap.utils.random(1, 3), // Huge fragments
        duration: 2,
        ease: 'power3.out',
        stagger: 0.05
      }, 0.5);

      // 3. The Collapse: Snap everything violently into the perfect Bento grid
      tl.to(cards, { 
        z: 0, 
        x: 0, 
        y: 0, 
        rotationX: 0, 
        rotationY: 0,
        rotationZ: 0,
        scale: 1,
        duration: 1.5, 
        ease: 'expo.inOut', 
        stagger: 0.05
      }, 2.5);

      // 4. Highlight Shockwave Flash
      tl.to('.big-bang-flash', {
        opacity: 1,
        scale: 1.5,
        duration: 0.2,
        ease: "power2.in"
      }, 4); // Hits exactly as the last card snaps in

      tl.to('.big-bang-flash', {
        opacity: 0,
        scale: 3,
        duration: 1,
        ease: "power3.out"
      }, 4.2);

      // Final rest period
      tl.to({}, {duration: 0.5});
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
        xTo(relX * 15);
        yTo(relY * -15); 
        zTo(20); // Lift up slightly
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
    <section ref={sectionRef} id="features" style={{ width: '100%', position: 'relative', zIndex: 20, background: 'var(--bg-base)' }}>
      {/* 
        CRITICAL: Outer pinned wrapper must NOT have overflow: hidden. 
        The inner view handles the clipping. 
      */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        
        {/* Shockwave flash element */}
        <div className="big-bang-flash"></div>

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
        
      </div>
    </section>
  );
}
