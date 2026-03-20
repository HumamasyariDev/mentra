import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ForestLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-layout-loading">
        <Loader2 className="app-layout-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout-container">
      {/* Main content - full viewport for forest */}
      <div className="app-layout-main">
        <main className="app-layout-content app-layout-content-forest">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
