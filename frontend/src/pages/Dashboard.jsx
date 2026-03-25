import { usePageTitle } from "../hooks/usePageTitle";
import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Loader2 } from 'lucide-react';
import { useDashboardUI } from '../contexts/DashboardUIContext';
import { usePageTransition } from '../contexts/PageTransitionContext';
import { DashboardFloatingUI } from '../components/dashboard/DashboardFloatingUI';
import { SimplifiedDashboard } from '../components/dashboard/SimplifiedDashboard';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { dashboardApi } from '../services/api';
import '../styles/pages/Dashboard.css';

const LazyMapViewport = React.lazy(() =>
  import('../components/dashboard/MapViewport').then((m) => ({ default: m.MapViewport }))
);

function MapLoadingFallback() {
  const { t } = useTranslation('dashboard');
  return (
    <div className="dashboard-map-loading">
      <Loader2 className="dashboard-map-loading-spinner" />
      <p className="dashboard-map-loading-text">{t('dashboard:loadingGalaxy')}</p>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('dashboard:pageTitle');

  const navigate = useNavigate();
  const { dashboardMode } = useDashboardUI();
  const { sidebarOpen, setSidebarOpen } = useDashboardUI();
  const { triggerFadeOut } = usePageTransition();
  const contentRef = React.useRef(null);
  const [islandClicked, setIslandClicked] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth < 768;

  // Detect if mobile - always use simplified dashboard on mobile
  const displayMode = isMobile ? 'simplified' : dashboardMode;

  // Fetch dashboard data from API
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await dashboardApi.get();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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

  // Build stats for floating UI from API data (with fallbacks)
  const floatingStats = dashboardData ? {
    level: dashboardData.user.level,
    exp: dashboardData.user.current_exp,
    maxExp: dashboardData.user.exp_to_next_level,
    streak: dashboardData.streak?.current_streak ?? 0,
    lastActivityDate: dashboardData.streak?.last_activity_date ?? null,
    todayCompleted: dashboardData.tasks?.today_completed ?? 0,
  } : {
    level: 1,
    exp: 0,
    maxExp: 100,
    streak: 0,
    lastActivityDate: null,
    todayCompleted: 0,
  };

  // If map mode on desktop
  if (displayMode === 'map') {
    return (
      <div className="dashboard-page dashboard-map-mode">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} shouldFadeOut={islandClicked} />
        <DashboardFloatingUI 
          stats={floatingStats}
          dashboardData={dashboardData}
          shouldFadeOut={islandClicked}
        />
        <div ref={contentRef} className="map-content">
          <Suspense fallback={<MapLoadingFallback />}>
            <LazyMapViewport onIslandClick={handleIslandClick} dashboardData={dashboardData} />
          </Suspense>
        </div>
      </div>
    );
  }

  // Simplified dashboard mode - just return the component, AppLayout will handle layout
  return <SimplifiedDashboard dashboardData={dashboardData} loading={loading} />;
}
