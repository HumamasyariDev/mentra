import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  Folder,
  Calendar,
  GraduationCap,
  MessageCircle,
  BarChart3,
  TreePine,
  MessageSquare,
  Sparkles,
  Settings,
} from "lucide-react";
import "../styles/components/Sidebar.css";

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

export default function Sidebar({ user, sidebarOpen, onClose, onLogout }) {
  return (
    <aside
      className={`sidebar ${sidebarOpen ? "sidebar-visible" : "sidebar-hidden"}`}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">M</div>
        </div>
        <button className="sidebar-toggle" onClick={onClose}>
          <span className="sidebar-toggle-icon"></span>
        </button>
      </div>

      <div className="sidebar-sections">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Produktivitas</div>
          <nav className="sidebar-nav">
            {productivityItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-section sidebar-section-chat">
          <div className="sidebar-section-title">AI & Chat</div>
          <nav className="sidebar-nav">
            {aiItems.map(({ to, label, icon: Icon, highlight }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-link ${highlight ? "sidebar-nav-link-highlight" : ""} ${isActive ? "active" : ""}`
                }
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Komunitas</div>
          <nav className="sidebar-nav">
            {communityItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Pengaturan</div>
          <nav className="sidebar-nav">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Settings className="sidebar-nav-icon" />
              <span className="sidebar-nav-label">Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-section-title">Akun</div>
        <div className="sidebar-account">
          <div className="sidebar-account-avatar">
            <img src={user.avatar || "/default-avatar.png"} alt={user.name} />
          </div>
          <div className="sidebar-account-info">
            <div className="sidebar-account-name">
              {user.name || "Amirbaqian"}
            </div>
            <div className="sidebar-account-role">Teacher</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
