# Archipelago Dashboard Design

**Date:** March 19, 2026  
**Status:** Approved  
**Target:** Transform the dashboard into an innovative, game-like island map experience

---

## Overview

Replace the current analytics-focused dashboard with an **archipelago map system** where main navigation items become explorable islands. This creates a visually distinctive, engaging experience that matches Mentra's gamification philosophy. Users can navigate via interactive islands, with fallback to simplified dashboard mode.

---

## Architecture & Layout

### Desktop Experience (≥ 1024px)

Two display modes (user-selectable via Settings):

**1. Map Mode (Default)**
- SVG-based archipelago viewport with 6 explorable islands
- Pan/zoom functionality (mouse drag to move, scroll to zoom)
- Floating HUD: hamburger menu (top-left) | Level/EXP bar + streak (top-center)
- Floating sidebar overlay (hamburger toggle)
- Smooth fade/slide animations on navigation

**2. Simplified Dashboard Mode**
- Card-based grid layout with key productivity metrics
- Normal fixed sidebar (not floating)
- Identical cards to mobile experience
- User can toggle between modes anytime via Settings

### Mobile Experience (< 1024px)

- Always displays simplified dashboard mode (no map toggle)
- Normal sidebar overlay (existing behavior)
- Optimized for touch and smaller screens
- Settings toggle for dashboard mode is hidden on mobile

### Tablet (768px - 1023px)

- Treated as mobile experience
- Simplified dashboard mode only
- Can be enhanced in future iterations

---

## Island Map System

### SVG Canvas Structure

**Container:**
- Parent: `<div class="map-viewport">` with fixed dimensions
- SVG: `viewBox="0 0 1200 800"` to maintain aspect ratio
- Responsive: scales to fit desktop viewport

**6 Islands (Organic Scatter Pattern):**

| Island | Position | Color Theme | Navigation |
|--------|----------|-------------|------------|
| Task Island | ~(200px, 150px) | Blue gradient | `/tasks` |
| Pomodoro Island | ~(900px, 200px) | Red/Orange gradient | `/pomodoro` |
| Forest Island | ~(150px, 550px) | Green gradient | `/forest` |
| Schedules Island | ~(600px, 600px) | Purple gradient | `/schedules` |
| AI & Chat Island | ~(950px, 650px) | Cyan gradient | `/chat` |
| Forum Island | ~(500px, 250px) | Yellow gradient | `/forum` |

**Island Design:**
- Each island: SVG group with placeholder shape (circle/oval)
- Placeholder SVG icon in center (easily replaceable with custom asset)
- Island label: text beneath/inside island
- Styling: CSS gradients, hover scale effect (1.1x), shadow on hover
- Visual polish: subtle border, opacity transitions

**Water Background:**
- Light blue gradient or solid color
- Optional: subtle wave pattern (SVG path, non-animated)
- Low visual noise to keep focus on islands

---

## Pan & Zoom Functionality

### Interaction Model

**Pan (Mouse Drag):**
- Click and drag anywhere on map to move viewport
- GSAP smooths the panning animation
- Easing: `power2.inOut` for natural feel
- Immediate feedback on drag

**Zoom (Mouse Wheel):**
- Scroll to zoom in/out
- Min zoom: 0.8x (zoomed out, see all islands)
- Max zoom: 3x (detailed view)
- Zoom maintains cursor center point
- Duration: 0.3s smooth transition

**Auto-Fit on Load:**
- Map starts at 1x zoom, all islands visible
- Serves the "convenience" and "visibility" requirement

### GSAP Integration

**Implementation:**
- `useGSAP()` hook for animation lifecycle management
- Smooth pan animations: `gsap.to(mapElement, { x, y, duration: 0.4, ease: "power2.inOut" })`
- Zoom animations: `gsap.to(mapElement, { scale, duration: 0.3, ease: "power2.inOut" })`
- No animation library bloat; GSAP already in project

**CSS Transforms:**
- SVG wrapper uses `transform: translate(x, y) scale(z)`
- CSS-native implementation (no Canvas API)
- GPU-accelerated for smooth 60fps performance

---

## Top HUD (Floating UI)

### Layout

```
[≡] Hamburger     [LVL 12] [████░] EXP     [🔥 7 Day Streak]
  (left)        (center-left)              (center-right)
```

### Components

**1. Hamburger Menu (Top-Left)**
- Icon: Lucide React `Menu` icon
- Toggles floating sidebar overlay
- Fixed position: `top: 1rem; left: 1rem; z-index: 50`
- Click to open/close sidebar with slide animation

**2. Level & EXP Bar (Top-Center-Left)**
- Display: "LVL 12" + horizontal progress bar
- EXP bar: gradient fill (theme-colored)
- Dimensions: ~200px wide, 24px tall
- Pulls data from existing user context/API
- Fixed position: calculated to be center-left of HUD

**3. Streak Counter (Top-Center-Right)**
- Display: 🔥 "7 Day" or "7" (configurable format)
- Pulls from existing Pomodoro/gamification context
- Fixed position: beside EXP bar (top-center-right)
- Minimal, elegant presentation

### Styling

**Container:**
- Semi-transparent background with backdrop blur (CSS `backdrop-filter`)
- Subtle shadow for depth
- Padding: 0.75rem horizontal, 0.5rem vertical
- Border: optional subtle 1px border

**Text & Icons:**
- High contrast for readability
- Font: inherit from app theme
- Icon size: 1.25rem

**Animations:**
- Fade-in on component mount (0.4s, ease-in)
- Smooth opacity transitions (0.3s)

---

## Island Click Behavior & Navigation

### On Island Click (Leaving Map)

**1. Fade Out Animation (0-0.3s)**
- Map content opacity: 1 → 0 (GSAP)
- HUD opacity: 1 → 0 (GSAP, same duration)
- Easing: `power1.inOut`

**2. Sidebar Animation (0-0.3s)**
- Floating sidebar slides out (translateX(-100%), simultaneously with fade)
- GSAP easing: `power2.inOut`

**3. Navigation & Page Load (0.3-0.6s)**
- React Router navigation to target page
- Sidebar becomes fixed (normal layout on target page)
- New page content fades in (0.3s, GSAP)
- User sees: normal page + fixed sidebar

### On Return to Dashboard

**1. Fade Out Current Page (0-0.3s)**
- Current page opacity: 1 → 0 (GSAP)

**2. Sidebar Animation (0-0.3s)**
- Sidebar slides back to floating state
- Sidebar opacity fades in simultaneously

**3. Map Animation (0.3-0.6s)**
- Map + HUD fade in (0.3s, GSAP)
- Optional: islands appear with staggered entrance (0.1s stagger between each)
- Map camera position: returns to default zoom/pan

### User Experience

- **Smooth choreography:** All animations coordinate (no jarring transitions)
- **Duration:** Total navigation time ~0.6s (quick, not sluggish)
- **Reversibility:** Returning to dashboard is mirror animation of leaving
- **Consistency:** Same transition effect for all islands

---

## Simplified Dashboard Mode

### Layout

**Card-based grid system:**
- `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- Responsive: 1 column (mobile) → 2-3 columns (desktop)
- Gap: 1.5rem between cards

### Cards Displayed

1. **Today's Tasks**
   - Active count, overdue count, completed count
   - Quick action button: "+ Add Task"
   - Color: blue theme

2. **Pomodoro Stats**
   - Sessions completed today
   - Weekly streak indicator (with fire icon)
   - Quick action: "Start Pomodoro" button
   - Color: red/orange theme

3. **Schedule Preview**
   - Next 3 events for today (compact list)
   - Time and title for each
   - Color: purple theme

4. **Weekly Summary**
   - Total tasks completed this week
   - Daily breakdown (mini bar chart or simple numbers)
   - Color: teal theme

5. **Forest Health**
   - Current tree status (image + level)
   - Quick action: "Water Tree" button
   - Color: green theme

6. **Quick Actions**
   - Action buttons: Start Pomodoro, Add Task, View Schedule, Visit Forest
   - Accessible buttons with icons + text
   - Color: neutral (background-only)

### Styling

- Card: subtle shadow, border-radius, hover scale effect (1.02x)
- Title: bold, 1.1rem
- Content: clean typography, good spacing
- Action buttons: prominent, theme-colored
- Responsive: full-width on mobile, grid on desktop
- No floating sidebar; normal fixed sidebar on desktop
- Same color palette as map mode

---

## Settings Page (New)

### Route

`/settings` (accessible from floating sidebar or account menu)

### Content

**Dashboard Display Mode** (Desktop only, hidden on mobile):
- Section title: "Dashboard Display"
- Two radio button options:
  1. "Map Mode (Innovative)" — Archipelago experience
  2. "Simplified Dashboard (Focus)" — Card grid layout
- Saves selection to `localStorage` key: `dashboard-mode`
- Persists across sessions

**Expandable Settings** (Future):
- Theme preferences (light/dark/auto)
- Notification settings
- Account details
- Password change
- etc.

### Responsive Behavior

- **Desktop:** Dashboard mode toggle visible and functional
- **Mobile:** Toggle hidden; always uses simplified dashboard
- **Settings UI:** Standard form layout, accessible design

---

## State Management & Data Flow

### New Context/Hook

**`useDashboardMode` Hook:**
```javascript
const { mode, setMode } = useDashboardMode();
// Returns: "map" | "simplified"
// Persists to localStorage
```

**Where it's used:**
- Dashboard component: conditionally renders map or simplified dashboard
- Settings page: displays current mode, allows toggle
- On mount, reads localStorage to restore user preference

### Data Dependencies

**Level/EXP Data:**
- Source: existing user context or API (no new data fetching needed)
- Used in: HUD Level/EXP bar

**Streak Counter:**
- Source: existing Pomodoro context or gamification system
- Used in: HUD streak display

**Task/Schedule/Forest Data:**
- Source: existing API calls (no changes needed)
- Used in: simplified dashboard cards

**Animation State:**
- Managed by GSAP via `useGSAP` hook
- Cleanup: automatic on component unmount

### Component Structure

```
Dashboard.jsx
├── (if map mode)
│   ├── MapViewport.jsx (SVG canvas, pan/zoom)
│   ├── HUD.jsx (hamburger, level, streak)
│   ├── FloatingSidebar.jsx
│   └── IslandClickHandler (navigation logic)
│
└── (if simplified mode)
    ├── SimplifiedDashboard.jsx (card grid)
    ├── Sidebar.jsx (normal fixed)
    └── (same card components)

Settings.jsx
├── DashboardModeToggle.jsx
└── (other settings sections)
```

---

## Responsive Behavior & Mobile Fallback

### Desktop (≥ 1024px)

✅ **Map mode available:**
- Full archipelago experience
- Pan/zoom enabled
- Floating HUD and sidebar
- Settings toggle active (can switch to simplified mode)

✅ **Simplified mode available:**
- Card grid layout
- Normal fixed sidebar
- Settings toggle active (can switch back to map mode)

✅ **User choice:**
- Preference saved to localStorage
- Persists across sessions

### Mobile (< 1024px)

✅ **Always simplified dashboard:**
- No map rendering
- No pan/zoom logic
- Normal sidebar overlay (existing behavior)
- Settings dashboard mode toggle is **hidden**
- Optimized card grid for touch/mobile viewports

✅ **Why not map on mobile?**
- Pan/zoom is cumbersome on touch devices
- Small screen doesn't benefit from archipelago aesthetic
- Pomodoro is designed for desktop (as you noted)
- Simplified dashboard provides faster, clearer access to key metrics

### Implementation Detail

**Viewport Detection:**
```javascript
const isDesktop = window.innerWidth >= 1024;

// In Dashboard component:
return isDesktop && mode === "map" ? <MapMode /> : <SimplifiedMode />;

// In Settings component:
return isDesktop ? <DashboardModeToggle /> : null;
```

---

## Technical Stack

**Frontend:**
- React 19 + React Router v7
- GSAP v3.14.2 + @gsap/react v2.1.2 (useGSAP hook)
- Tailwind CSS v4 + custom CSS modules
- Lucide React (icons)

**Styling Approach:**
- CSS-native: SVG + CSS transforms (no Canvas API)
- No new dependencies
- GSAP for smooth animations (already available)

**Browser Compatibility:**
- Modern browsers (CSS transforms, SVG, GSAP)
- Graceful fallback: if GSAP fails, animations degrade to instant transitions

---

## Success Criteria

✅ **Map mode is visually distinctive** — archipelago aesthetic differentiates from standard dashboard  
✅ **6 islands rendered** — Tasks, Pomodoro, Forest, Schedules, AI & Chat, Forum  
✅ **Organic scatter layout** — islands feel like natural archipelago, encourage exploration  
✅ **Pan/zoom functional** — mouse drag and scroll work smoothly, all islands visible on load  
✅ **Smooth transitions** — fade/slide animations between map and other pages (0.6s total)  
✅ **Floating HUD** — hamburger, level bar, and streak visible in top bar  
✅ **Simplified dashboard works** — card grid shows key metrics, responsive  
✅ **Settings toggle** — desktop users can switch between map and simplified mode  
✅ **Mobile fallback** — mobile users always see simplified dashboard  
✅ **CSS-native** — no Canvas API, all transforms via CSS  
✅ **GSAP integrated** — smooth animations using existing GSAP library  
✅ **Responsive** — works on desktop, tablet, mobile with appropriate fallbacks

---

## Future Enhancements (Out of Scope)

- Custom island assets/illustrations (currently placeholders)
- Wave animation in water background
- Island tooltips on hover
- Minimap for quick navigation
- Mobile map mode (could revisit if user engagement warrants)
- Advanced analytics dashboard (separate from navigation)
- Animated particles or effects around islands

---

## Questions & Notes

- **Placeholder Islands:** SVG circles with text labels; easily replaced with custom assets
- **Color Assignments:** Each island gets a unique gradient; finalize exact colors during implementation
- **Animation Timing:** All durations (0.3s fade, 0.6s total transition) are configurable
- **GSAP Licensing:** Project already has GSAP v3.14; no additional licensing needed
- **Accessibility:** SVG will include ARIA labels; floating HUD has proper `tabindex` and keyboard support
