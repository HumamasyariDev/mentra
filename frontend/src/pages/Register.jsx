import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Create Account</h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      <div>
        <label className="label">Name</label>
        <input
          type="text"
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <label className="label">Password</label>
        <input
          type="password"
          className="input-field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
      </div>

      <div>
        <label className="label">Confirm Password</label>
        <input
          type="password"
          className="input-field"
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
