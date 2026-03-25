import { usePageTitle } from "../hooks/usePageTitle";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Map, LayoutGrid, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/pages/Settings.css';

export default function Settings() {
  usePageTitle('settings:pageTitle');

  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { dashboardMode, setDashboardMode } = useDashboardUI();
  const { theme, toggleTheme } = useTheme();
  const contentRef = React.useRef(null);
  
  const isDarkMode = theme === 'dark';
  const currentLang = i18n.language;

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

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="settings-page">
      <div ref={contentRef} className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <button
            className="settings-back-btn"
            onClick={handleBackClick}
            aria-label={t('settings:goBack')}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="settings-title">{t('settings:pageTitle')}</h1>
          <div className="settings-spacer"></div>
        </header>

        {/* Settings Sections */}
        <main className="settings-main">
          {/* Language Switcher */}
          <section className="settings-section">
            <div className="section-title-row">
              <Globe size={18} className="section-title-icon" />
              <h2 className="section-title">{t('settings:language.title')}</h2>
            </div>
            <p className="section-description">
              {t('settings:language.description')}
            </p>

            <div className="language-switcher">
              <button
                className={`language-btn ${currentLang === 'id' ? 'language-btn--active' : ''}`}
                onClick={() => handleLanguageChange('id')}
              >
                {t('settings:language.indonesian')}
              </button>
              <button
                className={`language-btn ${currentLang === 'en' ? 'language-btn--active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                {t('settings:language.english')}
              </button>
            </div>
          </section>

          {/* Dashboard Display Mode */}
          <section className="settings-section">
            <h2 className="section-title">{t('settings:dashboardDisplay.title')}</h2>
            <p className="section-description">
              {t('settings:dashboardDisplay.description')}
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
                    <span className="option-title">{t('settings:dashboardDisplay.mapTitle')}</span>
                  </div>
                  <p className="option-description">
                    {t('settings:dashboardDisplay.mapDescription')}
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
                    <span className="option-title">{t('settings:dashboardDisplay.simplifiedTitle')}</span>
                  </div>
                  <p className="option-description">
                    {t('settings:dashboardDisplay.simplifiedDescription')}
                  </p>
                </div>
                <div className="option-checkmark"></div>
              </label>
            </div>

            <div className="mode-note">
              <p
                dangerouslySetInnerHTML={{
                  __html: `💡 ${t('settings:dashboardDisplay.mobileNote')}`,
                }}
              />
            </div>
          </section>

          {/* Theme Settings */}
          <section className="settings-section">
            <h2 className="section-title">{t('settings:appearance.title')}</h2>
            <p className="section-description">
              {t('settings:appearance.description')}
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
              <span className="toggle-label">{t('settings:appearance.darkMode')}</span>
            </label>
          </section>

          {/* About */}
          <section className="settings-section">
            <h2 className="section-title">{t('settings:about.title')}</h2>
            <div className="about-content">
              <p>
                <strong>{t('settings:about.appName')}</strong>
              </p>
              <p>{t('settings:about.appDescription')}</p>
              <p className="version-info">{t('settings:about.version')}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="settings-footer">
          <p>{t('settings:footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
}
