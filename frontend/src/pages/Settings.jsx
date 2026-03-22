import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Map, LayoutGrid } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/pages/Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { dashboardMode, setDashboardMode } = useDashboardUI();
  const { theme, toggleTheme } = useTheme();
  const contentRef = React.useRef(null);
  
  const isDarkMode = theme === 'dark';

  // Animate on mount
  useGSAP(
    () => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          }
        );
      }
    },
    { scope: contentRef }
  );

  const handleModeChange = (newMode) => {
    setDashboardMode(newMode);
  };

  const handleBackClick = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        navigate(-1);
      },
    });
  };

  return (
    <div className="settings-page">
      <div ref={contentRef} className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <button
            className="settings-back-btn"
            onClick={handleBackClick}
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="settings-title">Settings</h1>
          <div className="settings-spacer"></div>
        </header>

        {/* Settings Sections */}
        <main className="settings-main">
          {/* Dashboard Display Mode */}
          <section className="settings-section">
            <h2 className="section-title">Dashboard Display</h2>
            <p className="section-description">
              Choose how you want to view your dashboard
            </p>

            <div className="settings-options">
              {/* Map Mode */}
              <label className="settings-option">
                <input
                  type="radio"
                  name="dashboard-mode"
                  value="map"
                  checked={dashboardMode === 'map'}
                  onChange={() => handleModeChange('map')}
                  className="option-radio"
                />
                <div className="option-content">
                  <div className="option-header">
                    <Map size={20} className="option-icon" />
                    <span className="option-title">Archipelago Map</span>
                  </div>
                  <p className="option-description">
                    Explore your dashboard as an interactive island map with pan/zoom controls
                  </p>
                </div>
                <div className="option-checkmark"></div>
              </label>

              {/* Simplified Mode */}
              <label className="settings-option">
                <input
                  type="radio"
                  name="dashboard-mode"
                  value="simplified"
                  checked={dashboardMode === 'simplified'}
                  onChange={() => handleModeChange('simplified')}
                  className="option-radio"
                />
                <div className="option-content">
                  <div className="option-header">
                    <LayoutGrid size={20} className="option-icon" />
                    <span className="option-title">Simplified Dashboard</span>
                  </div>
                  <p className="option-description">
                    View your progress and quick actions in a clean card-based layout
                  </p>
                </div>
                <div className="option-checkmark"></div>
              </label>
            </div>

            <div className="mode-note">
              <p>
                💡 <strong>Note:</strong> On mobile devices, the simplified dashboard is always used for better usability.
              </p>
            </div>
          </section>

          {/* Theme Settings */}
          <section className="settings-section">
            <h2 className="section-title">Appearance</h2>
            <p className="section-description">
              Customize how the interface looks
            </p>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="toggle-input"
              />
              <div className="toggle-track">
                <div className="toggle-thumb"></div>
                {isDarkMode ? (
                  <Moon size={14} className="toggle-icon" />
                ) : (
                  <Sun size={14} className="toggle-icon" />
                )}
              </div>
              <span className="toggle-label">Dark Mode</span>
            </label>
          </section>

          {/* About */}
          <section className="settings-section">
            <h2 className="section-title">About</h2>
            <div className="about-content">
              <p>
                <strong>Mentra Dashboard v1.0</strong>
              </p>
              <p>An intelligent productivity and learning companion.</p>
              <p className="version-info">Version 1.0.0</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="settings-footer">
          <p>© 2025 Mentra. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
