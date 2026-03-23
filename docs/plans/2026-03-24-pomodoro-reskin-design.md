# Pomodoro Page Reskin Design

**Date:** 2026-03-24
**Approach:** Incremental Reskin (restyle in place, preserve all logic)

## Problem

The Pomodoro page is architecturally inconsistent with the rest of the app. It uses inline Tailwind utilities, hardcoded colors, its own theme context with gradient backgrounds, negative margins for full-bleed layout, glassmorphism cards, and dozens of `isDark` ternaries — while every other page uses semantic CSS classes and `theme.css` custom properties.

## Decisions

- **Visual direction:** Align fully with other pages (bg-surface cards, theme variables, standard layout)
- **Watering animation:** Keep and clean up (move inline styles to CSS classes)
- **Theme picker:** Keep, but "Default" theme follows global dark/light mode; non-default themes only accent the timer card
- **Sidebar behavior:** Auto-hide when Pomodoro starts, toggle button to reopen, auto-restore on stop/complete
- **Page layout:** Keep the bento grid (timer 2/3, stats + history 1/3)
- **Implementation approach:** Incremental reskin — restyle in place, preserve JSX structure and all logic

## Design

### 1. Page Structure & Cards

**Header:** Standard app pattern.
- Left: `h1` title ("Pomodoro") + subtitle ("Focus timer & session tracker")
- Right: Theme picker button (dropdown)
- CSS classes: `.pomodoro-header`, `.pomodoro-title`, `.pomodoro-subtitle`
- Typography: `2rem / 700 / -0.04em` title, `0.9375rem / var(--text-secondary)` subtitle

**Bento Grid:** Standard card styling.
- `grid-template-columns: 1fr 1fr 1fr` desktop, `1fr` mobile
- Timer card: `grid-column: 1 / 3; grid-row: 1 / 3`
- All cards: `var(--bg-surface); border: 1px solid var(--border-default); border-radius: 12px; padding: 24px`
- Hover: `border-color: var(--card-hover-border); box-shadow: var(--card-hover-shadow)`

**No full-bleed.** Remove negative margins. Page sits within AppLayout padding.

**No `isDark` ternaries.** All colors from theme.css variables. Dark/light is automatic.

### 2. Timer Card Interior

**Water progress bar:**
- Bar background: `var(--bg-inset)`
- Fill: `var(--accent)` (or themed accent if non-default theme)
- Border-radius: 8px bar, 6px fill

**Watering animation scene:**
- Scene background: `var(--bg-inset)` with subtle border
- Keep scene morph (circle idle → rounded rect running)
- Move inline positioning to CSS classes (`.pom-kran`, `.pom-drop`, `.pom-can`) with CSS custom properties for dynamic values
- Keep all keyframe animations

**Timer display:** `4rem / 700 / var(--text-primary) / -0.04em`. Keep pause-pulse and stop-shake animations.

**Duration selector:** Segment/pill pattern matching Tasks page view tabs.
- Container: `var(--bg-inset); border: 1px solid var(--border-default); border-radius: 12px; padding: 0.25rem`
- Active: `var(--bg-surface); box-shadow: var(--shadow-sm)`
- Inactive: transparent

**Task selector:** `var(--input-bg); border-radius: 10px`

**Control buttons:**
- Start: `var(--accent); color: var(--text-on-accent); border-radius: 10px`
- Pause: `var(--bg-hover); border: 1px solid var(--border-default)`
- Stop: `var(--danger-bg); color: var(--danger); border: 1px solid var(--danger-border)`
- Keep press animations (scale bounce, shake)

### 3. Sidebar Auto-Hide (Focus Mode)

**Trigger:** `startMutation` success dispatches `pomodoro:started` on `window`.

**AppLayout listens** for `pomodoro:started`, `pomodoro:stopped`, `pomodoro:completed`.

**Sidebar slide-out:**
- CSS class `.sidebar-focus-hidden` on sidebar
- `transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- Content area expands to fill space
- Toggle button appears on left edge: `>` chevron, `var(--bg-surface)` with border, `border-radius: 0 8px 8px 0`

**Toggle button:** Click slides sidebar in/out. Only visible during running session.

**Auto-restore:** On `pomodoro:stopped` or `pomodoro:completed`, sidebar slides back, toggle disappears.

**Session recovery:** On mount, if running session detected, trigger sidebar hide.

**State:** `focusMode` boolean in AppLayout, controlled by custom events (keeps Pomodoro decoupled from layout).

### 4. Theme Picker & Accent System

**Default theme:** Uses standard `theme.css` variables everywhere. No special colors. Respects global dark/light.

**Non-default themes (Sunset, Ocean, Forest, Lavender, Midnight, Rose):**
- Each defines accent palette: primary, light, dark, bg-tint
- Applied ONLY to timer card:
  - Progress bar fill uses theme accent
  - Scene background: `color-mix(in srgb, var(--pom-theme-accent) 8%, var(--bg-inset))`
  - Timer text stays `var(--text-primary)`
  - Start button uses theme accent
- Stats and history cards remain standard
- Implementation: CSS custom properties on timer card element (`--pom-theme-accent`, `--pom-theme-accent-bg`)

**Theme picker UI:**
- Palette icon button in header
- Dropdown: `var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 12px; box-shadow: var(--shadow-lg)`
- Color swatches with check mark on active
- Persisted in localStorage

### 5. Cleanup

**Dead code removal:**
- Delete legacy "cat feeding" CSS (`.pomodoro-cat-scene`, `.pomodoro-cat-emoji`, `.pomodoro-food-progress`, etc.)
- Remove unused layout selectors (`.pomodoro-wrapper`, `.pomodoro-container`, `.pomodoro-timer-card`, `.pomodoro-grid`)
- Remove old button selectors (`.pomodoro-start-btn`, `.pomodoro-pause-btn`, `.pomodoro-stop-btn`)

**Consolidate CSS:** Merge co-located `pages/Pomodoro.css` (animations) and `styles/pages/Pomodoro.css` (structural) into single file at `styles/pages/Pomodoro.css`.

**Remove Tailwind from JSX:** Replace all inline utilities with semantic CSS classes. No more `isDark` conditionals.

**Simplify PomodoroThemeContext:**
- Remove `dark` boolean from theme objects
- Keep: `accent`, `accentLight`, `accentDark`, `accentBg`
- Add `"default"` preset returning null values (signals "use global theme variables")
- Remove `isPomodoroPage` from context

**Preserve all functional behavior:** Timer logic, session recovery, React Query mutations, cross-page animation persistence, `prefers-reduced-motion` support — all untouched.
