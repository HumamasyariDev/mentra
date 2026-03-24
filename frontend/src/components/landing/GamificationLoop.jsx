import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Sparkles, Trophy, TreePine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS = [CheckSquare, Sparkles, Trophy, TreePine];
const STEP_COLORS = ['#818cf8', '#c084fc', '#a78bfa', '#34d399'];

export default function GamificationLoop() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['landing']);

  const steps = t('landing:gamification.steps', { returnObjects: true });

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const panels = gsap.utils.toArray('.loop-panel');
      const totalWidth = (panels.length - 1) * window.innerWidth;
      
      const scrollTween = gsap.to(containerRef.current, {
        x: () => -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          end: () => "+=" + totalWidth,
        }
      });

      gsap.to('.loop-progress-fill', {
        width: '100%',
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + totalWidth,
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

    // Mobile & tablet: vertical layout, simple scroll reveal
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray('.loop-panel').forEach((panel) => {
        const content = panel.querySelector('.loop-panel-content');
        gsap.fromTo(content,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="loop-horizontal-wrapper">
      <div ref={containerRef} className="loop-horizontal-container">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <div key={i} className="loop-panel">
              <div className="loop-panel-content">
                <div className="loop-panel-icon" style={{ boxShadow: `0 20px 50px ${STEP_COLORS[i]}40` }}>
                  <Icon size={56} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="loop-progress-bar">
        <div className="loop-progress-fill"></div>
      </div>
    </section>
  );
}
