import { useApi } from '../hooks/useApi';
import { useAuth } from '../store/authSlice';
import type { TournamentStats } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Badge } from '../components/ui/Badge';

/**
 * Admin landing — overview counters today; full CRUD for teams/players/matches
 * and moderation tools arrive in Phase 7. Route is guarded by ProtectedRoute(adminOnly).
 */
export default function Admin() {
  const user = useAuth((s) => s.user);
  const { body } = useApi<{ data: TournamentStats }>('/stats/tournament');
  const s = body?.data;

  const cards: Array<{ label: string; value: number }> = [
    { label: 'Teams', value: s?.teams ?? 0 },
    { label: 'Players', value: s?.players ?? 0 },
    { label: 'Matches', value: s?.matches ?? 0 },
    { label: 'Registered users', value: s?.users ?? 0 },
    { label: 'Predictions', value: s?.predictions ?? 0 },
    { label: 'Goals scored', value: s?.goals ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow={`Signed in as ${user?.name ?? 'admin'}`}
        title="Admin Dashboard"
        subtitle="Tournament data at a glance."
        right={<Badge tone="accent">Admin</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <GlassCard key={c.label}>
            <p className="text-sm text-white/50">{c.label}</p>
            <p className="mt-1 font-display text-4xl text-primary">
              <AnimatedNumber value={c.value} />
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-8">
        <h2 className="font-display text-xl">Coming in Phase 7</h2>
        <ul className="mt-3 space-y-1 text-sm text-white/50">
          <li>· CRUD management for teams, players and matches</li>
          <li>· Live score & event entry</li>
          <li>· Prediction analytics and user growth charts</li>
          <li>· Comment moderation tools</li>
        </ul>
      </GlassCard>
    </main>
  );
}
