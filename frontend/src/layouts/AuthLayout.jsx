import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/layouts/AuthLayout.css';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-layout-loading">
        <Loader2 className="auth-layout-loading-spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-content">
        <div className="auth-layout-header">
          <h1 className="auth-layout-logo">Mentra</h1>
          <p className="auth-layout-tagline">Gamified Productivity</p>
        </div>
        <div className="auth-layout-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
