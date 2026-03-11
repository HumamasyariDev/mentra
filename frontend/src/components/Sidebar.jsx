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
    BrainCircuit,
    MessageSquare,
} from 'lucide-react';
import '../styles/components/Sidebar.css';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { to: '/schedules', label: 'Schedules', icon: Calendar },
    { to: '/mood', label: 'Mood', icon: Smile },
    { to: '/sandbox', label: 'Sandbox', icon: Boxes },
    { to: '/chat', label: 'AI Chat', icon: Bot },
    { to: '/agent', label: 'Agent', icon: BrainCircuit },
    { to: '/forum', label: 'Forum', icon: MessageSquare },
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
            className={`sidebar ${!isPomodoroPage ? 'sidebar-bg-default' : ''} ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}
            style={isPomodoroPage && theme ? {
                backgroundColor: theme.sidebarBg?.replace('bg-', ''),
                borderRightColor: theme.sidebarBorder?.replace('border-', '')
            } : {}}
        >
            <div className="sidebar-header" style={isPomodoroPage && theme ? {
                borderBottomColor: theme.sidebarBorder?.replace('border-', '')
            } : {}}>
                <h1 className="sidebar-logo" style={isPomodoroPage && theme ? {
                    color: theme.accent?.replace('text-', '')
                } : {}}>Mentra</h1>
            </div>

            {/* User info + EXP + Streak */}
            <div className="sidebar-user-info" style={isPomodoroPage && theme ? {
                borderBottomColor: theme.sidebarBorder?.replace('border-', '')
            } : {}}>
                <p className="sidebar-username" style={isPomodoroPage && theme ? {
                    color: theme.sidebarText?.replace('text-', '')
                } : {}}>{user.name}</p>

                {/* Level + EXP bar */}
                <div className={`sidebar-level-card ${isDark ? 'dark' : ''}`}>
                    <div className="sidebar-level-header">
                        <div className="sidebar-level-badge">
                            <Zap className={`sidebar-level-icon ${isDark ? 'dark' : ''}`} />
                            <span className="sidebar-level-text">Level {user.level}</span>
                        </div>
                        <span className={`sidebar-level-exp ${isDark ? 'dark' : ''}`}>
                            {user.current_exp}/{expToNext} EXP
                        </span>
                    </div>
                    <div className={`sidebar-progress-bar ${isDark ? 'dark' : ''}`}>
                        <div
                            className="sidebar-progress-fill"
                            style={{ width: `${expPercent}%` }}
                        />
                    </div>
                    <p className={`sidebar-progress-label ${isDark ? 'dark' : ''}`}>Progress to Level {user.level + 1}</p>
                </div>

                {/* Streak + Total EXP row */}
                <div className="sidebar-stats-grid">
                    <div className={`sidebar-stat-card streak ${isDark ? 'dark' : ''}`}>
                        <Flame className={`sidebar-stat-icon streak ${isDark ? 'dark' : ''}`} />
                        <div>
                            <p className={`sidebar-stat-value streak ${isDark ? 'dark' : ''}`}>
                                {user.streak?.current_streak ?? 0}
                            </p>
                            <p className={`sidebar-stat-label streak ${isDark ? 'dark' : ''}`}>day streak</p>
                        </div>
                    </div>
                    <div className={`sidebar-stat-card exp ${isDark ? 'dark' : ''}`}>
                        <Trophy className={`sidebar-stat-icon exp ${isDark ? 'dark' : ''}`} />
                        <div>
                            <p className={`sidebar-stat-value exp ${isDark ? 'dark' : ''}`}>
                                {user.total_exp}
                            </p>
                            <p className={`sidebar-stat-label exp ${isDark ? 'dark' : ''}`}>total EXP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sidebar-nav-link ${isActive ? 'active' : 'inactive'} ${isDark ? 'dark' : ''}`
                        }
                    >
                        <Icon className="sidebar-nav-icon" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="sidebar-logout" style={isPomodoroPage && theme ? {
                borderTopColor: theme.sidebarBorder?.replace('border-', '')
            } : {}}>
                <button
                    onClick={onLogout}
                    className={`sidebar-logout-btn ${isDark ? 'dark' : ''}`}
                >
                    <LogOut className="sidebar-logout-icon" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
