import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PomodoroThemeProvider, usePomodoroTheme } from '../contexts/PomodoroThemeContext';
import '../styles/layouts/AppLayout.css';

function AppLayoutContent() {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, isPomodoroPage } = usePomodoroTheme();
  const location = useLocation();
  const isAgentPage = location.pathname === "/agent";
  const isChatPage = location.pathname === "/chat";

  if (loading) {
    return (
      <div className="app-layout-loading">
        <Loader2 className="app-layout-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="app-layout-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
        theme={theme}
        isPomodoroPage={isPomodoroPage}
      />

      {/* Main content */}
      <div className="app-layout-main">
        {/* Mobile header */}
        <header className="app-layout-mobile-header">
          <button onClick={() => setSidebarOpen(true)} className="app-layout-menu-btn">
            <Menu className="app-layout-menu-icon" />
          </button>
          <h1 className="app-layout-mobile-logo">Mentra</h1>
        </header>

        <main className={`app-layout-content ${isAgentPage ? "app-layout-content-agent" : ""} ${isChatPage ? "app-layout-content-chat" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <PomodoroThemeProvider>
      <AppLayoutContent />
    </PomodoroThemeProvider>
  );
}
