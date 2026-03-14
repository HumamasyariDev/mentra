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

    // The Horizontal Scroll / Pin
    mm.add("(min-width: 1024px)", () => {
      const panels = gsap.utils.toArray('.loop-panel');
      const totalPanels = panels.length;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (totalPanels - 1),
          // Scroll length depends on the width of the horizontal container
          end: () => "+=" + containerRef.current.offsetWidth,
        }
      });

      // Move the container horizontally
      tl.to(containerRef.current, {
        xPercent: -100 * (totalPanels - 1) / totalPanels,
        ease: "none"
      }, 0);

      // Animate the progress bar width
      tl.to('.loop-progress-fill', {
        width: '100%',
        ease: "none"
      }, 0);

      // Parallax effect on the content inside each panel as it moves
      panels.forEach((panel, i) => {
        if (i === 0) return; // Skip the first one since it's already there
        
        const content = panel.querySelector('.loop-panel-content');
        
        // As the panel slides in from the right, the content moves slightly faster
        gsap.from(content, {
          x: 200,
          opacity: 0,
          scale: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: () => `top top-=${(i - 0.5) * window.innerWidth}`,
            end: () => `top top-=${i * window.innerWidth}`,
            scrub: true,
          }
        });
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
  );
}
