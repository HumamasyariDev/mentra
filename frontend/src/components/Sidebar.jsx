import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Timer,
    Calendar,
    Smile,
    Bot,
    LogOut,
    Flame,
    Zap,
    Trophy,
    Boxes,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { to: '/schedules', label: 'Schedules', icon: Calendar },
    { to: '/mood', label: 'Mood', icon: Smile },
    { to: '/sandbox', label: 'Sandbox', icon: Boxes },
    { to: '/chat', label: 'AI Chat', icon: Bot },
];

export default function Sidebar({ user, sidebarOpen, onClose, onLogout, theme, isPomodoroPage }) {
    const expToNext = user.exp_to_next_level || user.level * 100;
    const expPercent = expToNext > 0 ? Math.min(100, Math.round((user.current_exp / expToNext) * 100)) : 0;

    // Apply theme colors when on Pomodoro page, otherwise use default
    const sidebarBg = isPomodoroPage && theme ? theme.sidebarBg : 'bg-white';
    const sidebarBorder = isPomodoroPage && theme ? theme.sidebarBorder : 'border-slate-200';
    const textPrimary = isPomodoroPage && theme ? theme.sidebarText : 'text-slate-900';
    const textSecondary = isPomodoroPage && theme?.dark ? 'text-white/70' : 'text-slate-600';
    const isDark = isPomodoroPage && theme?.dark;

    return (
        <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${sidebarBg} border-r ${sidebarBorder} flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
        >
            <div className={`p-6 border-b ${sidebarBorder}`}>
                <h1 className={`text-xl font-bold ${isPomodoroPage && theme ? theme.accent : 'text-indigo-600'}`}>Mentra</h1>
            </div>

            {/* User info + EXP + Streak */}
            <div className={`p-4 border-b ${sidebarBorder} space-y-3`}>
                <p className={`font-medium text-sm truncate ${textPrimary}`}>{user.name}</p>

                {/* Level + EXP bar */}
                <div className={`${isDark ? 'bg-white/10' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'} rounded-xl p-3 ${isDark ? textPrimary : 'text-white'}`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <Zap className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-300'}`} />
                            <span className="text-xs font-bold">Level {user.level}</span>
                        </div>
                        <span className={`text-[10px] ${isDark ? 'opacity-60' : 'text-indigo-200'}`}>
                            {user.current_exp}/{expToNext} EXP
                        </span>
                    </div>
                    <div className={`h-1.5 ${isDark ? 'bg-white/10' : 'bg-white/20'} rounded-full overflow-hidden`}>
                        <div
                            className={`h-full ${isDark ? 'bg-white' : 'bg-white'} rounded-full transition-all duration-500`}
                            style={{ width: `${expPercent}%` }}
                        />
                    </div>
                    <p className={`text-[10px] ${isDark ? 'opacity-60' : 'text-indigo-200'} mt-1`}>Progress to Level {user.level + 1}</p>
                </div>

                {/* Streak + Total EXP row */}
                <div className="grid grid-cols-2 gap-2">
                    <div className={`${isDark ? 'bg-white/10' : 'bg-orange-50'} rounded-lg px-3 py-2 flex items-center gap-2`}>
                        <Flame className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                        <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'} leading-none`}>
                                {user.streak?.current_streak ?? 0}
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-white/50' : 'text-orange-400'}`}>day streak</p>
                        </div>
                    </div>
                    <div className={`${isDark ? 'bg-white/10' : 'bg-indigo-50'} rounded-lg px-3 py-2 flex items-center gap-2`}>
                        <Trophy className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                        <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} leading-none`}>
                                {user.total_exp}
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-white/50' : 'text-indigo-400'}`}>total EXP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? isDark
                                    ? 'bg-white/20 text-white'
                                    : 'bg-indigo-50 text-indigo-700'
                                : isDark
                                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className={`p-3 border-t ${sidebarBorder}`}>
                <button
                    onClick={onLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors ${isDark
                        ? 'text-white/70 hover:bg-red-500/20 hover:text-red-300'
                        : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
