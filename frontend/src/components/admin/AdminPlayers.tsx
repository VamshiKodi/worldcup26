import { useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import { POSITIONS } from '../../lib/format';
import { isTeamRef, type ListResponse, type Player, type Position, type Team } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Flag } from '../ui/Flag';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatePanel } from '../ui/StatePanel';
import { Skeleton } from '../ui/Skeleton';
import { Field, inputCls, RowAction } from './controls';

interface Form {
  id?: string;
  name: string;
  teamId: string;
  position: Position;
  number: string;
  club: string;
  goals: string;
}

const blank: Form = { name: '', teamId: '', position: 'FW', number: '', club: '', goals: '' };

export function AdminPlayers() {
  const { body, loading, error, refetch } = useApi<ListResponse<Player>>('/players', { limit: 100 });
  const { body: teamsBody } = useApi<ListResponse<Team>>('/teams', { limit: 100 });
  const players = body?.data ?? [];
  const teams = teamsBody?.data ?? [];
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const edit = (p: Player) =>
    setForm({
      id: p._id,
      name: p.name,
      teamId: isTeamRef(p.teamId) ? p.teamId._id : (p.teamId as string),
      position: p.position,
      number: p.number?.toString() ?? '',
      club: p.club ?? '',
      goals: p.stats.goals?.toString() ?? '',
    });

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setErr(null);
    const payload: Record<string, unknown> = {
      name: form.name,
      teamId: form.teamId,
      position: form.position,
      club: form.club || undefined,
      stats: { goals: form.goals === '' ? 0 : Number(form.goals) },
    };
    if (form.number) payload.number = Number(form.number);
    try {
      if (form.id) await api.put(`/admin/players/${form.id}`, payload);
      else await api.post('/admin/players', payload);
      setForm(null);
      refetch();
    } catch (e) {
      setErr((e as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Player) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await api.delete(`/admin/players/${p._id}`);
    refetch();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Players</h2>
        <Button variant="ghost" onClick={() => setForm(form ? null : { ...blank })}>
          {form ? 'Close' : '+ Add player'}
        </Button>
      </div>

      {form && (
        <GlassCard className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Team">
              <select className={inputCls} value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
                <option value="">Select…</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Position">
              <select className={inputCls} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as Position })}>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Number">
              <input className={inputCls} inputMode="numeric" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
            </Field>
            <Field label="Club">
              <input className={inputCls} value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} />
            </Field>
            <Field label="Goals">
              <input className={inputCls} inputMode="numeric" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={save} disabled={busy || !form.name || !form.teamId}>
              {busy ? 'Saving…' : form.id ? 'Update' : 'Create'}
            </Button>
            {err && <span className="text-sm text-red-400">{err}</span>}
          </div>
        </GlassCard>
      )}

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={players.length === 0}
        onRetry={refetch}
        skeleton={<Skeleton className="h-64" />}
      >
        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 text-center font-medium">Pos</th>
                <th className="px-4 py-3 text-center font-medium">Goals</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const team = isTeamRef(p.teamId) ? p.teamId : null;
                return (
                  <tr key={p._id} className="border-t border-white/5">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-white/60">
                        {team && <Flag code={team.code} flagUrl={team.flagUrl} size={18} />}
                        {team?.name ?? '—'}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center"><Badge tone="muted">{p.position}</Badge></td>
                    <td className="px-4 py-2 text-center text-white/60">{p.stats.goals}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <RowAction onClick={() => edit(p)}>Edit</RowAction>
                        <RowAction tone="danger" onClick={() => remove(p)}>Delete</RowAction>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      </StatePanel>
    </div>
  );
}
