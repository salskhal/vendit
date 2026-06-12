import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLogin, useLogoutAll } from '../hooks/useAuth';
import { Logo } from '../components/Mark';

function WarnIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 20h20L12 3zM12 10v5M12 18h.01" />
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [destination, setDestination] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useLogin();
  const logoutAll = useLogoutAll();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await login.mutateAsync({ username, password });
      const dest = result.user.role === 'seller' ? '/seller' : '/products';
      if (result.warning) {
        setDestination(dest);
        setShowModal(true);
      } else {
        navigate({ to: dest });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  const handleContinue = () => {
    setShowModal(false);
    navigate({ to: destination ?? '/products' });
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll.mutateAsync();
      setShowModal(false);
      // All sessions cleared — re-login with same credentials immediately
      const result = await login.mutateAsync({ username, password });
      navigate({ to: result.user.role === 'seller' ? '/seller' : '/products' });
    } catch (err: any) {
      setShowModal(false);
      setError(err?.response?.data?.message ?? 'Something went wrong. Please log in again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><Logo size={26} /></div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-lede">Log in to deposit, buy, and manage your products.</div>

        {error && (
          <div className="alert alert--error" style={{ marginTop: 20 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 26 }}>
          <div className="form-group">
            <label className="vd-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="vd-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={login.isPending}
            style={{ marginTop: 4 }}
          >
            {login.isPending ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <div className="auth-footer">
          New to VendIt? <Link to="/register">Create an account</Link>
        </div>
      </div>

      {showModal && (
        <div className="modal-scrim">
          <div className="modal">
            <div className="modal__ico modal__ico--warn">
              <WarnIcon />
            </div>
            <div className="modal__title">There is already an active session</div>
            <div className="modal__body">
              Your account is signed in on another device or browser. For security,
              you can log out of all other sessions and continue only here.
            </div>
            <div className="modal__foot">
              <button
                className="btn btn-ghost"
                onClick={handleContinue}
                type="button"
              >
                Continue anyway
              </button>
              <button
                className="btn btn-primary"
                onClick={handleLogoutAll}
                disabled={logoutAll.isPending}
                type="button"
              >
                {logoutAll.isPending ? 'Signing out…' : 'Log out all sessions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
