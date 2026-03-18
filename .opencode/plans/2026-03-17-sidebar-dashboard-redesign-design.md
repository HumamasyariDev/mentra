# Sidebar & Dashboard Redesign

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Sidebar restyling, dashboard restyling, dark/light theme system, animation preference system

## Goal

Restyle the sidebar and dashboard to match the visual aesthetic from `frontend/public/design_example.png` (clean, rounded cards, soft shadows, refined typography). Add a dark/light mode toggle (dark default) with colors consistent with the landing page's indigo-to-purple gradient scheme. Add GSAP-powered animations with a 3-tier preference system (Max / Micro / None).

## Architecture: ThemeContext + CSS Custom Properties

A new `ThemeContext` React context manages two preferences:

- **Theme:** `"dark"` (default) or `"light"` -- sets `data-theme` attribute on `<html>`
- **Animation level:** `"max"` (default), `"micro"`, or `"none"` -- sets `data-animation` attribute on `<html>`

Both are persisted in localStorage (`mentra_theme`, `mentra_animation_level`). If the OS has `prefers-reduced-motion: reduce` and no stored preference exists, animation defaults to `"none"`.

The context wraps `AppLayout` only. The landing page keeps its own scoped dark-only styles.

### CSS Variable Strategy

All theme-dependent colors are defined as `--th-*` variables in a new `theme.css` file:

| Variable | Light | Dark |
|---|---|---|
| `--th-bg` | `#f5f5f7` | `#0f0a1a` |
| `--th-surface` | `#ffffff` | `#1a1525` |
| `--th-text` | `#1a1a1a` | `#f0eef5` |
| `--th-text-muted` | `#86868b` | `#8b82a8` |
| `--th-border` | `#e8e8ed` | `rgba(255,255,255,0.08)` |
| `--th-hover` | `#e8e8ed` | `rgba(255,255,255,0.06)` |
| `--th-shadow` | `0 1px 3px rgba(0,0,0,0.06)` | `0 1px 3px rgba(0,0,0,0.3)` |
| `--th-accent` | `#6366f1` | `#6366f1` |
| `--th-accent-gradient` | `linear-gradient(135deg, #6366f1, #8b5cf6)` | Same |

Light mode variables live in `:root` and `[data-theme="light"]`. Dark mode overrides in `[data-theme="dark"]`.

Existing hardcoded hex values in Sidebar.css, Dashboard.css, and AppLayout.css are replaced with `var(--th-*)` references.

The `[data-animation="none"]` selector globally disables all CSS `transition-duration` and `animation-duration`.

## Sidebar Restyling

The sidebar keeps its flat 8-item navigation list. Visual changes:

- **Logo:** "M" icon background changes from black to indigo-to-purple gradient
- **Active nav indicator:** White bg (light) or subtle highlight bg (dark) + 3px left border with purple gradient, implemented as `::before` pseudo-element
- **Colors:** All hardcoded values replaced with `var(--th-*)` references
- **Dark mode sidebar bg:** `#110d1e` (slightly lighter than page background)
- **Theme toggle:** Sun/moon icon button placed between nav list and account section, at the sidebar bottom
- **Animation setting:** Sparkles/zap/minus icon button that cycles through max -> micro -> none on click, placed next to the theme toggle

## Dashboard Restyling

Existing content is preserved (Level/EXP card, 4-stat grid, Mood card, Recent Activity). Visual changes:

- **Card border radius:** 12px -> 16px
- **Card shadows:** Added subtle `var(--th-shadow)`
- **Card backgrounds:** `var(--th-surface)` in light mode; glassmorphism (`rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)`) in dark mode
- **Card borders:** `var(--th-border)`
- **Level card gradient:** Updated to `#6366f1` -> `#8b5cf6` (indigo to violet). In dark mode, adds outer glow `box-shadow: 0 0 30px rgba(99,102,241,0.15)`
- **Stat icon backgrounds (dark mode):** Pastel backgrounds become semi-transparent colored backgrounds (e.g., `rgba(16,185,129,0.15)` for emerald)
- **Typography:** All text colors replaced with `var(--th-text)` and `var(--th-text-muted)`
- **Semantic colors** (mood colors, activity EXP green) stay unchanged across themes

## Animation System

### Max (GSAP-powered)

- Dashboard card stagger entrance: fade in + slide up, 0.1s stagger, `power2.out`
- EXP bar fill: `from({width: 0})`, `elastic.out`, 1.2s
- Stat number count-up: `from({innerText: 0})` with snap, 0.8s
- Card hover: GSAP `quickTo` for `y` (-4px) + shadow enhancement
- Sidebar active indicator: GSAP spring animation on `::before` height/opacity
- Theme toggle icon: 180deg rotation
- Level card glow pulse (dark mode): CSS keyframes, 3s loop

### Micro (CSS transitions only)

- Card hover lift: `transition: transform 0.2s, box-shadow 0.2s`
- Sidebar active indicator: `transition: height 0.2s`
- Progress bar fill: `transition: width 0.7s` (existing)
- Theme toggle: `transition: transform 0.3s`

### None

- `[data-animation="none"]` CSS rule kills all transitions and animations
- GSAP code gated behind `animationLevel !== "none"` checks
- `prefers-reduced-motion: reduce` auto-defaults to this tier

All GSAP animations wrapped in `useDashboardAnimations(refs, animationLevel)` hook using `useGSAP` from `@gsap/react` for cleanup.

## Files

### New (3)

| File | Purpose |
|---|---|
| `src/contexts/ThemeContext.jsx` | Theme + animation level context |
| `src/styles/theme.css` | CSS variable definitions |
| `src/hooks/useDashboardAnimations.js` | GSAP dashboard animation hook |

### Modified (7)

| File | Changes |
|---|---|
| `src/index.css` | Import theme.css, update `:root` vars |
| `src/layouts/AppLayout.jsx` | Wrap with ThemeProvider |
| `src/styles/layouts/AppLayout.css` | Replace hardcoded colors |
| `src/components/Sidebar.jsx` | Add theme toggle, animation button, useTheme() |
| `src/styles/components/Sidebar.css` | Restyle, active indicator, dark mode |
| `src/pages/Dashboard.jsx` | Add refs, use animation hook |
| `src/styles/pages/Dashboard.css` | Replace colors, glassmorphism, shadows |

### Not in scope

- Landing page, auth pages, other app pages (Tasks, Pomodoro, etc.)
- Backend
