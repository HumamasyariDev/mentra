import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Forest World', href: '#forest' },
];

export default function Navbar() {
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    // Nav entrance drop-in
    if (!prefersReducedMotion) {
      gsap.from(navRef.current, { 
        yPercent: -100, 
        opacity: 0, 
        duration: 1.2, 
        ease: 'expo.out', 
        delay: 0.2 
      });
    }

    // Scroll Frost Effect
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top -80',
      onEnter: () => {
        navRef.current?.classList.add('landing-nav-scrolled');
        gsap.to('.landing-nav-logo', { scale: 0.9, duration: 0.3 });
      },
      onLeaveBack: () => {
        navRef.current?.classList.remove('landing-nav-scrolled');
        gsap.to('.landing-nav-logo', { scale: 1, duration: 0.3 });
      },
    });
  }, { scope: navRef, dependencies: [prefersReducedMotion] });

  // Mobile menu open/close animation
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    
    if (mobileOpen) {
      gsap.fromTo(mobileMenuRef.current, 
        { height: 0, opacity: 0 }, 
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo('.landing-nav-mobile-link, .landing-nav-mobile .landing-nav-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
      gsap.to('.landing-nav-hamburger svg', { rotation: 90, duration: 0.3 });
    } else {
      gsap.to('.landing-nav-hamburger svg', { rotation: 0, duration: 0.3 });
    }
  }, [mobileOpen]);

  const scrollTo = (e, href) => {
    e.preventDefault();
    if (mobileOpen) {
      gsap.to(mobileMenuRef.current, { 
        height: 0, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          setMobileOpen(false);
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className="landing-nav" style={{ willChange: 'transform' }}>
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-logo" style={{ display: 'inline-block', transformOrigin: 'left center' }}>Mentra</Link>

        <div className="landing-nav-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-nav-link"
              onClick={(e) => scrollTo(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-login">Login</Link>
          <Link to="/register" className="landing-nav-cta">Get Started</Link>
        </div>

        <button
          className="landing-nav-hamburger"
          onClick={() => {
            if (mobileOpen) {
              gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => setMobileOpen(false) });
            } else {
              setMobileOpen(true);
            }
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div ref={mobileMenuRef} className="landing-nav-mobile" style={{ overflow: 'hidden' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-nav-mobile-link"
              onClick={(e) => scrollTo(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="landing-nav-mobile-link"
            onClick={() => {
              gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.3, onComplete: () => setMobileOpen(false) });
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="landing-nav-cta"
            onClick={() => {
              gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.3, onComplete: () => setMobileOpen(false) });
            }}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
