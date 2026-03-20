import React from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import { MapViewport } from '../components/dashboard/MapViewport';
import { DashboardFloatingUI } from '../components/dashboard/DashboardFloatingUI';
import { SimplifiedDashboard } from '../components/dashboard/SimplifiedDashboard';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import '../styles/pages/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardMode } = useDashboardUI();
  const { sidebarOpen, setSidebarOpen } = useDashboardUI();
  const { triggerFadeOut } = usePageTransition();
  const contentRef = React.useRef(null);
  const [islandClicked, setIslandClicked] = React.useState(false);
  const isMobile = window.innerWidth < 768;

  // Detect if mobile - always use simplified dashboard on mobile
  const displayMode = isMobile ? 'simplified' : dashboardMode;

  // Animate content on mount and mode change
  useGSAP(
    () => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          }
        );
      }
    },
    { dependencies: [displayMode] }
  );

  const handleIslandClick = (island) => {
    // Trigger fade-out of floating UI
    setIslandClicked(true);
    
    // Start fade to black overlay immediately (make it obvious)
    triggerFadeOut();
    
    // The MapViewport handles the zoom-in animation first.
    // When this callback fires, we are already zoomed in.
    // Fade out the content
    gsap.to(contentRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      delay: 0.4, // Wait for floating UI fade-out
      onComplete: () => {
        // Navigate once content is hidden
        navigate(island.route);
      },
    });
  };

  // If map mode on desktop
  if (displayMode === 'map') {
    return (
      <div className="dashboard-page dashboard-map-mode">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} shouldFadeOut={islandClicked} />
        <DashboardFloatingUI 
          stats={{
            level: 12,
            exp: 3200,
            maxExp: 5000,
            streak: 7,
          }}
          shouldFadeOut={islandClicked}
        />
        <div ref={contentRef} className="map-content">
          <MapViewport onIslandClick={handleIslandClick} />
        </div>
      </div>
    );
  }

  // Simplified dashboard mode - just return the component, AppLayout will handle layout
  return <SimplifiedDashboard />;
}
