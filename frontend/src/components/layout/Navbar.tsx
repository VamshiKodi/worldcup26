import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authSlice';

const LINKS = [
  ['Teams', '/teams'],
  ['Players', '/players'],
  ['Matches', '/matches'],
  ['Groups', '/groups'],
  ['Bracket', '/bracket'],
  ['AI Lab', '/lab'],
  ['Simulator', '/simulator'],
  ['Leaderboard', '/leaderboard'],
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const close = () => setOpen(false);

  // Collapse the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition hover:text-primary ${isActive ? 'text-primary' : 'text-white/70'}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" onClick={close} className="font-display text-lg font-bold tracking-tight text-gradient">
          WC26
        </Link>

        <ul className="hidden gap-6 text-sm md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <NavLink to={href} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
          {user?.role === 'admin' && (
            <li>
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/predictions"
                className="hidden rounded-full bg-primary/90 px-4 py-1.5 text-sm font-semibold text-bg shadow-glow transition hover:bg-primary sm:inline-block"
              >
                Predict Now
              </Link>
              <button
                onClick={() => void logout()}
                className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
                title={`Signed in as ${user.name}`}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-primary/90 px-4 py-1.5 text-sm font-semibold text-bg shadow-glow transition hover:bg-primary sm:inline-block"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="text-lg">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-3 text-sm">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <NavLink to={href} onClick={close} className={linkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
            {user?.role === 'admin' && (
              <li>
                <NavLink to="/admin" onClick={close} className={linkClass}>
                  Admin
                </NavLink>
              </li>
            )}
            <li className="border-t border-white/10 pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link to="/predictions" onClick={close} className="text-primary">
                    Predict Now
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      void logout();
                    }}
                    className="text-white/60"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={close} className="text-primary">
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
