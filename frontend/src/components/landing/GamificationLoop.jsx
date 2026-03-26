import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Sparkles, FileText, TreePine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS = [BookOpen, Sparkles, FileText, TreePine];

export default function GamificationLoop() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['landing']);

  const steps = t('landing:gamification.steps', { returnObjects: true });
  const headingWords = t('landing:gamification.title').split(' ');

  useGSAP(() => {
    if (prefersReducedMotion) return;

    /* ── Section heading reveal ── */
    gsap.fromTo('.loop-heading-word',
      { y: 60, opacity: 0, rotateX: -40 },
      {
        y: 0, opacity: 1, rotateX: 0,
        duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.loop-header',
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      }
    );

    gsap.fromTo('.loop-subtitle',
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.loop-header',
          start: 'top 75%',
          toggleActions: 'play none none none',
        }
      }
    );

    /* ── Timeline line draw (scrub) ── */
    const lineFill = sectionRef.current.querySelector('.loop-line-fill');
    if (lineFill) {
      gsap.fromTo(lineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.loop-timeline',
            start: 'top 65%',
            end: 'bottom 40%',
            scrub: 0.8,
          }
        }
      );
    }

    /* ── Step cards + nodes ── */
    gsap.utils.toArray('.loop-step').forEach((step, i) => {
      const card = step.querySelector('.loop-card');
      const node = step.querySelector('.loop-node');
      const isLeft = i % 2 === 0;

      // Card slides in from its side
      gsap.fromTo(card,
        { x: isLeft ? -80 : 80, opacity: 0, scale: 0.95 },
        {
          x: 0, opacity: 1, scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 82%',
            toggleActions: 'play none none none',
          }
        }
      );

      // Node pops in
      if (node) {
        gsap.fromTo(node,
          { scale: 0, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 0.5,
            delay: 0.15,
            ease: 'back.out(2.5)',
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
    });

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="loop-section">
      {/* Section header */}
      <div className="loop-header">
        <span className="loop-label">{t('landing:gamification.label')}</span>
        <h2 className="loop-heading">
          {headingWords.map((word, i) => (
            <span key={i} className="loop-heading-word">
              <span className={i === headingWords.length - 1 ? 'hero-title-highlight' : 'loop-heading-default'}>
                {word}
              </span>
              {i < headingWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h2>
        <p className="loop-subtitle">
          {t('landing:gamification.subtitle')}
        </p>
      </div>

      {/* Timeline */}
      <div className="loop-timeline">
        {/* Vertical connecting line */}
        <div className="loop-line" aria-hidden="true">
          <div className="loop-line-fill" />
        </div>

        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const isLeft = i % 2 === 0;

          return (
            <div
              key={i}
              className={`loop-step ${isLeft ? 'loop-step--left' : 'loop-step--right'}`}
            >
              {/* Card */}
              <div className="loop-card">
                <div className="loop-card-accent" />
                <span className="loop-card-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="loop-card-body">
                  <div className="loop-card-icon">
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <div className="loop-card-text">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              </div>

              {/* Timeline node */}
              <div className="loop-node">
                <span>{i + 1}</span>
              </div>

              {/* Spacer for the empty side */}
              <div className="loop-step-spacer" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
