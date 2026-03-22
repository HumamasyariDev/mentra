# Auth Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Combine Login and Register into a single dual-panel auth page with GSAP sliding panel animation and dark glassmorphism styling.

**Architecture:** Single `AuthPage` component with internal `mode` state replaces both `Login.jsx` and `Register.jsx`. A 3-panel track (`[Register | Decorative | Login]`) shifts horizontally to reveal the active form. The decorative panel contains logo, tagline, galaxy particles, and toggle CTA.

**Tech Stack:** React 19, react-router-dom v7, GSAP 3.14 + @gsap/react, Canvas2D (galaxy particles), CSS custom properties (theme.css)

**Design doc:** `docs/plans/2026-03-22-auth-page-redesign-design.md`

---

### Task 1: Update Routing — App.jsx and AuthLayout

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/layouts/AuthLayout.jsx`
- Modify: `frontend/src/styles/layouts/AuthLayout.css`

**Step 1: Update App.jsx imports and routes**

Replace the Login/Register imports and routes so both `/login` and `/register` render `AuthPage`:

```jsx
// In App.jsx — replace these imports:
// import Login from "./pages/Login";
// import Register from "./pages/Register";
import AuthPage from "./pages/AuthPage";

// In the Routes, replace:
// <Route element={<AuthLayout />}>
//   <Route path="/login" element={<Login />} />
//   <Route path="/register" element={<Register />} />
// </Route>

// With:
<Route element={<AuthLayout />}>
  <Route path="/login" element={<AuthPage />} />
  <Route path="/register" element={<AuthPage />} />
</Route>
```

**Step 2: Simplify AuthLayout**

The layout becomes a minimal dark full-viewport wrapper. Remove the logo/tagline header and white card — those now live inside `AuthPage`. The layout only handles auth redirect logic and the loading state.

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/layouts/AuthLayout.css';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-layout-loading">
        <Loader2 className="auth-layout-loading-spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout-container">
      <Outlet />
    </div>
  );
}
```

**Step 3: Restyle AuthLayout.css for dark mode**

```css
/* AuthLayout Styles — Dark mode wrapper */

.auth-layout-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-base, #0f1117);
}

.auth-layout-loading-spinner {
  width: 2rem;
  height: 2rem;
  animation: auth-spin 1s linear infinite;
  color: var(--accent, #6366f1);
}

@keyframes auth-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-layout-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-base, #0f1117);
  padding: 1rem;
  overflow: hidden;
}
```

**Step 4: Verify the app still builds**

Run: `cd frontend && npm run build`
Expected: Build succeeds (will fail until AuthPage exists — that's Task 2)

**Step 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/layouts/AuthLayout.jsx frontend/src/styles/layouts/AuthLayout.css
git commit -m "refactor: update auth routing and layout for combined auth page"
```

---

### Task 2: Create AuthPage Component — Structure and Forms (No Animation)

**Files:**
- Create: `frontend/src/pages/AuthPage.jsx`
- Create: `frontend/src/styles/pages/AuthPage.css`

**Step 1: Create AuthPage.jsx with the 3-panel track layout**

This is the core component. Both forms are always mounted. The track shifts to show either `[Decorative | Login]` or `[Register | Decorative]`.

```jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/pages/AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Derive initial mode from URL
  const [mode, setMode] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // Refs
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // --- LOGIN FORM STATE ---
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginForm);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // --- REGISTER FORM STATE ---
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterErrors({});
    setRegisterLoading(true);
    try {
      await register(registerForm);
    } catch (err) {
      if (err.response?.data?.errors) {
        setRegisterErrors(err.response.data.errors);
      }
      setRegisterError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- MODE SWITCHING ---
  const switchMode = useCallback((newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
  }, [mode, navigate]);

  const isLogin = mode === 'login';

  return (
    <div className="auth-container" ref={containerRef}>
      <div className="auth-card">
        <div className="auth-viewport">
          <div
            ref={trackRef}
            className={`auth-track ${isLogin ? 'auth-track--login' : 'auth-track--register'}`}
          >
            {/* LEFT PANEL: Register Form */}
            <div
              className="auth-panel auth-panel--form"
              aria-hidden={isLogin}
            >
              <form onSubmit={handleRegister} className="auth-form">
                <h2 className="auth-title">Create Account</h2>

                {registerError && (
                  <div className="auth-error">{registerError}</div>
                )}

                <div className="auth-field-group">
                  <label className="auth-label">Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                    tabIndex={isLogin ? -1 : 0}
                  />
                  {registerErrors.name && (
                    <p className="auth-field-error">{registerErrors.name[0]}</p>
                  )}
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    tabIndex={isLogin ? -1 : 0}
                  />
                  {registerErrors.email && (
                    <p className="auth-field-error">{registerErrors.email[0]}</p>
                  )}
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    tabIndex={isLogin ? -1 : 0}
                  />
                  {registerErrors.password && (
                    <p className="auth-field-error">{registerErrors.password[0]}</p>
                  )}
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Confirm Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={registerForm.password_confirmation}
                    onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                    required
                    tabIndex={isLogin ? -1 : 0}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={registerLoading} tabIndex={isLogin ? -1 : 0}>
                  {registerLoading && <Loader2 className="auth-loading-spinner" />}
                  Create Account
                </button>
              </form>
            </div>

            {/* CENTER PANEL: Decorative */}
            <div className="auth-panel auth-panel--decorative">
              <div className="auth-deco-content">
                <h1 className="auth-deco-logo">Mentra</h1>
                <p className="auth-deco-tagline">Gamified Productivity</p>
                <div className="auth-deco-divider"></div>
                {isLogin ? (
                  <div className="auth-deco-cta">
                    <p className="auth-deco-cta-text">Don't have an account?</p>
                    <button
                      className="auth-deco-cta-btn"
                      onClick={() => switchMode('register')}
                      type="button"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="auth-deco-cta">
                    <p className="auth-deco-cta-text">Already have an account?</p>
                    <button
                      className="auth-deco-cta-btn"
                      onClick={() => switchMode('login')}
                      type="button"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
              {/* Galaxy particle canvas goes here (Task 4) */}
              <canvas className="auth-deco-canvas" />
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div
              className="auth-panel auth-panel--form"
              aria-hidden={!isLogin}
            >
              <form onSubmit={handleLogin} className="auth-form">
                <h2 className="auth-title">Welcome Back</h2>

                {loginError && (
                  <div className="auth-error">{loginError}</div>
                )}

                <div className="auth-field-group">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    tabIndex={!isLogin ? -1 : 0}
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    tabIndex={!isLogin ? -1 : 0}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loginLoading} tabIndex={!isLogin ? -1 : 0}>
                  {loginLoading && <Loader2 className="auth-loading-spinner" />}
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create AuthPage.css — base layout and glassmorphism styling**

```css
/* ============================================
   AUTH PAGE — Combined Login/Register
   Dark glassmorphism, 3-panel sliding track
   ============================================ */

/* --- Container --- */
.auth-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1500px;
}

/* --- Card (visible viewport) --- */
.auth-card {
  width: 100%;
  max-width: 900px;
  height: 560px;
  position: relative;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
}

/* Mouse-tracking spotlight glow */
.auth-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(129, 140, 248, 0.12),
    transparent 40%
  );
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.auth-card:hover::before {
  opacity: 1;
}

/* Mouse-tracking border glow */
.auth-card::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(129, 140, 248, 0.6),
    transparent 45%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.auth-card:hover::after {
  opacity: 1;
}

/* --- Viewport (clips the track) --- */
.auth-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* --- Track (3 panels side by side, slides left/right) --- */
.auth-track {
  display: flex;
  width: 300%; /* 3 panels */
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}

/* Login mode: show panels 2+3 (decorative + login) = shift left by 0 panel-widths from center */
/* Each panel = 33.333% of track = 100% of viewport */
/* To show [Deco|Login] we need track offset so panel index 1,2 are visible */
/* Panel 0=Register, Panel 1=Deco, Panel 2=Login */
/* Viewport shows 2 panels = 66.666% of track width */
/* To show panels 1+2: offset = -(1/3) * 100% = -33.333% */
.auth-track--login {
  transform: translateX(-33.333%);
}

/* Register mode: show panels 0+1 (register + decorative) */
/* To show panels 0+1: offset = 0 */
.auth-track--register {
  transform: translateX(0%);
}

/* --- Panel (each is 1/3 of track = 50% of viewport) --- */
.auth-panel {
  width: 33.333%;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Form panels */
.auth-panel--form {
  padding: 2.5rem;
}

.auth-panel--form[aria-hidden="true"] {
  pointer-events: none;
}

/* --- Decorative Panel --- */
.auth-panel--decorative {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.15) 0%,
    rgba(139, 92, 246, 0.08) 50%,
    rgba(99, 102, 241, 0.12) 100%
  );
  position: relative;
  overflow: hidden;
}

.auth-deco-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.auth-deco-content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.auth-deco-logo {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.04em;
}

.auth-deco-tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.auth-deco-divider {
  width: 3rem;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 1.5rem 0;
}

.auth-deco-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.auth-deco-cta-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.auth-deco-cta-btn {
  padding: 0.75rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  background: transparent;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  will-change: transform;
}

.auth-deco-cta-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* --- Form Styles (dark theme) --- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #f0f0f5);
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-error {
  background-color: var(--danger-bg, rgba(239, 68, 68, 0.12));
  color: var(--danger, #ef4444);
  font-size: 0.8rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--danger-border, rgba(239, 68, 68, 0.25));
}

.auth-field-group {
  display: flex;
  flex-direction: column;
}

.auth-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary, #a0a4b8);
  margin-bottom: 0.4rem;
}

.auth-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background-color: var(--input-bg, #141720);
  border: 1px solid var(--input-border, rgba(255, 255, 255, 0.1));
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--input-text, #f0f0f5);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.auth-input:focus {
  border-color: var(--input-focus-border, #6366f1);
  box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(99, 102, 241, 0.2));
}

.auth-field-error {
  color: var(--danger, #ef4444);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.auth-submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  background: linear-gradient(135deg, var(--accent, #6366f1), var(--accent-dark, #4f46e5));
  color: var(--text-on-accent, #ffffff);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  will-change: transform;
}

.auth-submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.auth-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-loading-spinner {
  width: 1rem;
  height: 1rem;
  animation: auth-spin 1s linear infinite;
}

@keyframes auth-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- Mobile responsive --- */
@media (max-width: 768px) {
  .auth-card {
    max-width: 95vw;
    height: auto;
    min-height: 600px;
  }

  .auth-track {
    flex-direction: column;
    width: 100%;
    height: 300%; /* 3 panels stacked */
  }

  .auth-panel {
    width: 100%;
    height: 33.333%;
    min-height: 350px;
  }

  .auth-panel--decorative {
    min-height: 180px;
  }

  .auth-track--login {
    transform: translateY(-33.333%);
  }

  .auth-track--register {
    transform: translateY(0%);
  }
}
```

**Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: Build succeeds. Both `/login` and `/register` render the new `AuthPage`.

**Step 4: Manual test**

- Visit `/login` — should see decorative panel on left, login form on right
- Visit `/register` — should see register form on left, decorative panel on right
- Click "Sign Up" CTA — track slides, URL changes to `/register`
- Click "Sign In" CTA — track slides back, URL changes to `/login`
- Submit login form — should work (email + password → auth context)
- Submit register form — should work (name, email, password, confirm → auth context)
- Submit with bad credentials — error banner shows
- Submit register with mismatched passwords — per-field errors show

**Step 5: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx frontend/src/styles/pages/AuthPage.css
git commit -m "feat: create combined AuthPage with dual-panel sliding layout"
```

---

### Task 3: Delete Old Files and Clean Up

**Files:**
- Delete: `frontend/src/pages/Login.jsx`
- Delete: `frontend/src/pages/Register.jsx`
- Delete: `frontend/src/styles/pages/Auth.css`

**Step 1: Delete old login/register pages and their CSS**

```bash
rm frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/styles/pages/Auth.css
```

**Step 2: Remove unused imports from App.jsx**

The old `Login` and `Register` imports were already removed in Task 1. Verify no other file imports from `Login.jsx`, `Register.jsx`, or `Auth.css`.

Run: `grep -r "from.*Login\|from.*Register\|Auth.css" frontend/src/ --include="*.jsx" --include="*.js"`
Expected: Only `AuthPage.jsx` references remain (it doesn't import those files).

**Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: Clean build, no missing module errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old Login, Register pages and Auth.css"
```

---

### Task 4: Add Galaxy Particle Canvas to Decorative Panel

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`

**Step 1: Add a lightweight particle system to the decorative panel**

Add a `useEffect` that initializes a canvas-based particle field inside the decorative panel. This is a simplified version of the dashboard's `GalaxyCanvas` — no pan/zoom, no mouse interaction beyond a soft glow. Just twinkling stars with depth-based sizing.

Add this inside `AuthPage` component, after the refs:

```jsx
// Galaxy particle canvas for decorative panel
const canvasRef = useRef(null);
const particlesRef = useRef([]);
const animFrameRef = useRef(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  resize();

  // Init particles
  const colors = ['#ffffff', '#e0f2fe', '#c084fc', '#818cf8', '#fdf4ff'];
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;
  const count = Math.floor((w * h) / 8000);

  particlesRef.current = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    radius: Math.random() * 1.5 + 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.6 + 0.1,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    pulsePhase: Math.random() * Math.PI * 2,
  }));

  const draw = () => {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulsePhase += p.pulseSpeed;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const twinkle = Math.sin(p.pulsePhase) * 0.25;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha + twinkle));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    animFrameRef.current = requestAnimationFrame(draw);
  };

  draw();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);

  return () => {
    cancelAnimationFrame(animFrameRef.current);
    resizeObserver.disconnect();
  };
}, []);
```

Update the canvas element to use the ref:

```jsx
<canvas ref={canvasRef} className="auth-deco-canvas" />
```

**Step 2: Verify visually**

Run: `cd frontend && npm run dev`
Navigate to `/login` — the decorative panel should show twinkling stars on a transparent background with the gradient showing through.

**Step 3: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx
git commit -m "feat: add galaxy particle canvas to auth decorative panel"
```

---

### Task 5: Add GSAP Entrance Animation

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`

**Step 1: Add GSAP imports and entrance timeline**

Add imports at top of `AuthPage.jsx`:

```jsx
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMagneticHover } from '../hooks/useMagneticHover';
```

Add refs for the form panels:

```jsx
const loginPanelRef = useRef(null);
const registerPanelRef = useRef(null);
const decoPanelRef = useRef(null);
```

Add the entrance animation with `useGSAP`:

```jsx
const prefersReducedMotion = useReducedMotion();
const submitBtnRef = useMagneticHover(0.3);

useGSAP(() => {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Card entrance: scale + blur
  tl.fromTo(containerRef.current.querySelector('.auth-card'),
    { scale: 0.95, opacity: 0, filter: 'blur(8px)' },
    { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1 }
  );

  // Active form fields staggered entrance
  const activePanel = isLogin ? loginPanelRef.current : registerPanelRef.current;
  if (activePanel) {
    const fields = activePanel.querySelectorAll('.auth-field-group, .auth-title, .auth-submit-btn');
    tl.fromTo(fields,
      { y: 30, opacity: 0, rotateX: -20, filter: 'blur(4px)' },
      { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.06 },
      '-=0.5'
    );
  }

  // Decorative panel content
  tl.fromTo(decoPanelRef.current?.querySelectorAll('.auth-deco-logo, .auth-deco-tagline, .auth-deco-divider, .auth-deco-cta'),
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
    '-=0.6'
  );
}, { scope: containerRef, dependencies: [prefersReducedMotion] });
```

Attach refs to the panels in JSX:

```jsx
{/* LEFT PANEL: Register Form */}
<div ref={registerPanelRef} className="auth-panel auth-panel--form" aria-hidden={isLogin}>

{/* CENTER PANEL: Decorative */}
<div ref={decoPanelRef} className="auth-panel auth-panel--decorative">

{/* RIGHT PANEL: Login Form */}
<div ref={loginPanelRef} className="auth-panel auth-panel--form" aria-hidden={!isLogin}>
```

Also add `perspective: 800px` to `.auth-panel--form` in the CSS so `rotateX` has depth.

**Step 2: Verify visually**

Run dev server, visit `/login`. Card should fade in with scale + blur, then form fields stagger in.

**Step 3: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx frontend/src/styles/pages/AuthPage.css
git commit -m "feat: add GSAP entrance animations to auth page"
```

---

### Task 6: Add GSAP Panel Switch Animation

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`
- Modify: `frontend/src/styles/pages/AuthPage.css`

**Step 1: Replace CSS transition with GSAP timeline for the slide**

Remove the CSS `transition` from `.auth-track` and the `.auth-track--login` / `.auth-track--register` transform rules. The slide will now be driven entirely by GSAP.

In CSS, change:

```css
.auth-track {
  display: flex;
  width: 300%;
  height: 100%;
  /* Remove: transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1); */
}

/* Remove these — GSAP handles position now:
.auth-track--login { transform: translateX(-33.333%); }
.auth-track--register { transform: translateX(0%); }
*/
```

In the component, set initial track position with `useGSAP` (add to the entrance timeline):

```jsx
// Set initial track position
const initialX = isLogin ? '-33.333%' : '0%';
gsap.set(trackRef.current, { xPercent: isLogin ? -33.333 : 0 });
```

Update `switchMode` to use a GSAP timeline:

```jsx
const switchTimelineRef = useRef(null);

const switchMode = useCallback((newMode) => {
  if (newMode === mode) return;

  // Kill any in-flight switch animation
  if (switchTimelineRef.current) {
    switchTimelineRef.current.kill();
  }

  const oldPanel = mode === 'login' ? loginPanelRef.current : registerPanelRef.current;
  const newPanel = newMode === 'login' ? loginPanelRef.current : registerPanelRef.current;
  const targetX = newMode === 'login' ? -33.333 : 0;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      // Focus first input of new panel
      const firstInput = newPanel?.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  });
  switchTimelineRef.current = tl;

  if (prefersReducedMotion) {
    // Reduced motion: instant swap
    gsap.set(trackRef.current, { xPercent: targetX });
    setMode(newMode);
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
    return;
  }

  // Phase 1: Fade out current form fields
  const oldFields = oldPanel?.querySelectorAll('.auth-field-group, .auth-title, .auth-submit-btn, .auth-error');
  if (oldFields?.length) {
    tl.to(oldFields, {
      y: -15,
      opacity: 0,
      filter: 'blur(3px)',
      duration: 0.25,
      stagger: { amount: 0.15, from: 'end' },
      ease: 'power2.in'
    });
  }

  // Phase 2: Slide track + 3D perspective tilt
  tl.to(trackRef.current, {
    xPercent: targetX,
    duration: 0.55,
    ease: 'power3.inOut'
  }, '-=0.1');

  // 3D tilt: push rotateY during slide, settle back
  const card = containerRef.current?.querySelector('.auth-card');
  const tiltDir = newMode === 'register' ? 1 : -1;
  tl.to(card, {
    rotateY: 6 * tiltDir,
    duration: 0.275,
    ease: 'power2.in'
  }, '<');
  tl.to(card, {
    rotateY: 0,
    duration: 0.275,
    ease: 'power2.out'
  });

  // Phase 3: Fade in new form fields
  const newFields = newPanel?.querySelectorAll('.auth-field-group, .auth-title, .auth-submit-btn');
  if (newFields?.length) {
    // Reset new fields first
    gsap.set(newFields, { y: 30, opacity: 0, rotateX: -20, filter: 'blur(4px)' });
    tl.to(newFields, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 0.4,
      stagger: 0.05,
      ease: 'power3.out'
    }, '-=0.15');
  }

  // Update state and URL
  setMode(newMode);
  navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
}, [mode, navigate, prefersReducedMotion]);
```

**Step 2: Add perspective to form panels in CSS**

```css
.auth-panel--form {
  perspective: 800px;
}
```

**Step 3: Verify**

- Click toggle CTA — track slides smoothly with 3D tilt
- Form fields fade out, slide happens, new fields stagger in
- Rapid clicking should not cause glitches (timeline gets killed and restarted)
- Reduced motion users see instant swap

**Step 4: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx frontend/src/styles/pages/AuthPage.css
git commit -m "feat: add GSAP panel switch animation with 3D tilt"
```

---

### Task 7: Add Mouse-Tracking 3D Tilt and Spotlight

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`

**Step 1: Add mouse tracking for card tilt and spotlight glow**

Add this `useEffect` inside `AuthPage`:

```jsx
// Mouse tracking for 3D tilt + spotlight glow
useEffect(() => {
  if (prefersReducedMotion) return;

  const card = containerRef.current?.querySelector('.auth-card');
  if (!card) return;

  // Check if we're on a touch device / small screen
  const mq = window.matchMedia('(max-width: 768px)');
  if (mq.matches) return;

  const xRotTo = gsap.quickTo(card, 'rotationY', { duration: 2, ease: 'power3.out' });
  const yRotTo = gsap.quickTo(card, 'rotationX', { duration: 2, ease: 'power3.out' });

  const handleMouseMove = (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // 3D tilt: map 0-1 to -5..+5 degrees
    xRotTo((relX - 0.5) * 10);
    yRotTo((relY - 0.5) * -10);

    // CSS spotlight variables
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    xRotTo(0);
    yRotTo(0);
  };

  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
  };
}, [prefersReducedMotion]);
```

**Step 2: Add submit button pulse animation**

Inside the `useGSAP` entrance block, after other animations:

```jsx
// Ambient: submit button pulse
gsap.to('.auth-submit-btn', {
  scale: 1.03,
  duration: 1.5,
  yoyo: true,
  repeat: -1,
  ease: 'sine.inOut',
  delay: 2 // Wait for entrance to finish
});
```

**Step 3: Apply `useMagneticHover` ref to submit buttons**

The `useMagneticHover` hook returns a single ref. Since we have two submit buttons, we need to apply it manually. The simplest approach: use the hook on the decorative panel's CTA button instead (it's more prominent), and keep the submit buttons with just the pulse animation.

Apply `submitBtnRef` to the deco CTA button:

```jsx
<button ref={submitBtnRef} className="auth-deco-cta-btn" onClick={() => switchMode('register')} type="button">
```

Note: Since the CTA text changes between modes, we need to handle this. Use a single button with dynamic text:

```jsx
<button
  ref={submitBtnRef}
  className="auth-deco-cta-btn"
  onClick={() => switchMode(isLogin ? 'register' : 'login')}
  type="button"
>
  {isLogin ? 'Sign Up' : 'Sign In'}
</button>
```

**Step 4: Verify**

- Move mouse over card — subtle 3D tilt follows cursor
- Spotlight glow follows cursor position
- Border glows near cursor
- CTA button has magnetic hover feel
- Submit buttons pulse gently
- All disabled on mobile / reduced motion

**Step 5: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx
git commit -m "feat: add mouse-tracking tilt, spotlight glow, and magnetic hover"
```

---

### Task 8: Mobile Responsive Polish

**Files:**
- Modify: `frontend/src/pages/AuthPage.jsx`
- Modify: `frontend/src/styles/pages/AuthPage.css`

**Step 1: Use `gsap.matchMedia` for responsive animations**

Wrap the GSAP panel switch in a matchMedia context so mobile uses `yPercent` instead of `xPercent`:

In `AuthPage.jsx`, add a ref to track the current breakpoint:

```jsx
const isMobileRef = useRef(window.innerWidth <= 768);

useEffect(() => {
  const mq = window.matchMedia('(max-width: 768px)');
  const handler = (e) => { isMobileRef.current = e.matches; };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

Update the initial position set in `useGSAP`:

```jsx
// Set initial track position based on breakpoint
if (isMobileRef.current) {
  gsap.set(trackRef.current, { yPercent: isLogin ? -33.333 : 0 });
} else {
  gsap.set(trackRef.current, { xPercent: isLogin ? -33.333 : 0 });
}
```

Update `switchMode` to use the correct axis:

```jsx
// In the slide phase of switchMode:
if (isMobileRef.current) {
  tl.to(trackRef.current, { yPercent: targetX, duration: 0.55, ease: 'power3.inOut' }, '-=0.1');
  // 3D tilt becomes rotateX on mobile
  tl.to(card, { rotateX: 6 * tiltDir, duration: 0.275, ease: 'power2.in' }, '<');
  tl.to(card, { rotateX: 0, duration: 0.275, ease: 'power2.out' });
} else {
  tl.to(trackRef.current, { xPercent: targetX, duration: 0.55, ease: 'power3.inOut' }, '-=0.1');
  tl.to(card, { rotateY: 6 * tiltDir, duration: 0.275, ease: 'power2.in' }, '<');
  tl.to(card, { rotateY: 0, duration: 0.275, ease: 'power2.out' });
}
```

**Step 2: Polish mobile CSS**

```css
@media (max-width: 768px) {
  .auth-container {
    padding: 0.5rem;
  }

  .auth-card {
    max-width: 100%;
    height: auto;
    border-radius: 1rem;
  }

  .auth-viewport {
    height: auto;
    min-height: 500px;
  }

  .auth-track {
    flex-direction: column;
    width: 100%;
    height: auto;
  }

  .auth-panel {
    width: 100%;
    height: auto;
    min-height: 350px;
  }

  .auth-panel--form {
    padding: 1.5rem;
  }

  .auth-panel--decorative {
    min-height: 160px;
    padding: 1.5rem;
  }

  .auth-deco-logo {
    font-size: 1.75rem;
  }

  .auth-deco-divider {
    margin: 1rem 0;
  }

  /* Remove hover effects on mobile */
  .auth-card::before,
  .auth-card::after {
    display: none;
  }
}
```

**Step 3: Test on mobile viewport**

Use browser devtools responsive mode at 375px width:
- Panels should stack vertically
- Slide should be vertical
- No spotlight/border glow
- No 3D tilt on hover
- Forms remain fully functional

**Step 4: Commit**

```bash
git add frontend/src/pages/AuthPage.jsx frontend/src/styles/pages/AuthPage.css
git commit -m "feat: add mobile responsive layout with vertical slide"
```

---

### Task 9: Final Integration Test and Polish

**Files:**
- All auth-related files

**Step 1: Full build test**

Run: `cd frontend && npm run build`
Expected: Clean build, no warnings.

**Step 2: Functional testing checklist**

Test each item manually:

- [ ] `/login` loads with login form visible, decorative panel on left
- [ ] `/register` loads with register form visible, decorative panel on right
- [ ] Login with valid credentials → redirects to `/dashboard`
- [ ] Login with invalid credentials → error banner shows
- [ ] Register with valid data → redirects to `/dashboard`
- [ ] Register with mismatched passwords → per-field error shows
- [ ] Register with existing email → server error shows
- [ ] Toggle login→register → smooth slide, URL updates
- [ ] Toggle register→login → smooth slide, URL updates
- [ ] Rapid toggle (click multiple times fast) → no visual glitch
- [ ] Partially fill login form → switch to register → switch back → login form data preserved
- [ ] Browser back button from auth page → goes to previous page (not toggle)
- [ ] Already authenticated → redirected to `/dashboard`
- [ ] Mobile viewport (375px) → vertical layout, vertical slide
- [ ] Galaxy particles render on decorative panel
- [ ] Mouse hover → card tilts + spotlight glow (desktop only)

**Step 3: Commit final polish**

```bash
git add -A
git commit -m "feat: complete auth page redesign with GSAP sliding panels"
```

---

## Summary of All Tasks

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update routing and AuthLayout | App.jsx, AuthLayout.jsx, AuthLayout.css |
| 2 | Create AuthPage component + CSS | AuthPage.jsx, AuthPage.css |
| 3 | Delete old Login, Register, Auth.css | Login.jsx, Register.jsx, Auth.css |
| 4 | Galaxy particle canvas | AuthPage.jsx |
| 5 | GSAP entrance animation | AuthPage.jsx |
| 6 | GSAP panel switch animation | AuthPage.jsx, AuthPage.css |
| 7 | Mouse tracking, tilt, spotlight | AuthPage.jsx |
| 8 | Mobile responsive | AuthPage.jsx, AuthPage.css |
| 9 | Final integration test | All |
