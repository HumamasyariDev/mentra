# Sidebar & Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the sidebar and dashboard to match the design example aesthetic, add dark/light theme toggle (dark default), and implement a 3-tier animation system (Max/Micro/None).

**Architecture:** New `ThemeContext` manages theme and animation preferences via React context + `data-theme`/`data-animation` attributes on `<html>`. CSS custom properties (`--th-*`) define all theme-dependent colors. GSAP animations are wrapped in a custom hook gated by animation level.

**Tech Stack:** React 19, CSS Custom Properties, GSAP 3.14 + @gsap/react, Lucide React icons, localStorage

---

### Task 1: Create Theme CSS Variables

**Files:**
- Create: `frontend/src/styles/theme.css`

**Step 1: Create the theme CSS file**

```css
/* Theme System - CSS Custom Properties */
/* Light mode is the default in :root, dark mode overrides via [data-theme="dark"] */

:root,
[data-theme="light"] {
  /* Backgrounds */
  --th-bg: #f5f5f7;
  --th-surface: #ffffff;
  --th-surface-glass: #ffffff;

  /* Text */
  --th-text: #1a1a1a;
  --th-text-muted: #86868b;

  /* Borders & interactive */
  --th-border: #e8e8ed;
  --th-hover: rgba(0, 0, 0, 0.04);

  /* Shadows */
  --th-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --th-shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* Accent (consistent across themes) */
  --th-accent: #6366f1;
  --th-accent-light: #818cf8;
  --th-accent-dark: #4f46e5;
  --th-accent-glow: rgba(99, 102, 241, 0.15);

  /* Sidebar-specific */
  --th-sidebar-bg: #f5f5f7;
  --th-sidebar-active-bg: #ffffff;

  /* Card-specific */
  --th-card-backdrop: none;
  --th-card-bg: var(--th-surface);

  /* Stat icon backgrounds - light pastel */
  --th-stat-emerald-bg: #ecfdf5;
  --th-stat-blue-bg: #eff6ff;
  --th-stat-orange-bg: #fff7ed;
  --th-stat-indigo-bg: #eef2ff;
  --th-stat-yellow-bg: #fef9c3;
}

[data-theme="dark"] {
  /* Backgrounds */
  --th-bg: #0f0a1a;
  --th-surface: #1a1525;
  --th-surface-glass: rgba(255, 255, 255, 0.04);

  /* Text */
  --th-text: #f0eef5;
  --th-text-muted: #8b82a8;

  /* Borders & interactive */
  --th-border: rgba(255, 255, 255, 0.08);
  --th-hover: rgba(255, 255, 255, 0.06);

  /* Shadows */
  --th-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --th-shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.4);

  /* Accent glow is stronger in dark mode */
  --th-accent-glow: rgba(99, 102, 241, 0.25);

  /* Sidebar-specific */
  --th-sidebar-bg: #110d1e;
  --th-sidebar-active-bg: rgba(255, 255, 255, 0.08);

  /* Card-specific */
  --th-card-backdrop: blur(12px);
  --th-card-bg: var(--th-surface-glass);

  /* Stat icon backgrounds - dark transparent */
  --th-stat-emerald-bg: rgba(16, 185, 129, 0.15);
  --th-stat-blue-bg: rgba(59, 130, 246, 0.15);
  --th-stat-orange-bg: rgba(249, 115, 22, 0.15);
  --th-stat-indigo-bg: rgba(99, 102, 241, 0.15);
  --th-stat-yellow-bg: rgba(234, 179, 8, 0.15);
}

/* Animation level: none - kill all transitions and animations */
[data-animation="none"] *,
[data-animation="none"] *::before,
[data-animation="none"] *::after {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/theme.css
git commit -m "feat: add theme CSS variables for light/dark mode"
```

---

### Task 2: Create ThemeContext

**Files:**
- Create: `frontend/src/contexts/ThemeContext.jsx`

**Step 1: Create the ThemeContext**

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'mentra_theme';
const ANIMATION_KEY = 'mentra_animation_level';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

function getInitialAnimationLevel() {
  try {
    const stored = localStorage.getItem(ANIMATION_KEY);
    if (stored === 'max' || stored === 'micro' || stored === 'none') return stored;
  } catch {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'none';
  }
  return 'max';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [animationLevel, setAnimationLevel] = useState(getInitialAnimationLevel);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-animation', animationLevel);
    localStorage.setItem(ANIMATION_KEY, animationLevel);
  }, [animationLevel]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const cycleAnimationLevel = useCallback(() => {
    setAnimationLevel(prev => {
      if (prev === 'max') return 'micro';
      if (prev === 'micro') return 'none';
      return 'max';
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, animationLevel, toggleTheme, setAnimationLevel, cycleAnimationLevel }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add frontend/src/contexts/ThemeContext.jsx
git commit -m "feat: add ThemeContext for theme and animation level management"
```

---

### Task 3: Wire Up ThemeProvider and Update index.css

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/layouts/AppLayout.jsx`

**Step 1: Update index.css to import theme.css and bridge variables**

In `frontend/src/index.css`, add the theme.css import at the top (after the tailwind import) and update the `:root` variables to reference `--th-*`:

```css
@import "tailwindcss";
@import "./styles/theme.css";

@layer base {
  :root {
    --color-primary: var(--th-accent);
    --color-primary-light: var(--th-accent-light);
    --color-primary-dark: var(--th-accent-dark);
    --color-accent: #f59e0b;
    --color-success: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-bg: var(--th-bg);
    --color-surface: var(--th-surface);
    --color-text: var(--th-text);
    --color-text-muted: var(--th-text-muted);
    --color-border: var(--th-border);
  }

  body {
    @apply bg-[var(--color-bg)] text-[var(--color-text)] antialiased;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

Keep the `@layer components` section unchanged.

**Step 2: Update AppLayout.jsx to include ThemeProvider**

In `frontend/src/layouts/AppLayout.jsx`, wrap `AppLayoutContent` with `ThemeProvider`:

Import at top:
```jsx
import { ThemeProvider } from '../contexts/ThemeContext';
```

Update the default export:
```jsx
export default function AppLayout() {
  return (
    <ThemeProvider>
      <PomodoroThemeProvider>
        <AppLayoutContent />
      </PomodoroThemeProvider>
    </ThemeProvider>
  );
}
```

**Step 3: Update AppLayout.css to use theme variables**

In `frontend/src/styles/layouts/AppLayout.css`, replace all hardcoded colors:

| Old Value | New Value |
|---|---|
| `background-color: #f8fafc` | `background-color: var(--th-bg)` |
| `color: #6366f1` (spinner) | `color: var(--th-accent)` |
| `background-color: #ffffff` (mobile header) | `background-color: var(--th-surface)` |
| `border-bottom: 1px solid #e2e8f0` | `border-bottom: 1px solid var(--th-border)` |
| `color: #475569` (menu icon) | `color: var(--th-text-muted)` |
| `color: #4f46e5` (mobile logo) | `color: var(--th-accent-dark)` |

The full updated AppLayout.css:

```css
/* AppLayout Styles */

.app-layout-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--th-bg);
}

.app-layout-loading-spinner {
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  color: var(--th-accent);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.app-layout-container {
  min-height: 100vh;
  background-color: var(--th-bg);
  display: flex;
}

.app-layout-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 40;
}

@media (min-width: 1024px) {
  .app-layout-overlay { display: none; }
}

.app-layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-layout-mobile-header {
  background-color: var(--th-surface);
  border-bottom: 1px solid var(--th-border);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 1024px) {
  .app-layout-mobile-header { display: none; }
}

.app-layout-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.app-layout-menu-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--th-text-muted);
}

.app-layout-mobile-logo {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--th-accent-dark);
}

.app-layout-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

@media (min-width: 1024px) {
  .app-layout-content { padding: 2rem; }
}
```

**Step 4: Verify**

Run: `npm run dev` (from `frontend/`)
Expected: App loads without errors. Since default theme is dark, the background should be dark purple-tinted (`#0f0a1a`). Sidebar and dashboard content will still look off (hardcoded colors) — that's expected, we fix those next.

**Step 5: Commit**

```bash
git add frontend/src/index.css frontend/src/layouts/AppLayout.jsx frontend/src/styles/layouts/AppLayout.css
git commit -m "feat: wire ThemeProvider into AppLayout and update CSS variables"
```

---

### Task 4: Restyle Sidebar CSS

**Files:**
- Modify: `frontend/src/styles/components/Sidebar.css`

**Step 1: Rewrite Sidebar.css with theme variables and design example styling**

Replace the entire file with:

```css
/* Sidebar Styles - Themed */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 260px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--th-sidebar-bg);
  border-right: 1px solid var(--th-border);
  transition: transform 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-hidden {
  transform: translateX(-100%);
}

.sidebar-visible {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .sidebar {
    position: static;
  }
  .sidebar-hidden {
    transform: translateX(0);
  }
}

/* Header */
.sidebar-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.sidebar-toggle {
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: none;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.sidebar-toggle:hover {
  background-color: var(--th-hover);
}

.sidebar-toggle-icon {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--th-text-muted);
  margin: 0 auto;
}

@media (max-width: 1023px) {
  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Sections */
.sidebar-section {
  padding: 0 12px;
  margin-bottom: 8px;
  flex: 1;
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--th-text-muted);
  text-transform: uppercase;
  padding: 0 12px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 400;
  color: var(--th-text);
  text-decoration: none;
  transition: background-color 0.15s ease;
  position: relative;
}

.sidebar-nav-link:hover {
  background-color: var(--th-hover);
}

.sidebar-nav-link.active {
  background-color: var(--th-sidebar-active-bg);
  font-weight: 500;
  box-shadow: var(--th-shadow);
}

/* Active indicator bar */
.sidebar-nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 0 3px 3px 0;
  transition: height 0.2s ease;
}

.sidebar-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--th-text-muted);
}

.sidebar-nav-link.active .sidebar-nav-icon {
  color: var(--th-accent);
}

.sidebar-nav-label {
  flex: 1;
}

.sidebar-nav-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding: 0 12px 16px;
  border-top: 1px solid var(--th-border);
}

/* Settings row (theme toggle + animation toggle) */
.sidebar-settings-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 8px;
}

.sidebar-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--th-border);
  background-color: transparent;
  color: var(--th-text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.sidebar-settings-btn:hover {
  background-color: var(--th-hover);
  color: var(--th-text);
  border-color: var(--th-text-muted);
}

.sidebar-settings-btn .sidebar-settings-icon {
  width: 18px;
  height: 18px;
}

.sidebar-settings-label {
  font-size: 11px;
  color: var(--th-text-muted);
  white-space: nowrap;
}

/* Account section */
.sidebar-account {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sidebar-account:hover {
  background-color: var(--th-hover);
}

.sidebar-account-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--th-hover);
}

.sidebar-account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-account-info {
  flex: 1;
  min-width: 0;
}

.sidebar-account-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--th-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-account-role {
  font-size: 12px;
  color: var(--th-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/components/Sidebar.css
git commit -m "feat: restyle sidebar with theme variables and design example aesthetic"
```

---

### Task 5: Update Sidebar Component

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

**Step 1: Update Sidebar.jsx to add theme toggle and animation level button**

Replace the entire file with:

```jsx
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  FileText,
  Calendar,
  Folder,
  GraduationCap,
  BarChart3,
  MessageCircle,
  Sun,
  Moon,
  Sparkles,
  Zap,
  MinusCircle,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/components/Sidebar.css';

const mainMenuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: BookOpen },
  { to: '/pomodoro', label: 'Pomodoro', icon: FileText },
  { to: '/schedules', label: 'Schedules', icon: Calendar },
  { to: '/mood', label: 'Mood', icon: Folder },
  { to: '/sandbox', label: 'Sandbox', icon: GraduationCap },
  { to: '/agent', label: 'Agent', icon: BarChart3 },
  { to: '/forum', label: 'Forum', icon: MessageCircle },
];

const animationIcons = {
  max: Sparkles,
  micro: Zap,
  none: MinusCircle,
};

const animationLabels = {
  max: 'Max',
  micro: 'Micro',
  none: 'Off',
};

export default function Sidebar({ user, sidebarOpen, onClose, onLogout }) {
  const { theme, animationLevel, toggleTheme, cycleAnimationLevel } = useTheme();
  const AnimIcon = animationIcons[animationLevel];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">M</div>
        </div>
        <button className="sidebar-toggle" onClick={onClose}>
          <span className="sidebar-toggle-icon"></span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Main menu</div>
        <nav className="sidebar-nav">
          {mainMenuItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="sidebar-nav-icon" />
              <span className="sidebar-nav-label">{label}</span>
              {badge && <span className="sidebar-nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-settings-row">
          <button
            className="sidebar-settings-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="sidebar-settings-icon" />
            ) : (
              <Moon className="sidebar-settings-icon" />
            )}
          </button>
          <button
            className="sidebar-settings-btn"
            onClick={cycleAnimationLevel}
            title={`Animations: ${animationLabels[animationLevel]}`}
          >
            <AnimIcon className="sidebar-settings-icon" />
          </button>
          <span className="sidebar-settings-label">
            {animationLabels[animationLevel]}
          </span>
        </div>
        <div className="sidebar-account">
          <div className="sidebar-account-avatar">
            <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
          </div>
          <div className="sidebar-account-info">
            <div className="sidebar-account-name">{user.name || 'User'}</div>
            <div className="sidebar-account-role">Student</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Step 2: Verify**

Run: `npm run dev` (from `frontend/`)
Expected: Sidebar renders with gradient logo, theme toggle (sun/moon) and animation level button at the bottom. Clicking theme toggle switches between dark and light. Clicking animation button cycles through sparkles/zap/minus icons.

**Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "feat: add theme toggle and animation level controls to sidebar"
```

---

### Task 6: Restyle Dashboard CSS

**Files:**
- Modify: `frontend/src/styles/pages/Dashboard.css`

**Step 1: Rewrite Dashboard.css with theme variables and improved styling**

Replace the entire file with:

```css
/* Dashboard Page Styles - Themed */

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--th-text);
}

.dashboard-subtitle {
  color: var(--th-text-muted);
  margin-top: 0.25rem;
}

/* Loading */
.dashboard-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16rem;
}

.dashboard-loading-spinner {
  width: 2rem;
  height: 2rem;
  animation: dash-spin 1s linear infinite;
  color: var(--th-accent);
}

@keyframes dash-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Level Card */
.dashboard-level-card {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  padding: 1.5rem;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .dashboard-level-card {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);
}

/* Subtle glow pulse animation for dark mode level card */
@keyframes level-glow-pulse {
  0%, 100% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.15); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.25); }
}

[data-theme="dark"] .dashboard-level-card {
  animation: level-glow-pulse 3s ease-in-out infinite;
}

.dashboard-level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-level-info {
  display: flex;
  flex-direction: column;
}

.dashboard-level-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.dashboard-level-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

.dashboard-level-icon-container {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  border-radius: 0.75rem;
}

.dashboard-level-icon {
  width: 2rem;
  height: 2rem;
}

.dashboard-level-progress {
  margin-top: 1rem;
}

.dashboard-level-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.dashboard-level-progress-bar {
  height: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  overflow: hidden;
}

.dashboard-level-progress-fill {
  height: 100%;
  background-color: #ffffff;
  border-radius: 9999px;
  transition: width 0.7s ease;
}

/* Stats Grid */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 1024px) {
  .dashboard-stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.dashboard-stat-card {
  padding: 1.5rem;
  background-color: var(--th-card-bg);
  backdrop-filter: var(--th-card-backdrop);
  -webkit-backdrop-filter: var(--th-card-backdrop);
  border: 1px solid var(--th-border);
  border-radius: 1rem;
  box-shadow: var(--th-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--th-shadow-lg);
}

.dashboard-stat-icon-container {
  display: inline-flex;
  padding: 0.5rem;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
}

.dashboard-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.dashboard-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--th-text);
}

.dashboard-stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--th-text-muted);
}

.dashboard-stat-sub {
  font-size: 0.75rem;
  color: var(--th-text-muted);
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* Bottom Grid */
.dashboard-bottom-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-bottom-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dashboard-card {
  padding: 1.5rem;
  background-color: var(--th-card-bg);
  backdrop-filter: var(--th-card-backdrop);
  -webkit-backdrop-filter: var(--th-card-backdrop);
  border: 1px solid var(--th-border);
  border-radius: 1rem;
  box-shadow: var(--th-shadow);
}

.dashboard-card-title {
  font-weight: 600;
  color: var(--th-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.dashboard-card-title-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mood Card */
.dashboard-mood-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard-mood-emoji {
  font-size: 2.25rem;
}

.dashboard-mood-info {
  display: flex;
  flex-direction: column;
}

.dashboard-mood-label {
  font-weight: 500;
  text-transform: capitalize;
}

.dashboard-mood-energy {
  font-size: 0.875rem;
  color: var(--th-text-muted);
}

.dashboard-mood-note {
  font-size: 0.875rem;
  color: var(--th-text-muted);
  margin-top: 0.25rem;
}

.dashboard-mood-empty {
  color: var(--th-text-muted);
  font-size: 0.875rem;
}

/* Recent Activity */
.dashboard-activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--th-border);
}

.dashboard-activity-item:last-child {
  border-bottom: none;
}

.dashboard-activity-info {
  display: flex;
  flex-direction: column;
}

.dashboard-activity-description {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--th-text);
}

.dashboard-activity-source {
  font-size: 0.75rem;
  color: var(--th-text-muted);
}

.dashboard-activity-exp {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.dashboard-activity-empty {
  color: var(--th-text-muted);
  font-size: 0.875rem;
}

/* Mood Colors (semantic - same in both themes) */
.mood-great { color: #10b981; }
.mood-good { color: #22c55e; }
.mood-okay { color: #eab308; }
.mood-bad { color: #f97316; }
.mood-terrible { color: #ef4444; }

/* Stat Card Colors - Icon colors (same in both themes) */
.stat-color-emerald { color: #10b981; }
.stat-color-blue { color: #3b82f6; }
.stat-color-orange { color: #f97316; }
.stat-color-indigo { color: #6366f1; }
.stat-color-yellow { color: #eab308; }

/* Stat Card Backgrounds - Theme-aware */
.stat-bg-emerald { background-color: var(--th-stat-emerald-bg); }
.stat-bg-blue { background-color: var(--th-stat-blue-bg); }
.stat-bg-orange { background-color: var(--th-stat-orange-bg); }
.stat-bg-indigo { background-color: var(--th-stat-indigo-bg); }
.stat-bg-yellow { background-color: var(--th-stat-yellow-bg); }
```

**Step 2: Commit**

```bash
git add frontend/src/styles/pages/Dashboard.css
git commit -m "feat: restyle dashboard CSS with theme variables and glassmorphism"
```

---

### Task 7: Create Dashboard Animations Hook

**Files:**
- Create: `frontend/src/hooks/useDashboardAnimations.js`

**Step 1: Create the GSAP animation hook**

```jsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Dashboard GSAP animations - only runs at "max" animation level.
 * At "micro" level, CSS transitions handle hover/state changes.
 * At "none" level, everything is instant (CSS rule kills transitions).
 *
 * @param {Object} refs - Object containing React refs:
 *   - containerRef: the dashboard container
 *   - levelCardRef: the level/EXP card
 *   - progressBarRef: the EXP progress bar fill element
 *   - statCardsRef: array ref for stat cards (use callback refs)
 *   - bottomCardsRef: array ref for bottom section cards
 */
export function useDashboardAnimations(refs, dataLoaded) {
  const { animationLevel } = useTheme();

  useGSAP(() => {
    if (animationLevel !== 'max' || !dataLoaded) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Level card entrance
    if (refs.levelCardRef?.current) {
      tl.from(refs.levelCardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
      });
    }

    // EXP progress bar fill
    if (refs.progressBarRef?.current) {
      const targetWidth = refs.progressBarRef.current.style.width;
      tl.from(refs.progressBarRef.current, {
        width: '0%',
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      }, '-=0.3');
    }

    // Stat cards stagger
    if (refs.statCardsRef?.current?.length > 0) {
      tl.from(refs.statCardsRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
      }, '-=0.8');
    }

    // Stat value count-up
    if (refs.statValuesRef?.current?.length > 0) {
      refs.statValuesRef.current.forEach((el) => {
        if (!el) return;
        const text = el.textContent;
        const num = parseInt(text, 10);
        if (isNaN(num) || num === 0) return;

        // Only count-up pure numbers (not "45m" or "3 days")
        if (text === String(num)) {
          const obj = { val: 0 };
          tl.to(obj, {
            val: num,
            duration: 0.8,
            ease: 'power1.out',
            snap: { val: 1 },
            onUpdate: () => { el.textContent = obj.val; },
          }, '-=0.6');
        }
      });
    }

    // Bottom cards stagger
    if (refs.bottomCardsRef?.current?.length > 0) {
      tl.from(refs.bottomCardsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.15,
      }, '-=0.4');
    }
  }, { dependencies: [animationLevel, dataLoaded], scope: refs.containerRef });
}

/**
 * Hook for hover lift animation on cards (max animation level only).
 * For micro/none, CSS handles hover (or nothing).
 */
export function useCardHoverAnimation(cardRef) {
  const { animationLevel } = useTheme();

  useGSAP(() => {
    if (animationLevel !== 'max' || !cardRef?.current) return;

    const cards = Array.isArray(cardRef.current) ? cardRef.current : [cardRef.current];

    cards.forEach((card) => {
      if (!card) return;

      const onEnter = () => {
        gsap.to(card, {
          y: -4,
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      // Cleanup is handled by useGSAP's context revert
    });
  }, { dependencies: [animationLevel] });
}
```

**Step 2: Commit**

```bash
git add frontend/src/hooks/useDashboardAnimations.js
git commit -m "feat: add GSAP dashboard animation hooks"
```

---

### Task 8: Update Dashboard Component with Animation Refs

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

**Step 1: Update Dashboard.jsx to integrate animation hooks**

Replace the entire file with:

```jsx
import { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import {
  CheckSquare,
  Timer,
  Flame,
  TrendingUp,
  Zap,
  Calendar,
  Smile,
  Loader2,
} from 'lucide-react';
import { useDashboardAnimations } from '../hooks/useDashboardAnimations';
import '../styles/pages/Dashboard.css';

const moodEmoji = {
  great: { emoji: '\u{1F604}', color: 'mood-great' },
  good: { emoji: '\u{1F642}', color: 'mood-good' },
  okay: { emoji: '\u{1F610}', color: 'mood-okay' },
  bad: { emoji: '\u{1F61E}', color: 'mood-bad' },
  terrible: { emoji: '\u{1F622}', color: 'mood-terrible' },
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30000,
  });

  // Animation refs
  const containerRef = useRef(null);
  const levelCardRef = useRef(null);
  const progressBarRef = useRef(null);
  const statCardsRef = useRef([]);
  const statValuesRef = useRef([]);
  const bottomCardsRef = useRef([]);

  // Callback refs for arrays
  const setStatCardRef = useCallback((index) => (el) => {
    statCardsRef.current[index] = el;
  }, []);

  const setStatValueRef = useCallback((index) => (el) => {
    statValuesRef.current[index] = el;
  }, []);

  const setBottomCardRef = useCallback((index) => (el) => {
    bottomCardsRef.current[index] = el;
  }, []);

  // Wire up GSAP animations
  useDashboardAnimations(
    { containerRef, levelCardRef, progressBarRef, statCardsRef, statValuesRef, bottomCardsRef },
    !isLoading && !!data
  );

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="dashboard-loading-spinner" />
      </div>
    );
  }

  const d = data;

  return (
    <div className="dashboard-container" ref={containerRef}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {d.user.name}!</h1>
        <p className="dashboard-subtitle">Here's your productivity overview</p>
      </div>

      {/* Level & EXP Card */}
      <div className="dashboard-level-card" ref={levelCardRef}>
        <div className="dashboard-level-header">
          <div className="dashboard-level-info">
            <p className="dashboard-level-label">Level {d.user.level}</p>
            <p className="dashboard-level-value">{d.user.total_exp} Total EXP</p>
          </div>
          <div className="dashboard-level-icon-container">
            <Zap className="dashboard-level-icon" />
          </div>
        </div>
        <div className="dashboard-level-progress">
          <div className="dashboard-level-progress-header">
            <span>Progress to Level {d.user.level + 1}</span>
            <span>{d.user.current_exp}/{d.user.exp_to_next_level} EXP</span>
          </div>
          <div className="dashboard-level-progress-bar">
            <div
              className="dashboard-level-progress-fill"
              ref={progressBarRef}
              style={{
                width: `${Math.round((d.user.current_exp / d.user.exp_to_next_level) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          ref={setStatCardRef(0)}
          valueRef={setStatValueRef(0)}
          icon={CheckSquare}
          label="Tasks Done Today"
          value={d.tasks.today_completed}
          sub={`${d.tasks.completed} total`}
          color="stat-color-emerald"
          bg="stat-bg-emerald"
        />
        <StatCard
          ref={setStatCardRef(1)}
          valueRef={setStatValueRef(1)}
          icon={Timer}
          label="Focus Today"
          value={`${d.pomodoro.today_minutes}m`}
          sub={`${d.pomodoro.today_sessions} sessions`}
          color="stat-color-blue"
          bg="stat-bg-blue"
        />
        <StatCard
          ref={setStatCardRef(2)}
          valueRef={setStatValueRef(2)}
          icon={Flame}
          label="Current Streak"
          value={`${d.streak.current_streak} days`}
          sub={`Best: ${d.streak.longest_streak}`}
          color="stat-color-orange"
          bg="stat-bg-orange"
        />
        <StatCard
          ref={setStatCardRef(3)}
          valueRef={setStatValueRef(3)}
          icon={Calendar}
          label="Pending Tasks"
          value={d.tasks.pending}
          sub={`${d.tasks.in_progress} in progress`}
          color="stat-color-indigo"
          bg="stat-bg-indigo"
        />
      </div>

      {/* Bottom row */}
      <div className="dashboard-bottom-grid">
        <div className="dashboard-card" ref={setBottomCardRef(0)}>
          <h3 className="dashboard-card-title">
            <Smile className="dashboard-card-title-icon stat-color-yellow" />
            Today's Mood
          </h3>
          {d.today_mood ? (
            <div className="dashboard-mood-content">
              <span className="dashboard-mood-emoji">
                {moodEmoji[d.today_mood.mood]?.emoji}
              </span>
              <div className="dashboard-mood-info">
                <p className={`dashboard-mood-label ${moodEmoji[d.today_mood.mood]?.color}`}>
                  {d.today_mood.mood}
                </p>
                <p className="dashboard-mood-energy">
                  Energy: {d.today_mood.energy_level}/10
                </p>
                {d.today_mood.note && (
                  <p className="dashboard-mood-note">{d.today_mood.note}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="dashboard-mood-empty">No mood logged today</p>
          )}
        </div>

        <div className="dashboard-card" ref={setBottomCardRef(1)}>
          <h3 className="dashboard-card-title">
            <TrendingUp className="dashboard-card-title-icon stat-color-indigo" />
            Recent Activity
          </h3>
          {d.recent_exp.length > 0 ? (
            <div className="dashboard-activity-list">
              {d.recent_exp.map((exp) => (
                <div key={exp.id} className="dashboard-activity-item">
                  <div className="dashboard-activity-info">
                    <p className="dashboard-activity-description">{exp.description}</p>
                    <p className="dashboard-activity-source">{exp.source}</p>
                  </div>
                  <span className="dashboard-activity-exp">+{exp.amount} EXP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-activity-empty">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { forwardRef } from 'react';

const StatCard = forwardRef(function StatCard({ icon: Icon, label, value, sub, color, bg, valueRef }, ref) {
  return (
    <div className="dashboard-stat-card" ref={ref}>
      <div className={`dashboard-stat-icon-container ${bg}`}>
        <Icon className={`dashboard-stat-icon ${color}`} />
      </div>
      <p className="dashboard-stat-value" ref={valueRef}>{value}</p>
      <p className="dashboard-stat-label">{label}</p>
      {sub && <p className="dashboard-stat-sub">{sub}</p>}
    </div>
  );
});
```

**Step 2: Verify**

Run: `npm run dev` (from `frontend/`)
Expected: Dashboard loads with staggered card entrances (if animation level is max). Level card has glow pulse in dark mode. Stats count up. Hovering stat cards gives subtle lift. Switching animation level to micro removes GSAP animations but keeps CSS hover transitions. Setting to none makes everything instant.

**Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: integrate GSAP animations into dashboard component"
```

---

### Task 9: Final Integration and Visual Polish

**Files:**
- Verify all files work together

**Step 1: Full verification checklist**

Run: `npm run dev` (from `frontend/`)

Check each scenario:

1. **Dark mode (default):**
   - Background is dark purple-tinted (`#0f0a1a`)
   - Sidebar is `#110d1e` with subtle border
   - Dashboard cards have glass morphism (semi-transparent, blurred)
   - Level card has purple glow pulse
   - Text is light (`#f0eef5`)

2. **Light mode (toggle):**
   - Background is soft gray (`#f5f5f7`)
   - Sidebar is `#f5f5f7`
   - Cards are white with subtle shadow
   - Active nav item has white bg + purple left indicator
   - Text is dark (`#1a1a1a`)

3. **Animation max:**
   - Cards stagger in on page load
   - EXP bar animates from 0
   - Stat numbers count up
   - Card hover has GSAP lift effect

4. **Animation micro:**
   - No entrance animations
   - CSS hover transitions work (subtle transform)
   - Progress bar transition works

5. **Animation none:**
   - No transitions, no animations
   - Everything renders instantly

6. **Mobile (< 1024px):**
   - Sidebar slides in/out
   - Mobile header shows hamburger + "Mentra"
   - Overlay dims background

7. **Persistence:**
   - Set theme to light, refresh page -> stays light
   - Set animation to micro, refresh -> stays micro

**Step 2: Fix any visual issues found during verification**

Address any spacing, color, or transition issues. Common things to check:
- Sidebar width change (240px -> 260px) — ensure AppLayout main content adjusts
- Glass backdrop-filter performance on older browsers
- Theme toggle icon transition smoothness

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete sidebar & dashboard redesign with theme system and animations"
```

---

## Summary

| Task | Description | New/Modified Files |
|---|---|---|
| 1 | Theme CSS variables | Create `styles/theme.css` |
| 2 | ThemeContext | Create `contexts/ThemeContext.jsx` |
| 3 | Wire up provider + update layouts | Modify `index.css`, `AppLayout.jsx`, `AppLayout.css` |
| 4 | Restyle sidebar CSS | Modify `Sidebar.css` |
| 5 | Update sidebar component | Modify `Sidebar.jsx` |
| 6 | Restyle dashboard CSS | Modify `Dashboard.css` |
| 7 | Dashboard animation hook | Create `hooks/useDashboardAnimations.js` |
| 8 | Update dashboard component | Modify `Dashboard.jsx` |
| 9 | Final integration & visual polish | All files verification |

**Total: 3 new files, 7 modified files, 9 tasks**
