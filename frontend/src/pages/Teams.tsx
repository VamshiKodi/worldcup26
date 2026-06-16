import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { CONFEDERATIONS } from '../lib/format';
import type { Confederation, ListResponse, Team } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { FilterTabs } from '../components/ui/FilterTabs';
import { GlassCard } from '../components/ui/GlassCard';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { FormPips } from '../components/ui/FormPips';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

const LIMIT = 24;

export default function Teams() {
  const [confederation, setConfederation] = useState<Confederation | null>(null);
  const [rawSearch, setRawSearch] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(rawSearch);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => setPage(1), [confederation, search]);

  const { body, loading, error, refetch } = useApi<ListResponse<Team>>('/teams', {
    page,
    limit: LIMIT,
    confederation: confederation ?? undefined,
    search: search || undefined,
  });

  const teams = body?.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="48 nations, one trophy"
        title="Teams"
        subtitle="Every qualified nation for the 2026 finals, ranked by FIFA position."
        right={<Badge tone="primary">{body?.total ?? 0} teams</Badge>}
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs options={CONFEDERATIONS} value={confederation} onChange={setConfederation} />
        <input
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          placeholder="Search teams…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm outline-none transition focus:border-primary/60 lg:w-64"
        />
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={teams.length === 0}
        onRetry={refetch}
        skeleton={<SkeletonGrid count={12} />}
        emptyTitle="No teams found"
        emptyMessage="Try a different confederation or search term."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team, i) => (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
            >
              <GlassCard hover className="h-full">
                <div className="flex items-start justify-between">
                  <Flag code={team.code} flagUrl={team.flagUrl} size={40} />
                  <div className="flex flex-col items-end gap-1">
                    {team.isHost && <Badge tone="secondary">Host</Badge>}
                    <span className="text-xs text-white/40">#{team.fifaRanking} FIFA</span>
                  </div>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{team.name}</h3>
                <p className="text-sm text-white/40">{team.code}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge tone="muted">{team.confederation}</Badge>
                  <FormPips form={team.form} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <Pagination page={page} totalPages={body?.totalPages ?? 1} onChange={setPage} />
      </StatePanel>
    </main>
  );
}
