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
      // Robust calculation that updates on resize
      const getScrollAmount = () => {
        if (!trackRef.current) return 0;
        let trackWidth = trackRef.current.scrollWidth;
        let windowWidth = window.innerWidth;
        // We want to scroll far enough that the last card is visible on the right side
        // Subtract 40% of viewport width since the left header takes up 40%
        return trackWidth - (windowWidth * 0.6); 
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount() + 500}`, // Add 500px padding for safety
          pin: true,
          scrub: 1, 
          pinSpacing: true,
          invalidateOnRefresh: true, // Recalculates on resize or DOM load
        }
      });

      // Move the track horizontally
      tl.to(trackRef.current, {
        x: () => -getScrollAmount(),
        ease: "none"
      });

      // Add a cool stagger effect to the cards as they move
      const cards = gsap.utils.toArray('.horizontal-card');
      cards.forEach((card, i) => {
        if (i === 0) return; // First card is already visible
        gsap.from(card, {
          opacity: 0.2,
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
    <section ref={sectionRef} id="how-it-works" style={{ width: '100%', position: 'relative', zIndex: 10, background: 'var(--bg-base)' }}>
      {/* 
        CRITICAL: The pinned element MUST be a clean wrapper without overflow: hidden. 
        The inner div holds the 100vh and overflow: hidden.
      */}
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', width: '100%' }}>
        
        {/* Left Sticky Header */}
        <div style={{ flex: '0 0 40%', padding: '0 4rem', zIndex: 10, position: 'relative' }}>
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
        <div style={{ flex: '1', position: 'relative' }}>
          {/* trackRef needs enough explicit width/padding to scroll properly */}
          <div ref={trackRef} style={{ display: 'flex', gap: '2rem', paddingRight: '20vw', width: 'max-content', willChange: 'transform' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="horizontal-card" style={{ 
                width: '400px', // Explicit width is safer for scrollWidth calculations
                background: 'rgba(15, 23, 42, 0.6)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '32px', 
                padding: '3rem 2rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                transformOrigin: 'left center'
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
