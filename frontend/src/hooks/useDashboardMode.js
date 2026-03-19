import { useState } from 'react';

const STORAGE_KEY = 'dashboard-mode';
const MODES = {
  MAP: 'map',
  SIMPLIFIED: 'simplified',
};

export function useDashboardMode() {
  const [mode, setModeState] = useState(() => {
    // Initialize from localStorage, default to 'map'
    if (typeof window === 'undefined') return MODES.MAP;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || MODES.MAP;
  });

  const setMode = (newMode) => {
    if (Object.values(MODES).includes(newMode)) {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  };

  return { mode, setMode, MODES };
}
