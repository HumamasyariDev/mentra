# Auth Page Redesign — Combined Login/Register with GSAP Sliding Panels

**Date:** 2026-03-22
**Approach:** Single Route + Internal State (Approach A)

## Summary

Combine the separate `/login` and `/register` pages into a single dual-panel auth page with a sliding decorative panel animated by GSAP. The design matches the existing dark glassmorphism "Glass & Flow" aesthetic used throughout the landing page and dashboard.

## Layout

A centered glassmorphism card contains a 3-panel track: `[Register Form | Decorative Panel | Login Form]`. The visible viewport shows two panels at a time. The decorative panel always sits beside the active form.

**Login state (default):** viewport shows `[Decorative Panel | Login Form]`
**Register state:** viewport shows `[Register Form | Decorative Panel]`

The decorative panel contains the Mentra logo, tagline ("Gamified Productivity"), a galaxy particle canvas (adapted from the landing page), and the toggle CTA ("Don't have an account? Sign Up" / "Already have an account? Sign In").

### Desktop (>768px)
- Side-by-side horizontal layout
- Card ~800-900px wide, ~500px tall, centered
- Each panel is 50% of the visible card width
- Horizontal slide (translateX) on switch

### Mobile (<768px)
- Vertical stacked layout
- Decorative panel becomes a compact top/bottom banner (~30% height)
- Track stacks vertically: `[Register Form | Decorative Banner | Login Form]`
- Vertical slide (translateY) on switch
- Card takes ~95% viewport width, auto height
- Mouse-tracking tilt, spotlight glow, border glow, magnetic hover all disabled

## Animation System

### Initial Page Load (~1s)
- Card fades in with scale-up (0.95 to 1) and blur-to-sharp (8px to 0), `power4.out`
- Galaxy particles begin spawning with staggered opacity
- Active form fields do staggered fade-up entrance: rotateX -20 to 0, y: 30 to 0, blur: 4px to 0, stagger: 0.06s

### Panel Switch Timeline (~0.8s)
1. **Exit phase (0-0.3s):** Active form fields stagger-fade-out in reverse order (opacity to 0, y: -15, blur: 3px)
2. **Slide phase (0.15-0.7s):** Inner track translates horizontally. Card gets subtle rotateY push (~5-8deg) peaking at midpoint, settling back to 0. Easing: `power3.inOut`
3. **Enter phase (0.5-0.8s):** New form fields do staggered fade-up entrance. CTA text on decorative panel cross-fades

### Always-on Ambient Effects
- `gsap.quickTo` mouse-tracking tilt on card (rotationX/Y, ~5deg range, 2s duration, `power3.out`)
- CSS `--mouse-x`/`--mouse-y` spotlight glow on `::before`
- Glowing border using mask-composite XOR trick (from bento cards)
- Galaxy particle canvas on decorative panel
- Submit button uses `useMagneticHover` (elastic snap)
- Subtle idle pulse on submit button (scale: 1.03, yoyo, `sine.inOut`)

### Rapid Toggle
GSAP timeline `.reverse()` handles mid-flight reversal natively — no janky jumps.

### Reduced Motion
All GSAP animations gated behind `useReducedMotion()`. Fallback: instant opacity cross-fade, no slide, no tilt, no particles.

## Component Architecture

### File Changes
- **New:** `src/pages/AuthPage.jsx` — single combined component
- **New:** `src/styles/pages/AuthPage.css` — dark glassmorphism styles using theme CSS variables
- **Delete:** `src/pages/Login.jsx`
- **Delete:** `src/pages/Register.jsx`
- **Modify:** `src/layouts/AuthLayout.jsx` — restyle to dark background, remove white card wrapper
- **Modify:** `src/styles/layouts/AuthLayout.css` — dark theme styles
- **Modify:** `src/App.jsx` — both `/login` and `/register` routes render `<AuthPage />`
- **Delete (optional):** `src/styles/pages/Auth.css` — replaced by `AuthPage.css`

### Component Structure
```
AuthPage
├── mode state: "login" | "register" (derived from URL on mount)
├── containerRef (GSAP scope)
├── trackRef (the sliding 3-panel track)
├── useGSAP() — entrance timeline, ambient effects
├── switchMode() — triggers GSAP slide timeline, calls navigate()
│
├── <div class="auth-track">
│   ├── RegisterForm (left panel)
│   ├── DecorativePanel (center — logo, tagline, particles, CTA)
│   └── LoginForm (right panel)
│
└── Both forms use existing useAuth() context
```

### Routing
- `App.jsx`: both `/login` and `/register` render `<AuthPage />` inside `AuthLayout`
- On mount, `AuthPage` reads `location.pathname` to set initial mode
- On switch, `navigate('/login' | '/register', { replace: true })` keeps URL in sync without triggering TransitionWrapper
- Browser back button goes to previous page (landing), not toggle between modes

### Form State
- Each form manages its own `useState` for fields, errors, loading
- State persists across switches (no unmount)
- Both forms stay mounted at all times

## Auth Logic — Zero Changes

The following are completely untouched:
- `AuthContext` — `login()` and `register()` methods, token storage, user state
- Axios interceptors — Bearer token, 401 redirect
- Backend API — no endpoint changes
- Form submission — same `handleSubmit`, same error handling
- Redirect after success — `AuthLayout` redirects authenticated users to `/dashboard`
- Loading state — Loader2 spinner, disabled button during requests
- Server errors — general banner + per-field errors for register

## Error Handling & Edge Cases

- **Rapid toggle:** GSAP `.reverse()` handles mid-flight reversal
- **Submit during slide:** Hidden form has `pointer-events: none` and `aria-hidden="true"`
- **Submit during loading:** Same `disabled={loading}` pattern
- **Direct URL access:** `/login` opens login mode, `/register` opens register mode
- **Form errors persist** across switches (independent state per form, stays mounted)
- **Errors clear** within their own form on new submission attempt

## Accessibility

- Hidden form gets `aria-hidden="true"`, inputs get `tabIndex="-1"`
- On switch, focus moves to first input of revealed form
- Reduced motion: all GSAP gated, instant cross-fade fallback
- Clear accessible labels on toggle CTA buttons
- Keyboard navigation only reaches visible form

## Styling

- Full dark glassmorphism: `backdrop-filter: blur()`, semi-transparent bg
- Uses theme CSS variables (`--bg-base`, `--bg-surface`, `--accent`, etc.) instead of hardcoded light-mode colors
- Consistent with landing page "Glass & Flow" aesthetic
- `perspective: 1500px`, `transform-style: preserve-3d` on card container
- Responsive via `gsap.matchMedia` at 768px breakpoint
