import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { t, i18n } = useTranslation(['landing']);
  
  const logoRef = useMagneticHover(0.3);
  const ctaRef = useMagneticHover(0.2);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'id';
  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'id' ? 'en' : 'id');
  };

  const NAV_LINKS = [
    { label: t('landing:navbar.howItWorks'), href: '#how-it-works' },
    { label: t('landing:navbar.features'), href: '#features' },
    { label: t('landing:navbar.forestWorld'), href: '#forest' },
    { label: t('landing:navbar.faq'), href: '#faq' },
  ];

  useGSAP(() => {
    if (!prefersReducedMotion) {
      gsap.from(navRef.current, { 
        y: -150, 
        opacity: 0, 
        duration: 1.5, 
        ease: 'elastic.out(1, 0.5)', 
        delay: 0.5 
      });
    }

    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      toggleClass: { className: 'nav-scrolled', targets: navRef.current },
      onEnter: () => {
        gsap.to(navRef.current, { 
          backgroundColor: 'rgba(2, 6, 23, 0.85)', 
          backdropFilter: 'blur(24px)',
          width: '80%',
          duration: 0.4, 
          ease: 'power2.out' 
        });
      },
      onLeaveBack: () => {
        gsap.to(navRef.current, { 
          backgroundColor: 'rgba(2, 6, 23, 0.6)', 
          backdropFilter: 'blur(16px)',
          width: '90%',
          duration: 0.4, 
          ease: 'power2.out' 
        });
      }
    });
  }, { scope: navRef, dependencies: [prefersReducedMotion] });

  const scrollTo = (e, href) => {
    e.preventDefault();
    if (mobileOpen) {
      setMobileOpen(false);
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav ref={navRef} className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" ref={logoRef} className="landing-nav-logo">
            <img src="/mentra_title_logo.svg" alt="Mentra" className="landing-nav-logo-img" />
            <span className="landing-nav-logo-text">Mentra</span>
          </Link>

          <div className="landing-nav-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="landing-nav-link" onClick={(e) => scrollTo(e, link.href)}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-actions">
            <button
              className="landing-nav-lang-toggle"
              onClick={toggleLanguage}
              aria-label={`Switch to ${currentLang === 'id' ? 'English' : 'Indonesian'}`}
            >
              <span className={`landing-nav-lang-option ${currentLang === 'id' ? 'landing-nav-lang-option--active' : ''}`}>ID</span>
              <span className="landing-nav-lang-divider">/</span>
              <span className={`landing-nav-lang-option ${currentLang === 'en' ? 'landing-nav-lang-option--active' : ''}`}>EN</span>
            </button>
            <Link to="/login" className="landing-nav-link">{t('landing:navbar.login')}</Link>
            <Link to="/register" ref={ctaRef} className="landing-nav-cta">{t('landing:navbar.getStarted')}</Link>
          </div>

          <button className="landing-nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="landing-nav-mobile-overlay">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="mobile-nav-link" onClick={(e) => scrollTo(e, link.href)}>
              {link.label}
            </a>
          ))}
          <button
            className="mobile-nav-lang-toggle"
            onClick={toggleLanguage}
            aria-label={`Switch to ${currentLang === 'id' ? 'English' : 'Indonesian'}`}
          >
            <span className={`landing-nav-lang-option ${currentLang === 'id' ? 'landing-nav-lang-option--active' : ''}`}>ID</span>
            <span className="landing-nav-lang-divider">/</span>
            <span className={`landing-nav-lang-option ${currentLang === 'en' ? 'landing-nav-lang-option--active' : ''}`}>EN</span>
          </button>
          <Link to="/login" className="mobile-nav-link mobile-nav-link--muted" onClick={() => setMobileOpen(false)}>{t('landing:navbar.login')}</Link>
          <Link to="/register" className="mobile-nav-cta" onClick={() => setMobileOpen(false)}>{t('landing:navbar.getStarted')}</Link>
        </div>
      )}
    </>
  );
}
