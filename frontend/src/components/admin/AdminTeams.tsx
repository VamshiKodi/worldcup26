import { useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import { CONFEDERATIONS } from '../../lib/format';
import type { Confederation, ListResponse, Team } from '../../lib/types';
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
  code: string;
  confederation: Confederation;
  fifaRanking: string;
  isHost: boolean;
}

const blank: Form = { name: '', code: '', confederation: 'UEFA', fifaRanking: '', isHost: false };

export function AdminTeams() {
  const { body, loading, error, refetch } = useApi<ListResponse<Team>>('/teams', { limit: 100 });
  const teams = body?.data ?? [];
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const edit = (t: Team) =>
    setForm({
      id: t._id,
      name: t.name,
      code: t.code,
      confederation: t.confederation,
      fifaRanking: String(t.fifaRanking ?? ''),
      isHost: t.isHost,
    });

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setErr(null);
    const payload = {
      name: form.name,
      code: form.code.toUpperCase(),
      confederation: form.confederation,
      fifaRanking: form.fifaRanking === '' ? 0 : Number(form.fifaRanking),
      isHost: form.isHost,
    };
    try {
      if (form.id) await api.put(`/admin/teams/${form.id}`, payload);
      else await api.post('/admin/teams', payload);
      setForm(null);
      refetch();
    } catch (e) {
      setErr((e as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: Team) => {
    if (!window.confirm(`Delete ${t.name}?`)) return;
    await api.delete(`/admin/teams/${t._id}`);
    refetch();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Teams</h2>
        <Button variant="ghost" onClick={() => setForm(form ? null : { ...blank })}>
          {form ? 'Close' : '+ Add team'}
        </Button>
      </div>

      {form && (
        <GlassCard className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Code (3)">
              <input className={inputCls} maxLength={3} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Field>
            <Field label="Confederation">
              <select className={inputCls} value={form.confederation} onChange={(e) => setForm({ ...form, confederation: e.target.value as Confederation })}>
                {CONFEDERATIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="FIFA ranking">
              <input className={inputCls} inputMode="numeric" value={form.fifaRanking} onChange={(e) => setForm({ ...form, fifaRanking: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" checked={form.isHost} onChange={(e) => setForm({ ...form, isHost: e.target.checked })} />
              Host nation
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={save} disabled={busy || !form.name || form.code.length !== 3}>
              {busy ? 'Saving…' : form.id ? 'Update' : 'Create'}
            </Button>
            {err && <span className="text-sm text-red-400">{err}</span>}
          </div>
        </GlassCard>
      )}

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={teams.length === 0}
        onRetry={refetch}
        skeleton={<Skeleton className="h-64" />}
      >
        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Conf</th>
                <th className="px-4 py-3 text-center font-medium">Rank</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t._id} className="border-t border-white/5">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Flag code={t.code} flagUrl={t.flagUrl} size={22} />
                      <span>{t.name}</span>
                      {t.isHost && <Badge tone="secondary">Host</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-white/60">{t.confederation}</td>
                  <td className="px-4 py-2 text-center text-white/60">#{t.fifaRanking}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <RowAction onClick={() => edit(t)}>Edit</RowAction>
                      <RowAction tone="danger" onClick={() => remove(t)}>Delete</RowAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </StatePanel>
    </div>
  );
}
