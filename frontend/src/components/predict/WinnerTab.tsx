import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { usePredictions } from '../../store/predictionSlice';
import type { ListResponse, Team } from '../../lib/types';
import { Flag } from '../ui/Flag';
import { SkeletonGrid } from '../ui/Skeleton';
import { StatePanel } from '../ui/StatePanel';

export function WinnerTab() {
  const { body, loading, error, refetch } = useApi<ListResponse<Team>>('/teams', { limit: 48 });
  const teams = body?.data ?? [];
  const winnerTeamId = usePredictions((s) => s.winnerTeamId);
  const saveWinner = usePredictions((s) => s.saveWinner);
  const [busy, setBusy] = useState(false);

  const pick = async (id: string) => {
    setBusy(true);
    try {
      await saveWinner(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StatePanel
      loading={loading}
      error={error}
      isEmpty={teams.length === 0}
      onRetry={refetch}
      skeleton={<SkeletonGrid count={12} />}
    >
      <p className="mb-4 text-sm text-white/50">
        Who lifts the trophy? Correct champion = <span className="text-secondary">20 pts</span>.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((t) => {
          const selected = winnerTeamId === t._id;
          return (
            <button
              key={t._id}
              disabled={busy}
              onClick={() => pick(t._id)}
              className={`glass flex items-center gap-3 p-4 text-left transition disabled:opacity-60 ${
                selected ? 'border-secondary/60 shadow-glow' : 'hover:border-primary/40'
              }`}
            >
              <Flag code={t.code} flagUrl={t.flagUrl} size={32} />
              <div className="min-w-0">
                <p className="truncate font-medium">{t.name}</p>
                <p className="text-xs text-white/40">#{t.fifaRanking}</p>
              </div>
              {selected && <span className="ml-auto text-secondary">★</span>}
            </button>
          );
        })}
      </div>
    </StatePanel>
  );
}
