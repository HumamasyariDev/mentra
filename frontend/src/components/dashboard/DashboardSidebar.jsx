import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  Folder,
  Calendar,
  GraduationCap,
  MessageCircle,
  TreePine,
  MessageSquare,
  Sparkles,
  Settings,
  X,
  LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/components/dashboard/DashboardSidebar.css";

const productivityItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks", icon: BookOpen },
  { to: "/pomodoro", label: "Pomodoro", icon: FileText },
  { to: "/forest", label: "Forest", icon: TreePine },
  { to: "/schedules", label: "Schedules", icon: Calendar },
  { to: "/mood", label: "Mood", icon: Folder },
];

const aiItems = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/agent", label: "Agent", icon: Sparkles },
  { to: "/sandbox", label: "Sandbox", icon: GraduationCap },
];

const communityItems = [
  { to: "/forum", label: "Forum", icon: MessageCircle },
];

export const DashboardSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="dashboard-sidebar-overlay" onClick={onClose} />
      )}

      {/* Floating Sidebar */}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        {/* Header with close button */}
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-logo">
            <div className="sidebar-logo-icon">M</div>
            <span className="sidebar-logo-text">Mentra</span>
          </div>
          <button
            className="dashboard-sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sections identical to standard Sidebar */}
        <div className="dashboard-sidebar-sections">
          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-section-title">Produktivitas</div>
            <nav className="dashboard-sidebar-nav">
              {productivityItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `dashboard-sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="dashboard-sidebar-icon" />
                  <span className="dashboard-sidebar-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="dashboard-sidebar-section dashboard-sidebar-section-chat">
            <div className="dashboard-sidebar-section-title">AI & Chat</div>
            <nav className="dashboard-sidebar-nav">
              {aiItems.map(({ to, label, icon: Icon, highlight }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `dashboard-sidebar-link ${highlight ? "dashboard-sidebar-link-highlight" : ""} ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="dashboard-sidebar-icon" />
                  <span className="dashboard-sidebar-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-section-title">Komunitas</div>
            <nav className="dashboard-sidebar-nav">
              {communityItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `dashboard-sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="dashboard-sidebar-icon" />
                  <span className="dashboard-sidebar-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="dashboard-sidebar-section">
            <div className="dashboard-sidebar-section-title">Pengaturan</div>
            <nav className="dashboard-sidebar-nav">
              <NavLink
                to="/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `dashboard-sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Settings className="dashboard-sidebar-icon" />
                <span className="dashboard-sidebar-label">Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer / Account */}
        <div className="dashboard-sidebar-footer">
          <div className="dashboard-sidebar-section-title">Akun</div>
          <div className="dashboard-sidebar-account">
            <div className="dashboard-sidebar-account-avatar">
              <img src={user?.avatar || "/default-avatar.png"} alt={user?.name || "User"} />
            </div>
            <div className="dashboard-sidebar-account-info">
              <div className="dashboard-sidebar-account-name">
                {user?.name || "Amirbaqian"}
              </div>
              <div className="dashboard-sidebar-account-role">Teacher</div>
            </div>
          </div>
          
          <button
            className="dashboard-sidebar-logout"
            onClick={handleLogout}
            style={{ marginTop: '12px' }}
          >
            <LogOut size={16} className="dashboard-sidebar-icon" />
            <span className="dashboard-sidebar-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
