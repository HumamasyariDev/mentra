import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Sparkles, Trophy, TreePine } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: CheckSquare, title: 'Check it off', desc: 'Manage your daily tasks with beautiful list, calendar, or board views.' },
  { icon: Sparkles, title: 'Earn XP', desc: 'Every completed task earns experience points. Your productivity directly fuels your progress.' },
  { icon: Trophy, title: 'Level Up', desc: 'Hit milestones, maintain daily streaks, and climb levels as you build better habits.' },
  { icon: TreePine, title: 'Watch it Grow', desc: 'Your progress manifests as a living, breathing virtual forest that grows with you.' },
];

export default function GamificationLoop() {
  const sectionRef = useRef(null);
  const pinWrapperRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray('.tunnel-card');
      
      // Set cards up in deep Z-space
      cards.forEach((card, i) => {
        gsap.set(card, { 
          z: -3000 - (i * 2000), 
          opacity: 0,
          scale: 0.5
        });
      });

      // Pin the section wrapper, animate the track inside it
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current, // Pin the outer section
          start: "top top",
          end: `+=${cards.length * 1500}`, 
          pin: true,
          scrub: 1,
          pinSpacing: true // Ensure it pushes content down correctly
        }
      });

      const totalTravel = 3000 + (cards.length * 2000) + 1000;
      
      tl.to('.tunnel-track', {
        z: totalTravel,
        ease: "none"
      });

      // Update card focus based on absolute track Z
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${cards.length * 1500}`,
        onUpdate: () => {
          const trackZ = gsap.getProperty('.tunnel-track', 'z') || 0;
          
          cards.forEach((card, i) => {
            const cardZ = -3000 - (i * 2000);
            const currentRelativeZ = trackZ + cardZ;
            
            if (currentRelativeZ < -1500) {
              gsap.set(card, { opacity: 0, filter: 'blur(20px)' });
            } else if (currentRelativeZ >= -1500 && currentRelativeZ < -200) {
              const progress = gsap.utils.normalize(-1500, -200, currentRelativeZ);
              gsap.set(card, { opacity: progress, filter: `blur(${(1-progress)*20}px)` });
            } else if (currentRelativeZ >= -200 && currentRelativeZ < 200) {
              gsap.set(card, { opacity: 1, filter: 'blur(0px)' });
            } else if (currentRelativeZ >= 200) {
              const progress = gsap.utils.normalize(200, 1000, currentRelativeZ);
              gsap.set(card, { opacity: 1 - progress, filter: `blur(${progress*40}px)` });
            }
          });
        }
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" style={{ width: '100%', position: 'relative' }}>
      <div ref={pinWrapperRef} className="tunnel-pin-wrapper" style={{ width: '100%', height: '100vh', overflow: 'hidden', perspective: '2000px', background: 'var(--bg-base)', position: 'relative' }}>
        
        <div className="tunnel-title">The Loop.</div>

        <div className="tunnel-track">
          {STEPS.map((step, i) => (
            <div key={i} className="tunnel-card">
              <div className="tunnel-icon">
                <step.icon size={64} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
