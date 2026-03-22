import React, { useState } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/TopBar.css';

export default function TopBar({ user }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifTooltip, setShowNotifTooltip] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="topbar-container">
      <div className="topbar-content">
        {/* Logo/Brand */}
        <div className="topbar-brand">
          <h1 className="topbar-logo">mentra.page</h1>
        </div>

        {/* Spacer */}
        <div className="topbar-spacer" />

        {/* Actions */}
        <div className="topbar-actions">
          {/* Notifications */}
          <div className="topbar-notif-container">
            <button
              className="topbar-action-btn"
              title="Notifications"
              onClick={() => setShowNotifTooltip(!showNotifTooltip)}
            >
              <Bell size={20} />
            </button>
            {showNotifTooltip && (
              <div className="topbar-notif-dropdown">
                <p className="topbar-notif-empty">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="topbar-profile-container">
            <button
              className="topbar-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={`Profile - ${user.name}`}
            >
              <div className="topbar-avatar">
                {getInitials(user.name)}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="topbar-dropdown-menu">
                <div className="topbar-dropdown-header">
                  <p className="topbar-dropdown-name">{user.name}</p>
                  <p className="topbar-dropdown-email">Level {user.level}</p>
                </div>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item" onClick={() => navigate('/profile')}>
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="topbar-dropdown-item" onClick={() => navigate('/settings')}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item topbar-dropdown-item-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
