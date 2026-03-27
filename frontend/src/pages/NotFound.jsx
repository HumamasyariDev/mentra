import { usePageTitle } from "../hooks/usePageTitle";
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Rocket } from 'lucide-react';
import '../styles/pages/NotFound.css';

export default function NotFound() {
  usePageTitle('404 - Page Not Found');

  return (
    <div className="notfound-page">
      {/* Cosmic background effects */}
      <div className="notfound-gradient-orb notfound-gradient-orb-1" />
      <div className="notfound-gradient-orb notfound-gradient-orb-2" />
      <div className="notfound-gradient-orb notfound-gradient-orb-3" />
      
      {/* Animated stars */}
      <div className="notfound-stars" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={`notfound-star ${i < 8 ? 'notfound-star--bright' : ''}`}
            style={{
              left: `${(i * 17.3) % 100}%`,
              top: `${(i * 23.7) % 100}%`,
              animationDelay: `${(i * 0.3) % 5}s`,
              animationDuration: `${2 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting star */}
      <div className="notfound-shooting-star" />

      {/* Main content */}
      <div className="notfound-content">
        {/* Giant 404 Typography */}
        <div className="notfound-hero">
          <div className="notfound-404-wrapper">
            <span className="notfound-404-bg">404</span>
            <h1 className="notfound-404">404</h1>
          </div>
          
          <div className="notfound-astronaut">
            <Rocket className="notfound-rocket-icon" />
          </div>
        </div>

        {/* Text content */}
        <div className="notfound-text">
          <h2 className="notfound-title">
            Houston, we have a problem
          </h2>
          <p className="notfound-subtitle">
            The page you're looking for has drifted into a black hole.<br />
            Let's get you back to familiar territory.
          </p>
        </div>

        {/* Action buttons */}
        <div className="notfound-actions">
          <Link to="/dashboard" className="notfound-btn notfound-btn-primary">
            <Home size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="notfound-btn notfound-btn-ghost"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Footer */}
        <div className="notfound-footer">
          <Link to="/" className="notfound-logo-link">
            <img src="/mentra_title_logo.svg" alt="Mentra" className="notfound-logo" />
            <span className="notfound-logo-text">Mentra</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
