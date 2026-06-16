import { Link } from 'react-router-dom';

const LINKS = [
  ['Teams', '/teams'],
  ['Players', '/players'],
  ['Matches', '/matches'],
  ['Bracket', '/bracket'],
  ['Leaderboard', '/leaderboard'],
] as const;

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-gradient">
          WC26
        </Link>
        <ul className="hidden gap-6 text-sm text-white/70 md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link to={href} className="transition hover:text-primary">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/predictions"
          className="rounded-full bg-primary/90 px-4 py-1.5 text-sm font-semibold text-bg shadow-glow transition hover:bg-primary"
        >
          Predict Now
        </Link>
      </nav>
    </header>
  );
}
