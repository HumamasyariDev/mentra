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
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray('.tunnel-card');
      
      // Initial state: Cards are placed deep in Z-space, far away
      cards.forEach((card, i) => {
        gsap.set(card, { 
          z: -4000 - (i * 2000), // Card 0 is at -4000, Card 1 at -6000, etc.
          opacity: 0,
          scale: 0.5
        });
      });

      // Pin the tunnel and scrub the track forward
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#loop-pin',
          start: "top top",
          end: `+=${cards.length * 1500}`, // Deep scroll length
          pin: true,
          scrub: 1.5, // Super smooth
        }
      });

      // The entire track moves forward by (total depth + extra) to bring all cards past camera
      const totalTravel = 4000 + (cards.length * 2000) + 1000;
      
      tl.to('.tunnel-track', {
        z: totalTravel,
        ease: "none" // Linear travel speed
      });

      // Link opacity/blur to absolute Z-position relative to camera
      // GSAP ScrollTrigger onUpdate is perfect for this dynamic calculation
      ScrollTrigger.create({
        trigger: '#loop-pin',
        start: "top top",
        end: `+=${cards.length * 1500}`,
        onUpdate: () => {
          const trackZ = gsap.getProperty('.tunnel-track', 'z');
          
          cards.forEach((card, i) => {
            const cardZ = -4000 - (i * 2000);
            const currentRelativeZ = trackZ + cardZ;
            
            // Calculate effects based on how close it is to camera (z=0)
            if (currentRelativeZ < -2000) {
              gsap.set(card, { opacity: 0, filter: 'blur(20px)' });
            } else if (currentRelativeZ >= -2000 && currentRelativeZ < -500) {
              // Fading in from distance
              const progress = gsap.utils.normalize(-2000, -500, currentRelativeZ);
              gsap.set(card, { opacity: progress, filter: `blur(${(1-progress)*20}px)` });
            } else if (currentRelativeZ >= -500 && currentRelativeZ < 200) {
              // In perfect focus zone
              gsap.set(card, { opacity: 1, filter: 'blur(0px)' });
            } else if (currentRelativeZ >= 200) {
              // Blasting past the camera - fade out and blur heavily
              const progress = gsap.utils.normalize(200, 800, currentRelativeZ);
              gsap.set(card, { opacity: 1 - progress, filter: `blur(${progress*40}px)` });
            }
          });
        }
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="loop-pin" className="tunnel-pin-wrapper">
      
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

    </section>
  );
}
