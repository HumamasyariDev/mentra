# Landing Page GSAP Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static landing page into an Awwwards-style experience with magnetic buttons, pinned scrolling narratives, and 2.5D parallax.

**Architecture:** Create global GSAP hooks for reduced motion and magnetic hover, then systematically upgrade each component's `useGSAP` implementation.

**Tech Stack:** React 19, GSAP 3.14 + @gsap/react, Tailwind/CSS.

---

### Task 1: Create Global GSAP Utilities

**Files:**
- Create: `frontend/src/hooks/useReducedMotion.js`
- Create: `frontend/src/hooks/useMagneticHover.js`

**Step 1: Create useReducedMotion hook**

```javascript
import { useState, useEffect } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

**Step 2: Create useMagneticHover hook**

```javascript
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function useMagneticHover(strength = 0.5) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * strength);
      yTo(y * strength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
}
```

**Step 3: Commit**
```bash
git add frontend/src/hooks/useReducedMotion.js frontend/src/hooks/useMagneticHover.js
git commit -m "feat(landing): add GSAP global utility hooks"
```

---

### Task 2: Upgrade Hero Component

**Files:**
- Modify: `frontend/src/components/landing/Hero.jsx`

**Step 1: Import hooks and implement Magnetic Buttons & Cursor Parallax**

Replace the current `Hero.jsx` contents with this upgraded version:

```javascript
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

export default function Hero() {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const btn1Ref = useMagneticHover(0.3);
  const btn2Ref = useMagneticHover(0.3);

  useGSAP(() => {
    if (prefersReducedMotion) {
      gsap.to('.landing-hero-content > *', { opacity: 1, y: 0, duration: 0.5 });
      gsap.to('.landing-hero-visual', { opacity: 1, duration: 0.5 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.landing-hero-tagline', { x: -60, opacity: 0, duration: 1 })
      .from('.landing-hero-subtitle', { x: -40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.landing-hero-cta', { y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)' }, '-=0.4')
      .from('.landing-hero-badge', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.landing-hero-visual', { x: 60, opacity: 0, duration: 1 }, '-=1.2');

    // Infinite Float
    gsap.to('.landing-hero-shape', {
      y: -15,
      rotation: 'random(-5, 5)',
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.4, from: 'random' },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  // Cursor Parallax Background
  useEffect(() => {
    if (prefersReducedMotion || !visualRef.current) return;
    
    const shapes = visualRef.current.querySelectorAll('.landing-hero-shape');
    const xTo = gsap.quickTo(shapes, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(shapes, "y", { duration: 0.8, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5) * 40; // max 20px
      const yPos = (e.clientY / innerHeight - 0.5) * 40;
      xTo(xPos);
      yTo(yPos);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="landing-hero">
      <div className="landing-hero-content">
        <h1 className="landing-hero-tagline">
          Productivity that grows with you
        </h1>
        <p className="landing-hero-subtitle">
          Complete tasks. Earn XP. Level up. Watch your forest come alive.
        </p>
        <div className="landing-hero-actions">
          <Link to="/register" ref={btn1Ref} className="landing-hero-cta landing-btn-primary block">
            Get Started
          </Link>
          <a
            href="#how-it-works"
            ref={btn2Ref}
            className="landing-hero-cta landing-btn-outline block"
            onClick={scrollToHowItWorks}
          >
            See How It Works
          </a>
        </div>
        <p className="landing-hero-badge">Built with React, Laravel &amp; AI</p>
      </div>

      <div ref={visualRef} className="landing-hero-visual">
        <div className="landing-hero-shape landing-hero-shape-1" />
        <div className="landing-hero-shape landing-hero-shape-2" />
        <div className="landing-hero-shape landing-hero-shape-3" />
        <div className="landing-hero-shape landing-hero-shape-4" />
        <div className="landing-hero-shape landing-hero-shape-5" />
      </div>
    </section>
  );
}
```

**Step 2: Commit**
```bash
git add frontend/src/components/landing/Hero.jsx
git commit -m "feat(landing): upgrade Hero with magnetic hover and cursor parallax"
```

---

### Task 3: Upgrade GamificationLoop Component (Pinned Narrative)

**Files:**
- Modify: `frontend/src/components/landing/GamificationLoop.jsx`
- Modify: `frontend/src/styles/pages/LandingPage.css`

**Step 1: Update CSS for pinning layout**

Add to `LandingPage.css` under the Gamification Loop section:
```css
.landing-loop-container {
  width: 100%;
  position: relative;
}
.landing-loop-step {
  transition: opacity 0.3s, transform 0.3s;
}
.landing-loop-step.inactive {
  opacity: 0.3;
  transform: scale(0.85);
}
.landing-loop-step.active {
  opacity: 1;
  transform: scale(1);
}
```

**Step 2: Rewrite GamificationLoop.jsx**

```javascript
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

    // Desktop: Pinned Narrative
    mm.add("(min-width: 1024px)", () => {
      const steps = gsap.utils.toArray('.landing-loop-step');
      const lines = gsap.utils.toArray('.landing-loop-connector-line');

      // Initial state
      gsap.set(steps.slice(1), { opacity: 0.3, scale: 0.85 });
      gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: "+=2000",
          scrub: 1,
          pin: true,
        }
      });

      steps.forEach((step, i) => {
        if (i > 0) {
          // Draw line
          tl.to(lines[i - 1], { scaleX: 1, duration: 1, ease: "none" });
          
          // Next step active, previous step inactive
          tl.to(steps[i - 1], { opacity: 0.3, scale: 0.85, duration: 0.5 }, "<");
          tl.to(step, { opacity: 1, scale: 1, duration: 0.5 }, "<");
          
          // Icon pop
          tl.fromTo(step.querySelector('.landing-loop-icon'), 
            { rotation: -45, scale: 0.5 }, 
            { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }, 
            "<"
          );
        }
      });
    });

    // Mobile: Standard Stagger
    mm.add("(max-width: 1023px)", () => {
      gsap.from('.landing-loop-step', {
        x: 50, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.from('.landing-loop-connector-line', {
        scaleY: 0, transformOrigin: "top center", duration: 0.5, stagger: 0.2, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="how-it-works" className="landing-section">
      <h2 className="landing-section-heading">How Mentra Works</h2>
      <div ref={containerRef} className="landing-loop-container">
        <div className="landing-loop-grid">
          {STEPS.map((step, i) => (
            <div key={step.title} className="landing-loop-item">
              <div className={`landing-loop-step ${i === 0 ? 'active' : 'inactive'}`}>
                <div className="landing-loop-icon">
                  <step.icon size={28} />
                </div>
                <h3 className="landing-loop-title">{step.title}</h3>
                <p className="landing-loop-desc">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="landing-loop-connector">
                  <div className="landing-loop-connector-line" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Commit**
```bash
git add frontend/src/components/landing/GamificationLoop.jsx frontend/src/styles/pages/LandingPage.css
git commit -m "feat(landing): implement pinned scrolljacking narrative for GamificationLoop"
```

---

### Task 4: Upgrade ForestShowcase (2.5D Parallax)

**Files:**
- Modify: `frontend/src/components/landing/ForestShowcase.jsx`

**Step 1: Rewrite ForestShowcase.jsx**

```javascript
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
    if (prefersReducedMotion) return;

    // Window Entrance
    gsap.from('.landing-forest-mockup', {
      y: 100, scale: 0.9, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' }
    });

    // Ambient Loops
    gsap.to('.landing-forest-asset-campfire', {
      scale: 1.05, filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
      duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });
    
    gsap.to('.landing-forest-asset-tree', {
      rotation: 2, transformOrigin: "bottom center",
      duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 1.5
    });

    // 2.5D Parallax Scrub
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.landing-forest-mockup',
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // Background (slow)
    tl.to('.landing-forest-scene', { backgroundPosition: "50% 100%", ease: "none" }, 0);
    // Midground (medium)
    tl.to('.landing-forest-asset-tree', { y: -30, ease: "none" }, 0);
    // Foreground (fast)
    tl.to('.landing-forest-asset-front', { y: -80, ease: "none" }, 0);

  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} id="forest" className="landing-forest">
      <div className="landing-forest-inner">
        <h2 className="landing-forest-heading">Your productivity, visualized</h2>
        <p className="landing-forest-text">
          As you complete tasks, your forest grows. Trees sprout from seeds,
          the campfire burns brighter, and your world expands.
        </p>

        <div className="landing-forest-mockup">
          <div className="landing-forest-mockup-bar">
            <span className="landing-forest-mockup-dot"></span>
            <span className="landing-forest-mockup-dot"></span>
            <span className="landing-forest-mockup-dot"></span>
          </div>
          <div className="landing-forest-scene" style={{ backgroundSize: '100% 200%', backgroundPosition: '50% 0%' }}>
            <img src={treeYoung} alt="Young tree" className="landing-forest-asset landing-forest-asset-tree" />
            <img src={treeFull} alt="Full tree" className="landing-forest-asset landing-forest-asset-tree" />
            <img src={campfire} alt="Campfire" className="landing-forest-asset landing-forest-asset-front landing-forest-asset-campfire" />
            <img src={log} alt="Log" className="landing-forest-asset landing-forest-asset-front" />
            <img src={treeFull} alt="Full tree" className="landing-forest-asset landing-forest-asset-tree" />
            <img src={treeYoung} alt="Young tree" className="landing-forest-asset landing-forest-asset-tree" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**
```bash
git add frontend/src/components/landing/ForestShowcase.jsx
git commit -m "feat(landing): add 2.5D parallax and ambient loops to ForestShowcase"
```

---

### Task 5: Upgrade FeatureShowcase & TechStack (3D Reveals)

**Files:**
- Modify: `frontend/src/components/landing/FeatureShowcase.jsx`
- Modify: `frontend/src/components/landing/TechStack.jsx`

**Step 1: Rewrite FeatureShowcase.jsx**

```javascript
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckSquare, Timer, Calendar, Smile, Bot, BrainCircuit } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// ... keep FEATURES array ...

export default function FeatureShowcase() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // 3D Entrance
    gsap.from('.landing-feature-card', {
      rotationX: -45, y: 50, opacity: 0, transformPerspective: 1000,
      duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
    });

    // Hover Tilts
    const cards = gsap.utils.toArray('.landing-feature-card');
    cards.forEach(card => {
      const xTo = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power2.out" });
      const yTo = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power2.out" });
      
      card.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 10; // Max ~15deg
        const y = -(e.clientY - top - height / 2) / 10;
        xTo(x);
        yTo(y);
        gsap.set(card, { transformPerspective: 1000 });
      });
      
      card.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  // ... keep return statement ...
}
```

**Step 2: Rewrite TechStack.jsx**

Update the `useGSAP` block inside `TechStack.jsx`:
```javascript
  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
    });

    tl.from('.landing-tech-pill', {
      y: 30, opacity: 0, scale: 0.9,
      duration: 0.6, stagger: 0.05, ease: 'back.out(1.5)'
    })
    .from('.landing-tech-pill svg', {
      rotation: -180, scale: 0, opacity: 0,
      duration: 0.5, stagger: 0.05, ease: 'back.out(2)'
    }, "<0.1");
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });
```
*(Don't forget to import `useReducedMotion` and instantiate it `const prefersReducedMotion = useReducedMotion();`)*

**Step 3: Commit**
```bash
git add frontend/src/components/landing/FeatureShowcase.jsx frontend/src/components/landing/TechStack.jsx
git commit -m "feat(landing): add 3D entrances and hover tilts to features and tech stack"
```

---

### Task 6: Final Polish (CTAFooter, Navbar, Headings)

**Files:**
- Modify: `frontend/src/components/landing/CTAFooter.jsx`
- Modify: `frontend/src/components/landing/Navbar.jsx`

**Step 1: Enhance CTAFooter.jsx**

Import `useReducedMotion` and `useMagneticHover`. Add `useMagneticHover` to the button.
Inside `useGSAP`:
```javascript
    // Pulse animation for button
    gsap.to('.landing-cta-button', {
      scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });
    
    // Background gradient breathe
    gsap.to(sectionRef.current, {
      backgroundPosition: "100% 100%",
      duration: 10, yoyo: true, repeat: -1, ease: "sine.inOut"
    });
```
*(Apply `style={{ backgroundSize: '200% 200%' }}` to the section element)*

**Step 2: Enhance Navbar.jsx**

Inside `useGSAP`, add entrance animation:
```javascript
    gsap.from(navRef.current, { y: -100, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
```
For the mobile menu, use conditional rendering but wrap in a GSAP transition or just use standard CSS transitions if simpler, but since we are GSAP focused, use a `useRef` for the mobile menu and animate `height` or `yPercent`.

**Step 3: Commit**
```bash
git add frontend/src/components/landing/CTAFooter.jsx frontend/src/components/landing/Navbar.jsx
git commit -m "feat(landing): complete final GSAP polish for CTA and Navbar"
```

---

**Plan complete and saved to `.opencode/plans/2026-03-14-landing-gsap-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
