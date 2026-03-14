# Mentra Landing Page Redesign

**Date:** 2026-03-14
**Status:** Approved

## Context

The current landing page is a JS Mastery GSAP course template with no connection to Mentra. It needs a complete replacement with content that communicates what Mentra actually is: a gamified productivity app.

## Decisions

- **Audience:** Competition judges (not end-user conversion)
- **Approach:** Narrative scroll journey through the gamification loop
- **Animations:** GSAP with ScrollTrigger (already installed)
- **Color scheme:** Match the app's slate-indigo palette (`#6366f1` primary, `#f8fafc` bg)
- **CSS:** Native CSS files (consistent with app's refactoring away from Tailwind)
- **Hero visual:** Abstract/geometric illustration with indigo gradients

## Page Structure

### 1. Navbar
Fixed top bar, transparent over hero, gains white bg + shadow on scroll (GSAP ScrollTrigger).

- Left: "Mentra" logo text in indigo
- Center: Anchor links (Features, How It Works, AI, Forest World)
- Right: "Login" text link + "Get Started" filled indigo button (-> `/register`)
- Mobile: Hamburger menu with slide-down overlay

### 2. Hero
Full viewport height. Two columns on desktop (text left, visual right), stacked on mobile.

**Left column:**
- Tagline: "Productivity that grows with you"
- Subtitle: "Complete tasks. Earn XP. Level up. Watch your forest come alive."
- CTAs: "Get Started" (filled indigo) + "See How It Works" (outlined, scrolls to section 3)
- Trust badge: "Built with React, Laravel & AI"

**Right column:**
- Abstract/geometric illustration with indigo gradients
- Subtle floating animation (gentle bob via GSAP)

**GSAP:** Staggered entrance -- text slides from left, visual fades from right, CTAs pop last.

### 3. Gamification Loop
The narrative core. Explains Mentra's core mechanic as a visual cycle.

- Heading: "How Mentra Works"
- 4 steps in a horizontal progression (vertical timeline on mobile):
  1. **Complete Tasks** -- CheckSquare icon. "Manage your daily tasks with list, calendar, or board views"
  2. **Earn XP** -- Sparkle icon. "Every completed task earns experience points"
  3. **Level Up** -- Trophy icon. "Hit milestones, maintain streaks, climb levels"
  4. **Grow Your Forest** -- Tree icon. "Watch your virtual world come alive as you stay productive"
- Steps connected by animated SVG lines that draw on scroll

**GSAP:** Sequential reveal (fade + slide up per step), SVG path draw animation for connecting lines.

### 4. Feature Showcase
Scannable grid of Mentra's capabilities.

- Heading: "Everything you need to stay productive"
- 2x3 grid (3x2 on tablet, stacked on mobile)

| Feature | Icon | Description |
|---------|------|-------------|
| Task Management | CheckSquare | List, calendar, and kanban views. Complete tasks to earn XP. |
| Pomodoro Timer | Timer | Focus sessions with themes and a virtual cat companion. |
| Schedules | Calendar | Daily, weekly, and monthly routines that build habits. |
| Mood Tracking | Smile | Log mood and energy levels. See weekly patterns. |
| AI Chat | Bot | Productivity assistant powered by AI. Get tips and motivation. |
| AI Agent | BrainCircuit | Create tasks through conversation. Your intelligent productivity partner. |

Card design: White bg, rounded-xl, border `#e2e8f0`, icon in soft indigo circle, title slate-800, description slate-500. Matches existing `.card` class.

**GSAP:** Stagger reveal, 0.1s delay between cards.

### 5. Forest World Showcase
Full-width visual section. The "wow moment."

- Background: Soft indigo gradient (`#eef2ff` -> `#e0e7ff`) for contrast
- Heading: "Your productivity, visualized"
- Content: Large centered browser-frame mockup showing the forest world, using actual game assets (`campfire.png`, `tree-young.png`, `tree-full.png` from `/assets/gameworld/`)
- Supporting text: "As you complete tasks, your forest grows. Trees sprout from seeds, the campfire burns brighter, and your world expands."

**GSAP:** Parallax on mockup frame, subtle tree scale animation on enter.

### 6. Tech Stack
Brief credibility section for judges.

- Heading: "Built with modern tools"
- Horizontal row of tech items as subtle pills/small cards:
  - React 19, Laravel 12, Puter.js AI, GSAP, Supabase, TanStack Query
- Muted colors (slate-400 icons, slate-500 text)
- Optional one-liner: "Full-stack productivity platform with AI-powered features and real-time gamification."

**GSAP:** Simple fade-in on scroll.

### 7. CTA Footer
Closing push on indigo gradient background (`#6366f1` -> `#4f46e5`), white text.

- Heading: "Ready to grow?"
- Subtitle: "Start building productive habits today."
- CTA: "Get Started -- It's Free" (white button, indigo text, large) -> `/register`
- Below: "Already have an account? Log in" text link

**GSAP:** Gentle fade-in.

### 8. Footer
Minimal bar.

- Background: Dark slate (`#1e293b`)
- Left: "Mentra 2026" copyright
- Right: "Built for [Competition Name]" or GitHub link

## Technical Implementation

### File Structure
```
frontend/src/
  pages/LandingPage.jsx           -- Page component (replaces current)
  styles/pages/LandingPage.css    -- All landing page styles
  components/landing/
    Navbar.jsx                     -- Fixed navbar
    Hero.jsx                       -- Hero section
    GamificationLoop.jsx           -- 4-step cycle visualization
    FeatureShowcase.jsx            -- 6 feature cards grid
    ForestShowcase.jsx             -- Forest world visual section
    TechStack.jsx                  -- Built-with section
    CTAFooter.jsx                  -- Closing CTA
    Footer.jsx                     -- Minimal footer bar
```

### CSS Strategy
- Single `LandingPage.css` file in `frontend/src/styles/pages/`
- Reuses CSS variables from `index.css` (`--color-primary`, `--color-text`, etc.)
- Reuses existing utility classes (`.btn-primary`, `.card`) where applicable
- No Tailwind inline classes

### Animation Strategy
- GSAP + ScrollTrigger for all scroll-based animations
- `@gsap/react` for React integration (useGSAP hook)
- Animations are enhancement only -- page is fully readable without JS
- All animations respect `prefers-reduced-motion`

### Dependencies
No new dependencies. Uses existing: GSAP, @gsap/react, Lucide React, React Router DOM.

### Cleanup
Remove all 19 existing template components from `frontend/src/components/landing/`. They are JS Mastery course content and will be fully replaced.
