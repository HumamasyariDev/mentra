import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { Loader2, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { PomodoroThemeProvider } from '../contexts/PomodoroThemeContext';
import '../styles/layouts/AppLayout.css';

function AppLayoutContent() {
  const { user, loading, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, dashboardMode } = useDashboardUI();
  const location = useLocation();
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusSidebarOpen, setFocusSidebarOpen] = useState(false);
  const isPomodoroPage = location.pathname === "/pomodoro";
  const isAgentPage = location.pathname === "/agent";
  const isChatPage = location.pathname === "/chat";
  const isDashboardPage = location.pathname === "/dashboard";
  
  // Hide sidebar on dashboard map mode (map mode manages its own sidebar)
  const isMapMode = isDashboardPage && dashboardMode === 'map';

  // Use dashboard context for dashboard page, local state for other pages
  const currentSidebarOpen = isDashboardPage ? sidebarOpen : localSidebarOpen;
  const setCurrentSidebarOpen = isDashboardPage ? setSidebarOpen : setLocalSidebarOpen;

  // Listen for Pomodoro focus mode events
  useEffect(() => {
    const handleStarted = () => {
      setFocusMode(true);
      setFocusSidebarOpen(false);
    };
    const handleStopped = () => {
      setFocusMode(false);
      setFocusSidebarOpen(false);
    };

    window.addEventListener('pomodoro:started', handleStarted);
    window.addEventListener('pomodoro:stopped', handleStopped);
    window.addEventListener('pomodoro:completed', handleStopped);

    return () => {
      window.removeEventListener('pomodoro:started', handleStarted);
      window.removeEventListener('pomodoro:stopped', handleStopped);
      window.removeEventListener('pomodoro:completed', handleStopped);
    };
  }, []);

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

  // Sidebar hidden on desktop due to focus mode (only on Pomodoro page)
  const sidebarFocusHidden = focusMode && isPomodoroPage && !focusSidebarOpen;

  return (
    <div className={`app-layout-container ${sidebarFocusHidden ? "app-layout-focus-hidden" : ""}`}>
      {/* Mobile overlay */}
      {currentSidebarOpen && !isMapMode && (
        <div
          className="app-layout-overlay"
          onClick={() => setCurrentSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on dashboard map mode, shown everywhere else */}
      {!isMapMode && (
        <Sidebar
          sidebarOpen={currentSidebarOpen}
          onClose={() => setCurrentSidebarOpen(false)}
          onLogout={logout}
        />
      )}

      {/* Focus mode toggle button (desktop only, Pomodoro page only) */}
      {focusMode && isPomodoroPage && !isMapMode && (
        <button
          className="focus-sidebar-toggle"
          onClick={() => setFocusSidebarOpen(!focusSidebarOpen)}
          aria-label={focusSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {focusSidebarOpen ? (
            <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
          ) : (
            <ChevronRight style={{ width: "1rem", height: "1rem" }} />
          )}
        </button>
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
