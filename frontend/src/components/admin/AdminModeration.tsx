import { useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import type { AdminComment } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { FilterTabs } from '../ui/FilterTabs';
import { StatePanel } from '../ui/StatePanel';
import { Skeleton } from '../ui/Skeleton';
import { RowAction } from './controls';

const STATUSES = ['visible', 'flagged', 'removed'] as const;
type Status = (typeof STATUSES)[number];

const tone: Record<Status, 'accent' | 'secondary' | 'muted'> = {
  visible: 'accent',
  flagged: 'secondary',
  removed: 'muted',
};

export function AdminModeration() {
  const [status, setStatus] = useState<Status | null>(null);
  const { body, loading, error, refetch } = useApi<{ data: AdminComment[] }>('/admin/comments', {
    status: status ?? undefined,
  });
  const comments = body?.data ?? [];

  const setCommentStatus = async (id: string, s: Status) => {
    await api.patch(`/admin/comments/${id}`, { status: s });
    refetch();
  };
  const remove = async (id: string) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    await api.delete(`/admin/comments/${id}`);
    refetch();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Comment moderation</h2>
      </div>
      <div className="mb-6">
        <FilterTabs options={STATUSES} value={status} onChange={setStatus} allLabel="All" />
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={comments.length === 0}
        onRetry={refetch}
        skeleton={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        }
        emptyTitle="No comments"
        emptyMessage="Nothing to moderate right now."
      >
        <div className="space-y-3">
          {comments.map((c) => {
            const author = typeof c.userId === 'string' ? c.userId : c.userId?.name ?? 'Unknown';
            return (
              <GlassCard key={c._id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{author}</span>
                    <span className="text-white/30">on {c.targetType}</span>
                  </div>
                  <Badge tone={tone[c.status]}>{c.status}</Badge>
                </div>
                <p className="text-sm text-white/70">{c.body}</p>
                <div className="mt-3 flex justify-end gap-2">
                  {c.status !== 'visible' && <RowAction onClick={() => setCommentStatus(c._id, 'visible')}>Approve</RowAction>}
                  {c.status !== 'flagged' && <RowAction onClick={() => setCommentStatus(c._id, 'flagged')}>Flag</RowAction>}
                  {c.status !== 'removed' && <RowAction onClick={() => setCommentStatus(c._id, 'removed')}>Hide</RowAction>}
                  <RowAction tone="danger" onClick={() => remove(c._id)}>Delete</RowAction>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </StatePanel>
    </div>
  );
}
