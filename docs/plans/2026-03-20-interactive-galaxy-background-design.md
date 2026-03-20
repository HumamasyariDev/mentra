# Interactive Galaxy Background Design

**Date:** March 20, 2026  
**Project:** Mentra Dashboard Map  
**Objective:** Enhance the map viewport with an immersive, interactive galaxy background while maintaining 60fps performance.

---

## Overview

Transform the dashboard map from a minimal starfield into a living, interactive cosmic environment. The design balances atmospheric immersion (animated parallax galaxy, particle effects) with playful interactivity (clickable debris with physics, cursor particle trail) — all optimized for 60fps performance.

---

## Architecture & Approach: Canvas + SVG Hybrid

### Why This Approach?
- **Canvas layer:** Handles expensive galaxy animation/parallax (cheap re-draws, no geometry recalculation)
- **SVG layer:** Keeps interactive debris and particle trail in native SVG for easy click handling and consistency with current MapViewport
- **Clean separation:** Static parallax vs. dynamic interactivity
- **Performance:** Achieves 60fps target on most devices

### Layer Stack (Bottom to Top)
1. **Canvas Layer** — Animated Milky Way galaxy with parallax (rendered once, updated each frame)
2. **SVG Layer** — Current MapViewport content (nebulas, stars, planets, debris, particles)
3. **UI Layer** — Floating UI, sidebar, controls (z-index 50+)

---

## System 1: Canvas Galaxy Parallax

### Visual Design
- **Galaxy style:** Realistic Milky Way rendering with spiral arms, layered gradients
- **Color palette:** Deep purples, blues, with bright white/yellow galactic core
- **Animation:** Slow rotation (~0.5°/sec) around center, continuous loop

### Parallax Effect
- **Parallax factor:** 0.3–0.5 (galaxy moves at 30–50% of user's pan movement)
- **Behavior:** As user pans map, galaxy translates partially, creating depth illusion
- **Zoom interaction:** Galaxy scale stays fixed (doesn't zoom with content)
- **Result:** Feels like galaxy is far behind the interactive layer

### Implementation
- Canvas element positioned behind SVG via CSS z-index
- Galaxy rendered at viewport dimensions
- Re-renders on window resize
- Each frame: update parallax translation + rotation angle (cheap operation)
- requestAnimationFrame @ 60fps cap
- **No full re-draw each frame** — only transform/rotation applied

---

## System 2: Interactive Debris

### Debris Spawning & Management
- **Manager component:** DebrisManager spawns/destroys pieces to maintain 5–10 active debris
- **Spawn location:** Random position within viewport bounds + padding (enters from edges)
- **Variations:** 3 SVG placeholder asteroid shapes (simple polygons)
- **Lifespan:** 8–12 seconds natural fade-out before removal
- **Z-index:** Rendered between stars and planets (never occludes planets or UI)

### Physics & Interaction
- **Click behavior:** Single click splits debris into 2 smaller pieces
- **Velocity:** Pieces travel in opposite directions (away from click point)
- **Gravity:** Optional subtle downward drift for realism
- **Collisions:** Pieces can collide and split once (max 1 generation deep to prevent explosion)
- **Fade-out:** After split or lifespan end, fade opacity to 0 over 1–2 seconds, then remove from DOM

### SVG Rendering
- Debris rendered as grouped `<g>` elements with:
  - Opacity: 0.6–0.8 (semi-transparent)
  - Glow filter (feGaussianBlur for cosmic effect)
  - Transform applied via JS for physics
  - Click handler for split behavior

### Safety Constraints
- **Never blocks planets:** Rendered behind planet layer
- **Never blocks UI:** Planets + UI have higher z-index
- **Memory safe:** Removed from DOM after fade completes

---

## System 3: Cursor Particle Trail

### Particle Generation
- **Trigger:** Spawns on cursor movement over SVG viewport
- **Frequency:** One particle every 15–20ms (smooth trail)
- **Visual:** Small glowing circles (3–5px radius), semi-transparent white/blue
- **Glow:** SVG feGaussianBlur filter for luminous effect
- **Lifespan:** 800–1000ms from spawn

### Particle Animation
- **Initial movement:** Follows cursor briefly, then gentle drift (downward/outward)
- **Fade:** Opacity decreases from 0.8 → 0 over lifespan
- **Cleanup:** Removed from DOM after fade completes
- **Performance:** No continuous array of particles; each removed after lifespan

### Visual Result
- "Stardust" effect: subtle, not distracting
- Always visible (doesn't disappear when cursor leaves map)
- Z-index: In front of debris, behind planets

---

## Integration with Current MapViewport

### Existing Code Unchanged
- Planet interaction logic remains identical
- Nebula/star rendering unaffected
- Zoom/pan behavior preserved

### New Components
- **GalaxyCanvas:** New component managing canvas rendering
- **DebrisManager:** New hook managing debris lifecycle + physics
- **ParticleTrail:** New hook managing cursor particle spawning

### File Structure
```
frontend/src/components/dashboard/
├── MapViewport.jsx (modified: add canvas + managers)
├── GalaxyCanvas.jsx (new)
├── hooks/
│   ├── useDebrisManager.js (new)
│   └── useParticleTrail.js (new)

frontend/src/styles/components/dashboard/
├── MapViewport.css (modified: add canvas z-index)
├── GalaxyCanvas.css (new)
```

---

## Performance Targets

- **Frame rate:** 60fps on most devices (graceful degradation on older hardware)
- **Canvas re-draws:** Rotation + parallax transform only (no geometry recalculation)
- **Debris count:** 5–10 concurrent pieces (capped)
- **Particle cleanup:** Immediate removal after fade (no memory leak)
- **Zoom/pan impact:** No slowdown; canvas parallax update is O(1) operation

---

## Success Criteria

✅ Galaxy parallax background animates smoothly at 60fps  
✅ Debris spawns/despawns naturally as viewport pans  
✅ Debris splits on click with physics velocity  
✅ Cursor particle trail spawns on movement, fades out naturally  
✅ No UI elements blocked (planets, hamburger, exp bar always clickable)  
✅ Immersive atmosphere + playful interactivity balance maintained  
✅ No performance regression on current map interaction  

---

## Future Enhancements (Out of Scope)

- Video-based galaxy parallax (if desired later)
- Debris SVG assets (currently placeholders)
- Additional collision behaviors (bounce, stick to cursor, etc.)
- Sound effects for debris splits
- Difficulty levels/modes affecting debris spawn rate

---

## Notes

- **No commits until user approval** on design and implementation
- Video approach discussed but deferred; can revisit if needed
- Placeholder SVG debris can be replaced with real assets anytime
- Design prioritizes performance (Approach 1: Canvas + SVG Hybrid)
