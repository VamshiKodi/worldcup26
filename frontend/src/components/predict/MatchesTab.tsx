import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { usePredictions } from '../../store/predictionSlice';
import { formatKickoff, STAGE_LABEL } from '../../lib/format';
import type { ListResponse, Match, Outcome } from '../../lib/types';
import { Flag } from '../ui/Flag';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';
import { StatePanel } from '../ui/StatePanel';

export function MatchesTab() {
  const { body, loading, error, refetch } = useApi<ListResponse<Match>>('/matches', {
    status: 'scheduled',
    limit: 40,
  });
  const matches = body?.data ?? [];

  return (
    <StatePanel
      loading={loading}
      error={error}
      isEmpty={matches.length === 0}
      onRetry={refetch}
      skeleton={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
      emptyTitle="No upcoming matches"
      emptyMessage="Predictions open once fixtures are scheduled."
    >
      <p className="mb-4 text-sm text-white/50">
        Exact score = <span className="text-accent">5 pts</span> · correct result ={' '}
        <span className="text-accent">2 pts</span>. Picks lock at kickoff.
      </p>
      <div className="space-y-3">
        {matches.map((m) => (
          <MatchPredictCard key={m._id} match={m} />
        ))}
      </div>
    </StatePanel>
  );
}

function MatchPredictCard({ match }: { match: Match }) {
  const stored = usePredictions((s) => s.matchPicks[match._id]);
  const saveMatch = usePredictions((s) => s.saveMatch);

  const [home, setHome] = useState<string>(stored?.homeScore?.toString() ?? '');
  const [away, setAway] = useState<string>(stored?.awayScore?.toString() ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Sync local score inputs if the stored pick arrives/changes after mount.
  useEffect(() => {
    setHome(stored?.homeScore?.toString() ?? '');
    setAway(stored?.awayScore?.toString() ?? '');
  }, [stored?.homeScore, stored?.awayScore]);

  const save = async (outcome: Outcome | null, hs: number | null, as: number | null) => {
    setStatus('saving');
    try {
      await saveMatch(match._id, { outcome, homeScore: hs, awayScore: as });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const pickOutcome = (o: Outcome) => {
    const hs = home === '' ? null : Number(home);
    const as = away === '' ? null : Number(away);
    void save(o, hs, as);
  };

  const saveScore = () => {
    if (home === '' || away === '') return;
    const hs = Number(home);
    const as = Number(away);
    const derived: Outcome = hs > as ? 'H' : hs < as ? 'A' : 'D';
    void save(derived, hs, as);
  };

  const active = (o: Outcome) => stored?.outcome === o;
  const btn = (o: Outcome, label: string) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold transition ${
      active(o) ? 'bg-primary text-bg' : 'bg-white/5 text-white/70 hover:bg-white/10'
    }`;

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between text-xs text-white/40">
        <span>{STAGE_LABEL[match.stage]}</span>
        <span>{formatKickoff(match.kickoff)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <Flag code={match.homeTeamId?.code ?? '?'} flagUrl={match.homeTeamId?.flagUrl} size={28} />
          <span className="font-medium">{match.homeTeamId?.name ?? 'TBD'}</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            inputMode="numeric"
            value={home}
            onChange={(e) => setHome(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onBlur={saveScore}
            className="w-10 rounded-md border border-white/10 bg-white/5 py-1 text-center outline-none focus:border-primary/60"
            placeholder="–"
          />
          <span className="text-white/30">:</span>
          <input
            inputMode="numeric"
            value={away}
            onChange={(e) => setAway(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onBlur={saveScore}
            className="w-10 rounded-md border border-white/10 bg-white/5 py-1 text-center outline-none focus:border-primary/60"
            placeholder="–"
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="font-medium">{match.awayTeamId?.name ?? 'TBD'}</span>
          <Flag code={match.awayTeamId?.code ?? '?'} flagUrl={match.awayTeamId?.flagUrl} size={28} />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button className={btn('H', '1')} onClick={() => pickOutcome('H')}>
          {match.homeTeamId?.code ?? '1'}
        </button>
        <button className={btn('D', 'X')} onClick={() => pickOutcome('D')}>
          Draw
        </button>
        <button className={btn('A', '2')} onClick={() => pickOutcome('A')}>
          {match.awayTeamId?.code ?? '2'}
        </button>
      </div>

      <div className="mt-2 h-4 text-right text-xs">
        {status === 'saving' && <span className="text-white/40">Saving…</span>}
        {status === 'saved' && <span className="text-accent">✓ Saved</span>}
        {status === 'error' && <span className="text-red-400">Couldn't save</span>}
        {status === 'idle' && stored && <Badge tone="muted">Picked</Badge>}
      </div>
    </GlassCard>
  );
}
