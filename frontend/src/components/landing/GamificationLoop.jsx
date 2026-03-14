import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Sparkles, Trophy, TreePine } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: CheckSquare, title: 'Check it off', desc: 'Manage your daily tasks with beautiful list, calendar, or board views. Simple on the surface, smart underneath.' },
  { icon: Sparkles, title: 'Earn XP', desc: 'Every completed task earns experience points. Your real-world productivity directly fuels your digital progress.' },
  { icon: Trophy, title: 'Level Up', desc: 'Hit milestones, maintain daily streaks, and climb levels as you build better, more consistent habits.' },
  { icon: TreePine, title: 'Watch it Grow', desc: 'Your progress manifests as a living, breathing virtual forest that grows with you over time.' },
];

export default function GamificationLoop() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // We calculate how far the track needs to slide to the left
      // It's the total width of the track minus the width of its container (the right column)
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      // Let's just move it by a set amount relative to the cards
      const scrollDistance = trackWidth - (viewportWidth * 0.5);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scrollDistance}`, // Scroll exactly the distance needed
          pin: true,
          scrub: 1, // Smooth scrubbing
          pinSpacing: true,
        }
      });

      // Move the track horizontally
      tl.to(trackRef.current, {
        x: -scrollDistance,
        ease: "none"
      });

      // Add a cool stagger effect to the cards as they move
      const cards = gsap.utils.toArray('.horizontal-card');
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          scale: 0.8,
          y: 50,
          duration: 0.5,
          scrollTrigger: {
            trigger: card,
            containerAnimation: tl,
            start: "left 80%",
            toggleActions: "play none none reverse"
          }
        });
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="landing-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', margin: 0, maxWidth: '100%', padding: 0 }}>
      
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center' }}>
        
        {/* Left Sticky Header */}
        <div style={{ flex: '0 0 40%', padding: '0 4rem', zIndex: 10 }}>
          <h2 className="landing-section-heading" style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: 'clamp(3rem, 5vw, 5rem)' }}>
            The<br/>Productivity<br/>Loop.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Mentra uses game design psychology to make doing your work feel incredibly rewarding. 
            <br/><br/>
            Scroll to see how it works &rarr;
          </p>
        </div>

        {/* Right Horizontal Scrolling Track */}
        <div style={{ flex: '1', overflow: 'visible', position: 'relative' }}>
          <div ref={trackRef} style={{ display: 'flex', gap: '2rem', paddingRight: '20vw', willChange: 'transform' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="horizontal-card" style={{ 
                flex: '0 0 400px', 
                background: 'rgba(15, 23, 42, 0.6)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '32px', 
                padding: '3rem 2rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}>
                  <step.icon size={40} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
