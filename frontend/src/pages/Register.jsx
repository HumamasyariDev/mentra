import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import '../styles/pages/Register.css';

import assetRegister from '../assets/asset-register.png';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.502 3.4-3.502.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0 0 18 9Z" fill="#1877F2"/>
    <path d="M12.201 11.6 12.6 9h-2.496V7.312c0-.712.35-1.406 1.467-1.406h1.135V3.691s-1.03-.176-2.014-.176c-2.057 0-3.4 1.247-3.4 3.502V9H5.31v2.6h2.285v6.29a9.073 9.073 0 0 0 2.812 0V11.6h2.097Z" fill="#fff"/>
  </svg>
);

/** Pre-generate star positions for right panel */
function generateStars(count) {
  const seededRandom = (i, offset = 0) => {
    const x = Math.sin(i * 127.1 + offset * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    bright: i < 6,
    style: {
      left: `${seededRandom(i, 0) * 100}%`,
      top: `${seededRandom(i, 1) * 100}%`,
      animationDelay: `${seededRandom(i, 2) * 5}s`,
      animationDuration: `${2 + seededRandom(i, 3) * 4}s`,
      width: `${1 + seededRandom(i, 4) * (i < 6 ? 2.5 : 1.5)}px`,
      height: `${1 + seededRandom(i, 5) * (i < 6 ? 2.5 : 1.5)}px`,
    },
  }));
}

const RIGHT_PANEL_STARS = generateStars(35);
const OTP_LENGTH = 6;

export default function Register() {
  const { user, loading: authLoading, register: authRegister } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [agreeTOS, setAgreeTOS] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState(Array(OTP_LENGTH).fill(''));
  const [otpToken, setOtpToken] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const starElements = useMemo(
    () =>
      RIGHT_PANEL_STARS.map((star) => (
        <div
          key={star.key}
          className={`reg-star${star.bright ? ' reg-star--bright' : ''}`}
          style={star.style}
        />
      )),
    [],
  );

  if (authLoading) {
    return (
      <div className="reg-loading">
        <Loader2 className="reg-spinner" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const isStep1Valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    agreeTOS;

  // Import Check icon for password requirements
  const isStep2Valid = form.password && form.password_confirmation && form.password.length >= 8 && form.password === form.password_confirmation;
  const isOtpComplete = otpCode.every((d) => d !== '');

  // Password requirement checks (live)
  const pwLengthOk = form.password.length >= 8 && form.password.length <= 64;
  const pwLetterAndNumber = /[a-zA-Z]/.test(form.password) && /\d/.test(form.password);

  // ── Send OTP ──
  const sendOtp = async () => {
    setOtpSending(true);
    setError('');
    setErrors({});
    try {
      await authApi.sendOtp(form.email);
      setResendCooldown(60);
      return true;
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 429) {
        setResendCooldown(data?.retry_after || 60);
        setError(`Please wait ${data?.retry_after || 60}s before requesting a new code.`);
      } else if (data?.errors) {
        setErrors(data.errors);
        setError(data.message || 'Failed to send verification code.');
      } else {
        setError(data?.message || 'Failed to send verification code.');
      }
      return false;
    } finally {
      setOtpSending(false);
    }
  };

  // ── Step 1 → Step 2: Just advance to password step (no API call) ──
  const handleContinue = (e) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setError('');
    setErrors({});
    setStep(2);
  };

  // ── Step 2 → Step 3: Validate passwords, send OTP, move to OTP step ──
  const handlePasswordContinue = async (e) => {
    e.preventDefault();
    if (!pwLengthOk) {
      setError('Password must be between 8 and 64 characters.');
      return;
    }
    if (!pwLetterAndNumber) {
      setError('Password must contain at least 1 letter and 1 number.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    const sent = await sendOtp();
    if (sent) {
      setStep(3);
      // Focus first OTP input after step animation
      setTimeout(() => otpInputsRef.current[0]?.focus(), 400);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);
    setError('');

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newCode = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setOtpCode(newCode);
    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputsRef.current[focusIdx]?.focus();
  };

  // ── Verify OTP → Register (combined) ──
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!isOtpComplete) return;
    setOtpVerifying(true);
    setError('');
    try {
      // First verify OTP
      const { data } = await authApi.verifyOtp(form.email, otpCode.join(''));
      const token = data.otp_token;
      setOtpToken(token);

      // Then immediately register
      await authRegister({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        otp_token: token,
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        if (err.response.data.errors.otp_token) {
          setOtpToken('');
          setOtpCode(Array(OTP_LENGTH).fill(''));
          setError('Email verification expired. Please verify again.');
          return;
        }
      }
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpCode(Array(OTP_LENGTH).fill(''));
    await sendOtp();
    otpInputsRef.current[0]?.focus();
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/${provider}/redirect`;
  };

  return (
    <div className="reg-page">
      {/* LEFT PANEL -- Form */}
      <div className="reg-left">
        <div className="reg-left-inner">
          <div className="reg-left-content">
            <span className="sr-only">Sign up for Mentra, your productivity universe.</span>

            {step === 1 ? (
              <>
                {/* Header: logo + heading + subtitle */}
                <div className="reg-header">
                  <div className="reg-logo">M</div>
                  <div className="reg-heading-group">
                    <p className="reg-title">Let&apos;s create your account</p>
                    <div className="reg-subtitle">
                      Already have an account?{' '}
                      <Link to="/login" className="reg-link">Log in</Link>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="reg-arrow">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m13.75 6.75 5.5 5.25-5.5 5.25M19 12H4.75" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="reg-form-wrap">
                  <div className="reg-form-inner">
                    {error && <div className="reg-error">{error}</div>}

                    <form onSubmit={handleContinue} className="reg-form">
                      {/* First name + Last name */}
                      <div className="reg-name-row">
                        <div className="reg-field reg-field--half">
                          <p className="reg-label">First name</p>
                          <input
                            type="text"
                            className={`reg-input${errors.name ? ' reg-input--error' : ''}`}
                            placeholder="Your first name"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                            autoComplete="given-name"
                            id="firstName"
                            name="firstName"
                          />
                        </div>
                        <div className="reg-field reg-field--half">
                          <p className="reg-label">Last name</p>
                          <input
                            type="text"
                            className={`reg-input${errors.name ? ' reg-input--error' : ''}`}
                            placeholder="Your last name"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                            autoComplete="family-name"
                            id="lastName"
                            name="lastName"
                          />
                        </div>
                      </div>
                      {errors.name && <p className="reg-field-error">{errors.name[0]}</p>}

                      {/* Email */}
                      <div className="reg-field">
                        <p className="reg-label">Email</p>
                        <input
                          type="email"
                          className={`reg-input${errors.email ? ' reg-input--error' : ''}`}
                          placeholder="Enter your email address"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          autoComplete="email"
                          id="email"
                          name="email"
                        />
                        {errors.email && <p className="reg-field-error">{errors.email[0]}</p>}
                      </div>

                      {/* Terms checkbox */}
                      <div className="reg-terms">
                        <input
                          type="checkbox"
                          id="reg-tos"
                          className="reg-checkbox"
                          checked={agreeTOS}
                          onChange={(e) => setAgreeTOS(e.target.checked)}
                          required
                          name="agreeTOS"
                        />
                        <label htmlFor="reg-tos" className="reg-terms-text">
                          By signing up you agree to the{' '}
                          <Link to="/terms-of-service" className="reg-terms-link">terms of service</Link>
                          {' '}and the{' '}
                          <Link to="/privacy-policy" className="reg-terms-link">privacy policy</Link>.
                        </label>
                      </div>

                      {/* Continue button */}
                      <button type="submit" className="reg-submit" disabled={!isStep1Valid || otpSending}>
                        {otpSending ? <Loader2 className="reg-submit-spinner" /> : 'Continue'}
                      </button>

                      {/* Divider */}
                      <div className="reg-divider">
                        <hr className="reg-divider-line" />
                        <span className="reg-divider-text">or</span>
                        <hr className="reg-divider-line" />
                      </div>

                      {/* Social buttons */}
                      <div className="reg-social-group">
                        <button type="button" className="reg-social-btn" onClick={() => handleSocialLogin('google')}>
                          <GoogleIcon />
                          Sign up with Google
                        </button>
                        <button type="button" className="reg-social-btn" onClick={() => handleSocialLogin('facebook')}>
                          <FacebookIcon />
                          Sign up with Facebook
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            ) : step === 2 ? (
              /* ── Step 2: Password setup (Windsurf-identical layout) ── */
              <div className="reg-step" key="step2-password">
                <div className="reg-header">
                  <div className="reg-logo">M</div>
                  <div className="reg-heading-group">
                    <p className="reg-title">Let&apos;s create your account</p>
                  </div>
                </div>

                <div className="reg-form-wrap">
                  <div className="reg-form-inner">
                    {error && <div className="reg-error">{error}</div>}

                    <form onSubmit={handlePasswordContinue} className="reg-form">
                      {/* Email preview (read-only, like Windsurf) */}
                      <div className="reg-field">
                        <p className="reg-label">Email</p>
                        <p className="reg-email-preview">{form.email}</p>
                      </div>

                      {/* Password */}
                      <div className="reg-field">
                        <p className="reg-label">Password</p>
                        <div className="reg-password-wrap">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`reg-input${errors.password ? ' reg-input--error' : ''}`}
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            autoComplete="new-password"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="reg-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && <p className="reg-field-error">{errors.password[0]}</p>}
                      </div>

                      {/* Password confirmation */}
                      <div className="reg-field">
                        <p className="reg-label">Password confirmation</p>
                        <div className="reg-password-wrap">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="reg-input"
                            placeholder="Confirm your password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>

                      {/* Password requirements checklist */}
                      <div className="reg-pw-requirements">
                        <p className="reg-pw-requirements-title">Your password must contain:</p>
                        <div className="reg-pw-requirements-list">
                          <div className={`reg-pw-req${pwLengthOk ? ' reg-pw-req--met' : ''}`}>
                            <Check size={14} strokeWidth={2.5} />
                            <span>Between 8 and 64 characters</span>
                          </div>
                          <div className={`reg-pw-req${pwLetterAndNumber ? ' reg-pw-req--met' : ''}`}>
                            <Check size={14} strokeWidth={2.5} />
                            <span>At least 1 letter and 1 number</span>
                          </div>
                        </div>
                      </div>

                      {/* Continue button */}
                      <button type="submit" className="reg-submit" disabled={otpSending || !pwLengthOk || !pwLetterAndNumber || !form.password_confirmation}>
                        {otpSending ? <Loader2 className="reg-submit-spinner" /> : 'Continue'}
                      </button>

                      {/* Back link — Windsurf style: ← Other Sign up options */}
                      <button
                        type="button"
                        className="reg-back-link"
                        onClick={() => { setStep(1); setError(''); }}
                      >
                        <ArrowLeft size={16} />
                        Other Sign up options
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Step 3: OTP Verification ── */
              <div className="reg-step" key="step3-otp">
                <div className="reg-header">
                  <div className="reg-logo-icon">
                    <div className="reg-logo-icon-glow" />
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="reg-mail-svg">
                      {/* Envelope body */}
                      <rect x="4" y="8" width="24" height="16" rx="2.5" stroke="url(#mail-grad)" strokeWidth="1.5" fill="none" />
                      {/* Envelope flap */}
                      <path d="M4 10.5L16 18L28 10.5" stroke="url(#mail-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      {/* Check badge */}
                      <circle cx="25" cy="21" r="5" fill="#0f172a" />
                      <circle cx="25" cy="21" r="4.25" stroke="url(#check-grad)" strokeWidth="1.25" fill="rgba(124, 58, 237, 0.15)" />
                      <path d="M22.75 21L24.25 22.5L27.25 19.5" stroke="url(#check-grad)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="mail-grad" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#a78bfa" stopOpacity="0.9" />
                          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.7" />
                        </linearGradient>
                        <linearGradient id="check-grad" x1="21" y1="17" x2="29" y2="25" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#c4b5fd" />
                          <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="reg-heading-group">
                    <p className="reg-title">Check your email</p>
                    <p className="reg-otp-subtitle">
                      We sent a 6-digit code to <strong>{form.email}</strong>
                    </p>
                  </div>
                </div>

                <div className="reg-form-wrap">
                  <div className="reg-form-inner">
                    {error && <div className="reg-error">{error}</div>}

                    <form onSubmit={handleVerifyAndRegister} className="reg-form">
                      {/* OTP Input */}
                      <div className="reg-otp-group" onPaste={handleOtpPaste}>
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputsRef.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`reg-otp-input${digit ? ' reg-otp-input--filled' : ''}`}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            autoFocus={idx === 0}
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>

                      {/* Verify & Create button */}
                      <button type="submit" className="reg-submit" disabled={!isOtpComplete || otpVerifying}>
                        {otpVerifying ? <Loader2 className="reg-submit-spinner" /> : 'Verify & Create Account'}
                      </button>

                      {/* Resend */}
                      <div className="reg-otp-footer">
                        <span className="reg-otp-footer-text">Didn&apos;t receive the code?</span>
                        <button
                          type="button"
                          className="reg-otp-resend"
                          onClick={handleResend}
                          disabled={resendCooldown > 0 || otpSending}
                        >
                          {otpSending
                            ? 'Sending...'
                            : resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : 'Resend code'}
                        </button>
                      </div>

                      {/* Back */}
                      <button
                        type="button"
                        className="reg-back-btn reg-back-btn--center"
                        onClick={() => { setStep(2); setError(''); setOtpCode(Array(OTP_LENGTH).fill('')); }}
                      >
                        <ArrowLeft size={16} />
                        Back to previous step
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL -- Visual showcase (hidden <lg) */}
      <div className="reg-right">
        <div className="reg-right-stars" aria-hidden="true">
          {starElements}
        </div>
        <div className="reg-right-content">
          {/* Feature showcase image */}
          <div className="reg-showcase" aria-hidden="true">
            <img src={assetRegister} alt="" className="reg-showcase-img" draggable={false} loading="lazy" decoding="async" />
          </div>

          {/* Testimonial */}
          <div className="reg-testimonial">
            <div className="reg-testimonial-blur" aria-hidden="true" />
            <div className="reg-testimonial-inner">
              <p className="reg-quote">
                &quot;Organize your tasks, grow your focus forest, and let AI guide your productivity &mdash; all in one cosmic workspace.&quot;
              </p>
              <div className="reg-quote-author">
                <div className="reg-quote-avatar">M</div>
                <div className="reg-quote-info">
                  <p className="reg-quote-name">Mentra Team</p>
                  <p className="reg-quote-role">Your Productivity Universe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
