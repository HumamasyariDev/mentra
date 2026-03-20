# Interactive Galaxy Background System - Performance Test Report

## Task 6: Performance Analysis & Optimization

**Date:** March 20, 2026  
**Status:** In Progress - Baseline Analysis Complete

---

## Executive Summary

The interactive galaxy background system consists of:
- **GalaxyCanvas.jsx**: Canvas-based Milky Way rendering with parallax + SVG debris/particle overlay
- **useDebrisManager.js**: Physics simulation for 5-10 debris pieces with splitting behavior
- **useParticleTrail.js**: Cursor particle trail with max 100 particles
- **MapViewport.jsx**: Integration layer with pan/zoom, animation loop

This report documents baseline performance metrics, identified bottlenecks, optimizations applied, and final verification results.

---

## Part 1: BASELINE PERFORMANCE ANALYSIS

### Code Review Findings

#### 1. **GalaxyCanvas.jsx** (Lines 1-219)

**Current Implementation:**
- Canvas redraws entire galaxy every frame (rotation animation + starfield + nebula)
- SVG layer renders debris and particles via React (map function)
- Animation loop via requestAnimationFrame at 60fps target

**Identified Issues:**
- ❌ **Every-frame redraw**: `drawGalaxy()` is called every frame even if viewport unchanged
  - Starfield procedural generation runs per frame (expensive calculation)
  - Nebula radial gradient recreated every frame
  - Concentric circles redrawn every frame
- ❌ **No memoization**: GalaxyCanvas not wrapped with React.memo
- ❌ **SVG re-renders**: Debris/particles arrays trigger full SVG re-render on every state change
- ⚠️ **Callback dependencies**: `drawGalaxy` callback depends on nothing, good but unused
- ✅ **Good**: Uses refs for viewport state (avoids unnecessary re-renders)

**Performance Impact:** ~5-8ms per frame for canvas redraw

#### 2. **useDebrisManager.js** (Lines 1-191)

**Current Implementation:**
- Debris physics updates every frame via `setDebris()` 
- Updates all debris in map/filter pattern (immutable)
- Auto-spawn via interval (500ms check, spawn max 5)
- Max debris: 10 pieces enforced

**Identified Issues:**
- ❌ **Per-frame immutable updates**: Creates new array and objects every frame
  - `map()` + `filter()` runs even with 0 debris
  - Spreads entire debris object for each piece: `...piece, x, y, ...`
  - Triggers React re-render even if no visual change
- ❌ **Object pooling missing**: New debris objects created on spawn/split
- ❌ **Debris not culled**: Off-screen debris still physics-calculated
- ❌ **Generation limit only 1**: Wastes complexity for only 2-4 debris pieces max
- ✅ **Good**: Friction/bounce physics is simple (fast)

**Performance Impact:** ~2-3ms per frame for debris updates + React re-render

#### 3. **useParticleTrail.js** (Lines 1-183)

**Current Implementation:**
- Particle spawning on mousemove (min 15ms interval = ~67 particles/sec max)
- Max 100 particles, oldest discarded
- Particle cleanup via setInterval (16ms, ~62fps)
- Every particle updates opacity on cleanup

**Identified Issues:**
- ❌ **Update interval not RAF**: Uses setInterval(16) instead of requestAnimationFrame
  - Can drift and cause jank if main thread busy
- ❌ **Per-particle opacity calculation**: Maps all particles to update opacity
  - Even if particles haven't aged much
- ❌ **Particle objects created per spawn**: New object every 15ms
- ❌ **Distance calculation expensive**: `Math.sqrt()` every mousemove
- ❌ **No particle pooling**: No reuse of old particle objects
- ✅ **Good**: Debounces spawn with distance + time

**Performance Impact:** ~1-2ms per frame for particle updates

#### 4. **MapViewport.jsx** (Lines 1-360)

**Current Implementation:**
- GSAP pan/zoom with animation loop
- Debris + particle updates called every frame via RAF
- Event listeners: wheel, mousedown, mousemove, mouseup
- Manual RAF loop for physics updates

**Identified Issues:**
- ❌ **Multiple RAF loops**: GalaxyCanvas has own RAF, MapViewport has own RAF
  - Not synchronized = potential jank
- ❌ **Heavy mouse event handling**: `handleMouseMove` on every pixel (no debounce)
  - Calls `getScreenCTM()` every move (DOM query)
- ❌ **No React.memo**: MapViewport re-renders unnecessarily
- ⚠️ **SVG transform via attribute**: Better than CSS but still DOM write each frame

**Performance Impact:** ~1-2ms per frame for pan/zoom handling

#### 5. **Rendering Performance**

**SVG Rendering Issues:**
- Debris: 10 `<g>` groups + polygons/circles = low count, but:
  - Each has click handler (event listener overhead)
  - Each has `transform`, `opacity` attributes updated per render
- Particles: 100 `<circle>` elements, creates/destroys constantly
  - React key issues: particles reorder as old ones die = reconciliation overhead
  - No key stability

---

## Part 2: PERFORMANCE BOTTLENECK ANALYSIS

### Critical Path Analysis (60fps target = 16.67ms per frame)

**Current Estimated Frame Budget Breakdown:**

```
Animation Loop:
├─ GalaxyCanvas RAF tick
│  ├─ drawGalaxy() canvas render: ~5-8ms
│  └─ SVG re-render (debris/particles): ~2-3ms
├─ MapViewport RAF tick
│  ├─ updateDebris(): ~1-2ms
│  ├─ updateParticles(): ~1-2ms
│  └─ Event handling (mousemove): ~0.5-1ms
├─ Browser compositing: ~1-2ms
└─ Headroom: ~2-3ms

TOTAL ESTIMATED: ~13-19ms per frame (on edge of 60fps)
```

### Stress Test Projections

**Idle State (no interaction):**
- Expected: 60fps (canvas only)
- Actual estimate: ~7-10ms = 60fps ✅

**Cursor Trail (1 particle/frame):**
- Expected: 60fps (minimal particles)
- Actual estimate: ~9-12ms = 60fps ✅

**Debris Click (spawn 2 children):**
- Expected: 55-60fps (10 debris + 100 particles)
- Actual estimate: ~14-16ms = 60fps (just barely) ⚠️

**Max Stress (10 debris + 100 particles + panning):**
- Expected: 50-55fps minimum
- Actual estimate: ~17-20ms = 50fps (at risk) ⚠️

**Mobile (if applicable):**
- Expected: 45-50fps
- Actual estimate: ~15-18ms = 55fps (mobile GPU slower) ⚠️

---

## Part 3: RECOMMENDED OPTIMIZATIONS

### Priority 1: High Impact, Low Risk

#### Optimization 1.1: Memoize GalaxyCanvas
**File:** `GalaxyCanvas.jsx`  
**Change:** Wrap export with `React.memo`  
**Reason:** Prevents re-render when parent re-renders, props unchanged  
**Impact:** -1-2ms per frame on parent re-render  
**Risk:** Low

#### Optimization 1.2: Cache Starfield Canvas
**File:** `GalaxyCanvas.jsx`  
**Change:** Draw starfield to off-screen canvas once, reuse each frame  
**Reason:** Procedural starfield generation expensive, only redraw on viewport change  
**Impact:** -2-3ms per frame  
**Risk:** Low

#### Optimization 1.3: Use RAF Debouncer for Mousemove
**File:** `MapViewport.jsx`  
**Change:** Throttle mousemove events using RAF  
**Reason:** Currently fires every pixel moved, RAF naturally throttles to 60fps  
**Impact:** -0.5-1ms per frame  
**Risk:** Low

#### Optimization 1.4: Unified Animation Loop
**File:** `MapViewport.jsx` & `GalaxyCanvas.jsx`  
**Change:** Remove RAF from GalaxyCanvas, call from MapViewport loop  
**Reason:** Synchronizes both loops, prevents double-syncing  
**Impact:** -1-2ms per frame (less overhead)  
**Risk:** Medium (requires refactor)

### Priority 2: Medium Impact, Medium Risk

#### Optimization 2.1: Particle Object Pooling
**File:** `useParticleTrail.js`  
**Change:** Reuse particle objects from pool instead of creating new  
**Reason:** Reduces garbage collection pressure  
**Impact:** -0.5-1ms per frame (GC pressure reduced)  
**Risk:** Medium

#### Optimization 2.2: Debris State Batching
**File:** `useDebrisManager.js`  
**Change:** Batch updates every 3-5 frames instead of every frame  
**Reason:** Reduces React re-render frequency  
**Impact:** -1-2ms per frame  
**Risk:** Medium (visual stutter possible)

#### Optimization 2.3: Debris Culling
**File:** `useDebrisManager.js`  
**Change:** Only physics-update debris within viewport bounds  
**Reason:** Skip calculations for off-screen debris  
**Impact:** -0.5-1ms per frame  
**Risk:** Low

### Priority 3: Lower Impact / Edge Cases

#### Optimization 3.1: Use React.memo for Debris/Particles
**File:** `GalaxyCanvas.jsx` (SVG rendering)  
**Change:** Memoize debris/particle circles  
**Reason:** Prevent re-render of unchanged debris  
**Impact:** -0.2-0.5ms per frame  
**Risk:** High (reconciliation complexity)

#### Optimization 3.2: Canvas Resolution Scaling
**File:** `GalaxyCanvas.jsx`  
**Change:** Use devicePixelRatio * 0.75 on mobile  
**Reason:** Reduce pixel count on low-end devices  
**Impact:** -1-3ms on mobile  
**Risk:** Low (visual quality trade-off)

#### Optimization 3.3: Particle Trail Disabled on Low-End
**File:** `useParticleTrail.js`  
**Change:** Detect low performance, disable trail  
**Reason:** Particles less important than debris/pan  
**Impact:** -1-2ms on low-end devices  
**Risk:** Low

---

## Part 4: IMPLEMENTATION STRATEGY

### Phase 1: Quick Wins (1.1-1.3) - Est. -3-4ms
**Estimated Result:** 13-15ms per frame = 60fps stable ✅

1. Add `React.memo` to GalaxyCanvas
2. Cache starfield with viewport check
3. Add RAF debouncer for mousemove

### Phase 2: Medium Complexity (1.4 + 2.1) - Est. -2-3ms  
**Estimated Result:** 10-12ms per frame = 60fps comfortable ✅

4. Unify animation loop
5. Add particle pooling

### Phase 3: Nice-to-Have (2.2-3.3)
**For stress test optimization only**

6. Debris batching (if needed)
7. Canvas scaling (mobile)

---

## Part 5: BASELINE METRICS (To Be Measured)

### Test Scenario 1: Idle State
- **Setup:** Dashboard loaded, no interaction
- **Duration:** 30 seconds
- **Metrics:**
  - FPS: ___ (target: 60)
  - Frame time avg: ___ ms (target: <16.67)
  - 95th percentile: ___ ms
  - Memory: ___ MB (steady state)
  - CPU: ___% (low)
  - Long tasks (>50ms): ___

### Test Scenario 2: Cursor Trail
- **Setup:** Move cursor smoothly across viewport for 30s
- **Duration:** 30 seconds  
- **Metrics:**
  - FPS: ___ (target: 60)
  - Particle count: ___ (observe max)
  - Frame time avg: ___ ms (target: <16.67)
  - Memory growth: ___ MB
  - Stutter observed: YES/NO

### Test Scenario 3: Debris Clicking
- **Setup:** Click debris to split every 2-3 seconds for 30s
- **Duration:** 30 seconds
- **Metrics:**
  - FPS: ___ (target: 55-60)
  - Debris count at peak: ___
  - Frame time on click: ___ ms
  - Memory: ___ MB
  - Lag observed: NONE/SLIGHT/SEVERE

### Test Scenario 4: Pan/Zoom
- **Setup:** Pan and zoom continuously for 30s
- **Duration:** 30 seconds
- **Metrics:**
  - FPS: ___ (target: 50-60)
  - Frame time avg: ___ ms
  - Jank observed: YES/NO
  - Memory: ___ MB

### Test Scenario 5: Stress Test
- **Setup:** Cursor trail + debris clicks + panning simultaneously
- **Duration:** 20 seconds
- **Metrics:**
  - FPS: ___ (target: 45-55)
  - Frame time: ___ ms
  - Max debris: ___
  - Max particles: ___
  - Overall smoothness: SMOOTH/ACCEPTABLE/CHOPPY

---

## Part 6: KNOWN ISSUES & INVESTIGATION NEEDED

### Issue 1: Double RAF Loop
- GalaxyCanvas has own RAF loop (line 96)
- MapViewport has own RAF loop (line 207)
- These may fight for sync

### Issue 2: SVG Transform Attribution
- SVG transform updated via `setAttribute` (MapViewport:162)
- May cause layout recalculation each frame

### Issue 3: Event Listener Accumulation
- Mousemove listener attached to document (MapViewport:169)
- Could cause issues if multiple instances

### Issue 4: Particle Key Stability
- Particles have key `particle-${particle.id}` 
- IDs increment globally and reorder = React reconciliation overhead

---

## Next Steps

1. **Manual Testing:** Load dashboard, observe FPS in DevTools Performance tab
2. **Baseline Recording:** Record 30s session for each scenario
3. **Bottleneck Confirmation:** Check which components take most time
4. **Optimization Priority:** Apply Phase 1 changes first
5. **A/B Testing:** Record same scenarios after each optimization
6. **Memory Profiling:** Check for leaks after 5 minutes idle
7. **Mobile Testing:** If possible, test on actual device or emulation

---

## Testing Methodology

### Chrome DevTools Setup
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (Circle icon)
4. Run test scenario
5. Stop recording after 30s
6. Analyze flame chart for:
   - Main thread activity
   - Long tasks (>50ms)
   - Frame rate dips
   - Memory timeline

### Metrics to Track
- **Frame Rate:** Yellow/Red dots = dropped frames
- **Frame Time:** Green bar at top = frame duration
- **Main Thread:** Look for long JavaScript tasks
- **Paint:** Look for excessive paint events
- **Rendering:** Look for excessive SVG/Canvas redraws

### Success Criteria
- ✅ 60fps maintained (no red/yellow)
- ✅ Frame time <16.67ms (except on drops)
- ✅ No long tasks >50ms
- ✅ Memory stable after 30s
- ✅ Smooth interactions (no lag)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-20 | Initial baseline analysis, code review complete |
| (pending) | | After optimization implementation |

---

**Report Status:** Ready for Performance Testing Phase
