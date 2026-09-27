import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(password);
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Incorrect password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Admin Login" path="/admin" />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient-bg text-white">
            <Lock size={22} />
          </div>
          <h1 className="mt-4 text-center font-display text-xl font-semibold text-neutral-900">
            DollNepal Admin
          </h1>
          <p className="mt-1 text-center text-sm text-neutral-500">Sign in to manage products.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}
            <div>
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
