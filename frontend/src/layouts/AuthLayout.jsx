import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/layouts/AuthLayout.css';

// Planet assets from dashboard
import planetTasks from '../assets/dashboard_planets/planet_tasks.svg';
import planetPomodoro from '../assets/dashboard_planets/planet_pomodoro.svg';
import planetForest from '../assets/dashboard_planets/planet_forest.svg';
import planetSchedule from '../assets/dashboard_planets/planet_schedule.svg';
import planetAiChat from '../assets/dashboard_planets/planet_ai_chat.svg';
import planetForum from '../assets/dashboard_planets/planet_forum.svg';

const PLANETS = [
  { src: planetTasks, id: 'tasks', label: 'Tasks', className: 'planet-group planet-tasks' },
  { src: planetPomodoro, id: 'pomodoro', label: 'Pomodoro', className: 'planet-group planet-pomodoro' },
  { src: planetForest, id: 'forest', label: 'Forest', className: 'planet-group planet-forest' },
  { src: planetSchedule, id: 'schedule', label: 'Schedule', className: 'planet-group planet-schedule' },
  { src: planetAiChat, id: 'ai-chat', label: 'AI Chat', className: 'planet-group planet-ai-chat' },
  { src: planetForum, id: 'forum', label: 'Forum', className: 'planet-group planet-forum' },
];

/** Pre-generate star positions so they don't recalculate on every render */
function generateStars(count) {
  const seededRandom = (i, offset = 0) => {
    const x = Math.sin(i * 127.1 + offset * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  return Array.from({ length: count }, (_, i) => ({
    key: i,
    bright: i < 10,
    style: {
      left: `${seededRandom(i, 0) * 100}%`,
      top: `${seededRandom(i, 1) * 100}%`,
      animationDelay: `${seededRandom(i, 2) * 5}s`,
      animationDuration: `${2 + seededRandom(i, 3) * 4}s`,
      width: `${1 + seededRandom(i, 4) * (i < 10 ? 2.5 : 1.5)}px`,
      height: `${1 + seededRandom(i, 5) * (i < 10 ? 2.5 : 1.5)}px`,
    },
  }));
}

const STARS = generateStars(55);

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // Memoize stars to prevent DOM thrashing
  const starElements = useMemo(() => (
    STARS.map((star) => (
      <div
        key={star.key}
        className={`auth-star${star.bright ? ' auth-star--bright' : ''}`}
        style={star.style}
      />
    ))
  ), []);

  if (loading) {
    return (
      <div className="auth-loading">
        <Loader2 className="auth-spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      {/* Vignette overlay */}
      <div className="auth-vignette" />

      {/* Ambient glow effects */}
      <div className="auth-bg-glow" />

      {/* Twinkling stars — layered depths */}
      <div className="auth-stars" aria-hidden="true">
        {starElements}
      </div>

      {/* Shooting star */}
      <div className="auth-shooting-star" aria-hidden="true" />

      {/* Orbital ring decoration */}
      <div className="auth-orbital-ring auth-orbital-ring--1" aria-hidden="true" />
      <div className="auth-orbital-ring auth-orbital-ring--2" aria-hidden="true" />

      {/* Floating planets with labels */}
      <div className="auth-planets" aria-hidden="true">
        {PLANETS.map((planet) => (
          <div key={planet.id} className={planet.className}>
            <div className="planet-glow" />
            <img
              src={planet.src}
              alt=""
              className="planet-img"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <span className="planet-label">{planet.label}</span>
          </div>
        ))}
      </div>

      <div className="auth-content">
        {/* Logo mark */}
        <div className="auth-logo-section">
          <div className="auth-logo-icon">M</div>
        </div>

        {/* Page content (heading + card) comes from Login/Register via Outlet */}
        <Outlet />
      </div>
    </div>
  );
}
