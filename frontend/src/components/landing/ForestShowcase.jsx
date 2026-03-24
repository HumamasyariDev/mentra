import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Only the full-grown tree
import pineFinal from '../../assets/pine_purple/pine_purple_stage_final.png';

gsap.registerPlugin(ScrollTrigger);

/**
 * Planetary-curve tree layout — mirrors the app's Forest.jsx algorithm.
 * Golden-ratio horizontal spread, power-curve depth, dome dropoff at edges.
 */
function getTreeLayout(index, total) {
  const rawProgress = index / Math.max(1, total - 1);
  const depthProgress = Math.pow(rawProgress, 0.7);

  const seed = index * 73856093 ^ 19349663;

  // Golden ratio for even horizontal distribution
  let nx = ((index * 0.618033988749895) % 1) * 2 - 1;
  nx += Math.sin(seed) * 0.15;

  // Spread: narrow at horizon, wide at foreground (matches Forest.jsx)
  const maxSpread = 40 + Math.pow(depthProgress, 1.2) * 60;
  const leftPercent = 50 + nx * maxSpread;

  // Planetary curve: horizon ~55%, drops to -10% at foreground
  const baseBottom = 55 - depthProgress * 65;
  const domeDrop = (nx * nx) * 18;
  let bottomPercent = baseBottom - domeDrop;
  bottomPercent += Math.sin(seed * 2) * 2.5;

  // Scale: small at horizon, large at foreground (matches Forest.jsx values)
  let scale = 0.35 + ((55 - bottomPercent) / 65) * 1.45;
  scale *= 0.85 + Math.abs(Math.sin(seed * 3)) * 0.35;

  const opacity = Math.min(1, 0.5 + depthProgress * 0.5);

  return {
    left: `${leftPercent}%`,
    bottom: `${bottomPercent}%`,
    scale: Math.max(0.25, scale),
    opacity,
    zIndex: Math.round(1000 - bottomPercent * 10),
  };
}

const TREE_COUNT = 45;

export default function ForestShowcase() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['landing']);

  // Pre-compute tree layout
  const trees = useMemo(() =>
    Array.from({ length: TREE_COUNT }, (_, i) => ({
      id: i,
      ...getTreeLayout(i, TREE_COUNT),
    })),
    []
  );

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=2000',
          scrub: 1,
          pin: true,
          pinSpacing: true,
        }
      });

      // Title reveal
      tl.fromTo('.forest-showcase-title',
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
        0
      );

      tl.fromTo('.forest-showcase-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
        0.15
      );

      // Trees grow from the ground up — staggered from center
      tl.fromTo('.forest-showcase-tree',
        { scale: 0, opacity: 0, y: 60 },
        {
          scale: 1, opacity: 1, y: 0,
          duration: 0.8,
          ease: 'back.out(1.4)',
          stagger: { amount: 1.2, from: 'center' }
        },
        0.2
      );

      // Slow zoom immersion
      tl.to('.forest-showcase-scene', {
        scale: 1.08,
        y: '-3%',
        duration: 1,
        ease: 'none',
      }, 0.5);

      // Text fades as you dive deeper
      tl.to('.forest-showcase-text', {
        y: -80,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      }, 1.2);
    });

    // Mobile: simple scroll-triggered reveals, no pin
    mm.add("(max-width: 767px)", () => {
      gsap.fromTo('.forest-showcase-title',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );

      gsap.fromTo('.forest-showcase-subtitle',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
        }
      );

      gsap.fromTo('.forest-showcase-tree',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1,
          ease: 'back.out(1.2)',
          stagger: { amount: 0.8, from: 'center' },
          scrollTrigger: { trigger: '.forest-showcase-scene', start: 'top 85%' }
        }
      );
    });

    // Ambient sway on all trees
    gsap.utils.toArray('.forest-showcase-tree').forEach((tree, i) => {
      gsap.to(tree, {
        rotation: `+=${1.5 + Math.sin(i) * 1}`,
        duration: 4 + (i % 3),
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.2,
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <div ref={sectionRef}>
      <section id="forest" className="forest-showcase-section">
        {/* Radial glow behind the scene */}
        <div className="forest-showcase-glow" />

        {/* Text overlay */}
        <div className="forest-showcase-text">
          <h2 className="forest-showcase-title landing-section-heading">
            {t('landing:forest.title')}
          </h2>
          <p className="forest-showcase-subtitle">
            {t('landing:forest.subtitle')}
          </p>
        </div>

        {/* Tree scene */}
        <div className="forest-showcase-scene">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="forest-showcase-tree"
              style={{
                position: 'absolute',
                left: tree.left,
                bottom: tree.bottom,
                zIndex: tree.zIndex,
                opacity: tree.opacity,
                transformOrigin: 'bottom center',
              }}
            >
              <img
                src={pineFinal}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ transform: `scale(${tree.scale})`, transformOrigin: 'bottom center' }}
              />
            </div>
          ))}
        </div>

        {/* Ground gradient */}
        <div className="forest-showcase-ground" />
      </section>
    </div>
  );
}
