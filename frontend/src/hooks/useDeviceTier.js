import { useMemo } from 'react';

/**
 * Detect device capability tier: 'low', 'mid', or 'high'.
 * Uses navigator.hardwareConcurrency, deviceMemory, and a mobile heuristic.
 * Result is computed once and cached for the lifetime of the component.
 */
function getDeviceTier() {
  const cores = navigator.hardwareConcurrency || 2;
  const mem = navigator.deviceMemory || 4; // deviceMemory is Chrome-only, default 4
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile || cores <= 2 || mem <= 2) return 'low';
  if (cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

/** Cached tier — computed once per page load */
let _cachedTier = null;

export function getDeviceTierOnce() {
  if (!_cachedTier) _cachedTier = getDeviceTier();
  return _cachedTier;
}

/**
 * React hook returning the device tier: 'low' | 'mid' | 'high'.
 * Also downgrades to 'low' if prefers-reduced-motion is active.
 */
export function useDeviceTier(reducedMotion = false) {
  return useMemo(() => {
    if (reducedMotion) return 'low';
    return getDeviceTierOnce();
  }, [reducedMotion]);
}
