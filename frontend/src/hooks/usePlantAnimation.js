import { useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useReducedMotion';

/**
 * usePlantAnimation - Orchestrates the planting animation sequence
 *
 * Animation sequence (2.5s total):
 * 0. Container slides in from below
 * 1. Seed drops in onto container and scales up
 * 2. Seed pulses
 * 3. Seed shrinks and sinks into the dirt
 * 4. Baby tree emerges and bounces
 *
 * Usage:
 * const runPlantAnimation = usePlantAnimation();
 * runPlantAnimation(treeImageRef, cardRef, options);
 */
export function usePlantAnimation() {
  const prefersReducedMotion = useReducedMotion();

  const runPlantAnimation = useCallback(
    (treeImageRef, cardRef, options = {}) => {
      const { onComplete, onSwapImage } = options;
      
      if (prefersReducedMotion || !treeImageRef?.current) {
        onSwapImage?.();
        onComplete?.();
        return;
      }

      const treeNode = treeImageRef.current;
      const cardNode = cardRef?.current;

      // Kill any existing tweens
      gsap.killTweensOf(treeNode);
      if (cardNode) gsap.killTweensOf(cardNode);

      // Create main timeline
      const timeline = gsap.timeline({
        onComplete,
        defaults: {
          ease: 'power2.out',
        },
      });

      // Hide tree initially so it doesn't show before card slides in
      gsap.set(treeNode, { opacity: 0, scale: 0 });

      // Phase 0: Card slides in from below
      if (cardNode) {
        timeline.fromTo(
          cardNode,
          { y: 150, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.1)' },
          0
        );
      }

      // Label: seed planting phase
      // Start slightly before card finishes sliding in
      timeline.addLabel('seedPhase', cardNode ? 0.35 : 0);

      // Phase 1: Seed drops down onto the container
      timeline.fromTo(
        treeNode,
        {
          scale: 0.2,
          opacity: 0,
          y: -50,
          filter: 'drop-shadow(0 0px 0px rgba(15, 23, 42, 0))',
        },
        {
          scale: 1.15,
          opacity: 1,
          y: 0,
          filter: 'drop-shadow(0 16px 32px rgba(15, 23, 42, 0.12))',
          duration: 0.7,
          ease: 'bounce.out',
        },
        'seedPhase'
      );

      // Phase 2: Seed pulses (slight scale down then back up)
      timeline.to(
        treeNode,
        {
          scale: 1.0,
          duration: 0.15,
          ease: 'power2.inOut',
        },
        '+=0.15'
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

      // Phase 3: Seed shrinks down and sinks into ground with fade
      timeline.to(
        treeNode,
        {
          scale: 0.1,
          y: 40,
          opacity: 0,
          filter: 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0))',
          duration: 0.5,
          ease: 'back.in(1.2)',
          onComplete: onSwapImage,
        },
        'seedExit'
      );

      // Label: tree growth phase
      timeline.addLabel('treeGrowth');

      // Phase 4: Baby tree emerges from ground - grows in with bounce
      timeline.fromTo(
        treeNode,
        {
          scale: 0.4,
          y: 60,
          opacity: 0,
          filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.04))',
        },
        {
          scale: 1.0,
          y: 0,
          opacity: 1,
          filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.1))',
          duration: 0.6,
          ease: 'elastic.out(1, 0.65)',
        },
        'treeGrowth'
      );

      // Final cleanup: clear GSAP inline styles so CSS (like hover states) can take over smoothly
      if (cardNode) {
        timeline.set(cardNode, { clearProps: 'transform,opacity,scale' });
      }
      timeline.set(treeNode, { clearProps: 'transform,opacity,scale,filter' });
    },
    [prefersReducedMotion]
  );

  return runPlantAnimation;
}
