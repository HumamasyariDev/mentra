import { useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useReducedMotion';

/**
 * usePlantAnimation - Orchestrates the planting animation sequence
 *
 * Animation sequence (2.0s total):
 * 1. Seed grows in and scales up (0.7s)
 * 2. Seed pulses (0.3s)
 * 3. Seed shrinks and sinks (0.6s)
 * 4. Tree emerges and bounces (0.4s)
 *
 * Usage:
 * const runPlantAnimation = usePlantAnimation();
 * runPlantAnimation(treeImageRef, onComplete);
 */
export function usePlantAnimation() {
  const prefersReducedMotion = useReducedMotion();

  const runPlantAnimation = useCallback(
    (treeImageRef, options = {}) => {
      const { onComplete, onSwapImage } = options;
      
      if (prefersReducedMotion || !treeImageRef?.current) {
        onSwapImage?.();
        onComplete?.();
        return;
      }

      const treeNode = treeImageRef.current;

      // Kill any existing tweens on the tree node
      gsap.killTweensOf(treeNode);

      // Create main timeline
      const timeline = gsap.timeline({
        onComplete,
        defaults: {
          ease: 'power2.out',
        },
      });

      // Label: seed planting phase
      timeline.addLabel('seedPhase');

      // Phase 1: Seed sprouts - scale from tiny to full (0.7s)
      timeline.fromTo(
        treeNode,
        {
          scale: 0.2,
          opacity: 0,
          y: 20,
          filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.04))',
        },
        {
          scale: 1.15,
          opacity: 1,
          y: 0,
          filter: 'drop-shadow(0 16px 32px rgba(15, 23, 42, 0.12))',
          duration: 0.7,
          ease: 'back.out(1.2)',
        },
        'seedPhase'
      );

      // Phase 2: Seed pulses (slight scale down then back up) - 0.3s
      timeline.to(
        treeNode,
        {
          scale: 1.0,
          duration: 0.15,
          ease: 'power2.inOut',
        },
        'seedPhase+=0.7'
      );

      timeline.to(
        treeNode,
        {
          scale: 1.15,
          duration: 0.15,
          ease: 'power2.inOut',
        }
      );

      // Label: seed exit phase
      timeline.addLabel('seedExit');

      // Phase 3: Seed shrinks down and sinks into ground with fade - 0.6s
      timeline.to(
        treeNode,
        {
          scale: 0.1,
          y: 60,
          opacity: 0,
          filter: 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0))',
          duration: 0.6,
          ease: 'power2.in',
          onComplete: onSwapImage,
        },
        'seedExit'
      );

      // Label: tree growth phase
      timeline.addLabel('treeGrowth');

      // Phase 4: Baby tree emerges from ground - grows in with bounce (0.4s)
      timeline.fromTo(
        treeNode,
        {
          scale: 0.6,
          y: 80,
          opacity: 0,
          filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.04))',
        },
        {
          scale: 1.0,
          y: 0,
          opacity: 1,
          filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.1))',
          duration: 0.4,
          ease: 'back.out(1.6)',
        },
        'treeGrowth'
      );
    },
    [prefersReducedMotion]
  );

  return runPlantAnimation;
}
