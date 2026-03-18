# Forest Redesign Design

**Date:** 2026-03-18

**Goal:** Rework the `/forest` experience so it feels intentional and premium instead of placeholder-like, while preserving the existing game rules and adding the corrected active-tree cooldown behavior.

## Direction

The Forest page shifts from a colorful game scene to a white studio canvas that borrows the landing page's confidence: strong typography, restrained motion, precise spacing, and cleaner control styling. Instead of trying to simulate a full environment, the page treats the active tree as a hero object in a gallery-like composition.

## Visual System

- Use a clean white full-screen background with subtle neutral depth only where needed for separation.
- Keep the active tree centered as the primary focal point.
- Use landing-page inspired typography and rounded pill controls, but in a light minimal palette rather than the landing page's dark glass treatment.
- Remove decorative UI clutter and replace it with a compact, coherent control rail under the active tree.

## Tree Presentation

- The active tree must reflect its actual stage with the correct tree asset and a stage-specific visual scale.
- Earlier stages should feel visibly smaller and younger; later stages should feel more substantial before reaching the final silhouette.
- Background forest trees must be final-stage trees only.
- Archived trees populate the background gradually as a quiet accumulation of completed work, using depth, scale variance, and distribution rules instead of random clutter.

## Layout

- The active tree sits in a central hero zone.
- A compact status band below it contains the stage name, next watering availability, and the growth rail.
- The main action row groups the primary water action with secondary contextual information so nothing feels detached.
- Debug controls stay visually separate and clearly subordinate to the real gameplay controls.
- Archived final-stage trees occupy the far left, far right, and lower background edges so the page slowly fills over time without competing with the hero tree.

## Motion

- Use GSAP timelines for entry, watering, stage advancement, archiving, and background-tree reveal.
- Watering should feel sequenced: button press, water motion, tree response, progress update, then state labels settling.
- Stage advancement should crossfade or swap assets with scale, lift, and light timing rather than a single pulse.
- Archiving should move the completed tree from the hero composition into the background forest with a readable transition.
- Background trees should reveal with staggered sequencing so the forest appears curated, not randomly dumped.

## Growth Rail

- Replace the current generic progress bar with a more polished growth rail.
- The rail should visually show the current stage threshold, completed progress toward the next threshold, and milestone segmentation.
- Labels should remain minimal and legible on desktop and mobile.

## Cooldown Behavior

- Active-tree watering changes from the temporary 3-second cooldown to a randomized 6-12 hour cooldown after each successful watering.
- The first watering after planting remains immediately available.
- The randomized next-water time must be stored server-side so the UI reflects a stable countdown.
- Archived-tree watering remains separate from the active-tree cooldown behavior.

## Data and API Changes

- Add a persisted `next_water_at` timestamp on active trees.
- Return cooldown state and formatted timing data needed by the frontend.
- Update the watering service to assign a new random active-tree cooldown after each successful active watering or rescue.
- Keep archived trees visually represented as final-stage trees only.

## Success Criteria

- The page feels visually aligned with the landing page's quality bar, but on a white minimal canvas.
- The active tree clearly communicates its stage, scale, progress, and next actionable time.
- The background forest fills gradually with final-stage trees only.
- Controls feel integrated and polished.
- GSAP motion feels deliberate and sequenced instead of generic.
- Existing forest mechanics continue to work, with tests updated for the new cooldown rules.

## Future Consideration

- When archived trees reach a visual cap of roughly 25 background trees, unlock a pruning flow.
- Pruning should only become available once the cap is reached.
- The user can consume 5-10 archived trees at a time.
- Each consumed tree converts into 500 EXP.
- This creates space for new archived trees without expanding the background indefinitely.
