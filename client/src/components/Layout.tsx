import { useState } from 'react';
import { Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { getToken } from '../lib/auth';
import { Logo } from './Mark';

function LogoutIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface UserInfo {
  username: string;
  role: string;
}

interface NavUserProps {
  readonly user: UserInfo | undefined;
  readonly initials: string;
  readonly onLogout: () => void;
  readonly isPending: boolean;
}

function NavUser({ user, initials, onLogout, isPending }: NavUserProps) {
  if (!user) {
    return (
      <>
        <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Create account</Link>
      </>
    );
  }
  return (
    <>
      <span className="role-chip">
        <i />{user.role === 'buyer' ? 'Buyer' : 'Seller'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span className="vd-avatar">{initials}</span>
        <span className="nav-username">{user.username}</span>
      </div>
      <button className="icon-btn" onClick={onLogout} disabled={isPending}
        title="Log out" type="button" aria-label="Log out">
        <LogoutIcon />
      </button>
    </>
  );
}

interface DrawerUserProps {
  readonly user: UserInfo | undefined;
  readonly initials: string;
  readonly onLogout: () => void;
  readonly isPending: boolean;
}

function DrawerUser({ user, initials, onLogout, isPending }: DrawerUserProps) {
  if (!user) {
    return (
      <div className="nav-drawer__actions">
        <Link to="/login" className="btn btn-ghost btn-full">Log in</Link>
        <Link to="/register" className="btn btn-primary btn-full">Create account</Link>
      </div>
    );
  }
  return (
    <>
      <div className="nav-drawer__user">
        <span className="vd-avatar">{initials}</span>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{user.username}</span>
        <span className="role-chip" style={{ marginLeft: 'auto' }}>
          <i />{user.role === 'buyer' ? 'Buyer' : 'Seller'}
        </span>
      </div>
      <button className="btn btn-ghost btn-full" onClick={onLogout}
        disabled={isPending} type="button" style={{ justifyContent: 'flex-start', gap: 10 }}>
        <LogoutIcon />
        {isPending ? 'Logging out…' : 'Log out'}
      </button>
    </>
  );
}

export default function Layout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isAuthenticated = !!getToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const handleLogout = async () => {
    close();
    await logout.mutateAsync();
    router.navigate({ to: '/login' });
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navLinks = (
    <>
      <Link to="/products" className="nav-link" onClick={close}
        data-active={isActive('/products') ? 'true' : undefined}>
        Products
      </Link>
      {user?.role === 'buyer' && (
        <Link to="/deposit" className="nav-link" onClick={close}
          data-active={isActive('/deposit') ? 'true' : undefined}>
          Deposit
        </Link>
      )}
      {user?.role === 'seller' && (
        <Link to="/seller" className="nav-link" onClick={close}
          data-active={isActive('/seller') ? 'true' : undefined}>
          My products
        </Link>
      )}
    </>
  );

  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="nav-brand" aria-label="VendIt home">
          <Logo size={24} />
        </Link>

        <div className="nav-links">{navLinks}</div>

        <div className="nav-user">
          {isAuthenticated && (
            <NavUser user={user} initials={initials}
              onLogout={handleLogout} isPending={logout.isPending} />
          )}
          {!isAuthenticated && (
            <NavUser user={undefined} initials="" onLogout={handleLogout} isPending={false} />
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen((o) => !o)}
          type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}>
          {menuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>

      {menuOpen && (
        <div className="nav-drawer">
          {navLinks}
          <div className="nav-drawer__sep" />
          <DrawerUser user={user} initials={initials}
            onLogout={handleLogout} isPending={logout.isPending} />
        </div>
      )}

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
