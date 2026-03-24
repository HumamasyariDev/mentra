import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import '../styles/pages/Auth.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.502 3.4-3.502.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0 0 18 9Z" fill="#1877F2"/>
    <path d="M12.201 11.6 12.6 9h-2.496V7.312c0-.712.35-1.406 1.467-1.406h1.135V3.691s-1.03-.176-2.014-.176c-2.057 0-3.4 1.247-3.4 3.502V9H5.31v2.6h2.285v6.29a9.073 9.073 0 0 0 2.812 0V11.6h2.097Z" fill="#fff"/>
  </svg>
);

export default function Login() {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Pick up OAuth error from redirect
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const messages = {
        unsupported_provider: t('auth:errors.unsupportedProvider'),
        oauth_failed: t('auth:errors.oauthFailed'),
        no_email: t('auth:errors.noEmail'),
      };
      setError(messages[oauthError] || t('auth:errors.genericLoginError'));
    }
  }, [searchParams, t]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    
    // Clear both email error and general error when typing
    if (emailError && isValidEmail(val)) {
      setEmailError('');
    }
    if (error) {
      setError('');
    }
  };

  const handleEmailBlur = () => {
    if (form.email && !isValidEmail(form.email)) {
      setEmailError(t('auth:errors.invalidEmail'));
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email) {
      setEmailError(t('auth:errors.enterEmail'));
      return;
    }
    if (!isValidEmail(form.email)) {
      setEmailError(t('auth:errors.invalidEmail'));
      return;
    }
    setEmailError('');

    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      const errorData = err.response?.data;
      const errorType = errorData?.error_type;
      
      if (errorType === 'email_not_found') {
        setError(t('auth:errors.emailNotFound'));
      } else if (errorType === 'wrong_password') {
        setError(t('auth:errors.wrongPassword'));
      } else if (errorType === 'social_only_account') {
        setError(errorData.message);
      } else {
        setError(errorData?.message || t('auth:errors.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setEmailError('');

    // Must have a valid email first
    if (!form.email) {
      setEmailError(t('auth:errors.enterEmailForReset'));
      return;
    }
    if (!isValidEmail(form.email)) {
      setEmailError(t('auth:errors.invalidEmail'));
      return;
    }

    setResetSending(true);
    try {
      await authApi.forgotPassword(form.email);
      setResetSent(true);
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retry_after || 60;
        setError(t('auth:errors.rateLimitReset', { seconds: retryAfter }));
      } else {
        // Still show success to prevent email enumeration
        setResetSent(true);
      }
    } finally {
      setResetSending(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // OAuth routes are on web.php (not api.php), so we use origin without /api
    // In production, this will be https://mentra.page/auth/{provider}/redirect
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    window.location.href = `${backendUrl}/auth/${provider}/redirect`;
  };

  // ── Reset sent confirmation view (like Windsurf) ──
  if (resetSent) {
    return (
      <div className="auth-reset-sent">
        <h2 className="auth-reset-sent-title">{t('auth:login.resetEmailSentTitle')}</h2>
        <p className="auth-reset-sent-desc">
          {t('auth:login.resetEmailSentDesc')}
        </p>
        <button
          type="button"
          className="auth-reset-back"
          onClick={() => { setResetSent(false); setError(''); }}
        >
          <ArrowLeft size={16} />
          {t('auth:login.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="auth-heading">{t('auth:login.heading')}</h2>

      <div className="auth-card">
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-field-group">
            <label className="auth-label">{t('common:email')}</label>
            <input
              type="email"
              className={`auth-input${emailError ? ' has-error' : ''}`}
              placeholder={t('auth:login.emailPlaceholder')}
              value={form.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              required
              autoComplete="email"
            />
            {emailError && <p className="auth-field-error">{emailError}</p>}
          </div>

          {/* Password */}
          <div className="auth-field-group">
            <label className="auth-label">{t('common:password')}</label>
              <input
                type="password"
                className="auth-input"
                placeholder={t('auth:login.passwordPlaceholder')}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  // Clear error when typing password
                  if (error) setError('');
                }}
                required
                autoComplete="current-password"
              />
            <p className="auth-forgot-text">
              {t('auth:login.forgotPassword')}{' '}
              <button
                type="button"
                className="auth-inline-link"
                onClick={handleForgotPassword}
                disabled={resetSending}
              >
                {resetSending ? t('auth:login.sending') : t('auth:login.sendResetCode')}
              </button>
            </p>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="auth-loading-spinner" /> : t('auth:login.submitButton')}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">{t('common:or')}</span>
          <div className="auth-divider-line" />
        </div>

        {/* Social Login — full width, stacked */}
        <div className="auth-social-group">
          <button type="button" className="auth-social-btn" onClick={() => handleSocialLogin('google')}>
            <GoogleIcon />
            {t('auth:login.socialGoogle')}
          </button>
          <button type="button" className="auth-social-btn" onClick={() => handleSocialLogin('facebook')}>
            <FacebookIcon />
            {t('auth:login.socialFacebook')}
          </button>
        </div>

        {/* Footer */}
        <p className="auth-footer-text">
          {t('auth:login.noAccount')}{' '}
          <Link to="/register" className="auth-inline-link">{t('auth:login.signUp')}</Link>
        </p>
      </div>
    </>
  );
}
