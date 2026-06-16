import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl text-gradient">404</p>
        <p className="mt-4 text-white/60">This route hasn't qualified yet.</p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
