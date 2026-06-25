import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { POSITIONS, POSITION_LABEL } from '../lib/format';
import { isTeamRef, type ListResponse, type Player, type Position } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { FilterTabs } from '../components/ui/FilterTabs';
import { GlassCard } from '../components/ui/GlassCard';
import { Flag } from '../components/ui/Flag';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

const LIMIT = 24;
const SORTS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'xg', label: 'xG' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

export default function Players() {
  const [position, setPosition] = useState<Position | null>(null);
  const [sort, setSort] = useState<SortKey>('goals');
  const [rawSearch, setRawSearch] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(rawSearch);

  useEffect(() => setPage(1), [position, sort, search]);

  const { body, loading, error, refetch } = useApi<ListResponse<Player>>('/players', {
    page,
    limit: LIMIT,
    position: position ?? undefined,
    sort,
    search: search || undefined,
  });

  const players = body?.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="The stars of the show"
        title="Players"
        subtitle="Track the golden boot race and the tournament's standout performers."
        right={<Badge tone="primary">{body?.total ?? 0} players</Badge>}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          options={POSITIONS}
          value={position}
          onChange={setPosition}
          labels={POSITION_LABEL}
        />
        <input
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          placeholder="Search players…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm outline-none transition focus:border-primary/60 lg:w-64"
        />
      </div>

      <div className="mb-8 flex items-center gap-2 text-sm text-white/50">
        <span>Sort by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-full px-3 py-1 transition ${
              sort === s.key ? 'bg-accent/20 text-accent' : 'hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={players.length === 0}
        onRetry={refetch}
        skeleton={<SkeletonGrid count={12} />}
        emptyTitle="No players found"
        emptyMessage="Try a different position or search term."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((p, i) => {
            const team = isTeamRef(p.teamId) ? p.teamId : null;
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              >
                <GlassCard hover className="h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <PlayerAvatar name={p.name} photoUrl={p.photoUrl} size={48} />
                        {team && (
                          <Flag
                            code={team.code}
                            flagUrl={team.flagUrl}
                            size={20}
                            className="absolute -bottom-1 -right-1 ring-2 ring-bg"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight">{p.name}</h3>
                        <p className="text-xs text-white/40">
                          {team?.name ?? '—'}
                          {p.club ? ` · ${p.club}` : ''}
                        </p>
                      </div>
                    </div>
                    {p.number != null && (
                      <span className="font-display text-2xl text-white/20">{p.number}</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge tone="muted">{p.position}</Badge>
                    {p.isTopScorer && <Badge tone="secondary">Top scorer</Badge>}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Goals" value={p.stats.goals} highlight={sort === 'goals'} />
                    <Stat label="Assists" value={p.stats.assists} highlight={sort === 'assists'} />
                    <Stat label="xG" value={p.stats.xg} highlight={sort === 'xg'} />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <Pagination page={page} totalPages={body?.totalPages ?? 1} onChange={setPage} />
      </StatePanel>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg py-2 ${highlight ? 'bg-accent/10' : 'bg-white/5'}`}>
      <p className={`font-display text-xl ${highlight ? 'text-accent' : 'text-white'}`}>{value}</p>
      <p className="text-[0.65rem] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}
