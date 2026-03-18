# Forest Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Forest experience to match Mentra's landing-page quality on a white canvas, add a persisted random 6-12 hour active-tree cooldown, and improve stage fidelity, animation, and control layout.

**Architecture:** Update the backend forest model and service layer so active trees track a persisted `next_water_at` window and expose explicit cooldown metadata to the frontend. Rebuild the frontend Forest page around a hero-tree composition with final-stage-only background trees, a refined growth rail, and GSAP timelines that sequence watering, growth, archiving, and forest-fill transitions.

**Tech Stack:** Laravel 12, PHPUnit, React 19, TanStack Query, GSAP, native CSS, Vite.

---

### Task 1: Add persisted active-tree cooldown support

**Files:**
- Create: `backend/database/migrations/2026_03_18_000004_add_next_water_at_to_trees_table.php`
- Modify: `backend/app/Models/Tree.php`
- Modify: `backend/app/Services/WateringCanService.php`
- Test: `backend/tests/Feature/ForestTest.php`
- Test: `backend/tests/Feature/WateringCanServiceTest.php`

**Step 1: Write the failing test**

- Add a feature test asserting a newly planted active tree can be watered immediately because `next_water_at` starts at `now()` or null-equivalent ready state.
- Add a feature test asserting a successful active watering sets a future `next_water_at` between 6 and 12 hours ahead.
- Add a feature test asserting a second active watering before `next_water_at` returns a cooldown error and includes cooldown metadata.

**Step 2: Run test to verify it fails**

Run: `php artisan test --filter=Forest`
Expected: FAIL on missing `next_water_at` logic and updated cooldown assertions.

**Step 3: Write minimal implementation**

- Add the `next_water_at` column to `trees`.
- Cast it as a datetime on `Tree`.
- Add helper methods on `Tree` for active-water readiness and cooldown remaining values.
- Update `WateringCanService::waterActiveTree()` to:
  - allow watering immediately when `next_water_at` is null or in the past
  - set `next_water_at` to `now()->addHours(random_int(6, 12))` after successful active watering
  - set a fresh `next_water_at` after rescuing an active tree
  - return `cooldown_remaining_seconds` and `next_water_at` when blocked
- Ensure planting initializes `next_water_at` as immediately ready.

**Step 4: Run test to verify it passes**

Run: `php artisan test --filter=Forest`
Expected: PASS for updated active cooldown behavior.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

### Task 2: Expose forest UI metadata cleanly

**Files:**
- Modify: `backend/app/Http/Controllers/Api/ForestController.php`
- Modify: `backend/app/Models/Tree.php`
- Test: `backend/tests/Feature/ForestTest.php`

**Step 1: Write the failing test**

- Add a test asserting `/api/forest` returns active tree cooldown metadata needed by the new UI, such as `next_water_at`, `hours_until_wither`, `rescue_hours_remaining`, or equivalent explicit fields.

**Step 2: Run test to verify it fails**

Run: `php artisan test --filter=Forest`
Expected: FAIL because the serialized forest payload lacks the new fields.

**Step 3: Write minimal implementation**

- Update the tree serialization path so the frontend receives:
  - `next_water_at`
  - active-tree cooldown remaining data
  - wither/rescue timing metadata
  - stage cost values already needed by the growth rail
- Keep the response payload stable for the rest of the page.

**Step 4: Run test to verify it passes**

Run: `php artisan test --filter=Forest`
Expected: PASS with the new payload fields.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

### Task 3: Redesign the Forest page structure

**Files:**
- Modify: `frontend/src/pages/Forest.jsx`
- Modify: `frontend/src/pages/Forest.css`
- Modify: `frontend/src/services/api.js`
- Check: `frontend/src/styles/pages/LandingPage.css`

**Step 1: Write the failing test**

- There is no current frontend test harness for this page, so use build verification as the first safety check.
- Define the acceptance target in code comments or local checklist only if needed; do not add placeholder comments.

**Step 2: Run build to establish baseline**

Run: `npm run build`
Expected: PASS before structural changes.

**Step 3: Write minimal implementation**

- Rebuild `Forest.jsx` into clear sections:
  - top utility header
  - white-canvas stage
  - active-tree hero composition
  - integrated control rail
  - polished growth rail
  - final-stage-only archived forest background
  - archived tree detail modal
  - visually separate debug tools
- Keep only final-stage imagery in the background forest.
- Preserve stage-specific imagery and scale for the active tree.
- Add explicit UI states for ready-to-water, cooldown, withered, rescue, and archived maintenance.

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS with the new layout.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

### Task 4: Rebuild the visual language on a white canvas

**Files:**
- Modify: `frontend/src/pages/Forest.css`
- Check: `frontend/src/styles/pages/LandingPage.css`

**Step 1: Write the failing test**

- Visual work is verified through build success plus manual browser review.

**Step 2: Run build to establish baseline**

Run: `npm run build`
Expected: PASS before styling changes.

**Step 3: Write minimal implementation**

- Replace the current sky/ground scene with a white minimal studio canvas.
- Use landing-inspired typography scale, spacing, rounded pills, and neutral contrast.
- Restyle real gameplay controls so they feel anchored to the hero composition.
- Replace the existing progress bar with a segmented growth rail that looks intentional on desktop and mobile.
- Ensure debug controls remain subordinate and clearly labeled.

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS with the refined styling.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

### Task 5: Upgrade GSAP sequencing and asset usage

**Files:**
- Modify: `frontend/src/pages/Forest.jsx`
- Modify: `frontend/src/pages/Forest.css`
- Check: `frontend/src/assets/pine_purple/*`
- Check: `frontend/src/assets/gameworld/watering_can.png`
- Check: `frontend/src/assets/gameworld/water_drop.png`

**Step 1: Write the failing test**

- Motion work is verified through build success and manual browser review.

**Step 2: Run build to establish baseline**

Run: `npm run build`
Expected: PASS before animation changes.

**Step 3: Write minimal implementation**

- Replace generic pulses with GSAP timelines for:
  - page entrance
  - watering action
  - stage advancement asset swap
  - archive-to-background transition
  - background forest stagger reveal
- Use the watering can and water drop assets in the main interaction so the page uses more of the project's existing visual language.
- Respect reduced-motion behavior where practical.

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS with upgraded motion.

**Step 5: Commit**

Do not commit unless the user explicitly asks.

### Task 6: Verify backend and frontend behavior end-to-end

**Files:**
- Test: `backend/tests/Feature/ForestTest.php`
- Test: `backend/tests/Feature/WateringCanServiceTest.php`

**Step 1: Run backend test suite for forest behavior**

Run: `php artisan test --filter=Forest`
Expected: PASS

**Step 2: Run backend test suite for watering can awards**

Run: `php artisan test --filter=WateringCanService`
Expected: PASS

**Step 3: Run frontend build**

Run: `npm run build`
Expected: PASS

**Step 4: Manual browser verification**

- Confirm the Forest page loads on a white canvas.
- Confirm active tree stage and scale match the actual stage.
- Confirm background trees are final-stage only and fill the page gradually.
- Confirm cooldown displays a persisted 6-12 hour wait after active watering.
- Confirm archived trees still support maintenance and rescue.
- Confirm debug controls still work in development only.

**Step 5: Commit**

Do not commit unless the user explicitly asks.
