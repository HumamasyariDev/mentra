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
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) {
       gsap.to('.landing-forest-mockup', { opacity: 1, duration: 1 });
       return;
    }

    // Awwwards-style 3D Mockup Entrance
    gsap.from('.landing-forest-mockup', {
      y: 150, 
      scale: 0.85, 
      rotationX: 15,
      opacity: 0, 
      transformPerspective: 1200,
      duration: 1.5, 
      ease: 'expo.out',
      scrollTrigger: { 
        trigger: sectionRef.current, 
        start: 'top 85%' 
      }
    });

    // Aggressive Ambient Loops
    gsap.to('.landing-forest-asset-campfire', {
      scale: 1.1, 
      filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.8)) brightness(1.2)',
      duration: 0.8, 
      yoyo: true, 
      repeat: -1, 
      ease: 'sine.inOut'
    });
    
    gsap.to('.landing-forest-asset-tree', {
      rotation: 3, 
      skewX: 2,
      transformOrigin: "bottom center",
      duration: 3.5, 
      yoyo: true, 
      repeat: -1, 
      ease: 'sine.inOut', 
      stagger: { each: 1.5, from: "random" }
    });

    // Deep 2.5D Parallax Scrub
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.landing-forest-mockup',
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5 // Smoother scrub
      }
    });

    // Background (moves slow, creates deep space)
    tl.to('.landing-forest-scene', { backgroundPosition: "50% 120%", ease: "none" }, 0);
    // Midground (Trees, moving up slightly)
    tl.to('.landing-forest-asset-tree', { y: -60, ease: "none" }, 0);
    // Foreground (Fire/Log, moving up fast)
    tl.to('.landing-forest-asset-front', { y: -140, scale: 1.1, ease: "none" }, 0);

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="forest" className="landing-forest" style={{ overflow: 'hidden', position: 'relative' }}>
      <div className="landing-forest-inner">
        <h2 className="landing-forest-heading">Watch Your Progress Grow</h2>
        <p className="landing-forest-text">
          As you complete tasks, your forest grows. Trees sprout from seeds,
          the campfire burns brighter, and your world expands.
        </p>

        <div className="landing-forest-mockup" style={{ willChange: 'transform, opacity' }}>
          <div className="landing-forest-mockup-bar">
            <span className="landing-forest-mockup-dot"></span>
            <span className="landing-forest-mockup-dot"></span>
            <span className="landing-forest-mockup-dot"></span>
          </div>
          <div className="landing-forest-scene" style={{ 
            backgroundSize: '100% 250%', 
            backgroundPosition: '50% 0%',
            overflow: 'hidden'
          }}>
            <img src={treeYoung} alt="Young tree" className="landing-forest-asset landing-forest-asset-tree" style={{ zIndex: 1 }} />
            <img src={treeFull} alt="Full tree" className="landing-forest-asset landing-forest-asset-tree" style={{ zIndex: 2, left: '10%' }} />
            
            {/* Foreground Assets */}
            <img src={campfire} alt="Campfire" className="landing-forest-asset landing-forest-asset-front landing-forest-asset-campfire" style={{ zIndex: 10 }} />
            <img src={log} alt="Log" className="landing-forest-asset landing-forest-asset-front" style={{ zIndex: 9, right: '45%' }} />
            
            <img src={treeFull} alt="Full tree" className="landing-forest-asset landing-forest-asset-tree" style={{ zIndex: 2, right: '10%' }} />
            <img src={treeYoung} alt="Young tree" className="landing-forest-asset landing-forest-asset-tree" style={{ zIndex: 1 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
