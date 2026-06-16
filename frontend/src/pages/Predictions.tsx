import { useAuth } from '../store/authSlice';

/**
 * Protected placeholder — proves the auth flow end-to-end.
 * Phase 6 turns this into the full prediction dashboard.
 */
export default function Predictions() {
  const user = useAuth((s) => s.user);
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 text-center">
      <h1 className="font-display text-4xl">Your Predictions</h1>
      <p className="mt-3 text-white/60">
        Welcome, <span className="text-primary">{user?.name}</span>. The prediction engine
        (match / group / bracket / winner) arrives in Phase 6.
      </p>
    </main>
  );
}
