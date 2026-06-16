import { useApi } from '../../hooks/useApi';
import type { TournamentStats } from '../../lib/types';
import { AnimatedNumber } from '../ui/AnimatedNumber';

const ITEMS: Array<{ key: keyof TournamentStats; label: string }> = [
  { key: 'teams', label: 'Teams' },
  { key: 'matches', label: 'Matches' },
  { key: 'players', label: 'Players' },
  { key: 'stadiums', label: 'Stadiums' },
  { key: 'hostCountries', label: 'Host nations' },
];

/** Headline tournament counters, wired to /stats/tournament. */
export function StatsBand() {
  const { body } = useApi<{ data: TournamentStats }>('/stats/tournament');
  const stats = body?.data;

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="glass grid grid-cols-2 gap-6 px-8 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {ITEMS.map((item) => (
          <div key={item.key} className="text-center">
            <p className="font-display text-4xl font-bold text-gradient">
              <AnimatedNumber value={stats?.[item.key] ?? 0} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-white/40">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
