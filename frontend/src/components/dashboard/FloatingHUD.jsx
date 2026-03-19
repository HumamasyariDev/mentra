import React, { useState, useEffect } from 'react';
import '../../styles/components/dashboard/FloatingHUD.css';

export const FloatingHUD = ({ onHamburgerClick }) => {
  const [stats, setStats] = useState({
    level: 12,
    exp: 3200,
    maxExp: 5000,
    streak: 7,
  });

  // Fetch user stats (this would integrate with your backend later)
  useEffect(() => {
    // TODO: Fetch actual user stats from API
    // For now, using mock data
  }, []);

  const expPercentage = (stats.exp / stats.maxExp) * 100;

  return (
    <div className="floating-hud">
      {/* Hamburger Menu - Top Left */}
      <div className="hud-section hud-hamburger">
        <button
          className="hamburger-btn"
          onClick={onHamburgerClick}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Level & EXP Bar - Top Center-Left */}
      <div className="hud-section hud-level">
        <div className="level-badge">
          <span className="level-number">{stats.level}</span>
        </div>
        <div className="exp-container">
          <div className="exp-label">
            <span className="exp-text">EXP</span>
            <span className="exp-value">
              {stats.exp} / {stats.maxExp}
            </span>
          </div>
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Streak Counter - Top Center-Right */}
      <div className="hud-section hud-streak">
        <div className="streak-badge">
          <span className="streak-flame">🔥</span>
          <span className="streak-number">{stats.streak}</span>
        </div>
        <span className="streak-label">Day Streak</span>
      </div>
    </div>
  );
};
