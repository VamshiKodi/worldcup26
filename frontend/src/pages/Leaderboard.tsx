import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../store/authSlice';
import type { LeaderboardEntry, ListResponse } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Skeleton } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';
import { Pagination } from '../components/ui/Pagination';

const LIMIT = 50;
const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [page, setPage] = useState(1);
  const me = useAuth((s) => s.user);
  const { body, loading, error, refetch } = useApi<ListResponse<LeaderboardEntry>>('/leaderboard', {
    page,
    limit: LIMIT,
  });

  const entries = body?.data ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="Who predicts best?"
        title="Leaderboard"
        subtitle="Global ranking by prediction points. Climb the table as results roll in."
      />

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={entries.length === 0}
        onRetry={refetch}
        skeleton={
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        }
        emptyTitle="No rankings yet"
        emptyMessage="Be the first to make predictions and top the table."
      >
        <div className="space-y-2">
          {entries.map((e, i) => {
            const isMe = me?.id === e._id;
            return (
              <motion.div
                key={e._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
              >
                <GlassCard
                  className={`flex items-center gap-4 py-3 ${isMe ? 'border-primary/50 shadow-glow' : ''}`}
                >
                  <div className="w-10 text-center font-display text-xl">
                    {MEDAL[e.rank - 1] ?? <span className="text-white/50">{e.rank}</span>}
                  </div>

                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
                    {e.avatarUrl ? (
                      <img src={e.avatarUrl} alt={e.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">{e.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {e.name} {isMe && <span className="text-xs text-primary">(you)</span>}
                    </p>
                    <p className="text-xs text-white/40">{e.badges?.length ?? 0} badges</p>
                  </div>

                  <ProgressRing value={e.accuracy} size={44} stroke={4} />

                  <div className="w-20 text-right">
                    <p className="font-display text-2xl text-primary">{e.score}</p>
                    <p className="text-[0.6rem] uppercase tracking-wide text-white/40">points</p>
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
