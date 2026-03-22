import React, { useRef, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { useDashboardUI } from '../../contexts/DashboardUIContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import streakHappy from '../../assets/streak_fire/streak_fire_state_happy.png';
import streakSad from '../../assets/streak_fire/streak_fire_state_sad.png';
import streakNormal from '../../assets/streak_fire/streak_fire_state_normal.png';
import streakSleep from '../../assets/streak_fire/streak_fire_state_sleep.png';
import '../../styles/components/dashboard/DashboardFloatingUI.css';

/**
 * Determine the streak fire state based on activity data.
 * - 'happy': streak is active AND user completed at least 1 task today
 * - 'normal': streak is active (last activity was today or yesterday) but no tasks today yet
 * - 'sad': streak is broken (last activity > 1 day ago)
 * - 'sleep': no streak data / never started
 */
function getStreakState(stats) {
  const { streak = 0, lastActivityDate, todayCompleted = 0 } = stats;

  if (!lastActivityDate || streak === 0) return 'sleep';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

  // Streak is broken if last activity was more than 1 day ago
  if (diffDays > 1) return 'sad';

  // Streak is active — check if user did something today
  if (todayCompleted > 0) return 'happy';

  return 'normal';
}

const STREAK_IMAGES = {
  happy: streakHappy,
  sad: streakSad,
  normal: streakNormal,
  sleep: streakSleep,
};

export const DashboardFloatingUI = ({ stats = {}, dashboardData, shouldFadeOut = false }) => {
  const { setSidebarOpen } = useDashboardUI();
  const containerRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  const {
    level = 1,
    exp = 0,
    maxExp = 100,
    streak = 0,
  } = stats;

  const expPercentage = maxExp > 0 ? (exp / maxExp) * 100 : 0;
  const streakState = useMemo(() => getStreakState(stats), [stats]);
  const streakImg = STREAK_IMAGES[streakState];

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
          <img src={streakImg} alt="streak" className="streak-icon-img" />
          <span className="badge-value">{streak}</span>
        </div>
      </div>
    </div>
  );
};
