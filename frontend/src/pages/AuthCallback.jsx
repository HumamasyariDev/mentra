import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const messages = {
        unsupported_provider: 'Provider tidak didukung.',
        oauth_failed: 'Login gagal. Silakan coba lagi.',
        no_email: 'Akun sosial tidak memiliki email. Gunakan akun dengan email yang valid.',
      };
      setError(messages[errorParam] || 'Terjadi kesalahan saat login.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (token) {
      // Save token and fetch user
      localStorage.setItem('mentra_token', token);
      refreshUser().then(() => {
        navigate('/dashboard', { replace: true });
      }).catch(() => {
        setError('Gagal memuat data user.');
        localStorage.removeItem('mentra_token');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, refreshUser]);

  if (error) {
    return (
      <div className="auth-callback-wrapper">
        <div className="auth-callback-card">
          <div className="auth-callback-error">{error}</div>
          <p className="auth-callback-redirect">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-wrapper">
      <div className="auth-callback-card">
        <Loader2 className="auth-loading-spinner" />
        <p className="auth-callback-text">Memproses login...</p>
      </div>
    </div>
  );
}
