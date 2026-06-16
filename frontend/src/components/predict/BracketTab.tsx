import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import { isTeamRef, type ListResponse, type Team, type TeamRef } from '../../lib/types';
import { Flag } from '../ui/Flag';
import { Badge } from '../ui/Badge';
import { SkeletonGrid } from '../ui/Skeleton';
import { StatePanel } from '../ui/StatePanel';
import { Button } from '../ui/Button';

interface BracketDoc {
  rounds: { sf: Array<{ teamId: TeamRef | null }> };
  champion: TeamRef | null;
}

const MAX_SF = 4;

export function BracketTab() {
  // Top contenders form the selectable pool.
  const { body, loading, error, refetch } = useApi<ListResponse<Team>>('/teams', { limit: 16 });
  const { body: mine } = useApi<{ data: BracketDoc | null }>('/brackets/me');
  const teams = body?.data ?? [];

  const [sf, setSf] = useState<string[]>([]);
  const [champion, setChampion] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Seed from any saved bracket.
  useEffect(() => {
    const doc = mine?.data;
    if (!doc) return;
    const sfIds = (doc.rounds?.sf ?? [])
      .map((s) => (isTeamRef(s.teamId) ? s.teamId._id : null))
      .filter((x): x is string => !!x);
    setSf(sfIds);
    if (isTeamRef(doc.champion)) setChampion(doc.champion._id);
  }, [mine]);

  const toggleSf = (id: string) => {
    setSf((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SF) return prev;
      return [...prev, id];
    });
    setStatus('idle');
  };

  // Champion must be one of the semifinalists.
  useEffect(() => {
    if (champion && !sf.includes(champion)) setChampion('');
  }, [sf, champion]);

  const save = async () => {
    setStatus('saving');
    try {
      await api.put('/brackets/me', { sf, champion: champion || null });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const sfTeams = teams.filter((t) => sf.includes(t._id));

  return (
    <StatePanel loading={loading} error={error} isEmpty={teams.length === 0} onRetry={refetch} skeleton={<SkeletonGrid count={8} />}>
      <p className="mb-4 text-sm text-white/50">
        Pick your <span className="text-primary">Final Four</span> ({sf.length}/{MAX_SF}), then crown a
        champion from them.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((t) => {
          const chosen = sf.includes(t._id);
          return (
            <button
              key={t._id}
              onClick={() => toggleSf(t._id)}
              className={`glass flex items-center gap-2 p-3 text-left transition ${
                chosen ? 'border-primary/60 shadow-glow' : 'hover:border-primary/30'
              } ${!chosen && sf.length >= MAX_SF ? 'opacity-40' : ''}`}
            >
              <Flag code={t.code} flagUrl={t.flagUrl} size={26} />
              <span className="truncate text-sm font-medium">{t.name}</span>
            </button>
          );
        })}
      </div>

      {sfTeams.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-white/60">Your champion</p>
          <div className="flex flex-wrap gap-2">
            {sfTeams.map((t) => (
              <button
                key={t._id}
                onClick={() => setChampion(t._id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  champion === t._id ? 'bg-secondary text-bg' : 'glass hover:border-secondary/50'
                }`}
              >
                <Flag code={t.code} flagUrl={t.flagUrl} size={20} />
                {t.name}
                {champion === t._id && <span>★</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button variant="primary" onClick={save} disabled={status === 'saving' || sf.length === 0}>
          {status === 'saving' ? 'Saving…' : 'Save bracket'}
        </Button>
        {status === 'saved' && <Badge tone="accent">✓ Saved</Badge>}
        {status === 'error' && <span className="text-sm text-red-400">Couldn't save</span>}
      </div>
    </StatePanel>
  );
}
