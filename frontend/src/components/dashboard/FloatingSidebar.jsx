import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { X } from 'lucide-react';
import '../../styles/components/dashboard/FloatingSidebar.css';

export const FloatingSidebar = ({ isOpen, onClose, onNavigate }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const sidebarRef = React.useRef(null);
  const overlayRef = React.useRef(null);

  useGSAP(
    () => {
      if (!sidebarRef.current || !overlayRef.current) {
        return;
      }

      if (isOpen) {
        // Animate in
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );

        gsap.fromTo(
          sidebarRef.current,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      } else {
        // Animate out
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });

        gsap.to(sidebarRef.current, {
          x: -100,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });

        // Restore body scroll
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    },
    { dependencies: [isOpen], scope: React.useRef(null) }
  );

  const handleClose = () => {
    onClose();
  };

  const handleNavigate = (destination) => {
    onNavigate?.(destination);
    handleClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        ref={overlayRef}
        className="floating-sidebar-overlay"
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside ref={sidebarRef} className="floating-sidebar">
        {/* Close button */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">{t('dashboard:floatingSidebar.menu')}</h2>
          <button
            className="sidebar-close-btn"
            onClick={handleClose}
            aria-label={t('dashboard:sidebar.closeMenu')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li>
              <a
                href="#/"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/');
                }}
              >
                <span className="sidebar-link-icon">🏠</span>
                <span>{t('common:nav.dashboard')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/tasks"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/tasks');
                }}
              >
                <span className="sidebar-link-icon">✓</span>
                <span>{t('common:nav.tasks')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/pomodoro"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/pomodoro');
                }}
              >
                <span className="sidebar-link-icon">🍅</span>
                <span>{t('common:nav.pomodoro')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/forest"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/forest');
                }}
              >
                <span className="sidebar-link-icon">🌳</span>
                <span>{t('common:nav.forest')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/schedules"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/schedules');
                }}
              >
                <span className="sidebar-link-icon">📅</span>
                <span>{t('common:nav.schedules')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/chat"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/chat');
                }}
              >
                <span className="sidebar-link-icon">💬</span>
                <span>{t('common:sections.aiChat')}</span>
              </a>
            </li>
            <li>
              <a
                href="#/forum"
                className="sidebar-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate('/forum');
                }}
              >
                <span className="sidebar-link-icon">👥</span>
                <span>{t('common:nav.forum')}</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Settings section */}
        <div className="sidebar-footer">
          <a
            href="#/settings"
            className="sidebar-settings-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/settings');
            }}
          >
            <span className="sidebar-link-icon">⚙️</span>
            <span>{t('common:nav.settings')}</span>
          </a>
        </div>
      </aside>
    </>
  );
};
