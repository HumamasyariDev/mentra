import { createContext, useContext, useState, useEffect } from 'react';

const backgrounds = [
  { key: 'default', label: 'Default', accent: null, accentLight: null, accentDark: null, accentBg: null, glow: null },
  { key: 'sunset', label: 'Sunset', accent: '#f97316', accentLight: '#fb923c', accentDark: '#ea580c', accentBg: 'rgba(249, 115, 22, 0.12)', glow: 'rgba(249, 115, 22, 0.25)' },
  { key: 'ocean', label: 'Ocean', accent: '#0ea5e9', accentLight: '#38bdf8', accentDark: '#0284c7', accentBg: 'rgba(14, 165, 233, 0.12)', glow: 'rgba(14, 165, 233, 0.25)' },
  { key: 'forest', label: 'Forest', accent: '#10b981', accentLight: '#34d399', accentDark: '#059669', accentBg: 'rgba(16, 185, 129, 0.12)', glow: 'rgba(16, 185, 129, 0.25)' },
  { key: 'lavender', label: 'Lavender', accent: '#8b5cf6', accentLight: '#a78bfa', accentDark: '#7c3aed', accentBg: 'rgba(139, 92, 246, 0.12)', glow: 'rgba(139, 92, 246, 0.25)' },
  { key: 'midnight', label: 'Midnight', accent: '#6366f1', accentLight: '#818cf8', accentDark: '#4f46e5', accentBg: 'rgba(99, 102, 241, 0.12)', glow: 'rgba(99, 102, 241, 0.25)' },
  { key: 'rose', label: 'Rose', accent: '#f43f5e', accentLight: '#fb7185', accentDark: '#e11d48', accentBg: 'rgba(244, 63, 94, 0.12)', glow: 'rgba(244, 63, 94, 0.25)' },
];

const PomodoroThemeContext = createContext();

export function PomodoroThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('mentra_pomodoro_bg') || 'default');

  const theme = backgrounds.find((b) => b.key === themeKey) || backgrounds[0];

  useEffect(() => {
    localStorage.setItem('mentra_pomodoro_bg', themeKey);
  }, [themeKey]);

  return (
    <PomodoroThemeContext.Provider value={{ theme, setTheme: setThemeKey, backgrounds }}>
      {children}
    </PomodoroThemeContext.Provider>
  );
}

export function usePomodoroTheme() {
  const context = useContext(PomodoroThemeContext);
  if (!context) {
    throw new Error('usePomodoroTheme must be used within PomodoroThemeProvider');
  }
  return context;
}
