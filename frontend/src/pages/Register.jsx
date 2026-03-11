import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Create Account</h2>

      {error && (
        <div className="auth-error">{error}</div>
      )}

      <div className="auth-field-group">
        <label className="auth-label">Name</label>
        <input
          type="text"
          className="auth-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name[0]}</p>}
      </div>

      <div className="auth-field-group">
        <label className="auth-label">Email</label>
        <input
          type="email"
          className="auth-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email[0]}</p>}
      </div>

      <div className="auth-field-group">
        <label className="auth-label">Password</label>
        <input
          type="password"
          className="auth-input"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password[0]}</p>}
      </div>

      <div className="auth-field-group">
        <label className="auth-label">Confirm Password</label>
        <input
          type="password"
          className="auth-input"
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          required
        />
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading && <Loader2 className="auth-loading-spinner" />}
        Create Account
      </button>

      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign In
        </Link>
      </p>
    </form>
  );
}
