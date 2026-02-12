import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Calendar,
  Smile,
  Bot,
  LogOut,
  Loader2,
  Menu,
  X,
  Flame,
  Zap,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/pomodoro', label: 'Focus Timer', icon: Timer },
  { to: '/schedules', label: 'Schedules', icon: Calendar },
  { to: '/mood', label: 'Mood', icon: Smile },
  { to: '/chat', label: 'AI Chat', icon: Bot },
];

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const expToNext = user.exp_to_next_level || user.level * 100;
  const expPercent = expToNext > 0 ? Math.min(100, Math.round((user.current_exp / expToNext) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600">Mentra</h1>
        </div>

        {/* User info + EXP + Streak */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <p className="font-medium text-sm truncate">{user.name}</p>

          {/* Level + EXP bar */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">Level {user.level}</span>
              </div>
              <span className="text-[10px] text-indigo-200">
                {user.current_exp}/{expToNext} EXP
              </span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${expPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-indigo-200 mt-1">Progress to Level {user.level + 1}</p>
          </div>

          {/* Streak + Total EXP row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-orange-600 leading-none">
                  {user.streak?.current_streak ?? 0}
                </p>
                <p className="text-[10px] text-orange-400">day streak</p>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-sm font-bold text-indigo-600 leading-none">
                  {user.total_exp}
                </p>
                <p className="text-[10px] text-indigo-400">total EXP</p>
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
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
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
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-indigo-600">Mentra</h1>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
