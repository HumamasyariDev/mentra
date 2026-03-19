import React, { useRef } from 'react';
import { Menu } from 'lucide-react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../../styles/components/dashboard/DashboardFloatingUI.css';

export const DashboardFloatingUI = ({ stats = {}, shouldFadeOut = false }) => {
  const { setSidebarOpen } = useDashboardUI();
  const containerRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  const {
    level = 12,
    exp = 3200,
    maxExp = 5000,
    streak = 7,
  } = stats;

  const expPercentage = (exp / maxExp) * 100;

  // Fade out animation when island is clicked
  useGSAP(
    () => {
      if (shouldFadeOut && containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        });
      }
    },
    { dependencies: [shouldFadeOut] }
  );

  const handleHamburgerClick = () => {
    if (!shouldFadeOut) {
      setSidebarOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="dashboard-floating-ui">
      {/* Hamburger Button - Top Left */}
      <button
        ref={hamburgerRef}
        className="dashboard-hamburger"
        onClick={handleHamburgerClick}
        aria-label="Toggle menu"
        disabled={shouldFadeOut}
      >
        <Menu size={20} />
      </button>

      {/* Compact Info Bar - Top Middle */}
      <div className="dashboard-info-bar">
        {/* Level Badge */}
        <div className="info-badge info-level">
          <span className="badge-label">Lvl</span>
          <span className="badge-value">{level}</span>
        </div>

        {/* EXP Bar */}
        <div className="info-exp-container">
          <div className="exp-bar-mini">
            <div className="exp-fill-mini" style={{ width: `${expPercentage}%` }}></div>
          </div>
          <span className="exp-text-mini">
            {exp}/{maxExp}
          </span>
        </div>

        {/* Streak Badge */}
        <div className="info-badge info-streak">
          <span className="streak-icon">🔥</span>
          <span className="badge-value">{streak}</span>
        </div>
      </div>
    </div>
  );
};
