import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  LogOut,
  ChevronUp,
  Save,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { profileApi } from "../services/api";
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

export default function Sidebar({ sidebarOpen, onClose, onLogout }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    if (!showAccountPanel) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowAccountPanel(false);
        setShowDeleteConfirm(false);
        setDeleteText("");
        setError("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAccountPanel]);

  const togglePanel = () => {
    if (!showAccountPanel) {
      setEditName(user?.name || "");
      setShowDeleteConfirm(false);
      setDeleteText("");
      setError("");
    }
    setShowAccountPanel(!showAccountPanel);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === user?.name) return;
    setSaving(true);
    setError("");
    try {
      await profileApi.update({ name: editName.trim() });
      await refreshUser();
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    setError("");
    try {
      await profileApi.deleteAccount("DELETE");
      // Account deleted — clear local state and redirect
      localStorage.removeItem("mentra_token");
      localStorage.removeItem("mentra_user");
      window.location.href = "/login";
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    setShowAccountPanel(false);
    onLogout();
  };

  const userInitial = (user?.name || "U").charAt(0).toUpperCase();

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

      <div className="sidebar-footer" ref={panelRef}>
        {/* Account Dropdown Panel */}
        {showAccountPanel && (
          <div className="sidebar-account-panel">
            {/* Panel Header */}
            <div className="sidebar-panel-header">
              <div className="sidebar-panel-avatar">{userInitial}</div>
              <div className="sidebar-panel-info">
                <div className="sidebar-panel-name">{user?.name || "User"}</div>
                <div className="sidebar-panel-email">{user?.email}</div>
                <div className="sidebar-panel-meta">
                  Member since{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* Edit Name */}
            <div className="sidebar-panel-section">
              <label className="sidebar-panel-label">Display Name</label>
              <div className="sidebar-panel-input-row">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="sidebar-panel-input"
                  placeholder="Your name"
                  disabled={saving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !editName.trim() || editName.trim() === user?.name}
                  className="sidebar-panel-save-btn"
                  title="Save name"
                >
                  {saving ? <Loader2 size={14} className="sidebar-spinner" /> : <Save size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <div className="sidebar-panel-error">{error}</div>}

            {/* Logout */}
            <button className="sidebar-panel-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            {/* Delete Account */}
            <div className="sidebar-panel-danger-zone">
              {!showDeleteConfirm ? (
                <button
                  className="sidebar-panel-delete-trigger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="sidebar-panel-delete-confirm">
                  <p className="sidebar-panel-delete-warning">
                    Type <strong>DELETE</strong> to permanently remove your account.
                  </p>
                  <div className="sidebar-panel-input-row">
                    <input
                      type="text"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      className="sidebar-panel-input sidebar-panel-input-danger"
                      placeholder="Type DELETE"
                      disabled={deleting}
                    />
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteText !== "DELETE"}
                      className="sidebar-panel-confirm-delete-btn"
                    >
                      {deleting ? (
                        <Loader2 size={14} className="sidebar-spinner" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                  <button
                    className="sidebar-panel-cancel-delete"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Row (clickable) */}
        <div className="sidebar-section-title">Akun</div>
        <button className="sidebar-account" onClick={togglePanel}>
          <div className="sidebar-account-avatar">{userInitial}</div>
          <div className="sidebar-account-info">
            <div className="sidebar-account-name">
              {user?.name || "User"}
            </div>
            <div className="sidebar-account-role">Level {user?.level || 1}</div>
          </div>
          <ChevronUp
            size={16}
            className={`sidebar-account-chevron ${showAccountPanel ? "open" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
}
