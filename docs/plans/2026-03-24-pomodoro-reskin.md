# Pomodoro Reskin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reskin the Pomodoro page to match the rest of the app's design system (theme.css variables, semantic CSS classes, no Tailwind in JSX, no isDark ternaries), add sidebar auto-hide during focus sessions, and clean up dead code.

**Architecture:** Incremental reskin — restyle in place, preserving all existing logic (timer, session recovery, React Query mutations, cross-page animation persistence). The page moves from inline Tailwind + glassmorphism to `var(--bg-surface)` cards and `theme.css` tokens. The sidebar auto-hide uses custom events to decouple Pomodoro from AppLayout.

**Tech Stack:** React 19, CSS custom properties (theme.css), Lucide icons, React Query, custom events API

**Design doc:** `docs/plans/2026-03-24-pomodoro-reskin-design.md`

---

### Task 1: Update PomodoroThemeContext — New Accent System

**Files:**
- Modify: `frontend/src/contexts/PomodoroThemeContext.jsx` (all 39 lines)

**Step 1: Rewrite the backgrounds array with accent-only themes**

Replace the entire file content. The new themes define accent colors (CSS color values) instead of Tailwind gradient classes. The "default" theme has null accents, signaling "use global theme variables."

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const backgrounds = [
  { key: 'default', label: 'Default', accent: null, accentLight: null, accentDark: null, accentBg: null },
  { key: 'sunset', label: 'Sunset', accent: '#f97316', accentLight: '#fb923c', accentDark: '#ea580c', accentBg: 'rgba(249, 115, 22, 0.12)' },
  { key: 'ocean', label: 'Ocean', accent: '#0ea5e9', accentLight: '#38bdf8', accentDark: '#0284c7', accentBg: 'rgba(14, 165, 233, 0.12)' },
  { key: 'forest', label: 'Forest', accent: '#10b981', accentLight: '#34d399', accentDark: '#059669', accentBg: 'rgba(16, 185, 129, 0.12)' },
  { key: 'lavender', label: 'Lavender', accent: '#8b5cf6', accentLight: '#a78bfa', accentDark: '#7c3aed', accentBg: 'rgba(139, 92, 246, 0.12)' },
  { key: 'midnight', label: 'Midnight', accent: '#6366f1', accentLight: '#818cf8', accentDark: '#4f46e5', accentBg: 'rgba(99, 102, 241, 0.12)' },
  { key: 'rose', label: 'Rose', accent: '#f43f5e', accentLight: '#fb7185', accentDark: '#e11d48', accentBg: 'rgba(244, 63, 94, 0.12)' },
];

const PomodoroThemeContext = createContext();

export function PomodoroThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('mentra_pomodoro_bg') || 'default');

  const theme = backgrounds.find((b) => b.key === themeKey) || backgrounds[0];

  useEffect(() => {
    localStorage.setItem('mentra_pomodoro_bg', themeKey);
  }, [themeKey]);

  return (
    <PomodoroThemeContext.Provider value={{ theme, setTheme: setThemeKey, backgrounds }}>
      {children}
    </PomodoroThemeContext.Provider>
  );
}

export function usePomodoroTheme() {
  const context = useContext(PomodoroThemeContext);
  if (!context) {
    throw new Error('usePomodoroTheme must be used within PomodoroThemeProvider');
  }
  return context;
}
```

Key changes:
- Removed `gradient`, `catBg`, `sidebarBg`, `sidebarText`, `sidebarBorder`, `dark` properties
- Added `accent`, `accentLight`, `accentDark`, `accentBg` as CSS color values (not Tailwind classes)
- Added `"default"` theme with all null accents
- Removed `isPomodoroPage` and `useLocation` import (no longer needed)
- Default theme key changed from `'cozy-room'` to `'default'`

**Step 2: Update AppLayout to remove unused PomodoroTheme props**

Modify: `frontend/src/layouts/AppLayout.jsx`

In `AppLayoutContent`, remove the `usePomodoroTheme` import usage for sidebar props:

Change line 14 from:
```jsx
const { theme, isPomodoroPage } = usePomodoroTheme();
```
To:
```jsx
// PomodoroThemeContext is still provided by PomodoroThemeProvider wrapping AppLayout
```

Remove lines 55-56 (the `theme` and `isPomodoroPage` props from Sidebar):
```jsx
<Sidebar
  user={user}
  sidebarOpen={currentSidebarOpen}
  onClose={() => setCurrentSidebarOpen(false)}
  onLogout={logout}
/>
```

Remove the import of `usePomodoroTheme` from line 7 (keep `PomodoroThemeProvider`):
```jsx
import { PomodoroThemeProvider } from '../contexts/PomodoroThemeContext';
```

**Step 3: Verify the app still loads**

Run: `cd frontend && npx vite build 2>&1 | tail -5`
Expected: Build succeeds (or at least no import errors from the context changes)

**Step 4: Commit**

```bash
git add frontend/src/contexts/PomodoroThemeContext.jsx frontend/src/layouts/AppLayout.jsx
git commit -m "refactor: simplify PomodoroThemeContext to accent-only system"
```

---

### Task 2: Rewrite Pomodoro CSS — Clean Slate with Theme Variables

**Files:**
- Rewrite: `frontend/src/styles/pages/Pomodoro.css` (currently 675 lines → new version ~400 lines)
- Delete: `frontend/src/pages/Pomodoro.css` (153 lines — animations move into the merged file)

**Step 1: Write the new consolidated CSS file**

Replace `frontend/src/styles/pages/Pomodoro.css` entirely. This merges the animation CSS (from the co-located file) with new structural CSS using theme variables. All legacy/dead selectors are removed.

```css
/* ============================================================
   Pomodoro Page Styles
   Single consolidated file — layout, typography, animations
   ============================================================ */

/* ── Page Layout ── */
.pomodoro-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100%;
}

/* ── Header ── */
.pomodoro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.pomodoro-header-info {
  display: flex;
  flex-direction: column;
}

.pomodoro-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  margin: 0;
}

.pomodoro-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 6px 0 0 0;
  font-weight: 400;
}

/* ── Theme Picker ── */
.pomodoro-theme-picker {
  position: relative;
}

.pomodoro-theme-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border-default);
  background: var(--bg-hover);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.pomodoro-theme-btn:hover {
  background: var(--bg-active);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.pomodoro-theme-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 0.375rem;
  min-width: 200px;
  z-index: 50;
}

.pomodoro-theme-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--text-secondary);
  text-align: left;
  transition: all 0.15s ease;
}

.pomodoro-theme-option:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.pomodoro-theme-option.active {
  background: var(--accent-bg);
  color: var(--accent);
}

.pomodoro-theme-swatch {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--border-default);
}

.pomodoro-theme-check {
  width: 0.875rem;
  height: 0.875rem;
  margin-left: auto;
  color: var(--accent);
}

/* ── Bento Grid ── */
.pomodoro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .pomodoro-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Cards ── */
.pomodoro-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pomodoro-card:hover {
  border-color: var(--card-hover-border);
  box-shadow: var(--card-hover-shadow);
}

.pomodoro-timer-card {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

@media (max-width: 1024px) {
  .pomodoro-timer-card {
    grid-column: auto;
    grid-row: auto;
  }
}

.pomodoro-card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  letter-spacing: -0.01em;
}

/* ── Water Progress Bar ── */
.pom-water-progress-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pom-water-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--info);
}

.pom-progress-track {
  flex: 1;
  max-width: 200px;
  height: 0.5rem;
  border-radius: 8px;
  background: var(--bg-inset);
  overflow: hidden;
  min-width: 0;
}

.pom-progress-fill {
  height: 100%;
  border-radius: 6px;
  background: var(--pom-accent, var(--accent));
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.pom-progress-pct {
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 2.25rem;
  text-align: right;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* ── Watering Animation Scene ── */
.pom-scene {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  background: var(--bg-inset);
  border: 1px solid var(--border-default);
  transition:
    width 0.9s cubic-bezier(0.34, 1.2, 0.64, 1),
    height 0.9s cubic-bezier(0.34, 1.2, 0.64, 1),
    border-radius 0.9s cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 0.5s ease;
}

.pom-scene-idle {
  width: 192px;
  height: 192px;
  border-radius: 96px;
}

.pom-scene-running {
  width: 320px;
  height: 480px;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.pom-scene-skip-morph {
  transition: none !important;
}
.pom-scene-skip-morph .pom-scene-kran,
.pom-scene-skip-morph .pom-scene-kran *,
.pom-scene-skip-morph .pom-scene-can,
.pom-scene-skip-morph .pom-scene-can * {
  transition: none !important;
}

.pom-scene:not(.pom-scene-skip-morph) .pom-scene-kran,
.pom-scene:not(.pom-scene-skip-morph) .pom-scene-can {
  transition: all 0.7s cubic-bezier(0.34, 1.2, 0.64, 1);
}

/* Kran positioning */
.pom-scene-kran {
  flex-shrink: 0;
  z-index: 10;
  align-self: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.pom-scene-kran-idle {
  margin-left: 0;
  margin-top: 0;
  padding-top: 0;
}

.pom-scene-kran-running {
  margin-left: 8rem;
  margin-top: -60px;
  padding-top: 1rem;
}

.pom-kran-img {
  object-fit: contain;
}

.pom-kran-img-idle {
  width: 8rem;
  height: 8rem;
}

.pom-kran-img-running {
  width: 12.5rem;
  height: 12.5rem;
}

/* Water drops container */
.pom-drops-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Single water drop — positioned absolutely */
.pom-drop-single {
  position: absolute;
  width: 2rem;
  height: 2.5rem;
  top: 18%;
  left: calc(50% - 1rem + 12px);
  backface-visibility: hidden;
  transform-origin: top center;
  animation: pom-fall-1 3s cubic-bezier(0.4, 0, 0.6, 1) 0s infinite backwards;
  will-change: transform, opacity;
  animation-play-state: running;
}

.pom-drop-z1 { z-index: 32; }
.pom-drop-z2 { z-index: 31; }
.pom-drop-z3 { z-index: 30; }

/* Watering can */
.pom-scene-can {
  flex-shrink: 0;
  z-index: 10;
  padding-bottom: 1rem;
}

.pom-scene-can-idle {
  position: absolute;
  bottom: 0;
}

.pom-can-img {
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.pom-can-img-idle {
  width: 6rem;
  height: 6rem;
}

.pom-can-img-running {
  width: 9rem;
  height: 9rem;
}

/* Scene spacer — pushes can to bottom when running */
.pom-scene-spacer {
  flex: 1;
}

/* ── Status Text ── */
.pom-status-sub {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 1rem;
  text-align: center;
}

/* ── Timer Display ── */
.pom-timer-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.pom-timer-display {
  font-size: 4rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: 0;
}

@media (min-width: 768px) {
  .pom-timer-display {
    font-size: 4.5rem;
  }
}

.pom-timer-display.pom-running {
  transform: scale(1.05);
}

.pom-timer-display.pom-paused {
  animation: pom-timer-pause-pulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pom-timer-display.pom-stopped {
  animation: pom-timer-stop-shake 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pom-status-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 0.75rem;
}

/* ── Setup Block (duration, custom, task) ── */
.pom-setup-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 360px;
  margin: 0 auto;
}

/* Duration pills — segment control pattern */
.pom-duration-row {
  display: flex;
  gap: 0.25rem;
  width: 100%;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 0.25rem;
}

.pom-duration-btn {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.pom-duration-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.pom-duration-btn-active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

/* Custom duration row */
.pom-custom-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.pom-custom-label,
.pom-custom-unit {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

.pom-custom-input {
  width: 3.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  border: 1.5px solid transparent;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.pom-custom-input:focus {
  border-color: var(--input-focus-border);
}

.pom-custom-input::-webkit-inner-spin-button,
.pom-custom-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pom-custom-input[type="number"] {
  -moz-appearance: textfield;
}

/* Task selector */
.pom-task-row {
  width: 100%;
}

.pom-task-select {
  width: 100%;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid transparent;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.pom-task-select:focus {
  border-color: var(--input-focus-border);
}

/* ── Control Buttons ── */
.pomodoro-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}

/* Start — primary CTA */
.pom-start-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: var(--pom-accent, var(--accent));
  color: var(--text-on-accent);
  transition: all 0.2s ease;
}

.pom-start-btn:hover:not(:disabled) {
  background: var(--pom-accent-dark, var(--accent-dark));
  transform: translateY(-1px);
}

.pom-start-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.pom-start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pause/Resume */
.pom-btn-pause {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-default);
  background: var(--bg-hover);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.pom-btn-pause:hover {
  background: var(--bg-active);
  border-color: var(--border-hover);
}

/* Stop */
.pom-btn-stop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger);
  transition: all 0.2s ease;
}

.pom-btn-stop:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Button press animations */
.pom-btn-pause.pom-just-paused {
  animation: pom-btn-pause-press 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pom-btn-pause.pom-just-resumed {
  animation: pom-btn-resume-press 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pom-btn-stop.pom-just-stopped {
  animation: pom-btn-stop-press 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pom-btn-pause-press {
  0% { transform: scale(1); }
  35% { transform: scale(0.92); }
  65% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes pom-btn-resume-press {
  0% { transform: scale(1); }
  35% { transform: scale(0.92); }
  65% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes pom-btn-stop-press {
  0% { transform: scale(1) translateX(0); }
  15% { transform: scale(0.95) translateX(-6px); }
  30% { transform: scale(0.95) translateX(6px); }
  45% { transform: scale(0.95) translateX(-4px); }
  60% { transform: scale(0.95) translateX(4px); }
  80% { transform: scale(1.03); }
  100% { transform: scale(1) translateX(0); }
}

/* ── Completed State ── */
.pom-completed-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid var(--success-border);
  animation: pom-pulse 2s ease-in-out infinite;
}

.pom-cans-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background: var(--info-bg);
  color: var(--info);
  border-radius: 9999px;
  font-size: 0.8125rem;
}

@keyframes pom-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ── Timer Animations ── */
@keyframes pom-timer-pause-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  40% { transform: scale(0.96); opacity: 0.85; }
  70% { transform: scale(1.03); }
}

@keyframes pom-timer-stop-shake {
  0%, 100% { transform: translateX(0) scale(1); }
  15% { transform: translateX(-8px) scale(0.98); }
  30% { transform: translateX(8px) scale(0.98); }
  45% { transform: translateX(-5px) scale(0.98); }
  60% { transform: translateX(5px) scale(0.98); }
  80% { transform: translateX(0) scale(1.02); }
}

/* ── Water Drop Animation ── */
@keyframes pom-fall-1 {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1) translateZ(0);
    filter: drop-shadow(0 2px 8px rgba(100, 150, 200, 0.3));
  }
  80% {
    opacity: 1;
    transform: translateY(210px) scale(1) translateZ(0);
    filter: drop-shadow(0 4px 12px rgba(100, 150, 200, 0.4));
  }
  95% {
    opacity: 0.4;
    transform: translateY(235px) scale(0.8) translateZ(0);
    filter: drop-shadow(0 2px 6px rgba(100, 150, 200, 0.2));
  }
  100% {
    opacity: 0;
    transform: translateY(238px) scale(0.5) translateZ(0);
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0));
  }
}

/* ── Watering Can Bounce ── */
@keyframes pom-bounce {
  0% {
    transform: translateY(0) scaleY(1) scaleX(1);
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  }
  25% {
    transform: translateY(8px) scaleY(0.9) scaleX(1);
    filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.22));
  }
  50% {
    transform: translateY(0px) scaleY(1) scaleX(1);
    filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));
  }
  75% {
    transform: translateY(0px) scaleY(1) scaleX(1);
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.16));
  }
  100% {
    transform: translateY(0) scaleY(1) scaleX(1);
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  }
}

.pom-can-bounce {
  animation-name: pom-bounce;
  animation-duration: 1s;
  animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: 0.3s;
  animation-iteration-count: infinite;
  will-change: transform;
}

/* ── Loading Spinner ── */
.pomodoro-loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  animation: pom-spin 0.7s linear infinite;
}

@keyframes pom-spin {
  to { transform: rotate(360deg); }
}

/* ── Stats Card ── */
.pom-stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--bg-inset);
}

.pom-stat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.pom-stat-icon {
  width: 1rem;
  height: 1rem;
}

.pom-stat-icon-accent { color: var(--accent); }
.pom-stat-icon-success { color: var(--success); }

.pom-stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pom-stat-value-accent { color: var(--accent); }
.pom-stat-value-success { color: var(--success); }

/* ── History Card ── */
.pom-history-list {
  display: flex;
  flex-direction: column;
}

.pom-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.pom-history-item:last-child {
  border-bottom: none;
}

.pom-history-info {
  flex: 1;
  min-width: 0;
}

.pom-history-task {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pom-history-meta {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  margin: 0.125rem 0 0 0;
}

.pom-history-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.pom-badge-completed {
  background: var(--success-bg);
  color: var(--success);
}

.pom-badge-cancelled {
  background: var(--danger-bg);
  color: var(--danger);
}

.pom-badge-running {
  background: var(--warning-bg);
  color: var(--warning);
}

/* ── Dev Button ── */
.pom-dev-btn {
  margin-left: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: var(--orange-bg);
  color: var(--orange);
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.pom-dev-btn:hover {
  background: rgba(249, 115, 22, 0.2);
}

.pom-dev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Accessibility ── */
@media (prefers-reduced-motion: reduce) {
  .pom-drop-single {
    animation: pom-fall-reduced 2s linear 0s infinite backwards;
  }

  .pom-can-bounce {
    animation: none;
    transform: none;
  }

  @keyframes pom-fall-reduced {
    0% {
      opacity: 0;
      transform: translateY(-4px) scale(0.8) translateZ(0);
    }
    50% {
      opacity: 1;
      transform: translateY(120px) scale(1) translateZ(0);
    }
    100% {
      opacity: 0;
      transform: translateY(238px) scale(0.8) translateZ(0);
    }
  }
}

/* ── Mobile Responsive ── */
@media (max-width: 640px) {
  .pomodoro-page {
    gap: 1rem;
  }

  .pomodoro-title {
    font-size: 1.5rem;
  }

  .pom-timer-display {
    font-size: 3rem;
  }

  .pomodoro-card {
    padding: 20px;
  }

  .pom-scene-running {
    width: 260px;
    height: 400px;
  }
}
```

**Step 2: Delete the co-located animation CSS file**

```bash
rm frontend/src/pages/Pomodoro.css
```

**Step 3: Commit**

```bash
git add frontend/src/styles/pages/Pomodoro.css
git rm frontend/src/pages/Pomodoro.css
git commit -m "refactor: consolidate Pomodoro CSS with theme variables, remove dead code"
```

---

### Task 3: Rewrite Pomodoro JSX — Replace Tailwind with Semantic Classes

**Files:**
- Modify: `frontend/src/pages/Pomodoro.jsx` (748 lines → ~500 lines)

**Step 1: Rewrite the Pomodoro.jsx component**

Replace the entire file. Key changes:
- Remove all Tailwind utility classes from JSX
- Remove all `isDark ? ... : ...` ternaries
- Use new CSS classes from Task 2
- Update import to only use `../styles/pages/Pomodoro.css` (no more co-located import)
- Theme accent applied via CSS custom properties on timer card
- Dispatch `pomodoro:started` event on start success
- Remove `plantMoods` scale property (was Tailwind class, unused)
- Keep ALL functional logic unchanged (timer, mutations, effects, refs)

```jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroApi, taskApi } from "../services/api";
import {
  Play,
  Pause,
  Square,
  Loader2,
  Palette,
  ChevronDown,
  Droplets,
  Clock,
  CheckCircle,
  Sprout,
  Check,
} from "lucide-react";
import { usePomodoroTheme } from "../contexts/PomodoroThemeContext";

import kranAirImg from "../assets/gameworld/kran_air-2.png";
import wateringCanImg from "../assets/gameworld/watering_can.png";
import "../styles/pages/Pomodoro.css";

/** Inline SVG water drop — no image load, renders immediately */
const WaterDropSvg = ({ className, style, idSuffix = "0" }) => (
  <svg
    className={className}
    style={{ width: "100%", height: "100%", ...style }}
    viewBox="0 0 32 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
  >
    <path
      d="M16 2c0 0-12 14-12 22a12 12 0 0 0 24 0C28 16 16 2 16 2z"
      fill={`url(#pom-drop-grad-${idSuffix})`}
      stroke="rgba(100,150,200,0.4)"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id={`pom-drop-grad-${idSuffix}`} x1="8" y1="2" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93c5fd" />
        <stop offset="0.5" stopColor="#60a5fa" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  </svg>
);

const plantMoods = {
  idle: { label: "Waiting for water..." },
  focusing: { label: "Watering in progress..." },
  paused: { label: "Tap is closed..." },
  completed: { label: "Plant is happy & fully watered!" },
};

export default function Pomodoro() {
  const queryClient = useQueryClient();
  const { theme, setTheme, backgrounds } = usePomodoroTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(25);
  const [selectedTask, setSelectedTask] = useState("");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [waterState, setWaterState] = useState("idle");
  const [cansEarned, setCansEarned] = useState(null);
  const [animState, setAnimState] = useState(null);
  const [skipSceneMorph, setSkipSceneMorph] = useState(false);
  const intervalRef = useRef(null);

  // Theme accent CSS custom properties (only set for non-default themes)
  const timerCardStyle = theme.accent
    ? {
        '--pom-accent': theme.accent,
        '--pom-accent-light': theme.accentLight,
        '--pom-accent-dark': theme.accentDark,
        '--pom-accent-bg': theme.accentBg,
      }
    : {};

  const { data: stats } = useQuery({
    queryKey: ["pomodoro-stats"],
    queryFn: () => pomodoroApi.stats().then((r) => r.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", "pending"],
    queryFn: () =>
      taskApi.list({ status: "pending", per_page: 50 }).then((r) => r.data),
  });

  const { data: history } = useQuery({
    queryKey: ["pomodoro-history"],
    queryFn: () => pomodoroApi.list({ per_page: 5 }).then((r) => r.data),
  });

  const startMutation = useMutation({
    mutationFn: (data) => pomodoroApi.start(data),
    onSuccess: (res) => {
      setSessionId(res.data.id);
      setIsRunning(true);
      setWaterState("focusing");
      // Dispatch event for focus mode sidebar auto-hide
      window.dispatchEvent(new CustomEvent('pomodoro:started'));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => pomodoroApi.complete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pomodoro-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["forest"] });
      setWaterState("completed");
      if (res.data?.cans_awarded) {
        setCansEarned(res.data.cans_awarded);
      }
      // Dispatch event for sidebar restore
      window.dispatchEvent(new CustomEvent('pomodoro:completed'));
      setTimeout(() => {
        resetTimer();
        setWaterState("idle");
        setCansEarned(null);
      }, 3000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => pomodoroApi.cancel(id),
    onSuccess: () => {
      resetTimer();
      setWaterState("idle");
    },
  });

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSessionId(null);
    setTimeLeft(duration * 60);
    setSkipSceneMorph(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

  // Preload scene assets
  useEffect(() => {
    [kranAirImg, wateringCanImg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // On mount: detect & recover any active session from the server
  useEffect(() => {
    pomodoroApi
      .list({ status: "running", per_page: 1 })
      .then((res) => {
        const active = res.data?.data?.[0];
        if (active && ["running", "paused"].includes(active.status)) {
          const dur = active.duration_minutes ?? 25;
          const elapsedSec = Math.floor(
            (Date.now() - new Date(active.started_at).getTime()) / 1000,
          );
          const remaining = Math.max(0, dur * 60 - elapsedSec);
          setSessionId(active.id);
          setDuration(dur);
          setTimeLeft(remaining);
          const running = active.status === "running";
          setIsRunning(running);
          setWaterState(running ? "focusing" : "paused");
          setSkipSceneMorph(true);
          // If session is running, trigger focus mode
          if (running) {
            window.dispatchEvent(new CustomEvent('pomodoro:started'));
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for pending animation on mount
  useEffect(() => {
    const pendingAnimStr = localStorage.getItem('pom-pending-anim');
    if (pendingAnimStr) {
      try {
        const { type, timestamp } = JSON.parse(pendingAnimStr);
        const elapsed = Date.now() - timestamp;
        if (elapsed < 30000) {
          setAnimState(type);
          const animDuration = type === 'stopped' ? 600 : 450;
          setTimeout(() => setAnimState(null), animDuration);
        }
        localStorage.removeItem('pom-pending-anim');
      } catch (e) {
        localStorage.removeItem('pom-pending-anim');
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && sessionId) {
      completeMutation.mutate(sessionId);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, sessionId, completeMutation]);

  useEffect(() => {
    if (!isRunning && !sessionId) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isRunning, sessionId]);

  const handleBgChange = (key) => {
    setTheme(key);
    setShowBgPicker(false);
  };

  const handleStart = () => {
    startMutation.mutate({
      duration_minutes: duration,
      task_id: selectedTask || undefined,
    });
  };

  const handleStop = () => {
    if (sessionId) {
      window.dispatchEvent(new CustomEvent('pomodoro:stopped'));
      setAnimState("stopped");
      const animData = { type: 'stopped', timestamp: Date.now() };
      localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
      setTimeout(() => setAnimState(null), 600);
      cancelMutation.mutate(sessionId);
    }
  };

  const handlePauseResume = () => {
    const next = !isRunning;
    const animType = next ? "resumed" : "paused";
    window.dispatchEvent(new CustomEvent(`pomodoro:${animType}`));
    setAnimState(animType);
    const animData = { type: animType, timestamp: Date.now() };
    localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
    setTimeout(() => setAnimState(null), 450);
    setIsRunning(next);
    setWaterState(next ? "focusing" : "paused");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = duration * 60;
  const elapsedSeconds = isRunning ? Math.max(0, totalSeconds - timeLeft) : 0;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const mood = plantMoods[waterState];
  const waterProgress = Math.min(100, progress);

  return (
    <div className="pomodoro-page">
      {/* Header */}
      <div className="pomodoro-header">
        <div className="pomodoro-header-info">
          <h1 className="pomodoro-title">Pomodoro</h1>
          <p className="pomodoro-subtitle">Water your plants by staying focused</p>
        </div>
        {/* Theme picker */}
        <div className="pomodoro-theme-picker">
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            className="pomodoro-theme-btn"
          >
            <Palette style={{ width: "1rem", height: "1rem" }} />
            <span>{theme.label}</span>
            <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
          </button>
          {showBgPicker && (
            <div className="pomodoro-theme-dropdown">
              {backgrounds.map((b) => (
                <button
                  key={b.key}
                  onClick={() => handleBgChange(b.key)}
                  className={`pomodoro-theme-option ${theme.key === b.key ? "active" : ""}`}
                >
                  <span
                    className="pomodoro-theme-swatch"
                    style={{ background: b.accent || 'var(--accent)' }}
                  />
                  {b.label}
                  {theme.key === b.key && (
                    <Check className="pomodoro-theme-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="pomodoro-grid">
        {/* Timer Card */}
        <div className="pomodoro-card pomodoro-timer-card" style={timerCardStyle}>
          {/* Water progress */}
          <div className="pom-water-progress-row">
            <Droplets className="pom-water-icon" />
            <div className="pom-progress-track">
              <div
                className="pom-progress-fill"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
            <span className="pom-progress-pct">
              {Math.round(waterProgress)}%
            </span>
          </div>

          {/* Watering Animation Scene */}
          <div className={`pom-scene ${isRunning ? "pom-scene-running" : "pom-scene-idle"} ${skipSceneMorph ? "pom-scene-skip-morph" : ""}`}>
            {/* Kran Air */}
            <div className={`pom-scene-kran ${isRunning ? "pom-scene-kran-running" : "pom-scene-kran-idle"}`}>
              <img
                src={kranAirImg}
                alt="Kran Air"
                className={`pom-kran-img ${!skipSceneMorph ? "transition-all duration-700" : ""} ${isRunning ? "pom-kran-img-running" : "pom-kran-img-idle"}`}
              />
            </div>

            {/* Water Drops */}
            {isRunning && (
              <div key={sessionId ?? "drops"} className="pom-drops-container">
                <div
                  className="pom-drop-single pom-drop-z1"
                  style={{ animationDelay: `${-((elapsedSeconds % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="1" />
                </div>
                <div
                  className="pom-drop-single pom-drop-z2"
                  style={{ animationDelay: `${-(((elapsedSeconds - 1 + 3) % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="2" />
                </div>
                <div
                  className="pom-drop-single pom-drop-z3"
                  style={{ animationDelay: `${-(((elapsedSeconds - 2 + 3) % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="3" />
                </div>
              </div>
            )}

            {/* Spacer pushes can to bottom */}
            {isRunning && <div className="pom-scene-spacer" />}

            {/* Watering Can */}
            <div className={`pom-scene-can ${isRunning ? "pom-can-bounce" : "pom-scene-can-idle"}`}>
              <img
                src={wateringCanImg}
                alt="Watering Can"
                className={`pom-can-img ${!skipSceneMorph ? "transition-all duration-700" : ""} ${isRunning ? "pom-can-img-running" : "pom-can-img-idle"}`}
              />
            </div>
          </div>

          {/* Status */}
          <div className="pom-status-sub">{mood.label}</div>

          {/* Timer */}
          <div className="pom-timer-section">
            <p className={`pom-timer-display ${isRunning ? "pom-running" : ""} ${animState === "paused" ? "pom-paused" : ""} ${animState === "stopped" ? "pom-stopped" : ""}`}>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
            <p className="pom-status-label">
              {sessionId
                ? isRunning
                  ? "Watering in progress..."
                  : "Paused — tap is closed"
                : "Start to water your plants"}
            </p>
          </div>

          {/* Duration selector */}
          {!sessionId && (
            <div className="pom-setup-block">
              <div className="pom-duration-row">
                {[15, 25, 45, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`pom-duration-btn ${duration === d ? "pom-duration-btn-active" : ""}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>

              <div className="pom-custom-row">
                <span className="pom-custom-label">or custom</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 120) {
                      setDuration(val);
                    }
                  }}
                  className="pom-custom-input"
                />
                <span className="pom-custom-unit">min</span>
              </div>

              <div className="pom-task-row">
                <select
                  className="pom-task-select"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">No task linked</option>
                  {tasks?.data?.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="pomodoro-controls">
            {!sessionId ? (
              <button
                onClick={handleStart}
                className="pom-start-btn"
                disabled={startMutation.isPending}
              >
                {startMutation.isPending ? (
                  <Loader2 className="pomodoro-loading-spinner" />
                ) : (
                  <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
                Water Plants
              </button>
            ) : waterState === "completed" ? (
              <div className="pom-completed-msg">
                <span>Plant is happy! +EXP earned</span>
                {cansEarned > 0 && (
                  <span className="pom-cans-badge">
                    <Sprout style={{ width: "1rem", height: "1rem" }} />
                    +{cansEarned} cans
                  </span>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className={`pom-btn-pause ${animState === "paused" ? "pom-just-paused" : ""} ${animState === "resumed" ? "pom-just-resumed" : ""}`}
                >
                  {isRunning ? (
                    <Pause style={{ width: "1.25rem", height: "1.25rem" }} />
                  ) : (
                    <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                  )}
                  {isRunning ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={handleStop}
                  className={`pom-btn-stop ${animState === "stopped" ? "pom-just-stopped" : ""}`}
                >
                  <Square style={{ width: "1.25rem", height: "1.25rem" }} />
                  Stop
                </button>
              </>
            )}

            {/* Debug button - dev only */}
            {import.meta.env.DEV && sessionId && waterState !== "completed" && (
              <button
                onClick={() => completeMutation.mutate(sessionId)}
                className="pom-dev-btn"
                disabled={completeMutation.isPending}
              >
                [DEV] Complete
              </button>
            )}
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="pomodoro-card">
            <h3 className="pomodoro-card-title">Today's Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="pom-stat-item">
                <div className="pom-stat-label">
                  <Clock className="pom-stat-icon pom-stat-icon-accent" />
                  <span>Today Sessions</span>
                </div>
                <span className="pom-stat-value pom-stat-value-accent">
                  {stats.today_sessions}
                </span>
              </div>
              <div className="pom-stat-item">
                <div className="pom-stat-label">
                  <CheckCircle className="pom-stat-icon pom-stat-icon-success" />
                  <span>Total Focus</span>
                </div>
                <span className="pom-stat-value pom-stat-value-success">
                  {stats.total_focus_minutes}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* History Card */}
        {history?.data?.length > 0 && (
          <div className="pomodoro-card">
            <h3 className="pomodoro-card-title">Recent Sessions</h3>
            <div className="pom-history-list">
              {history.data.map((session) => (
                <div key={session.id} className="pom-history-item">
                  <div className="pom-history-info">
                    <p className="pom-history-task">
                      {session.task?.title || "No task"}
                    </p>
                    <p className="pom-history-meta">
                      {session.duration_minutes}min ·{" "}
                      {new Date(session.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <span
                    className={`pom-history-badge ${
                      session.status === "completed"
                        ? "pom-badge-completed"
                        : session.status === "cancelled"
                          ? "pom-badge-cancelled"
                          : "pom-badge-running"
                    }`}
                  >
                    {session.status === "completed"
                      ? "✓"
                      : session.status === "cancelled"
                        ? "×"
                        : "..."}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd frontend && npx vite build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/pages/Pomodoro.jsx
git commit -m "refactor: replace Tailwind utilities with semantic CSS classes in Pomodoro page"
```

---

### Task 4: Add Sidebar Focus Mode — Auto-Hide During Pomodoro

**Files:**
- Modify: `frontend/src/layouts/AppLayout.jsx`
- Modify: `frontend/src/styles/layouts/AppLayout.css`
- Modify: `frontend/src/styles/components/Sidebar.css`

**Step 1: Add focus mode state and event listeners to AppLayout**

In `frontend/src/layouts/AppLayout.jsx`, add focus mode logic to `AppLayoutContent`:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { Loader2, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { PomodoroThemeProvider } from '../contexts/PomodoroThemeContext';
import '../styles/layouts/AppLayout.css';

function AppLayoutContent() {
  const { user, loading, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, dashboardMode } = useDashboardUI();
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusSidebarOpen, setFocusSidebarOpen] = useState(false);
  const isAgentPage = window.location.pathname === "/agent";
  const isChatPage = window.location.pathname === "/chat";
  const isDashboardPage = window.location.pathname === "/dashboard";
  
  const isMapMode = isDashboardPage && dashboardMode === 'map';
  const currentSidebarOpen = isDashboardPage ? sidebarOpen : localSidebarOpen;
  const setCurrentSidebarOpen = isDashboardPage ? setSidebarOpen : setLocalSidebarOpen;

  // Listen for Pomodoro focus mode events
  useEffect(() => {
    const handleStarted = () => {
      setFocusMode(true);
      setFocusSidebarOpen(false);
    };
    const handleStopped = () => {
      setFocusMode(false);
      setFocusSidebarOpen(false);
    };

    window.addEventListener('pomodoro:started', handleStarted);
    window.addEventListener('pomodoro:stopped', handleStopped);
    window.addEventListener('pomodoro:completed', handleStopped);

    return () => {
      window.removeEventListener('pomodoro:started', handleStarted);
      window.removeEventListener('pomodoro:stopped', handleStopped);
      window.removeEventListener('pomodoro:completed', handleStopped);
    };
  }, []);

  if (loading) {
    return (
      <div className="app-layout-loading">
        <Loader2 className="app-layout-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine if sidebar should be hidden on desktop due to focus mode
  const sidebarFocusHidden = focusMode && !focusSidebarOpen;

  return (
    <div className="app-layout-container">
      {/* Mobile overlay */}
      {currentSidebarOpen && !isMapMode && (
        <div
          className="app-layout-overlay"
          onClick={() => setCurrentSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isMapMode && (
        <div className={`sidebar-focus-wrapper ${sidebarFocusHidden ? "sidebar-focus-hidden" : ""}`}>
          <Sidebar
            user={user}
            sidebarOpen={currentSidebarOpen}
            onClose={() => setCurrentSidebarOpen(false)}
            onLogout={logout}
          />
        </div>
      )}

      {/* Focus mode toggle button */}
      {focusMode && !isMapMode && (
        <button
          className="focus-sidebar-toggle"
          onClick={() => setFocusSidebarOpen(!focusSidebarOpen)}
          aria-label={focusSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {focusSidebarOpen ? (
            <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
          ) : (
            <ChevronRight style={{ width: "1rem", height: "1rem" }} />
          )}
        </button>
      )}

      {/* Main content */}
      <div className="app-layout-main">
        {/* Mobile header */}
        <header className="app-layout-mobile-header">
          <button onClick={() => setCurrentSidebarOpen(true)} className="app-layout-menu-btn">
            <Menu className="app-layout-menu-icon" />
          </button>
          <h1 className="app-layout-mobile-logo">Mentra</h1>
        </header>

        <main className={`app-layout-content ${isAgentPage ? "app-layout-content-agent" : ""} ${isChatPage ? "app-layout-content-chat" : ""} ${isDashboardPage ? "app-layout-content-dashboard" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <PomodoroThemeProvider>
      <AppLayoutContent />
    </PomodoroThemeProvider>
  );
}
```

**Step 2: Add focus mode CSS to AppLayout.css**

Append to `frontend/src/styles/layouts/AppLayout.css`:

```css
/* ── Focus Mode (Pomodoro Sidebar Auto-Hide) ── */

.sidebar-focus-wrapper {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 1024px) {
  .sidebar-focus-wrapper.sidebar-focus-hidden {
    transform: translateX(-100%);
    margin-left: -260px;
  }
}

.focus-sidebar-toggle {
  display: none;
}

@media (min-width: 1024px) {
  .focus-sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 45;
    width: 1.5rem;
    height: 3rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-left: none;
    border-radius: 0 8px 8px 0;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .focus-sidebar-toggle:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    width: 2rem;
  }

  /* When sidebar is visible in focus mode, shift toggle to the right */
  .sidebar-focus-wrapper:not(.sidebar-focus-hidden) ~ .focus-sidebar-toggle {
    left: 260px;
  }
}
```

**Step 3: Verify build**

Run: `cd frontend && npx vite build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add frontend/src/layouts/AppLayout.jsx frontend/src/styles/layouts/AppLayout.css
git commit -m "feat: add sidebar auto-hide focus mode during Pomodoro sessions"
```

---

### Task 5: Manual Testing Checklist

No code changes. Verify the following behaviors in the browser.

**Visual consistency:**
- [ ] Pomodoro page cards match the style of Tasks/Mood/Schedules pages (bg-surface, border, 12px radius)
- [ ] No gradient background — page uses standard AppLayout bg-base
- [ ] Header matches app pattern (large title + subtitle left, action button right)
- [ ] Duration selector looks like Tasks page view tabs (pill/segment control)
- [ ] Control buttons use theme variables (accent for start, danger for stop)
- [ ] Stats and History cards use standard card styling
- [ ] Dark and light modes both look correct (no hardcoded colors)

**Theme picker:**
- [ ] Default theme shows standard app colors
- [ ] Non-default themes only tint the timer card (progress bar, start button color)
- [ ] Stats and History cards remain standard regardless of theme
- [ ] Theme persists in localStorage across page reloads

**Watering animation:**
- [ ] Scene morphs from circle (idle) to rounded rect (running) on start
- [ ] Water drops fall correctly with staggered timing
- [ ] Watering can bounces
- [ ] Session recovery skips morph animation (scene is already running)
- [ ] `prefers-reduced-motion` fallback works

**Sidebar focus mode:**
- [ ] Sidebar slides out when Pomodoro starts
- [ ] Small toggle button appears on left edge
- [ ] Toggle button opens/closes sidebar
- [ ] Sidebar slides back in when Pomodoro stops or completes
- [ ] Toggle button disappears when session ends
- [ ] Session recovery triggers sidebar hide on page load
- [ ] Mobile sidebar behavior is unaffected

**Functional behavior (must not break):**
- [ ] Timer counts down correctly
- [ ] Start, pause, resume, stop all work
- [ ] Session recovery on page reload
- [ ] Cross-page animation persistence (navigate away and back)
- [ ] Stats and history update after completion
- [ ] EXP and watering cans display on completion

---

### Task 6: Final Cleanup — Remove console.logs

**Files:**
- Modify: `frontend/src/pages/Pomodoro.jsx`

The original file had several `console.log` statements with emoji prefixes for debugging the animation system. These were removed in the Task 3 rewrite, but verify none were accidentally left in.

Run: `grep -n "console.log" frontend/src/pages/Pomodoro.jsx`
Expected: No output (all debug logs were removed)

If any remain, remove them.

**Step 2: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup for Pomodoro reskin"
```
