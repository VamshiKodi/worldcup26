import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { STAGE_LABEL, formatDay, formatTime } from '../lib/format';
import type { ListResponse, Match, MatchStatus, Stage } from '../lib/types';
import { useLive } from '../store/liveSlice';
import { SectionHeading } from '../components/ui/SectionHeading';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

const LIMIT = 30;
const STAGES: Stage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];
const STATUSES: MatchStatus[] = ['scheduled', 'live', 'finished'];
const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: 'Upcoming',
  live: 'Live',
  finished: 'Finished',
};

export default function Matches() {
  const [stage, setStage] = useState<Stage | null>(null);
  const [status, setStatus] = useState<MatchStatus | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [stage, status]);

  const { body, loading, error, refetch } = useApi<ListResponse<Match>>('/matches', {
    page,
    limit: LIMIT,
    stage: stage ?? undefined,
    status: status ?? undefined,
  });

  const matches = body?.data ?? [];

  // Group fixtures by calendar day for a schedule-style layout.
  const byDay = useMemo(() => {
    const groups: Array<{ day: string; matches: Match[] }> = [];
    for (const m of matches) {
      const day = formatDay(m.kickoff);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.matches.push(m);
      else groups.push({ day, matches: [m] });
    }
    return groups;
  }, [matches]);

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="104 matches · 16 venues"
        title="Match Center"
        subtitle="Fixtures and results across the United States, Canada and Mexico."
      />

      <div className="mb-8 space-y-3">
        <FilterTabs options={STAGES} value={stage} onChange={setStage} labels={STAGE_LABEL} allLabel="All stages" />
        <FilterTabs options={STATUSES} value={status} onChange={setStatus} labels={STATUS_LABEL} allLabel="Any status" />
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={matches.length === 0}
        onRetry={refetch}
        skeleton={
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        }
        emptyTitle="No matches found"
        emptyMessage="Adjust the stage or status filters to see fixtures."
      >
        <div className="space-y-10">
          {byDay.map(({ day, matches }) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">{day}</h2>
              <div className="space-y-3">
                {matches.map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <Pagination page={page} totalPages={body?.totalPages ?? 1} onChange={setPage} />
      </StatePanel>
    </main>
  );
}

/** 'R32-3' → 'Match 3' for a tidy knockout-slot label. */
function slotLabel(slot?: string | null): string | null {
  const n = slot?.match(/(\d+)\s*$/)?.[1];
  return n ? `Match ${n}` : null;
}

function MatchRow({ match }: { match: Match }) {
  // Live overlay (Phase 9): a socket update supersedes the REST snapshot in place.
  const live = useLive((s) => s.live[match._id]);
  const status = live?.status ?? match.status;
  const score = live?.score ?? match.score;
  const minute = live?.minute ?? match.minute;
  const { homeTeamId: home, awayTeamId: away } = match;
  const played = status === 'finished' || status === 'live';
  // Knockout fixtures exist before the draw — render them as a clean "to be determined" slot.
  const tbd = !home || !away;

  return (
    <Link to={`/matches/${match._id}`} className="glass flex items-center gap-4 px-5 py-4 transition hover:border-primary/40">
      <div className="w-28 shrink-0 text-xs text-white/40">
        {played ? (
          <Badge tone={status === 'live' ? 'live' : 'muted'}>
            {status === 'live' ? `● ${minute ? `${minute}'` : 'LIVE'}` : 'FT'}
          </Badge>
        ) : (
          formatTime(match.kickoff)
        )}
      </div>

      {tbd ? (
        <div className="flex flex-1 items-center justify-center gap-3 text-center">
          <Badge tone="primary">{STAGE_LABEL[match.stage]}</Badge>
          <span className="text-sm text-white/40">
            To be determined{slotLabel(match.bracketSlot) ? ` · ${slotLabel(match.bracketSlot)}` : ''}
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-end gap-3 text-right">
            <span className="font-medium">{home?.name}</span>
            <Flag code={home?.code ?? '?'} flagUrl={home?.flagUrl} size={26} />
          </div>

          <div className="w-16 shrink-0 text-center font-display text-lg">
            {played && score.home != null ? (
              <span>
                {score.home}<span className="px-1 text-white/30">:</span>{score.away}
              </span>
            ) : (
              <span className="text-white/30">vs</span>
            )}
          </div>

          <div className="flex flex-1 items-center gap-3">
            <Flag code={away?.code ?? '?'} flagUrl={away?.flagUrl} size={26} />
            <span className="font-medium">{away?.name}</span>
          </div>
        </>
      )}

      <div className="hidden w-40 shrink-0 text-right text-xs text-white/30 sm:block">
        {match.groupId && typeof match.groupId === 'object'
          ? `Group ${match.groupId.name}`
          : match.groupId
          ? `Group ${match.groupId}`
          : STAGE_LABEL[match.stage]}
      </div>
    </Link>
  );
}
