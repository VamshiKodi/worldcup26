import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { STAGE_LABEL } from '../lib/format';
import type {
  AiMatchPrediction,
  ChampionshipOdd,
  ListResponse,
  Match,
} from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { ProbabilityBar } from '../components/ui/ProbabilityBar';
import { Skeleton } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

export default function AiLab() {
  const { body: matchBody, refetch: refetchMatches } = useApi<ListResponse<Match>>('/matches', { limit: 120 });
  const matches = useMemo(
    () => (matchBody?.data ?? []).filter((match) => match.homeTeamId && match.awayTeamId),
    [matchBody],
  );
  const [matchId, setMatchId] = useState<string>('');

  // Keep an open lab tab current as knockout pairings are resolved by the live fixture sync.
  useEffect(() => {
    const refresh = () => refetchMatches();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refetchMatches]);

  // Default to an available match and move off a fixture if it becomes unresolved.
  useEffect(() => {
    if (matches.length && !matches.some((match) => match._id === matchId)) {
      setMatchId(matches[0]._id);
    }
  }, [matches, matchId]);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="Probability model"
        title="AI Prediction Lab"
        subtitle="An Elo-style model rates each side from FIFA ranking and recent form to project match and title odds."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-white/40">Choose a match</span>
            <select
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary/60"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
            >
              {matches.map((m) => (
                <option key={m._id} value={m._id} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  {m.homeTeamId?.name ?? 'TBD'} vs {m.awayTeamId?.name ?? 'TBD'} · {STAGE_LABEL[m.stage]}
                </option>
              ))}
            </select>
          </label>

          {matchId && <MatchProbability matchId={matchId} />}
        </section>

        <ChampionshipOdds />
      </div>
    </main>
  );
}

function MatchProbability({ matchId }: { matchId: string }) {
  const { body, loading, error, refetch } = useApi<{ data: AiMatchPrediction }>(`/ai/match/${matchId}`);
  const ai = body?.data;

  return (
    <StatePanel loading={loading} error={error} onRetry={refetch} skeleton={<Skeleton className="h-72" />}>
      {ai && (
        <GlassCard>
          <div className="mb-5 flex items-center justify-between">
            <TeamHead card={ai.home} align="left" />
            <div className="text-center">
              <p className="font-display text-3xl">
                {ai.likelyScore.home}<span className="px-1 text-white/30">–</span>{ai.likelyScore.away}
              </p>
              <p className="text-[0.65rem] uppercase tracking-wide text-white/40">likely score</p>
              {ai.neutral && <Badge tone="muted" className="mt-1">Neutral venue</Badge>}
            </div>
            <TeamHead card={ai.away} align="right" />
          </div>

          <div className="space-y-3">
            <ProbabilityBar tone="primary" label={`${ai.home.code} win`} value={ai.probabilities.home} />
            {ai.stage === 'group' && (
              <ProbabilityBar tone="secondary" label="Draw" value={ai.probabilities.draw} />
            )}
            <ProbabilityBar tone="accent" label={`${ai.away.code} win`} value={ai.probabilities.away} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Factor label="Rating" home={ai.home.rating} away={ai.away.rating} />
            <Factor label="FIFA rank" home={`#${ai.home.fifaRanking}`} away={`#${ai.away.fifaRanking}`} />
            <Factor label="xG" home={ai.expectedGoals.home} away={ai.expectedGoals.away} />
            <Factor
              label="Form"
              home={ai.home.form.join('') || '—'}
              away={ai.away.form.join('') || '—'}
            />
          </div>
        </GlassCard>
      )}
    </StatePanel>
  );
}

function TeamHead({ card, align }: { card: AiMatchPrediction['home']; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'left' ? 'items-start' : 'items-end'}`}>
      <Flag code={card.code} flagUrl={card.flagUrl} size={44} />
      <span className="text-sm font-semibold">{card.code}</span>
    </div>
  );
}

function Factor({ label, home, away }: { label: string; home: string | number; away: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="text-[0.6rem] uppercase tracking-wide text-white/40">{label}</p>
      <div className="flex justify-between font-medium">
        <span>{home}</span>
        <span className="text-white/40">{away}</span>
      </div>
    </div>
  );
}

function ChampionshipOdds() {
  const { body, loading, error, refetch } = useApi<{ data: ChampionshipOdd[] }>('/ai/championship', {
    limit: 12,
  });
  const odds = body?.data ?? [];

  return (
    <GlassCard className="h-fit">
      <h2 className="mb-1 font-display text-xl font-bold">Title odds</h2>
      <p className="mb-4 text-xs text-white/40">Model probability to win the tournament.</p>
      <StatePanel
        loading={loading}
        error={error}
        onRetry={refetch}
        skeleton={
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {odds.map((o) => (
            <div key={o.id} className="flex items-center gap-3">
              <Flag code={o.code} flagUrl={o.flagUrl} size={22} />
              <div className="flex-1">
                <ProbabilityBar value={o.probability} label={o.name} tone="primary" />
              </div>
            </div>
          ))}
        </div>
      </StatePanel>
    </GlassCard>
  );
}
