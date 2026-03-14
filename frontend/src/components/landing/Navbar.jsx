import { useRef, useState, useEffect } from 'react';
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
];

export default function Navbar() {
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Magnetic Hovers for Nav items
  const logoRef = useMagneticHover(0.3);
  const ctaRef = useMagneticHover(0.2);

  useGSAP(() => {
    if (!prefersReducedMotion) {
      // Elegant heavy drop-in
      gsap.from(navRef.current, { 
        y: -150, 
        opacity: 0, 
        duration: 1.5, 
        ease: 'elastic.out(1, 0.5)', 
        delay: 0.5 
      });
    }

    // Velocity-based Skewing & Width reduction
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (prefersReducedMotion) return;
        
        let velocity = self.getVelocity();
        // Clamp skew between -3 and 3 degrees based on scroll speed
        let skew = gsap.utils.clamp(-3, 3, velocity / -300);
        
        gsap.to(navRef.current, { 
          skewY: skew, 
          duration: 0.1, 
          overwrite: true 
        });
        
        // Return to 0 when stopped
        gsap.delayedCall(0.1, () => {
          gsap.to(navRef.current, { skewY: 0, duration: 0.4, ease: "power2.out" });
        });

        // Width reduction when scrolling past top
        if (self.progress > 0.05) {
          gsap.to(navRef.current, { width: '80%', backgroundColor: 'rgba(2, 6, 23, 0.8)', duration: 0.4 });
          gsap.to('.landing-nav-logo', { scale: 0.9, duration: 0.4 });
        } else {
          gsap.to(navRef.current, { width: '90%', backgroundColor: 'rgba(2, 6, 23, 0.6)', duration: 0.4 });
          gsap.to('.landing-nav-logo', { scale: 1, duration: 0.4 });
        }
      }
    });
  }, { scope: navRef, dependencies: [prefersReducedMotion] });

  return (
    <nav ref={navRef} className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" ref={logoRef} className="landing-nav-logo">Mentra.</Link>

        <div className="landing-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }); }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-link">Log in</Link>
          <Link to="/register" ref={ctaRef} className="landing-nav-cta">Get Started</Link>
        </div>

        <button className="landing-nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="landing-nav-mobile-overlay" style={{ opacity: 1, pointerEvents: 'auto' }}>
           {/* Mobile menu handled via standard conditional rendering for simplicity, 
               but CSS ensures it sits perfectly behind the pill */}
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link to="/login" style={{ color: '#94a3b8', fontSize: '1.5rem', textDecoration: 'none', marginTop: '2rem' }} onClick={() => setMobileOpen(false)}>Log in</Link>
        </div>
      )}
    </nav>
  );
}
