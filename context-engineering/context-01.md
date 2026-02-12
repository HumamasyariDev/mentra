---

## 16. APPROVED LIBRARIES & FRONTEND UTILITIES

The project may use modern and relevant frontend libraries to improve user experience, performance, and development efficiency.

However, libraries must be:
- Lightweight
- Well maintained
- Production proven
- Performance aware

Avoid unnecessary heavy dependencies.

---

### 16.1 Animation Library

#### GSAP (GreenSock Animation Platform)
GSAP is allowed and recommended for smooth, high performance animations.

GSAP should be used for:
- Micro interactions
- Page transition animations
- Dashboard element entrance animations
- Progress bar / EXP animation
- Gamification feedback animations

GSAP must NOT be used for:
- Continuous heavy background animation
- Large timeline animation on dashboard load
- Anything that affects core app performance

Animation must feel:
- Fast
- Smooth
- Professional
- Subtle (not flashy)

---

### 16.2 UI / Utility Libraries (Allowed)

AI Agent may use if needed:

- Headless UI (accessible components)
- Radix UI (optional advanced UI primitives)
- Framer Motion (ONLY if GSAP is not suitable for specific case)
- React Query / TanStack Query (for server state management)

---

### 16.3 Chart / Data Visualization

If analytics visualization is required:

Preferred:
- Recharts
- Chart.js (light usage)

Avoid:
- Heavy enterprise dashboard libraries

---

### 16.4 Form Handling

Allowed:
- React Hook Form

Avoid:
- Over complex form frameworks

---

## 17. ANIMATION DESIGN PRINCIPLES

Mentra design philosophy:

- Smooth over flashy
- Functional over decorative
- Micro feedback > macro animation

Examples of GOOD animation:
- Button press feedback
- Task completion subtle celebration
- EXP gain micro animation
- Card hover elevation
- Smooth modal open/close

Examples of BAD animation:
- Constant floating elements
- Heavy gradient animated backgrounds
- Long intro animations
- Animation blocking user interaction

---

## 18. PERFORMANCE SAFE RULES

Animations must:
- Never block user input
- Never delay page usability
- Respect reduced motion preferences
- Be disabled or reduced on low performance devices if needed

Lazy load animation libraries when possible.

---

## 19. DEVELOPMENT RULE FOR AI AGENT (LIBRARY USAGE)

AI Agent MUST:
- Prefer built-in React + Tailwind first
- Only add library if clear benefit exists
- Avoid duplicate libraries with same function
- Avoid installing animation libraries without real UI need

---

END OF ADDITION
