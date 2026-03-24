import { useState, useRef, useEffect } from "react";
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
  LogOut,
  ChevronUp,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { profileApi } from "../../services/api";
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

export const DashboardSidebar = ({ isOpen, onClose, shouldFadeOut = false }) => {
  const { user, logout, refreshUser } = useAuth();
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

  // Reset panel when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setShowAccountPanel(false);
      setShowDeleteConfirm(false);
      setDeleteText("");
      setError("");
    }
  }, [isOpen]);

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
    onClose();
    logout();
  };

  const userInitial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="dashboard-sidebar-overlay" onClick={onClose} />
      )}

      {/* Floating Sidebar */}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""} ${shouldFadeOut ? "fade-out-immediate" : ""}`}>
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
        <div className="dashboard-sidebar-footer" ref={panelRef}>
          {/* Account Dropdown Panel */}
          {showAccountPanel && (
            <div className="dashboard-sidebar-account-panel">
              {/* Panel Header */}
              <div className="dsb-panel-header">
                <div className="dsb-panel-avatar">{userInitial}</div>
                <div className="dsb-panel-info">
                  <div className="dsb-panel-name">{user?.name || "User"}</div>
                  <div className="dsb-panel-email">{user?.email}</div>
                  <div className="dsb-panel-meta">
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
              <div className="dsb-panel-section">
                <label className="dsb-panel-label">Display Name</label>
                <div className="dsb-panel-input-row">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="dsb-panel-input"
                    placeholder="Your name"
                    disabled={saving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !editName.trim() || editName.trim() === user?.name}
                    className="dsb-panel-save-btn"
                    title="Save name"
                  >
                    {saving ? <Loader2 size={14} className="dsb-spinner" /> : <Save size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && <div className="dsb-panel-error">{error}</div>}

              {/* Logout */}
              <button className="dsb-panel-logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>

              {/* Delete Account */}
              <div className="dsb-panel-danger-zone">
                {!showDeleteConfirm ? (
                  <button
                    className="dsb-panel-delete-trigger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={14} />
                    <span>Delete Account</span>
                  </button>
                ) : (
                  <div className="dsb-panel-delete-confirm">
                    <p className="dsb-panel-delete-warning">
                      Type <strong>DELETE</strong> to permanently remove your account.
                    </p>
                    <div className="dsb-panel-input-row">
                      <input
                        type="text"
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                        className="dsb-panel-input dsb-panel-input-danger"
                        placeholder="Type DELETE"
                        disabled={deleting}
                      />
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteText !== "DELETE"}
                        className="dsb-panel-confirm-delete-btn"
                      >
                        {deleting ? (
                          <Loader2 size={14} className="dsb-spinner" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                    <button
                      className="dsb-panel-cancel-delete"
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
          <div className="dashboard-sidebar-section-title">Akun</div>
          <button className="dashboard-sidebar-account" onClick={togglePanel}>
            <div className="dashboard-sidebar-account-avatar">{userInitial}</div>
            <div className="dashboard-sidebar-account-info">
              <div className="dashboard-sidebar-account-name">
                {user?.name || "User"}
              </div>
              <div className="dashboard-sidebar-account-role">Level {user?.level || 1}</div>
            </div>
            <ChevronUp
              size={16}
              className={`dashboard-sidebar-account-chevron ${showAccountPanel ? "open" : ""}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
};
