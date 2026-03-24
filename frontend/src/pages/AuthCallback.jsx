import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function AuthCallback() {
  const { t } = useTranslation(['auth', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const messages = {
        unsupported_provider: t('auth:errors.unsupportedProvider'),
        oauth_failed: t('auth:errors.oauthFailed'),
        no_email: t('auth:errors.noEmail'),
      };
      setError(messages[errorParam] || t('auth:errors.genericLoginError'));
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (token) {
      // Save token and fetch user
      localStorage.setItem('mentra_token', token);
      refreshUser().then(() => {
        navigate('/dashboard', { replace: true });
      }).catch(() => {
        setError(t('auth:callback.failedLoadUser'));
        localStorage.removeItem('mentra_token');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, refreshUser, t]);

  if (error) {
    return (
      <div className="auth-callback-wrapper">
        <div className="auth-callback-card">
          <div className="auth-callback-error">{error}</div>
          <p className="auth-callback-redirect">{t('auth:callback.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-wrapper">
      <div className="auth-callback-card">
        <Loader2 className="auth-loading-spinner" />
        <p className="auth-callback-text">{t('auth:callback.processingLogin')}</p>
      </div>
    </div>
  );
}
