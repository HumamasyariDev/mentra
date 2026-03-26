import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const btn1Ref = useMagneticHover(0.5);
  const { t } = useTranslation(['landing']);

  const titleLines = [
    { text: t('landing:hero.titleLine1'), highlight: false },
    { text: t('landing:hero.titleLine2'), highlight: true }
  ];

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const master = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // ENTRANCE: Cinematic word reveal with stagger
    master
      .fromTo('.hero-title-word',
        { y: 120, opacity: 0, rotateX: -60, filter: 'blur(10px)' },
        { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.5, stagger: 0.1 }
      )
      .fromTo('.hero-subtitle',
        { y: 30, opacity: 0, filter: 'blur(5px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2 },
        "-=1"
      )
      .fromTo('.hero-actions',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' },
        "-=0.8"
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

    // Hero content fade on scroll
    gsap.to('.hero-content', {
      y: -150,
      opacity: 0,
      scale: 0.95,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Scroll indicator bounce
    gsap.to('.hero-scroll-chevron', {
      y: 6,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={containerRef} className="hero-wrapper">
      <div className="hero-glow"></div>

      <div className="hero-content">
        <h1 className="hero-title">
          {titleLines.map((line, i) => (
            <div key={i} className="hero-title-line" style={{ gap: '0.3em' }}>
              {line.text.split(' ').map((word, j) => (
                <span 
                  key={j} 
                  className={`hero-title-word ${line.highlight ? 'hero-title-highlight' : ''}`}
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </h1>

        <p className="hero-subtitle">
          {t('landing:hero.subtitle')}
        </p>

        <div className="hero-actions">
          <Link to="/register" ref={btn1Ref} className="hero-btn-primary">
            {t('landing:hero.cta')}
          </Link>
          <a href="#features" className="hero-btn-secondary" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}>
            {t('landing:hero.secondaryCta')}
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator">
          <span className="hero-scroll-text">{t('landing:hero.scrollText')}</span>
          <svg className="hero-scroll-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
