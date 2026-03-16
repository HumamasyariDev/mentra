import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Only use the final stage of the pine purple tree
import pineFinal from '../../assets/pine_purple/pine_purple_stage_final.png';

gsap.registerPlugin(ScrollTrigger);

// Generate intentional forest data
const FOREST_TREES = [
  // Left side coverage (Large trees to cover screen edges)
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `left-${i}`,
    left: `${-15 + Math.random() * 20}%`,
    bottom: `${-20 + Math.random() * 10}%`,
    scale: 1.8 + Math.random() * 0.8,
    rotation: (Math.random() - 0.5) * 10,
    zIndex: 25,
  })),
  // Right side coverage (Large trees to cover screen edges)
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `right-${i}`,
    left: `${80 + Math.random() * 20}%`,
    bottom: `${-20 + Math.random() * 10}%`,
    scale: 1.8 + Math.random() * 0.8,
    rotation: (Math.random() - 0.5) * 10,
    zIndex: 25,
  })),
  // Middle variety (Varied scales, reaching up towards text)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `mid-${i}`,
    left: `${20 + Math.random() * 60}%`,
    bottom: `${-15 + Math.random() * 15}%`,
    scale: 1.0 + Math.random() * 1.4,
    rotation: (Math.random() - 0.5) * 15,
    zIndex: 5 + Math.floor(Math.random() * 15),
  })),
];

export default function ForestShowcase() {
  const sectionRef = useRef(null);
  const portalRef = useRef(null);
  const textRef = useRef(null);
  const forestRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Ambient Swaying for all trees
    gsap.to('.forest-tree-instance', {
      rotation: "+=2",
      skewX: "+=1",
      duration: () => 4 + Math.random() * 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: {
        amount: 3,
        from: "random"
      }
    });

    // The Portal Dive (Pin and expand)
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2500",
          scrub: 1,
          pin: true,
          pinSpacing: true
        }
      });

      // NO Expansion animation needed as portal starts full width

      // Persist text with blending effect
      tl.to(textRef.current, {
        scale: 1.15,
        y: -100, // Move up slowly to cross paths with growing trees
        ease: 'none',
        duration: 1
      }, 0);

      // Immerse into the forest scene
      tl.to('.forest-scene-inner', { scale: 1.1, y: '5%', ease: 'none' }, 0);
      
      // Trees grow from the ground up (Pop-up effect)
      tl.from('.forest-tree-instance', {
        scale: 0,
        y: 150, // Grounded growth
        opacity: 0,
        stagger: {
          amount: 1.5,
          from: "center"
        },
        ease: 'power2.out'
      }, 0.1);

      // Extra parallax for deeper trees
      tl.to('.forest-tree-instance', {
        y: (i, target) => {
          const zIndex = parseInt(target.style.zIndex);
          return zIndex > 15 ? -50 : -20; // Forefront trees move more
        },
        ease: 'none'
      }, 0.5);
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <div ref={sectionRef}>
      <section id="forest" className="forest-section" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: 'var(--bg-base)' }}>
        
        <div ref={textRef} className="forest-text-overlay" style={{ mixBlendMode: 'difference' }}>
          <h2 className="landing-section-heading" style={{ margin: 0, filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}>
            Watch Your Progress Grow
          </h2>
          <p style={{ color: '#fff', fontSize: '1.25rem', marginTop: '1rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>
            Scroll to dive in.
          </p>
        </div>

        <div ref={portalRef} className="forest-portal">
          <div ref={forestRef} className="forest-scene-inner">
            {/* Populated Forest using only final stage trees */}
            {FOREST_TREES.map((tree) => (
              <img 
                key={tree.id}
                src={pineFinal} 
                alt="" 
                className="forest-asset forest-tree-instance"
                style={{ 
                  left: tree.left, 
                  bottom: tree.bottom, 
                  transform: `scale(${tree.scale}) rotate(${tree.rotation}deg)`,
                  zIndex: tree.zIndex,
                  width: '28%', // Made trees inherently taller/wider
                  pointerEvents: 'none'
                }} 
              />
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}
