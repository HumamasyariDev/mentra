import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { Loader2, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function ResetPassword() {
  const { t } = useTranslation(['auth', 'common']);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pwLengthOk = form.password.length >= 8 && form.password.length <= 64;
  const pwLetterAndNumber = /[a-zA-Z]/.test(form.password) && /\d/.test(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pwLengthOk) {
      setError(t('auth:errors.passwordLength'));
      return;
    }
    if (!pwLetterAndNumber) {
      setError(t('auth:errors.passwordLetterNumber'));
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError(t('auth:errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t('auth:errors.resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid link ──
  if (!token || !email) {
    return (
      <div className="auth-reset-sent">
        <h2 className="auth-reset-sent-title">{t('auth:resetPassword.invalidLinkTitle')}</h2>
        <p className="auth-reset-sent-desc">
          {t('auth:resetPassword.invalidLinkDesc')}
        </p>
        <Link to="/login" className="auth-reset-back">
          <ArrowLeft size={16} />
          {t('auth:resetPassword.backToLogin')}
        </Link>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="auth-reset-sent">
        <h2 className="auth-reset-sent-title">{t('auth:resetPassword.successTitle')}</h2>
        <p className="auth-reset-sent-desc">
          {t('auth:resetPassword.successDesc')}
        </p>
        <Link to="/login" className="auth-reset-back">
          <ArrowLeft size={16} />
          {t('auth:resetPassword.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="auth-heading">{t('auth:resetPassword.heading')}</h2>

      <div className="auth-card">
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email preview */}
          <div className="auth-field-group">
            <label className="auth-label">{t('common:email')}</label>
            <p className="auth-email-preview">{email}</p>
          </div>

          {/* Password */}
          <div className="auth-field-group">
            <label className="auth-label">{t('auth:resetPassword.newPassword')}</label>
            <div className="auth-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder={t('auth:resetPassword.newPasswordPlaceholder')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div className="auth-field-group">
            <label className="auth-label">{t('auth:resetPassword.confirmNewPassword')}</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder={t('auth:resetPassword.confirmNewPasswordPlaceholder')}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Password requirements */}
          <div className="auth-pw-requirements">
            <p className="auth-pw-requirements-title">{t('auth:resetPassword.pwRequirementsTitle')}</p>
            <div className="auth-pw-requirements-list">
              <div className={`auth-pw-req${pwLengthOk ? ' auth-pw-req--met' : ''}`}>
                <Check size={14} strokeWidth={2.5} />
                <span>{t('auth:resetPassword.pwLength')}</span>
              </div>
              <div className={`auth-pw-req${pwLetterAndNumber ? ' auth-pw-req--met' : ''}`}>
                <Check size={14} strokeWidth={2.5} />
                <span>{t('auth:resetPassword.pwLetterAndNumber')}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !pwLengthOk || !pwLetterAndNumber || !form.password_confirmation}
          >
            {loading ? <Loader2 className="auth-loading-spinner" /> : t('auth:resetPassword.submitButton')}
          </button>
        </form>

        <Link to="/login" className="auth-reset-back" style={{ alignSelf: 'center', marginTop: '0.5rem' }}>
          <ArrowLeft size={16} />
          {t('auth:resetPassword.backToLogin')}
        </Link>
      </div>
    </>
  );
}
