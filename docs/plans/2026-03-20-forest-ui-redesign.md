# Forest UI Redesign - Glassmorphic Container

**Date:** 2026-03-20  
**Status:** Design Approved

## Overview

Redesign the Forest page with a centered glassmorphic card showing tree progress, removing the modal system. Single tree type only. Immediate planting with GSAP animation sequence.

## Key Changes

### 1. Single Tree Type
- Remove plant modal with type selection
- Automatically plant the only available tree type when "Plant" is clicked
- No multi-type branching in UI

### 2. Central Glassmorphic Card
A frosted glass card centered on screen containing:
- **Horizontal progress bar** (top) - shows water progress for current stage (e.g., 3/5)
- **Stage name** below bar (e.g., "Baby", "Sapling") - no numbers, mysterious progression
- **Large prominent water button** (center) - disabled/grayed when on cooldown
- **Timer text** below button showing:
  - Cooldown countdown if locked
  - "Withers in Xh" if stable
  - "Needs rescue - Xh left" if withered

### 3. GSAP Plant Animation
Sequence when planting:
1. Seed image appears scaled 0 (invisible)
2. Scales up to 150% over 0.4s
3. Holds for 0.2s
4. Scales down + moves to ground position over 0.6s
5. Fades out and vanishes
6. Baby/Stage 1 sprout fades in (scale 0.8→1.0)

### 4. Stage Names (Mystery Progression)
- Stage 1: "Baby"
- Stage 2: "Sapling"
- Stage 3: "Young Tree"
- Stage 4: "Teen Tree"
- Stage 5: "Adult Tree"

### 5. Background Forest
- Keep background tree layout but ensure visual separation from card
- Card floats centered, forest remains decorative and non-interactive
- Can experiment with spacing/opacity

## Watering Progression
- **Baby (Stage 1):** 5 waterings → Sapling
- **Sapling (Stage 2):** 10 waterings → Young Tree
- **Young Tree (Stage 3):** 10 waterings → Teen Tree
- **Teen Tree (Stage 4):** 10 waterings → Adult Tree
- **Adult Tree (Stage 5):** 10 waterings → Archive & Finalize

## Removed Features
- Plant type selection modal
- Archived tree interaction modal
- Tree type grid
- Debug skip stage endpoint (keep in code but don't expose in UI)

## UI/UX Goals
- Simpler, more focused experience
- Glassmorphic aesthetic (modern, clean)
- Mystery progression (no stage numbers visible)
- Clear action (prominent water button)
- Clear timers (next water, wither countdown)
- Reduced cognitive load
