import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './ForestTreeCard.css';

/**
 * ForestTreeCard displays the active tree in a centered glassmorphic card
 * with progress bar, stage name, water button, and timer information.
 *
 * Props:
 * - tree: active tree object (null if empty)
 * - treeAsset: image URL for the tree
 * - stageName: display name for current stage (e.g., "Baby", "Sapling")
 * - waterProgressPercent: 0-100 progress within current stage
 * - overallProgressPercent: 0-100 progress across all stages
 * - canWater: boolean - true if ready to water now
 * - cooldownSeconds: seconds until next water available
 * - onWater: callback when water button clicked
 * - isPending: boolean - mutation in flight
 * - disabled: boolean - button disabled state
 * - wateringCanCount: number of watering cans available
 * - isAtFinal: boolean - tree at final stage (archiving)
 * - archiveProgress: number 0-10 for final stage progress
 * - treeImageRef: ref object for the tree image (used for animations)
 * - treeWidth: width in pixels for the tree image based on growth stage
 * - isPlanting: boolean - if true, shows planting state UI
 * - plantingTitle: string - text to display while planting
 * - cardRefOverride: optional ref for the container card
 */
export default function ForestTreeCard({
  tree,
  treeAsset,
  stageName,
  waterProgressPercent,
  overallProgressPercent,
  canWater,
  cooldownSeconds,
  onWater,
  isPending,
  disabled,
  wateringCanCount,
  isAtFinal,
  archiveProgress,
  treeImageRef,
  treeWidth,
  isPlanting,
  plantingTitle,
  cardRefOverride,
}) {
  const prefersReducedMotion = useReducedMotion();
  const internalCardRef = useRef(null);
  const cardRef = cardRefOverride || internalCardRef;
  const localTreeImageRef = useRef(null);
  
  const fullUiRef = useRef(null);
  const plantingUiRef = useRef(null);
  const wasPlantingRef = useRef(isPlanting);
  
  const [timerText, setTimerText] = useState('');

  // Track previous planting state to prevent double-animations
  useEffect(() => {
    wasPlantingRef.current = isPlanting;
  }, [isPlanting]);

  // Use provided ref if available, otherwise use local ref
  const treeRef = treeImageRef || localTreeImageRef;

  // Format cooldown into human-readable text
  useEffect(() => {
    if (canWater || !tree) {
      setTimerText('Ready now');
      return;
    }

    const updateTimer = () => {
      if (cooldownSeconds <= 0) {
        setTimerText('Ready now');
        return;
      }

      const totalMinutes = Math.ceil(cooldownSeconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours && minutes) {
        setTimerText(`${hours}h ${minutes}m`);
      } else if (hours) {
        setTimerText(`${hours}h`);
      } else {
        setTimerText(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 30000); // Update every 30 seconds
    return () => window.clearInterval(interval);
  }, [cooldownSeconds, canWater, tree]);

  // Main Card Entrance Animation
  useGSAP(() => {
    if (!cardRef.current || prefersReducedMotion || !tree) return;

    // If currently planting, the usePlantAnimation hook handles the card sliding in from the bottom
    if (isPlanting) return;

    // If we just finished planting, DO NOT run the normal card entrance animation,
    // because the card is already on screen!
    if (wasPlantingRef.current) return;

    // Normal page-load entrance animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 12, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out' }
    );
  }, { scope: cardRef, dependencies: [tree?.id, prefersReducedMotion] }); 
  // Notice `isPlanting` is NOT in the dependencies array. This guarantees it won't fire 
  // when `isPlanting` changes to false!

  // Smooth UI Crossfade when Planting completes
  useGSAP(() => {
    if (prefersReducedMotion) return;

    if (isPlanting) {
      // Immediately prepare planting state
      gsap.set(fullUiRef.current, { autoAlpha: 0 });
      gsap.set(plantingUiRef.current, { autoAlpha: 1, y: 0 });
    } else if (wasPlantingRef.current) {
      // Transition out of planting state smoothly
      gsap.to(plantingUiRef.current, {
        autoAlpha: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      
      gsap.fromTo(fullUiRef.current,
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.15 }
      );
    } else {
      // Normal stable state
      gsap.set(fullUiRef.current, { autoAlpha: 1, y: 0 });
      gsap.set(plantingUiRef.current, { autoAlpha: 0 });
    }
  }, { dependencies: [isPlanting, prefersReducedMotion] });

  if (!tree) {
    return null;
  }

  const buttonLabel = tree.is_withered ? 'Rescue tree' : canWater ? 'Water tree' : 'Waiting to water';
  const buttonDisabled = disabled || !canWater || wateringCanCount < 1 || isPending;

  return (
    <div className="forest-tree-card" ref={cardRef}>
      {/* Glassmorphic backdrop */}
      <div className="forest-tree-card-backdrop"></div>

      {/* Content container */}
      <div className="forest-tree-card-content">
         {/* Tree visual */}
         <div className="forest-tree-card-visual">
           <img
             ref={treeRef}
             src={treeAsset}
             alt={isPlanting ? 'Planting' : tree.tree_type.display_name}
             className={`forest-tree-card-image ${tree.is_withered ? 'is-withered' : ''}`}
             style={{ '--tree-width': `${treeWidth}px` }}
           />
         </div>

        {/* UI Container - Set relative so absolute layers stack correctly */}
        <div style={{ position: 'relative' }}>
        
          {/* Planting text layer */}
          <div 
            ref={plantingUiRef}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
              visibility: 'hidden' // Overridden by GSAP autoAlpha
            }}
          >
            <h3 className="forest-tree-card-title" style={{ fontSize: '1.4rem' }}>
              {plantingTitle}
            </h3>
          </div>

          {/* Full interactive UI layer */}
          <div 
            className="forest-tree-card-info" 
            ref={fullUiRef}
            style={{
              visibility: 'hidden' // Overridden by GSAP autoAlpha
            }}
          >
            <div className="forest-tree-card-header">
              <div>
                <span className="forest-tree-card-overline">Active growth</span>
                <h3 className="forest-tree-card-title">{tree.tree_type.display_name}</h3>
              </div>
              <div className={`forest-tree-card-stage ${isAtFinal ? 'is-final' : ''}`}>
                {isAtFinal ? 'Finalizing' : stageName}
              </div>
            </div>

            {/* Progress bar */}
            <div className="forest-tree-card-progress">
              <div className="forest-tree-card-progress-track">
                <div className="forest-tree-card-progress-fill" style={{ width: `${overallProgressPercent}%` }}></div>
              </div>
              <div className="forest-tree-card-progress-label">
                <span>{isAtFinal ? `Archive: ${archiveProgress}/10` : `${Math.round(waterProgressPercent)}%`}</span>
                <span className="forest-tree-card-timer">{timerText}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              className="forest-tree-card-button"
              onClick={onWater}
              disabled={buttonDisabled}
              aria-label={buttonLabel}
            >
              {buttonLabel}
            </button>

            {/* Status text */}
            <p className="forest-tree-card-status">
              {tree.is_withered
                ? `Rescue within ${tree.rescue_hours_remaining ?? 0}h`
                : canWater
                  ? 'Ready to water'
                  : `Next in ${timerText}`}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
