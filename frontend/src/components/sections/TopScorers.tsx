import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { isTeamRef, type Player } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Flag } from '../ui/Flag';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { Skeleton } from '../ui/Skeleton';

/** Golden-boot preview for the home page, wired to /stats/top-scorers. */
export function TopScorers() {
  const { body, loading } = useApi<{ data: Player[] }>('/stats/top-scorers');
  const players = (body?.data ?? []).slice(0, 5);

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Golden Boot race</p>
          <h2 className="font-display text-3xl font-bold">Top Scorers</h2>
        </div>
        <Link to="/players" className="text-sm text-primary hover:underline">
          All players →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <GlassCard className="text-center text-sm text-white/50">
          No goals recorded yet — the race is wide open.
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => {
            const team = isTeamRef(p.teamId) ? p.teamId : null;
            return (
              <GlassCard key={p._id} className="flex items-center gap-4 py-3">
                <span className="w-6 font-display text-xl text-white/30">{i + 1}</span>
                <div className="relative shrink-0">
                  <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={40} />
                  {team && (
                    <Flag
                      code={team.code}
                      flagUrl={team.flagUrl}
                      size={18}
                      className="absolute -bottom-1 -right-1 ring-2 ring-bg"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-white/40">{team?.name ?? ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-secondary">{p.stats.goals}</p>
                  <p className="text-[0.6rem] uppercase tracking-wide text-white/40">goals</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
