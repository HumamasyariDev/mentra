# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder JS Mastery landing page with a Mentra-branded narrative scroll page that showcases the gamified productivity app for competition judges.

**Architecture:** 8 section components composed in a single `LandingPage.jsx`, styled via one shared `LandingPage.css` file using namespaced plain CSS classes (matching the app's Dashboard/Tasks CSS pattern). GSAP + ScrollTrigger handles all animations. No new dependencies.

**Tech Stack:** React 19, GSAP 3.14 + @gsap/react, Lucide React icons, React Router DOM, native CSS.

**Design doc:** `.opencode/plans/2026-03-14-landing-page-design.md`

---

### Task 1: Create the CSS foundation

**Files:**
- Create: `frontend/src/styles/pages/LandingPage.css`

All classes prefixed with `landing-` to namespace them, matching codebase pattern (`dashboard-*`, `sidebar-*`).

### Task 2: Create Footer component

**Files:**
- Create: `frontend/src/components/landing/Footer.jsx`

Simplest component. No GSAP, no state.

### Task 3: Create CTAFooter component

**Files:**
- Create: `frontend/src/components/landing/CTAFooter.jsx`

GSAP fade-in on scroll. Links to /register and /login.

### Task 4: Create TechStack component

**Files:**
- Create: `frontend/src/components/landing/TechStack.jsx`

6 tech pills with Lucide icons, GSAP stagger fade-in.

### Task 5: Create FeatureShowcase component

**Files:**
- Create: `frontend/src/components/landing/FeatureShowcase.jsx`

6 feature cards in responsive grid, GSAP stagger reveal.

### Task 6: Create ForestShowcase component

**Files:**
- Create: `frontend/src/components/landing/ForestShowcase.jsx`

Browser mockup with game assets from `/assets/gameworld/`. GSAP parallax + scale.

### Task 7: Create GamificationLoop component

**Files:**
- Create: `frontend/src/components/landing/GamificationLoop.jsx`

4-step horizontal/vertical progression with connectors. GSAP sequential reveal.

### Task 8: Create Hero component

**Files:**
- Overwrite: `frontend/src/components/landing/Hero.jsx`

Two-column layout with abstract shapes. GSAP timeline entrance + floating animation.

### Task 9: Create Navbar component

**Files:**
- Create: `frontend/src/components/landing/Navbar.jsx`

Fixed nav with scroll class toggle, mobile hamburger, anchor links.

### Task 10: Rewrite LandingPage.jsx

**Files:**
- Overwrite: `frontend/src/pages/LandingPage.jsx`

Wire up all 8 new components, import CSS.

### Task 11: Delete old template components

Delete 18 old JS Mastery template files from `frontend/src/components/landing/`.

### Task 12: Visual verification and polish

Open dev server, verify each section, fix spacing/color issues.
