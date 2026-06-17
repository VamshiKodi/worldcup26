import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useMatchLive } from '../hooks/useMatchLive';
import { usePredictions } from '../store/predictionSlice';
import { useAuth } from '../store/authSlice';
import { STAGE_LABEL, formatKickoff } from '../lib/format';
import type { ItemResponse, Match, MatchEvent } from '../lib/types';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';
import { StatePanel } from '../components/ui/StatePanel';
import { Skeleton } from '../components/ui/Skeleton';

const EVENT_ICON: Record<MatchEvent['type'], string> = {
  goal: '⚽',
  own_goal: '⚽',
  penalty: '🎯',
  yellow: '🟨',
  red: '🟥',
  sub: '🔁',
};

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { body, loading, error, refetch } = useApi<ItemResponse<Match>>(`/matches/${id}`);
  const base = body?.data ?? null;
  const overlay = useMatchLive(id, base);

  // Live overlay supersedes the REST snapshot.
  const status = overlay?.status ?? base?.status ?? 'scheduled';
  const score = overlay?.score ?? base?.score ?? { home: null, away: null };
  const minute = overlay?.minute ?? base?.minute ?? 0;
  const events = overlay?.events ?? base?.events ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <Link to="/matches" className="mb-6 inline-block text-sm text-white/50 hover:text-white">
        ← Match Center
      </Link>

      <StatePanel
        loading={loading}
        error={error}
        onRetry={refetch}
        skeleton={<Skeleton className="h-72" />}
      >
        {base && (
          <MatchDetailBody
            match={base}
            status={status}
            score={score}
            minute={minute}
            events={events}
          />
        )}
      </StatePanel>
    </main>
  );
}

function MatchDetailBody({
  match,
  status,
  score,
  minute,
  events,
}: {
  match: Match;
  status: Match['status'];
  score: Match['score'];
  minute: number;
  events: MatchEvent[];
}) {
  const home = match.homeTeamId;
  const away = match.awayTeamId;
  const live = status === 'live';
  const played = live || status === 'finished';

  // The user's stored pick for this match, if any (Phase 6 predictions).
  const isAuthed = useAuth((s) => s.status === 'authed');
  const pick = usePredictions((s) => s.matchPicks[match._id]);

  const timeline = useMemo(
    () => [...events].sort((a, b) => a.minute - b.minute),
    [events],
  );

  return (
    <div className="space-y-6">
      <div className="text-center text-xs uppercase tracking-wide text-white/40">
        {STAGE_LABEL[match.stage]}
        {match.city ? ` · ${match.city}` : ''}
      </div>

      {/* Scoreline */}
      <GlassCard className="flex items-center justify-between gap-4">
        <TeamColumn name={home?.name} code={home?.code} flagUrl={home?.flagUrl} />

        <div className="shrink-0 text-center">
          {live ? (
            <Badge tone="live" className="mb-2">● {minute}'</Badge>
          ) : status === 'finished' ? (
            <Badge tone="muted" className="mb-2">Full time</Badge>
          ) : (
            <div className="mb-2 text-xs text-white/40">{formatKickoff(match.kickoff)}</div>
          )}
          <div className="font-display text-4xl font-bold tabular-nums">
            {played && score.home != null ? (
              <>
                {score.home}
                <span className="px-2 text-white/30">:</span>
                {score.away}
              </>
            ) : (
              <span className="text-white/30">vs</span>
            )}
          </div>
        </div>

        <TeamColumn name={away?.name} code={away?.code} flagUrl={away?.flagUrl} />
      </GlassCard>

      {/* Your prediction vs the live state */}
      {isAuthed && pick && (
        <GlassCard>
          <div className="mb-2 text-xs uppercase tracking-wide text-white/40">Your prediction</div>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg tabular-nums">
              {pick.homeScore != null && pick.awayScore != null
                ? `${pick.homeScore} : ${pick.awayScore}`
                : pick.outcome
                  ? { H: 'Home win', D: 'Draw', A: 'Away win' }[pick.outcome]
                  : '—'}
            </span>
            {pick.settled ? (
              <Badge tone={pick.points > 0 ? 'accent' : 'muted'}>
                {pick.points > 0 ? `+${pick.points} pts` : '0 pts'}
              </Badge>
            ) : (
              <Badge tone="primary">{live ? 'In play' : 'Pending'}</Badge>
            )}
          </div>
        </GlassCard>
      )}

      {/* Event timeline */}
      <GlassCard>
        <div className="mb-3 text-xs uppercase tracking-wide text-white/40">Timeline</div>
        {timeline.length === 0 ? (
          <p className="text-sm text-white/40">
            {played ? 'No events recorded.' : 'Kick-off pending — events appear here live.'}
          </p>
        ) : (
          <ul className="space-y-2">
            {timeline.map((e, i) => {
              const onHome = e.teamId && home && e.teamId === home._id;
              const scorer = typeof e.playerId === 'object' && e.playerId ? e.playerId.name : null;
              return (
                <li key={i} className={`flex items-center gap-3 text-sm ${onHome ? '' : 'flex-row-reverse text-right'}`}>
                  <span className="w-10 shrink-0 text-white/40 tabular-nums">{e.minute}'</span>
                  <span>{EVENT_ICON[e.type]}</span>
                  <span className="text-white/80">
                    {scorer ?? (onHome ? home?.name : away?.name)}
                    {e.type !== 'goal' && <span className="ml-1 text-white/40">({e.type})</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function TeamColumn({ name, code, flagUrl }: { name?: string; code?: string; flagUrl?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <Flag code={code ?? '?'} flagUrl={flagUrl} size={48} />
      <span className="text-sm font-medium">{name ?? 'TBD'}</span>
    </div>
  );
}
