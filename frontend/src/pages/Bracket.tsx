import { useApi } from '../hooks/useApi';
import { formatKickoff } from '../lib/format';
import type { ListResponse, Match, Stage } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

// 2026 knockout shape. `slots` is how many ties each round has.
const ROUNDS: Array<{ stage: Stage; label: string; slots: number }> = [
  { stage: 'r32', label: 'Round of 32', slots: 16 },
  { stage: 'r16', label: 'Round of 16', slots: 8 },
  { stage: 'qf', label: 'Quarter-finals', slots: 4 },
  { stage: 'sf', label: 'Semi-finals', slots: 2 },
  { stage: 'final', label: 'Final', slots: 1 },
];

export default function Bracket() {
  // Pull every fixture once; knockout ties are filtered per column.
  const { body, loading, error, refetch } = useApi<ListResponse<Match>>('/matches', { limit: 120 });
  const matches = body?.data ?? [];
  const knockout = matches.filter((m) => m.stage !== 'group');

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="The road to the final"
        title="Knockout Bracket"
        subtitle="32 teams advance to a single-elimination run at MetLife Stadium's final."
        right={
          knockout.length === 0 ? <Badge tone="muted">Awaiting group stage</Badge> : undefined
        }
      />

      <StatePanel
        loading={loading}
        error={error}
        onRetry={refetch}
        skeleton={<Skeleton className="h-96" />}
      >
        {knockout.length === 0 && (
          <p className="mb-6 text-sm text-white/50">
            Knockout ties are seeded once the group stage concludes. The bracket structure below
            fills in as teams qualify.
          </p>
        )}

        <div className="flex gap-6 overflow-x-auto pb-6">
          {ROUNDS.map((round) => {
            const ties = knockout
              .filter((m) => m.stage === round.stage)
              .sort((a, b) => (a.bracketSlot ?? '').localeCompare(b.bracketSlot ?? ''));
            return (
              <div key={round.stage} className="flex min-w-[16rem] flex-col">
                <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-white/40">
                  {round.label}
                </h2>
                <div className="flex flex-1 flex-col justify-around gap-4">
                  {Array.from({ length: round.slots }).map((_, i) => (
                    <TieCard key={i} match={ties[i]} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </StatePanel>
    </main>
  );
}

function TieCard({ match }: { match?: Match }) {
  if (!match) {
    return (
      <div className="glass flex flex-col gap-2 px-4 py-3 opacity-60">
        <TbdSide />
        <div className="h-px bg-white/5" />
        <TbdSide />
      </div>
    );
  }

  const { homeTeamId: home, awayTeamId: away, score, status } = match;
  const decided = status === 'finished' && score.home != null;
  const homeWon = decided && (score.home ?? 0) > (score.away ?? 0);
  const awayWon = decided && (score.away ?? 0) > (score.home ?? 0);

  return (
    <div className="glass flex flex-col gap-2 px-4 py-3 transition hover:border-primary/40">
      <Side name={home?.name} code={home?.code} flagUrl={home?.flagUrl} goals={score.home} win={homeWon} />
      <div className="h-px bg-white/5" />
      <Side name={away?.name} code={away?.code} flagUrl={away?.flagUrl} goals={score.away} win={awayWon} />
      <p className="mt-1 text-[0.6rem] text-white/30">
        {decided ? 'Full time' : formatKickoff(match.kickoff)}
      </p>
    </div>
  );
}

function Side({
  name,
  code,
  flagUrl,
  goals,
  win,
}: {
  name?: string;
  code?: string;
  flagUrl?: string;
  goals?: number | null;
  win?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${win ? 'text-accent' : ''}`}>
      <div className="flex items-center gap-2">
        <Flag code={code ?? '?'} flagUrl={flagUrl} size={20} />
        <span className="text-sm font-medium">{name ?? 'TBD'}</span>
      </div>
      {goals != null && <span className="font-display text-sm">{goals}</span>}
    </div>
  );
}

function TbdSide() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[0.6rem]">?</span>
      <span className="text-sm text-white/40">TBD</span>
    </div>
  );
}
