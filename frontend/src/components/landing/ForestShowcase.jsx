import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import treeFull from '../../assets/gameworld/tree.png';
import treeYoung from '../../assets/gameworld/new_tree.png';
import campfire from '../../assets/gameworld/roar_fire.png';
import log from '../../assets/gameworld/log.png';

gsap.registerPlugin(ScrollTrigger);

export default function ForestShowcase() {
  const sectionRef = useRef(null);
  const portalRef = useRef(null);
  const textRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Ambient Swaying
    gsap.to('.forest-tree-left, .forest-tree-right', {
      rotation: 3,
      skewX: 1,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 2
    });

    gsap.to('.forest-portal-glow, .forest-fire', {
      scale: 1.1,
      opacity: 0.9,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // The Portal Dive (Pin and expand)
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current, // Pin the outer container
          start: "top top",
          end: "+=1500", // Shorter to avoid overlapping fatigue
          scrub: 1,
          pin: true,
          pinSpacing: true
        }
      });

      // Scale the portal to fill the screen
      tl.to(portalRef.current, {
        width: '100vw',
        height: '100vh',
        borderRadius: '0px',
        border: '0px',
        boxShadow: 'none',
        ease: 'power2.inOut',
      }, 0);

      // Fade out the text
      tl.to(textRef.current, {
        opacity: 0,
        scale: 1.2,
        y: -100,
        ease: 'power2.in'
      }, 0);

      // Deep 3D Parallax of the forest elements
      tl.to('.forest-scene-inner', { scale: 1.1, y: '10%', ease: 'none' }, 0);
      tl.to('.forest-tree-left, .forest-tree-right', { scale: 1.3, y: '15%', ease: 'none' }, 0);
      tl.to('.forest-fire, .forest-log', { scale: 1.6, y: '25%', ease: 'none' }, 0);
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="forest" style={{ width: '100%', position: 'relative' }}>
      <div className="forest-pin-wrapper" style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: 'var(--bg-base)' }}>
        
        <div ref={textRef} className="forest-text-overlay">
          <h2 className="landing-section-heading" style={{ margin: 0, filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}>
            Watch Your Progress Grow
          </h2>
          <p style={{ color: '#fff', fontSize: '1.25rem', marginTop: '1rem', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>
            Scroll to dive in.
          </p>
        </div>

        <div ref={portalRef} className="forest-portal">
          <div className="forest-scene-inner">
            <div className="forest-portal-glow"></div>
            
            <img src={treeFull} alt="" className="forest-asset forest-tree-left" />
            <img src={treeFull} alt="" className="forest-asset forest-tree-right" />
            <img src={log} alt="" className="forest-asset forest-log" />
            <img src={campfire} alt="" className="forest-asset forest-fire" />
            
            <img src={treeYoung} alt="" className="forest-asset forest-tree-left" style={{ left: '8%', width: '15%', bottom: '2%', zIndex: 11 }} />
            <img src={treeYoung} alt="" className="forest-asset forest-tree-right" style={{ right: '8%', width: '15%', bottom: '2%', zIndex: 11 }} />
          </div>
        </div>

      </div>
    </section>
  );
}
