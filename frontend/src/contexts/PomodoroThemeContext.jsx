import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const backgrounds = [
    { key: 'cozy-room', label: 'Cozy Room', gradient: 'from-amber-50 via-orange-50 to-yellow-50', accent: 'text-amber-700', catBg: 'bg-amber-100', sidebarBg: 'bg-gradient-to-b from-amber-50 to-orange-50', sidebarText: 'text-amber-900', sidebarBorder: 'border-amber-200' },
    { key: 'night-sky', label: 'Night Sky', gradient: 'from-slate-800 via-indigo-900 to-slate-900', accent: 'text-indigo-300', catBg: 'bg-indigo-800', dark: true, sidebarBg: 'bg-gradient-to-b from-slate-800 to-indigo-900', sidebarText: 'text-white', sidebarBorder: 'border-indigo-700' },
    { key: 'garden', label: 'Garden', gradient: 'from-emerald-50 via-green-50 to-lime-50', accent: 'text-emerald-700', catBg: 'bg-emerald-100', sidebarBg: 'bg-gradient-to-b from-emerald-50 to-green-50', sidebarText: 'text-emerald-900', sidebarBorder: 'border-emerald-200' },
    { key: 'ocean', label: 'Ocean', gradient: 'from-cyan-50 via-sky-50 to-blue-50', accent: 'text-sky-700', catBg: 'bg-sky-100', sidebarBg: 'bg-gradient-to-b from-cyan-50 to-sky-50', sidebarText: 'text-sky-900', sidebarBorder: 'border-sky-200' },
    { key: 'sakura', label: 'Sakura', gradient: 'from-pink-50 via-rose-50 to-fuchsia-50', accent: 'text-pink-700', catBg: 'bg-pink-100', sidebarBg: 'bg-gradient-to-b from-pink-50 to-rose-50', sidebarText: 'text-pink-900', sidebarBorder: 'border-pink-200' },
    { key: 'minimal', label: 'Minimal', gradient: 'from-slate-50 via-white to-slate-50', accent: 'text-slate-700', catBg: 'bg-slate-100', sidebarBg: 'bg-white', sidebarText: 'text-slate-900', sidebarBorder: 'border-slate-200' },
];

const PomodoroThemeContext = createContext();

export function PomodoroThemeProvider({ children }) {
    const location = useLocation();
    const [themeKey, setThemeKey] = useState(() => localStorage.getItem('mentra_pomodoro_bg') || 'cozy-room');

    const theme = backgrounds.find((b) => b.key === themeKey) || backgrounds[0];
    const isPomodoroPage = location.pathname === '/pomodoro';

    useEffect(() => {
        localStorage.setItem('mentra_pomodoro_bg', themeKey);
    }, [themeKey]);

    return (
        <PomodoroThemeContext.Provider value={{ theme, setTheme: setThemeKey, isPomodoroPage, backgrounds }}>
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
