import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useRegister } from '../hooks/useAuth';
import { Logo } from '../components/Mark';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({ username, password, role });
      navigate({ to: '/login' });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Registration failed.'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand"><Logo size={26} /></div>
        <div className="auth-title">Create your account</div>
        <div className="auth-lede">Pick a role — you can buy, or sell, not both.</div>

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
              placeholder="Choose a username"
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <span className="vd-hint">Used to authenticate every request to the API.</span>
          </div>
          <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
            <legend className="vd-label" style={{ marginBottom: 7 }}>Role</legend>
            <div className="vd-segment">
              <button
                type="button"
                className={`vd-seg-opt ${role === 'buyer' ? 'is-active' : ''}`}
                onClick={() => setRole('buyer')}
              >
                <span className="vd-seg-opt__t">Buyer <span className="vd-radio" /></span>
                <span className="vd-seg-opt__d">Deposit coins and purchase products.</span>
              </button>
              <button
                type="button"
                className={`vd-seg-opt ${role === 'seller' ? 'is-active' : ''}`}
                onClick={() => setRole('seller')}
              >
                <span className="vd-seg-opt__t">Seller <span className="vd-radio" /></span>
                <span className="vd-seg-opt__d">List and manage your own products.</span>
              </button>
            </div>
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={register.isPending}
            style={{ marginTop: 4 }}
          >
            {register.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
