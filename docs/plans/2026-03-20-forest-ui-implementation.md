# Forest UI Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Forest UI with a centered glassmorphic card, GSAP plant animation, single tree type, and stage name mystery progression.

**Architecture:** 
- Remove plant modal and archived tree modals entirely
- Replace with single centered glassmorphic card container
- Simplify state management (no selectedArchivedTree, no tree type selection)
- Add GSAP plant sequence animation
- Add stage name mapping (Baby → Sapling → Young Tree → Teen Tree → Adult Tree)
- Keep background forest as non-interactive decoration

**Tech Stack:** React, GSAP, Tailwind CSS, React Query

---

## Task 1: Add Stage Name Mapping

**Files:**
- Modify: `frontend/src/pages/Forest.jsx:1-100`

**Step 1: Add stage name constant**

Add this constant after the STAGES array in Forest.jsx:

```javascript
const STAGE_NAMES = {
  0: 'Baby',
  1: 'Sapling',
  2: 'Young Tree',
  3: 'Teen Tree',
  4: 'Adult Tree',
};

function getStageName(stage) {
  return STAGE_NAMES[stage] ?? 'Unknown';
}
```

**Step 2: Test stage names**

In browser console, verify the mapping works by checking that `getStageName(0) === 'Baby'`, `getStageName(1) === 'Sapling'`, etc.

**Step 3: Commit**

```bash
git add frontend/src/pages/Forest.jsx
git commit -m "feat: add stage name mapping (Baby, Sapling, Young Tree, Teen Tree, Adult Tree)"
```

---

## Task 2: Auto-Plant Single Tree Type

**Files:**
- Modify: `frontend/src/pages/Forest.jsx:500-540`

**Step 1: Remove plant modal state and modal rendering**

Delete:
- `const [showPlantModal, setShowPlantModal] = useState(false);` line
- The entire plant modal JSX section (lines ~690-730 in current code)
- The "Plant a seed" button in empty panel

Replace the empty panel section with:

```javascript
) : (
  <section className="forest-empty-panel">
    <div className="forest-empty-preview">
      <img src={pinePurpleSeed} alt="Seed" />
    </div>
    <div className="forest-empty-copy">
      <span className="forest-overline">No active tree</span>
      <h2>Start a new growth cycle.</h2>
      <p>Plant a seed, earn watering cans in Pomodoro, and grow your forest.</p>
    </div>
    <button className="forest-primary-button" onClick={handlePlant}>
      <img src={wateringCanAsset} alt="" />
      <span>Plant a seed</span>
    </button>
  </section>
)}
```

**Step 2: Update handlePlant to skip modal**

Replace the `handlePlant` callback with:

```javascript
const handlePlant = useCallback(() => {
  if (!treeTypes || treeTypes.length === 0) {
    return;
  }
  
  setInteractionLocked(true);
  // Plant the first (and only) tree type
  plantMutation.mutate(treeTypes[0].id);
}, [treeTypes, plantMutation]);
```

**Step 3: Update empty panel button click**

Change `onClick={() => setShowPlantModal(true)}` to `onClick={handlePlant}` on the plant button.

**Step 4: Commit**

```bash
git add frontend/src/pages/Forest.jsx
git commit -m "feat: auto-plant single tree type, remove plant modal"
```

---

## Task 3: Build Glassmorphic Container Component

**Files:**
- Create: `frontend/src/components/ForestTreeCard.jsx`

**Step 1: Create new component file**

```javascript
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ForestTreeCard.css';

export function ForestTreeCard({
  tree,
  canWaterNow,
  cooldownSeconds,
  growth,
  onWater,
  isLoading,
}) {
  const cardRef = useRef(null);
  const treeImageRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current || isLoading) return;

    // Initial entrance animation
    gsap.fromTo(
      cardRef.current,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [isLoading]);

  if (!tree) return null;

  const stageName = [
    'Baby',
    'Sapling',
    'Young Tree',
    'Teen Tree',
    'Adult Tree',
  ][tree.stage] || 'Unknown';

  const waterPercentage = Math.min(
    100,
    (tree.water_progress / growth.stageCost) * 100
  );

  return (
    <div className="forest-tree-card" ref={cardRef}>
      {/* Progress Bar */}
      <div className="forest-tree-card-progress">
        <div className="forest-progress-track">
          <div
            className="forest-progress-fill"
            style={{ width: `${waterPercentage}%` }}
          />
        </div>
      </div>

      {/* Stage Name */}
      <div className="forest-stage-name">{stageName}</div>

      {/* Tree Visual */}
      <div className="forest-card-tree-container">
        <img
          ref={treeImageRef}
          className="forest-card-tree-image"
          src={getTreeAsset(tree.tree_type.name, tree.stage)}
          alt={tree.tree_type.display_name}
        />
      </div>

      {/* Water Button */}
      <button
        className="forest-card-water-button"
        onClick={onWater}
        disabled={!canWaterNow || isLoading}
      >
        <span>Water</span>
      </button>

      {/* Timer Info */}
      <div className="forest-card-timer-info">
        {tree.is_withered ? (
          <p className="timer-text warn">
            Needs rescue — {tree.rescue_hours_remaining || 0}h left
          </p>
        ) : !canWaterNow ? (
          <p className="timer-text">
            Available in {formatDuration(cooldownSeconds)}
          </p>
        ) : tree.hours_until_wither ? (
          <p className="timer-text">
            Withers in {tree.hours_until_wither}h
          </p>
        ) : (
          <p className="timer-text">Ready to water</p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ForestTreeCard.jsx
git commit -m "feat: create glassmorphic ForestTreeCard component"
```

---

## Task 4: Style Glassmorphic Container

**Files:**
- Create: `frontend/src/components/ForestTreeCard.css`

**Step 1: Create CSS file**

```css
.forest-tree-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: min(420px, 90vw);
  padding: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* Progress Bar */
.forest-tree-card-progress {
  width: 100%;
}

.forest-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.forest-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06b6d4);
  transition: width 0.3s ease;
  border-radius: 999px;
}

/* Stage Name */
.forest-stage-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Tree Container */
.forest-card-tree-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forest-card-tree-image {
  width: auto;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(15, 23, 42, 0.1));
}

/* Water Button */
.forest-card-water-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.forest-card-water-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.4);
}

.forest-card-water-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Timer Info */
.forest-card-timer-info {
  font-size: 0.9rem;
  text-align: center;
  min-height: 1.5rem;
}

.timer-text {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

.timer-text.warn {
  color: #dc2626;
}

@media (max-width: 640px) {
  .forest-tree-card {
    width: min(100vw, 380px);
    padding: 1.5rem;
    gap: 1.2rem;
  }

  .forest-card-tree-container {
    height: 160px;
  }

  .forest-card-water-button {
    padding: 0.85rem;
    font-size: 1rem;
  }
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/ForestTreeCard.css
git commit -m "feat: add glassmorphic card styling"
```

---

## Task 5: Implement Plant Animation Sequence

**Files:**
- Modify: `frontend/src/pages/Forest.jsx:350-400`

**Step 1: Add plant animation function**

Add this before the component return:

```javascript
const runPlantSequence = useCallback((onComplete) => {
  if (prefersReducedMotion || !containerRef.current) {
    onComplete?.();
    return;
  }

  // Create temporary seed element for animation
  const seedDiv = document.createElement('div');
  seedDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 15;
  `;
  
  const seedImg = document.createElement('img');
  seedImg.src = pinePurpleSeed;
  seedImg.style.cssText = `
    width: 80px;
    height: 80px;
    object-fit: contain;
  `;
  
  seedDiv.appendChild(seedImg);
  document.body.appendChild(seedDiv);

  const timeline = gsap.timeline({ onComplete });

  // Seed appears scaled up
  timeline
    .set(seedDiv, { xPercent: -50, yPercent: -50 })
    .fromTo(
      seedImg,
      { scale: 0, autoAlpha: 0 },
      { scale: 1.5, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.4)' }
    )
    // Hold
    .to(seedImg, { duration: 0.2 })
    // Seed scales down to ground and disappears
    .to(
      seedImg,
      {
        scale: 0,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.in',
      },
      '-=0.2'
    )
    // Clean up
    .add(() => {
      document.body.removeChild(seedDiv);
      onComplete?.();
    });
}, [prefersReducedMotion]);
```

**Step 2: Update plantMutation success handler**

Modify the `plantMutation` to use the animation:

```javascript
const plantMutation = useMutation({
  mutationFn: (treeTypeId) => 
    forestApi.plantTree(treeTypeId).then((res) => res.data),
  onSuccess: (data) => {
    runPlantSequence(refreshForest);
  },
  onError: () => setInteractionLocked(false),
});
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Forest.jsx
git commit -m "feat: implement GSAP plant animation sequence"
```

---

## Task 6: Integrate ForestTreeCard into Forest.jsx

**Files:**
- Modify: `frontend/src/pages/Forest.jsx:550-650`

**Step 1: Import ForestTreeCard**

Add at the top:

```javascript
import { ForestTreeCard } from '../components/ForestTreeCard';
```

**Step 2: Replace hero panel with card**

Replace the entire `<main className="forest-hero-shell">` section with:

```javascript
{activeTree ? (
  <ForestTreeCard
    tree={activeTree}
    canWaterNow={canWaterActive}
    cooldownSeconds={cooldownSeconds}
    growth={growth}
    onWater={handleWaterActive}
    isLoading={isLoading}
  />
) : (
  <section className="forest-empty-panel">
    <div className="forest-empty-preview">
      <img src={pinePurpleSeed} alt="Seed" />
    </div>
    <div className="forest-empty-copy">
      <span className="forest-overline">No active tree</span>
      <h2>Start a new growth cycle.</h2>
      <p>Plant a seed, earn watering cans in Pomodoro, and grow your forest.</p>
    </div>
    <button className="forest-primary-button" onClick={handlePlant}>
      <img src={wateringCanAsset} alt="" />
      <span>Plant a seed</span>
    </button>
  </section>
)}
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Forest.jsx
git commit -m "feat: integrate glassmorphic ForestTreeCard component"
```

---

## Task 7: Update Forest.css for New Layout

**Files:**
- Modify: `frontend/src/pages/Forest.css`

**Step 1: Simplify hero shell**

Replace `.forest-hero-shell` CSS (around line 300) with:

```css
.forest-hero-shell {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.forest-hero-shell > * {
  pointer-events: auto;
}
```

**Step 2: Remove hero panel styles**

Delete or comment out:
- `.forest-hero-panel`
- `.forest-hero-visual`
- `.forest-hero-tree-wrap`
- `.forest-hero-tree`
- `.forest-hero-copy`
- `.forest-growth-card`
- `.forest-growth-rail`
- `.forest-growth-fill`
- `.forest-action-panel`
- `.forest-status-row`
- etc. (all hero-specific styles)

**Step 3: Keep empty panel and background styles**

Keep `.forest-empty-panel`, `.forest-background-layer`, `.forest-background-tree` CSS intact.

**Step 4: Commit**

```bash
git add frontend/src/pages/Forest.css
git commit -m "feat: simplify CSS for new glassmorphic card layout"
```

---

## Task 8: Remove Unused State and Handlers

**Files:**
- Modify: `frontend/src/pages/Forest.jsx:170-240`

**Step 1: Clean up state**

Remove these state declarations:
```javascript
const [showPlantModal, setShowPlantModal] = useState(false); // already removed in Task 2
const [heroPanelRef] = removed
```

Keep only:
- `timeTick`
- `interactionLocked`
- `containerRef`
- `heroTreeRef` (might still be used for animations, verify)
- `previousSnapshotRef`
- `lastActionRef`
- `isFirstVisitRef`

**Step 2: Verify and remove unnecessary refs**

If `heroTreeRef` is not used for animations anymore, remove it and clean up references.

**Step 3: Commit**

```bash
git add frontend/src/pages/Forest.jsx
git commit -m "feat: clean up unused state and refs"
```

---

## Task 9: Test Full Flow

**Files:**
- Test: Browser testing

**Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

**Step 2: Test plant sequence**

- Click "Plant a seed" button
- Verify GSAP animation: seed scales up → holds → scales down and disappears → baby appears
- Verify tree card is centered with glassmorphic styling

**Step 3: Test water button**

- Verify water button is prominent and blue
- Water the tree 5 times
- Verify progress bar fills (0% → 100%)
- Verify stage name changes from "Baby" to "Sapling"
- Verify cooldown timer shows when locked

**Step 4: Test responsive**

- Test on mobile (640px width)
- Verify card scales appropriately
- Verify button is accessible

**Step 5: Manual testing notes**

If issues occur:
- Check browser console for errors
- Verify GSAP animations are smooth
- Check that glassmorphic blur effect renders
- Verify progress bar fills smoothly

---

## Task 10: Run Tests

**Files:**
- Test: `backend/tests/Feature/ForestTest.php`

**Step 1: Run backend tests**

```bash
cd backend && php artisan test tests/Feature/ForestTest.php --no-coverage
```

**Expected:** All 13 tests pass (no changes to backend logic)

**Step 2: Commit any fixes**

If tests fail, investigate and commit fixes.

```bash
git commit -m "fix: resolve backend test issues"
```

---

## Summary of Changes

**Frontend:**
- ✅ Single tree type auto-plant (no modal)
- ✅ Glassmorphic centered card with progress bar
- ✅ Stage name mystery progression
- ✅ GSAP plant animation sequence
- ✅ Removed archived tree modals
- ✅ Removed plant type selection modal
- ✅ Cleaner, simpler UI

**Backend:**
- No changes needed (logic already supports single tree)

**Tests:**
- All 13 existing tests should pass
- New manual testing validates animations and UI

**Commits:**
- 10 focused commits for incremental progress
