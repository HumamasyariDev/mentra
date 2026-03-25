import { usePageTitle } from "../hooks/usePageTitle";
import { useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/pages/LandingPage.css';

import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import GamificationLoop from '../components/landing/GamificationLoop';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import ForestShowcase from '../components/landing/ForestShowcase';
import TechStack from '../components/landing/TechStack';
import FAQ from '../components/landing/FAQ';
import CTAFooter from '../components/landing/CTAFooter';
import Footer from '../components/landing/Footer';

// Planet assets — reused from the auth/dashboard cosmos
import planetTasks from '../assets/dashboard_planets/planet_tasks.svg';
import planetPomodoro from '../assets/dashboard_planets/planet_pomodoro.svg';
import planetForest from '../assets/dashboard_planets/planet_forest.svg';
import planetSchedule from '../assets/dashboard_planets/planet_schedule.svg';
import planetAiChat from '../assets/dashboard_planets/planet_ai_chat.svg';
import planetForum from '../assets/dashboard_planets/planet_forum.svg';

gsap.registerPlugin(ScrollTrigger);

const PLANETS = [
  { src: planetTasks, id: 'tasks', label: 'Tasks', className: 'lp-planet lp-planet--tasks' },
  { src: planetPomodoro, id: 'pomodoro', label: 'Pomodoro', className: 'lp-planet lp-planet--pomodoro' },
  { src: planetForest, id: 'forest', label: 'Forest', className: 'lp-planet lp-planet--forest' },
  { src: planetSchedule, id: 'schedule', label: 'Schedule', className: 'lp-planet lp-planet--schedule' },
  { src: planetAiChat, id: 'ai-chat', label: 'AI Chat', className: 'lp-planet lp-planet--ai-chat' },
  { src: planetForum, id: 'forum', label: 'Forum', className: 'lp-planet lp-planet--forum' },
];

/** Pre-generate star positions deterministically */
function generateStars(count) {
  const seededRandom = (i, offset = 0) => {

    const x = Math.sin(i * 127.1 + offset * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    bright: i < 12,
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

const STARS = generateStars(80);

export default function LandingPage() {
  usePageTitle(null);

  const pageRef = useRef(null);

  const starElements = useMemo(() => (
    STARS.map((star) => (
      <div
        key={star.key}
        className={`lp-star${star.bright ? ' lp-star--bright' : ''}`}
        style={star.style}
      />
    ))
  ), []);

  useGSAP(() => {
    // Shooting star repeating animation
    gsap.fromTo('.lp-shooting-star',
      { x: '-10vw', y: '0', opacity: 0 },
      {
        x: '110vw', y: '30vh', opacity: 0,
        duration: 2, ease: 'power1.in',
        repeat: -1, repeatDelay: 8,
        keyframes: {
          '0%': { opacity: 0 },
          '5%': { opacity: 1 },
          '30%': { opacity: 0.8 },
          '100%': { opacity: 0 }
        }
      }
    );

    // Orbital rings slow rotation
    gsap.to('.lp-orbital-ring--1', { rotation: 360, duration: 120, repeat: -1, ease: 'none' });
    gsap.to('.lp-orbital-ring--2', { rotation: -360, duration: 160, repeat: -1, ease: 'none' });
    gsap.to('.lp-orbital-ring--3', { rotation: 360, duration: 200, repeat: -1, ease: 'none' });
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="landing-page">
      {/* ── Fixed cosmic background ── */}
      <div className="lp-bg-parallax" aria-hidden="true">
        <div className="lp-vignette" />
        <div className="lp-bg-glow" />

        <div className="lp-stars">
          {starElements}
        </div>

        <div className="lp-shooting-star" />

        <div className="lp-orbital-ring lp-orbital-ring--1" />
        <div className="lp-orbital-ring lp-orbital-ring--2" />
        <div className="lp-orbital-ring lp-orbital-ring--3" />

        <div className="lp-planets">
          {PLANETS.map((planet) => (
            <div key={planet.id} className={planet.className}>
              <div className="lp-planet-glow" />
              <img
                src={planet.src}
                alt=""
                className="lp-planet-img"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
              <span className="lp-planet-label">{planet.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Page content ── */}
      <Navbar />
      <Hero />
      <GamificationLoop />
      <FeatureShowcase />
      <ForestShowcase />
      {/* Section separator overlay */}
      <div className="lp-section-divider" aria-hidden="true" />
      <TechStack />
      <FAQ />
      <CTAFooter />
      <Footer />
    </div>
  );
}
