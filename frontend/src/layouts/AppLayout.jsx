import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { Loader2, Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PomodoroThemeProvider, usePomodoroTheme } from '../contexts/PomodoroThemeContext';
import '../styles/layouts/AppLayout.css';

function AppLayoutContent() {
  const { user, loading, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, dashboardMode } = useDashboardUI();
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false);
  const { theme, isPomodoroPage } = usePomodoroTheme();
  const isAgentPage = window.location.pathname === "/agent";
  const isChatPage = window.location.pathname === "/chat";
  const isDashboardPage = window.location.pathname === "/dashboard";
  
  // Hide sidebar on dashboard map mode (map mode manages its own sidebar)
  const isMapMode = isDashboardPage && dashboardMode === 'map';

  // Use dashboard context for dashboard page, local state for other pages
  const currentSidebarOpen = isDashboardPage ? sidebarOpen : localSidebarOpen;
  const setCurrentSidebarOpen = isDashboardPage ? setSidebarOpen : setLocalSidebarOpen;

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
      {currentSidebarOpen && !isMapMode && (
        <div
          className="app-layout-overlay"
          onClick={() => setCurrentSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on dashboard map mode, shown everywhere else including simplified dashboard */}
      {!isMapMode && (
        <Sidebar
          user={user}
          sidebarOpen={currentSidebarOpen}
          onClose={() => setCurrentSidebarOpen(false)}
          onLogout={logout}
          theme={theme}
          isPomodoroPage={isPomodoroPage}
        />
      )}

      {/* Main content */}
      <div className="app-layout-main">
        {/* Mobile header */}
        <header className="app-layout-mobile-header">
          <button onClick={() => setCurrentSidebarOpen(true)} className="app-layout-menu-btn">
            <Menu className="app-layout-menu-icon" />
          </button>
          <h1 className="app-layout-mobile-logo">Mentra</h1>
        </header>

        <main className={`app-layout-content ${isAgentPage ? "app-layout-content-agent" : ""} ${isChatPage ? "app-layout-content-chat" : ""} ${isDashboardPage ? "app-layout-content-dashboard" : ""}`}>
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
