import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Folder,
  Calendar,
  GraduationCap,
  MessageCircle,
  BarChart3,
  FileBarChart,
  Newspaper,
  Activity,
  Sparkles,
  LogOut,
  TreePine,
} from "lucide-react";
import "../styles/components/Sidebar.css";

const mainMenuItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks", icon: BookOpen },
  { to: "/pomodoro", label: "Pomodoro", icon: FileText },
  { to: "/forest", label: "Forest", icon: TreePine },
  { to: "/schedules", label: "Schedules", icon: Calendar },
  { to: "/mood", label: "Mood", icon: Folder },
  { to: "/sandbox", label: "Sandbox", icon: GraduationCap },
  { to: "/agent", label: "Agent", icon: BarChart3 },
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

      <div className="sidebar-section">
        <div className="sidebar-section-title">Main menu</div>
        <nav className="sidebar-nav">
          {mainMenuItems.map(({ to, label, icon: Icon, badge }) => (
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
              {badge && <span className="sidebar-nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-section-title">Account</div>
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
