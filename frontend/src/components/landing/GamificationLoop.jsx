import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Sparkles, Trophy, TreePine } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: CheckSquare, title: 'Complete Tasks', desc: 'Manage your daily tasks with list, calendar, or board views' },
  { icon: Sparkles, title: 'Earn XP', desc: 'Every completed task earns experience points' },
  { icon: Trophy, title: 'Level Up', desc: 'Hit milestones, maintain streaks, climb levels' },
  { icon: TreePine, title: 'Grow Your Forest', desc: 'Watch your virtual world come alive as you stay productive' },
];

export default function GamificationLoop() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    // Desktop: Pinned Narrative with aggressive masking and blur
    mm.add("(min-width: 1024px)", () => {
      const steps = gsap.utils.toArray('.landing-loop-step');
      const lines = gsap.utils.toArray('.landing-loop-connector-line');

      // Initial aggressive state
      gsap.set(steps.slice(1), { opacity: 0.1, scale: 0.7, filter: 'blur(8px)' });
      gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(steps[0].querySelector('.landing-loop-icon'), { boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: "+=2500", // Much longer scroll for a premium feel
          scrub: 1, // Smooth scrubbing
          pin: true,
          anticipatePin: 1,
        }
      });

      steps.forEach((step, i) => {
        if (i > 0) {
          // Progressively draw the line
          tl.to(lines[i - 1], { scaleX: 1, duration: 1, ease: "none" });
          
          // Crossfade: Previous step recedes heavily into the background
          tl.to(steps[i - 1], { 
            opacity: 0.1, 
            scale: 0.7, 
            filter: 'blur(8px)',
            duration: 0.8,
            ease: "power2.inOut"
          }, "<");
          
          tl.to(steps[i - 1].querySelector('.landing-loop-icon'), { 
            boxShadow: '0 0 0px rgba(99, 102, 241, 0)', duration: 0.8 
          }, "<");

          // Current step blasts into focus
          tl.to(step, { 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            duration: 0.8,
            ease: "power2.out"
          }, "<");

          // Icon pop with cosmic pulse
          tl.fromTo(step.querySelector('.landing-loop-icon'), 
            { rotation: -90, scale: 0.5 }, 
            { 
              rotation: 0, 
              scale: 1, 
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
              duration: 1, 
              ease: "elastic.out(1, 0.5)" 
            }, 
            "<0.2"
          );
        }
      });
    });

    // Mobile: Parallax Stagger
    mm.add("(max-width: 1023px)", () => {
      gsap.from('.landing-loop-step', {
        x: 100, 
        opacity: 0, 
        rotationY: 45,
        duration: 0.8, 
        stagger: 0.3, 
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.from('.landing-loop-connector-line', {
        scaleY: 0, transformOrigin: "top center", duration: 0.6, stagger: 0.3, delay: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="landing-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="landing-section-heading" style={{ overflow: 'hidden' }}>
        <span style={{ display: 'block', transform: 'translateY(0)', transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>The Productivity Loop</span>
      </h2>
      <div ref={containerRef} className="landing-loop-container">
        <div className="landing-loop-grid">
          {STEPS.map((step, i) => (
            <div key={step.title} className="landing-loop-item" style={{ perspective: '1000px' }}>
              <div className={`landing-loop-step ${i === 0 ? 'active' : 'inactive'}`} style={{ willChange: 'transform, opacity, filter', transformOrigin: 'center center' }}>
                <div className="landing-loop-icon" style={{ transition: 'box-shadow 0.3s' }}>
                  <step.icon size={32} />
                </div>
                <h3 className="landing-loop-title" style={{ fontSize: '1.25rem' }}>{step.title}</h3>
                <p className="landing-loop-desc" style={{ fontSize: '1rem' }}>{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="landing-loop-connector">
                  <div className="landing-loop-connector-line" style={{ willChange: 'transform' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
