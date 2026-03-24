import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Forest World', href: '#forest' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const logoRef = useMagneticHover(0.3);
  const ctaRef = useMagneticHover(0.2);

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
    <nav ref={navRef} className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" ref={logoRef} className="landing-nav-logo">
          <span className="landing-nav-logo-icon">M</span>
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
          <Link to="/login" className="landing-nav-link">Log in</Link>
          <Link to="/register" ref={ctaRef} className="landing-nav-cta">Get Started</Link>
        </div>

        <button className="landing-nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="landing-nav-mobile-overlay" style={{ opacity: 1, pointerEvents: 'auto' }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="mobile-nav-link" onClick={(e) => scrollTo(e, link.href)}>
              {link.label}
            </a>
          ))}
          <Link to="/login" className="mobile-nav-link mobile-nav-link--muted" onClick={() => setMobileOpen(false)}>Log in</Link>
          <Link to="/register" className="mobile-nav-cta" onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
