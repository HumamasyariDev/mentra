import { usePageTitle } from "../hooks/usePageTitle";
import React from 'react';
import { Moon, Sun, Map, LayoutGrid, Globe, Palette, Monitor, Info, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/pages/Settings.css';

export default function Settings() {
  usePageTitle('settings:pageTitle');

  const { t, i18n } = useTranslation(['settings', 'common']);
  const { dashboardMode, setDashboardMode } = useDashboardUI();
  const { theme, toggleTheme } = useTheme();
  const pageRef = React.useRef(null);
  const contentRef = React.useRef(null);
  
  const isDarkMode = theme === 'dark';
  const currentLang = i18n.language;

  // Animate on mount
  useGSAP(
    () => {
      if (!pageRef.current) return;

      // Background gradient orbs
      gsap.fromTo(
        '.settings-orb',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', stagger: 0.2 }
      );

      // Content cards stagger
      gsap.fromTo(
        '.settings-card',
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.1, delay: 0.25 }
      );

      // Footer fade
      gsap.fromTo(
        '.settings-footer',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.7 }
      );
    },
    { scope: pageRef }
  );

  const handleModeChange = (newMode) => {
    setDashboardMode(newMode);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div ref={pageRef} className="settings-fullscreen">
      {/* Ambient background orbs */}
      <div className="settings-bg">
        <div className="settings-orb settings-orb--1" />
        <div className="settings-orb settings-orb--2" />
        <div className="settings-orb settings-orb--3" />
      </div>

      {/* Scrollable content area */}
      <div className="settings-scroll" ref={contentRef}>
        <div className="settings-inner">
          {/* Page title */}
          <div className="settings-hero">
            <h1 className="settings-hero-title">{t('settings:pageTitle')}</h1>
            <p className="settings-hero-subtitle">Customize your Mentra experience</p>
          </div>

          {/* Two-column grid on desktop, single on mobile */}
          <div className="settings-grid">
            {/* Language Switcher */}
            <section className="settings-card">
              <div className="card-header">
                <div className="card-icon">
                  <Globe size={20} />
                </div>
                <div className="card-header-text">
                  <h2 className="card-title">{t('settings:language.title')}</h2>
                  <p className="card-desc">{t('settings:language.description')}</p>
                </div>
              </div>

              <div className="language-switcher">
                <button
                  className={`lang-card ${currentLang === 'id' ? 'lang-card--active' : ''}`}
                  onClick={() => handleLanguageChange('id')}
                >
                  <span className="lang-flag">🇮🇩</span>
                  <span className="lang-name">{t('settings:language.indonesian')}</span>
                  {currentLang === 'id' && <div className="lang-check" />}
                </button>
                <button
                  className={`lang-card ${currentLang === 'en' ? 'lang-card--active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span className="lang-flag">🇬🇧</span>
                  <span className="lang-name">{t('settings:language.english')}</span>
                  {currentLang === 'en' && <div className="lang-check" />}
                </button>
              </div>
            </section>

            {/* Appearance / Theme */}
            <section className="settings-card">
              <div className="card-header">
                <div className="card-icon">
                  <Palette size={20} />
                </div>
                <div className="card-header-text">
                  <h2 className="card-title">{t('settings:appearance.title')}</h2>
                  <p className="card-desc">{t('settings:appearance.description')}</p>
                </div>
              </div>

              <label className="theme-toggle-row">
                <div className="theme-toggle-info">
                  <div className="theme-icon-wrap">
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div className="theme-toggle-text">
                    <span className="theme-toggle-label">{t('settings:appearance.darkMode')}</span>
                    <span className="theme-toggle-hint">
                      {isDarkMode ? 'Dark theme is active' : 'Light theme is active'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  className="theme-toggle-input"
                />
                <div className="theme-toggle-track">
                  <div className="theme-toggle-thumb">
                    {isDarkMode
                      ? <Moon size={10} className="theme-thumb-icon" />
                      : <Sun size={10} className="theme-thumb-icon" />
                    }
                  </div>
                </div>
              </label>
            </section>

            {/* Dashboard Display Mode — spans full width */}
            <section className="settings-card settings-card--wide">
              <div className="card-header">
                <div className="card-icon">
                  <Monitor size={20} />
                </div>
                <div className="card-header-text">
                  <h2 className="card-title">{t('settings:dashboardDisplay.title')}</h2>
                  <p className="card-desc">{t('settings:dashboardDisplay.description')}</p>
                </div>
              </div>

              <div className="mode-options">
                {/* Map Mode */}
                <label className={`mode-card ${dashboardMode === 'map' ? 'mode-card--active' : ''}`}>
                  <input
                    type="radio"
                    name="dashboard-mode"
                    value="map"
                    checked={dashboardMode === 'map'}
                    onChange={() => handleModeChange('map')}
                    className="mode-radio-hidden"
                  />
                  <div className="mode-card-icon">
                    <Map size={20} />
                  </div>
                  <div className="mode-card-content">
                    <span className="mode-card-title">{t('settings:dashboardDisplay.mapTitle')}</span>
                    <p className="mode-card-desc">{t('settings:dashboardDisplay.mapDescription')}</p>
                  </div>
                  <div className="mode-indicator" />
                </label>

                {/* Simplified Mode */}
                <label className={`mode-card ${dashboardMode === 'simplified' ? 'mode-card--active' : ''}`}>
                  <input
                    type="radio"
                    name="dashboard-mode"
                    value="simplified"
                    checked={dashboardMode === 'simplified'}
                    onChange={() => handleModeChange('simplified')}
                    className="mode-radio-hidden"
                  />
                  <div className="mode-card-icon">
                    <LayoutGrid size={20} />
                  </div>
                  <div className="mode-card-content">
                    <span className="mode-card-title">{t('settings:dashboardDisplay.simplifiedTitle')}</span>
                    <p className="mode-card-desc">{t('settings:dashboardDisplay.simplifiedDescription')}</p>
                  </div>
                  <div className="mode-indicator" />
                </label>
              </div>

              <div className="mode-note">
                <Sparkles size={14} className="mode-note-icon" />
                <p dangerouslySetInnerHTML={{ __html: t('settings:dashboardDisplay.mobileNote') }} />
              </div>
            </section>

            {/* About — spans full width */}
            <section className="settings-card settings-card--wide settings-card--about">
              <div className="card-header">
                <div className="card-icon">
                  <Info size={20} />
                </div>
                <div className="card-header-text">
                  <h2 className="card-title">{t('settings:about.title')}</h2>
                </div>
              </div>
              <div className="about-body">
                <div className="about-brand">
                  <img src="/mentra_title_logo.svg" alt="Mentra" className="about-logo" />
                  <div className="about-info">
                    <p className="about-name">{t('settings:about.appName')}</p>
                    <p className="about-desc">{t('settings:about.appDescription')}</p>
                  </div>
                </div>
                <div className="about-meta">
                  <div className="about-version-badge">
                    <span className="version-label">Version</span>
                    <code className="version-value">{t('settings:about.version')}</code>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="settings-footer">
            <p>{t('settings:footer.copyright')}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
