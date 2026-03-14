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
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const panels = gsap.utils.toArray('.loop-panel');
      
      // Calculate how far to scroll horizontally
      // It's (number of panels - 1) * 100vw
      const xTravel = -100 * (panels.length - 1);

      // Create the main horizontal scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000", // Give it plenty of scroll room
          scrub: 1, // Smooth scrubbing
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        }
      });

      // 1. Move the container left
      tl.to(containerRef.current, {
        xPercent: xTravel,
        ease: "none"
      }, 0);

      // 2. Fill the progress bar
      tl.to('.loop-progress-fill', {
        width: '100%',
        ease: "none"
      }, 0);

      // 3. Add beautiful parallax to the content inside each panel so they don't look static while moving
      panels.forEach((panel, i) => {
        const content = panel.querySelector('.loop-panel-content');
        
        // This is a neat trick: As the container moves left, move the content slightly right 
        // to create a depth parallax effect, then snap it to 0.
        tl.fromTo(content, 
          { x: 200, opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 0.8 }, 
          { 
            x: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            ease: "power2.out" 
          }, 
          (i - 0.5) * (1 / (panels.length - 1)) // Trigger precisely as the panel enters the center
        );
        
        // Cosmic pulse on the icon when it's active
        const icon = panel.querySelector('.loop-panel-icon');
        tl.to(icon, {
          scale: 1.1,
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.8)',
          duration: 0.2,
          yoyo: true,
          repeat: 1
        }, (i) * (1 / (panels.length - 1))); // Trigger when perfectly centered
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="loop-horizontal-wrapper">
      
      <div ref={containerRef} className="loop-horizontal-container">
        {STEPS.map((step, i) => (
          <div key={i} className="loop-panel">
            <div className="loop-panel-content">
              <div className="loop-panel-icon">
                <step.icon size={64} />
              </div>
              <h3 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, marginBottom: '1.5rem' }}>{step.title}</h3>
              <p style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="loop-progress-bar">
        <div className="loop-progress-fill"></div>
      </div>

    </section>
  );
}
