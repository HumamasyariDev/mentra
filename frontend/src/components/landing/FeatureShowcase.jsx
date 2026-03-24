import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Landing page screenshot images
import taskPage from '../../assets/landing_page_images/task_page.png';
import pomodoroPage from '../../assets/landing_page_images/pomodoro_page.png';
import forestPage from '../../assets/landing_page_images/forest_page.png';
import schedulePage from '../../assets/landing_page_images/schedule_page.png';
import aiChat from '../../assets/landing_page_images/ai_chat.png';
import forumPage from '../../assets/landing_page_images/forum_page.png';

gsap.registerPlugin(ScrollTrigger);

const FEATURE_IMAGES = [taskPage, pomodoroPage, forestPage, schedulePage, aiChat, forumPage];
const FEATURE_ACCENTS = ['#a78bfa', '#c084fc', '#34d399', '#38bdf8', '#818cf8', '#7c3aed'];

const CARD_OFFSET = 20; // px peek between stacked cards

export default function FeatureShowcase() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['landing']);

  const featureItems = t('landing:features.items', { returnObjects: true });
  const titleWords = t('landing:features.title').split(" ");

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const cards = gsap.utils.toArray('.stack-card');
      const totalCards = cards.length;

      // Hide ALL cards initially
      gsap.set(cards, { yPercent: 100, opacity: 0 });

      // ── Even phase spacing so snap points land in rest windows ──
      // Layout: [title | card0 | card1 | ... | card5 | hold]
      // Each phase = 1 unit, animations take 0.5 units → 0.5-unit rest gap.
      // Hold is shorter (0.4 phase) to minimize dead scroll after last card.
      const PHASE = 1;
      const HOLD = PHASE * 0.4;
      const contentPhases = totalCards + 1; // title + cards
      const totalDuration = contentPhases * PHASE + HOLD;

      // Snap points at each phase boundary + end
      const snapPoints = Array.from(
        { length: contentPhases + 1 },
        (_, i) => (i * PHASE) / totalDuration
      );
      snapPoints.push(1.0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalDuration * 800}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          snap: {
            snapTo: snapPoints,
            duration: { min: 0.2, max: 0.5 },
            ease: 'power2.inOut',
          },
        }
      });

      // Phase 0: Title reveal (scrubbed — scrolls away naturally)
      tl.fromTo('.feature-title-word',
        { y: 60, opacity: 0, rotateX: -45 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
        0
      );

      // Phase 1: First card slides in
      tl.to(cards[0], {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      }, 1 * PHASE);

      // Phase 2..N: Each subsequent card slides up & pushes previous cards back
      for (let i = 1; i < totalCards; i++) {
        const cardStart = (i + 1) * PHASE;

        // Slide new card in
        tl.to(cards[i], {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
        }, cardStart);

        // Push previous cards back (scale down + shift up for depth)
        for (let j = 0; j < i; j++) {
          const depth = i - j;
          tl.to(cards[j], {
            scale: Math.max(0.88, 1 - depth * 0.025),
            y: -depth * CARD_OFFSET,
            duration: 0.5,
            ease: 'power3.out',
          }, cardStart);
        }
      }

      // Short hold so last card stays visible briefly before section unpins
      tl.to({}, { duration: HOLD }, contentPhases * PHASE);
    });

    // Mobile: simple fade-up stagger
    mm.add("(max-width: 767px)", () => {
      gsap.fromTo('.feature-title-word',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );

      gsap.utils.toArray('.stack-card').forEach((card) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%' }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="features" className="stack-section">
      <div className="stack-title-area">
        <h2 className="landing-section-heading">
          {titleWords.map((word, i) => (
            <span key={i} className="feature-title-word" style={{ display: 'inline-block' }}>
              <span className={i === 2 ? 'hero-title-highlight' : 'feature-title-default'}>
                {word}
              </span>
              {i < titleWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h2>
      </div>

      <div className="stack-deck">
        {featureItems.map((feature, i) => (
          <div
            key={i}
            className="stack-card"
            style={{ '--card-accent': FEATURE_ACCENTS[i], zIndex: i + 1 }}
          >
            <div className="stack-card-image">
              <img
                src={FEATURE_IMAGES[i]}
                alt={feature.title}
                draggable={false}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <div className="stack-card-overlay">
              <div className="stack-card-info">
                <h3 className="stack-card-title">{feature.title}</h3>
                <p className="stack-card-desc">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom fade into cosmic background */}
      <div className="stack-section-ground" />
    </section>
  );
}
