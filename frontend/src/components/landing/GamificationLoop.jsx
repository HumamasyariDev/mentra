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
      const totalWidth = (panels.length - 1) * window.innerWidth;
      
      // Massive scroll distance to make the interaction very deliberate and long
      const scrollDistance = window.innerWidth * panels.length * 1.5; 

      const scrollTween = gsap.to(containerRef.current, {
        x: () => -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          end: () => `+=${scrollDistance}`,
          pinSpacing: true,
        }
      });

      gsap.to('.loop-progress-fill', {
        width: '100%',
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          scrub: 1,
        }
      });

      panels.forEach((panel, i) => {
        if (i === 0) return; 
        
        const content = panel.querySelector('.loop-panel-content');
        
        gsap.fromTo(content, 
          { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: "left center+=300",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <div ref={sectionRef}> {/* Bare wrapper for bulletproof GSAP pinning */}
      <section id="how-it-works" className="loop-horizontal-wrapper" style={{ height: '100vh', width: '100%', overflow: 'hidden', position: 'relative', background: '#020617', display: 'flex', alignItems: 'center' }}>
        
        <div ref={containerRef} className="loop-horizontal-container">
          {STEPS.map((step, i) => (
            <div key={i} className="loop-panel">
              <div className="loop-panel-content">
                <div className="loop-panel-icon">
                  <step.icon size={64} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="loop-progress-bar">
          <div className="loop-progress-fill"></div>
        </div>

      </section>
    </div>
  );
}
