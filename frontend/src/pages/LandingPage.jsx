import { usePageTitle } from "../hooks/usePageTitle";
import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useDeviceTier } from '../hooks/useDeviceTier';
import '../styles/pages/LandingPage.css';

/* ── Planet SVG assets ── */
import planetTasks from '../assets/dashboard_planets/planet_tasks.svg';
import planetPomodoro from '../assets/dashboard_planets/planet_pomodoro.svg';
import planetForest from '../assets/dashboard_planets/planet_forest.svg';
import planetSchedule from '../assets/dashboard_planets/planet_schedule.svg';
import planetAiChat from '../assets/dashboard_planets/planet_ai_chat.svg';
import planetForum from '../assets/dashboard_planets/planet_forum.svg';

/* ── Above-the-fold: eager ── */
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';

/* ── Below-the-fold: lazy ── */
const GamificationLoop = React.lazy(() => import('../components/landing/GamificationLoop'));
const FeatureShowcase = React.lazy(() => import('../components/landing/FeatureShowcase'));
const ForestShowcase = React.lazy(() => import('../components/landing/ForestShowcase'));
const TechStack = React.lazy(() => import('../components/landing/TechStack'));
const FAQ = React.lazy(() => import('../components/landing/FAQ'));
const CTAFooter = React.lazy(() => import('../components/landing/CTAFooter'));
const Footer = React.lazy(() => import('../components/landing/Footer'));

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing-page quality presets per device tier.
 * Controls star count, whether to show planets/shooting-star/noise, etc.
 */
const LP_QUALITY = {
  low: {
    starCount: 25,
    showPlanets: true,    // Always show planets for visual consistency
    showShootingStar: false,
    showOrbitalRings: false,
    showNoise: false,
  },
  mid: {
    starCount: 45,
    showPlanets: true,
    showShootingStar: true,
    showOrbitalRings: true,
    showNoise: false,
  },
  high: {
    starCount: 80,
    showPlanets: true,
    showShootingStar: true,
    showOrbitalRings: true,
    showNoise: true,
  },
};

/**
 * Planet SVG images — actual detailed planet graphics like login page
 */
const PLANETS = [
  { id: 'tasks',    src: planetTasks,    label: 'Tasks',    className: 'lp-planet lp-planet--tasks' },
  { id: 'pomodoro', src: planetPomodoro, label: 'Pomodoro', className: 'lp-planet lp-planet--pomodoro' },
  { id: 'forest',   src: planetForest,   label: 'Forest',   className: 'lp-planet lp-planet--forest' },
  { id: 'schedule', src: planetSchedule, label: 'Schedule', className: 'lp-planet lp-planet--schedule' },
  { id: 'ai-chat',  src: planetAiChat,   label: 'AI Chat',  className: 'lp-planet lp-planet--ai-chat' },
  { id: 'forum',    src: planetForum,    label: 'Forum',    className: 'lp-planet lp-planet--forum' },
];

/** Pre-generate star positions deterministically */
function generateStars(count) {
  const seededRandom = (i, offset = 0) => {
    const x = Math.sin(i * 127.1 + offset * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    bright: i < Math.max(5, Math.floor(count * 0.15)),
    style: {
      left: `${seededRandom(i, 0) * 100}%`,
      top: `${seededRandom(i, 1) * 100}%`,
      animationDelay: `${seededRandom(i, 2) * 5}s`,
      animationDuration: `${2 + seededRandom(i, 3) * 4}s`,
      width: `${1 + seededRandom(i, 4) * (i < 12 ? 2.5 : 1.5)}px`,
      height: `${1 + seededRandom(i, 5) * (i < 12 ? 2.5 : 1.5)}px`,
    },
  }));
}

export default function LandingPage() {
  usePageTitle(null);

  const prefersReducedMotion = useReducedMotion();
  const deviceTier = useDeviceTier(prefersReducedMotion);
  const quality = LP_QUALITY[deviceTier];

  const pageRef = useRef(null);

  // Generate stars based on device tier
  const stars = useMemo(() => generateStars(quality.starCount), [quality.starCount]);

  const starElements = useMemo(() => (
    stars.map((star) => (
      <div
        key={star.key}
        className={`lp-star${star.bright ? ' lp-star--bright' : ''}`}
        style={star.style}
      />
    ))
  ), [stars]);

  // Apply tier CSS class to root for CSS-level optimizations
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove('lp-tier-low', 'lp-tier-mid', 'lp-tier-high');
    el.classList.add(`lp-tier-${deviceTier}`);
  }, [deviceTier]);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Shooting star — only on mid/high, quick streak across top of screen
    if (quality.showShootingStar) {
      gsap.fromTo('.lp-shooting-star',
        { x: '-5vw', y: '0', opacity: 0 },
        {
          x: '105vw', y: '15vh', opacity: 0,
          duration: 1.5, ease: 'power1.in',
          repeat: -1, repeatDelay: 12,
          keyframes: {
            '0%': { opacity: 0 },
            '10%': { opacity: 0.8 },
            '40%': { opacity: 0.5 },
            '100%': { opacity: 0 }
          }
        }
      );
    }

    // Orbital rings slow rotation — only on mid/high
    if (quality.showOrbitalRings) {
      gsap.to('.lp-orbital-ring--1', { rotation: 360, duration: 120, repeat: -1, ease: 'none' });
      gsap.to('.lp-orbital-ring--2', { rotation: -360, duration: 160, repeat: -1, ease: 'none' });
      gsap.to('.lp-orbital-ring--3', { rotation: 360, duration: 200, repeat: -1, ease: 'none' });
    }
  }, { scope: pageRef, dependencies: [prefersReducedMotion, quality] });

  return (
    <div ref={pageRef} className="landing-page">
      {/* ── Fixed cosmic background ── */}
      <div className="lp-bg-parallax" aria-hidden="true">
        <div className="lp-vignette" />
        <div className="lp-bg-glow" />

        <div className="lp-stars">
          {starElements}
        </div>

        {quality.showShootingStar && <div className="lp-shooting-star" />}

        {quality.showOrbitalRings && (
          <>
            <div className="lp-orbital-ring lp-orbital-ring--1" />
            <div className="lp-orbital-ring lp-orbital-ring--2" />
            <div className="lp-orbital-ring lp-orbital-ring--3" />
          </>
        )}

        {quality.showPlanets && (
          <div className="lp-planets">
            {PLANETS.map((planet) => (
              <div key={planet.id} className={planet.className}>
                <div className="lp-planet-glow" />
                <img
                  src={planet.src}
                  alt=""
                  className="lp-planet-img"
                  draggable={false}
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="lp-planet-label">{planet.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Page content ── */}
      <Navbar />
      <Hero />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <GamificationLoop />
        <FeatureShowcase />
        <ForestShowcase />
        {/* Section separator overlay */}
        <div className="lp-section-divider" aria-hidden="true" />
        <TechStack />
        <FAQ />
        <CTAFooter />
        <Footer />
      </Suspense>
    </div>
  );
}
