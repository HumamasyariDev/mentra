# Mentra Landing Page GSAP Animation Upgrade

**Date:** 2026-03-14
**Status:** Approved
**Approach:** The ScrollTeller (Full Showcase / Awwwards-style)

## Context
The Mentra landing page has been built with clean, native CSS components, but the current GSAP implementation is monotonous. Every section uses a simple `slide up + fade in` triggered once on scroll. To impress competition judges, the page needs an Awwwards-level interactive upgrade focusing on narrative flow, 3D depth, and magnetic interactivity.

## Global Mechanics
- **`useReducedMotion` Hook:** A custom React hook checking `window.matchMedia('(prefers-reduced-motion: reduce)')`. This boolean will be passed into `useGSAP` contexts to return early or use a simplified `opacity`-only timeline, ensuring accessibility.
- **`gsap.matchMedia()`:** All complex scroll-based layouts (specifically pinning) will be wrapped in matchMedia breakpoints to ensure they only run on desktop/tablet, gracefully degrading to vertical layouts on mobile.
- **Section Heading Component:** Extract the `h2.landing-section-heading` logic into a reusable `<AnimatedHeading text="..." />` component. It will split the text by words/lines and animate them in sequentially with a subtle `rotateX` and `y` translation via ScrollTrigger.

## Component Upgrades

### 1. Hero (`Hero.jsx`)
- **Magnetic Buttons:** Use `gsap.quickTo` on a `mousemove` listener attached to `.landing-hero-actions`. The CTA buttons will gently translate (max ~10-15px) toward the cursor position. On `mouseleave`, they bounce back using `elastic.out`.
- **Cursor Parallax Background:** The 5 floating background shapes keep their infinite `yoyo` float, but gain a second layer of motion. A `mousemove` listener on the `window` maps cursor coordinates to subtle `x` and `y` translations on the shapes, creating 3D depth relative to the mouse.
- **Entrance Timeline:** Keep existing stagger, but tighten easing (e.g., `back.out(1.2)` on buttons).

### 2. Navbar (`Navbar.jsx`)
- **Entrance:** The entire nav drops down (`y: -100` -> `y: 0`) 0.5s after the Hero timeline starts.
- **Logo Scroll Sync:** When scrolling past 50px, the logo scales down (`scale: 0.9`) as the frosted glass background activates.
- **Mobile Menu:** Replace the instant render with a GSAP slide-down (`yPercent: -100` -> `0`) and fade-in, using `power2.out`. The `X` icon spins 90 degrees on open.

### 3. Gamification Loop (`GamificationLoop.jsx`)
- **Desktop Pinning:** Wrap the grid in a spacer block. Use ScrollTrigger to `pin: true` the grid when it hits `center center`. Set `end: "+=2000"` to create scroll space.
- **Scrubbed Narrative:** A timeline linked to `scrub: 1`. 
  - Step 1 is opaque. 
  - As scroll progresses, the SVG line draws (`scaleX: 0 -> 1`).
  - When the line reaches Step 2, Step 2 scales/fades in (`0.8 -> 1`, `0.3 -> 1`), while Step 1 recedes (`1 -> 0.8`, `1 -> 0.3`).
  - This repeats for all 4 steps. Icons spin/pulse as they activate.
- **Mobile Fallback:** Uses `gsap.matchMedia`. No pinning. Standard vertical stagger entrance.

### 4. Forest Showcase (`ForestShowcase.jsx`)
- **2.5D Scroll Parallax:** The browser mockup acts as a fixed window (`overflow: hidden`). Inside, 3 layers move vertically at different speeds linked to scroll (`scrub: 1`):
  - `.landing-forest-scene` background gradient (slowest).
  - Midground: `treeFull`, `treeYoung` (medium).
  - Foreground: `campfire`, `log` (fastest).
- **Ambient Loops:** 
  - `campfire`: Infinite subtle scale pulse (`1 -> 1.05`, `yoyo: true`) simulating flickering light.
  - Trees: Infinite slow sway (`rotation: -2 -> 2`, `transformOrigin: "bottom center"`, `yoyo: true`).
- **Entrance:** The browser mockup itself scales up from `0.9` as it enters the viewport.

### 5. Feature Showcase (`FeatureShowcase.jsx`)
- **3D Entrance:** Cards enter with a 3D flip: `rotationX: -45`, `y: 50`, `opacity: 0`, `transformPerspective: 1000`, staggered by `0.1s`.
- **Hover Interactivity:** Add `mousemove` listeners to each card. Calculate cursor position relative to card center and apply subtle `rotationX` and `rotationY` (max ~5-8 degrees) to create a physical "glare" or tilt effect. Remove tilt smoothly on `mouseleave`.

### 6. Tech Stack (`TechStack.jsx`)
- **Snappy Entrance:** Pills slide up with `stagger: 0.05` and `ease: "back.out(1.5)"`.
- **Icon Pop:** The Lucide icon inside each pill rotates `180deg` or scales `0.5 -> 1` precisely when its parent pill fades in.
- **Hover:** CSS transition for scale (`1.05`), but add a GSAP infinite slow rotation (`repeat: -1, ease: "linear"`) to the icon on hover.

### 7. CTA & Footer (`CTAFooter.jsx`, `Footer.jsx`)
- **CTA Background Shift:** Animate the `backgroundPosition` of the linear gradient over a large `backgroundSize` to create a slow, breathing backdrop.
- **CTA Button Pulse & Magnet:** Combine a continuous soft scale pulse (`1 -> 1.05`, `yoyo: true`) with the same magnetic `mousemove` effect used in the Hero.
- **Footer:** Add a simple, delayed fade-in (`opacity: 0 -> 1`, `y: 20 -> 0`) linked to a ScrollTrigger at the very bottom of the page.
