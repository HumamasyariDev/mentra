import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>

      {error && (
        <div className="auth-error">{error}</div>
      )}

      <div className="auth-field-group">
        <label className="auth-label">Email</label>
        <input
          type="email"
          className="auth-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
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
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading && <Loader2 className="auth-loading-spinner" />}
        Sign In
      </button>

      <p className="auth-footer-text">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
