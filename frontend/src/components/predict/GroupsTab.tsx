import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import { isTeamRef, type Group, type Prediction } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Flag } from '../ui/Flag';
import { Skeleton } from '../ui/Skeleton';
import { StatePanel } from '../ui/StatePanel';

export function GroupsTab() {
  const { body, loading, error, refetch } = useApi<{ data: Group[] }>('/groups');
  const { body: mine } = useApi<{ data: Prediction[] }>('/predictions/me');
  const groups = body?.data ?? [];

  // Seed existing group picks: groupId → [firstTeamId, secondTeamId].
  const seeded = useMemo(() => {
    const map: Record<string, [string, string]> = {};
    for (const p of mine?.data ?? []) {
      if (p.type !== 'group' || !p.groupId) continue;
      const gid = typeof p.groupId === 'string' ? p.groupId : p.groupId._id;
      const ordered = [...p.groupPrediction].sort((a, b) => a.rank - b.rank).map((r) => r.teamId);
      map[gid] = [ordered[0] ?? '', ordered[1] ?? ''];
    }
    return map;
  }, [mine]);

  return (
    <StatePanel
      loading={loading}
      error={error}
      isEmpty={groups.length === 0}
      onRetry={refetch}
      skeleton={
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      }
    >
      <p className="mb-4 text-sm text-white/50">
        Call the top two of each group. Each correct placement = <span className="text-accent">3 pts</span>.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <GroupPicker key={g._id} group={g} initial={seeded[g._id]} />
        ))}
      </div>
    </StatePanel>
  );
}

function GroupPicker({ group, initial }: { group: Group; initial?: [string, string] }) {
  const teams = group.teamIds.filter(isTeamRef);
  const [first, setFirst] = useState(initial?.[0] ?? '');
  const [second, setSecond] = useState(initial?.[1] ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (initial) {
      setFirst(initial[0]);
      setSecond(initial[1]);
    }
  }, [initial]);

  const save = async (a: string, b: string) => {
    if (!a || !b || a === b) return;
    setStatus('saving');
    try {
      await api.put(`/predictions/group/${group._id}`, { ranking: [a, b] });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const onFirst = (v: string) => {
    setFirst(v);
    void save(v, second);
  };
  const onSecond = (v: string) => {
    setSecond(v);
    void save(first, v);
  };

  const selectCls =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60';

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">
          Group <span className="text-gradient">{group.name}</span>
        </h3>
        <span className="h-4 text-xs">
          {status === 'saving' && <span className="text-white/40">Saving…</span>}
          {status === 'saved' && <span className="text-accent">✓</span>}
          {status === 'error' && <span className="text-red-400">!</span>}
        </span>
      </div>

      <label className="mb-2 block">
        <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-white/40">Winner</span>
        <select value={first} onChange={(e) => onFirst(e.target.value)} className={selectCls}>
          <option value="">Select…</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id} disabled={t._id === second}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-white/40">Runner-up</span>
        <select value={second} onChange={(e) => onSecond(e.target.value)} className={selectCls}>
          <option value="">Select…</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id} disabled={t._id === first}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {teams.map((t) => (
          <Flag key={t._id} code={t.code} flagUrl={t.flagUrl} size={20} />
        ))}
      </div>
    </GlassCard>
  );
}
