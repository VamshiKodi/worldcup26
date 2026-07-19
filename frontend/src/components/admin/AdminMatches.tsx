import { useState } from 'react';
import { api } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import { STAGE_LABEL, formatKickoff } from '../../lib/format';
import type { Group, ListResponse, Match, MatchStatus, Stage, Team } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Flag } from '../ui/Flag';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatePanel } from '../ui/StatePanel';
import { Skeleton } from '../ui/Skeleton';
import { Field, inputCls, RowAction } from './controls';

const STAGES: Stage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];
const STATUSES: MatchStatus[] = ['scheduled', 'live', 'finished'];

export function AdminMatches() {
  const { body, loading, error, refetch } = useApi<ListResponse<Match>>('/matches', { limit: 120 });
  const { body: teamsBody } = useApi<ListResponse<Team>>('/teams', { limit: 100 });
  const { body: groupsBody } = useApi<{ data: Group[] }>('/groups');
  const matches = body?.data ?? [];
  const teams = teamsBody?.data ?? [];
  const groups = groupsBody?.data ?? [];

  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Matches</h2>
        <Button variant="ghost" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Close' : '+ Add match'}
        </Button>
      </div>

      {creating && (
        <CreateMatch
          teams={teams}
          groups={groups}
          onDone={() => {
            setCreating(false);
            refetch();
          }}
        />
      )}

      <p className="mb-4 text-sm text-white/50">
        Set a match to <span className="text-accent">finished</span> with a score to recompute
        standings and settle predictions automatically.
      </p>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={matches.length === 0}
        onRetry={refetch}
        skeleton={<Skeleton className="h-64" />}
      >
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchEditor key={m._id} match={m} onSaved={refetch} />
          ))}
        </div>
      </StatePanel>
    </div>
  );
}

function MatchEditor({ match, onSaved }: { match: Match; onSaved: () => void }) {
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [home, setHome] = useState(match.score.home?.toString() ?? '');
  const [away, setAway] = useState(match.score.away?.toString() ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [note, setNote] = useState('');

  const save = async () => {
    setState('saving');
    setNote('');
    const score = {
      home: home === '' ? null : Number(home),
      away: away === '' ? null : Number(away),
    };
    try {
      const { data } = await api.put(`/admin/matches/${match._id}`, { status, score });
      const settled = data.meta?.settled ?? 0;
      setState('saved');
      if (settled) setNote(`${settled} prediction${settled === 1 ? '' : 's'} settled`);
      onSaved();
    } catch {
      setState('error');
    }
  };

  return (
    <GlassCard className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex min-w-[3rem] items-center text-xs text-white/40">{STAGE_LABEL[match.stage]}</div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
        <span className="truncate text-sm">{match.homeTeamId?.name ?? 'TBD'}</span>
        <Flag code={match.homeTeamId?.code ?? '?'} flagUrl={match.homeTeamId?.flagUrl} size={22} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <input className={`${inputCls} w-12 text-center`} inputMode="numeric" value={home} onChange={(e) => setHome(e.target.value.replace(/\D/g, '').slice(0, 2))} />
        <span className="text-white/30">:</span>
        <input className={`${inputCls} w-12 text-center`} inputMode="numeric" value={away} onChange={(e) => setAway(e.target.value.replace(/\D/g, '').slice(0, 2))} />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Flag code={match.awayTeamId?.code ?? '?'} flagUrl={match.awayTeamId?.flagUrl} size={22} />
        <span className="truncate text-sm">{match.awayTeamId?.name ?? 'TBD'}</span>
      </div>
      <select className={`${inputCls} w-full sm:w-32`} value={status} onChange={(e) => setStatus(e.target.value as MatchStatus)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <RowAction onClick={save}>{state === 'saving' ? '…' : 'Save'}</RowAction>
      <div className="w-full text-right text-xs">
        {state === 'saved' && <span className="text-accent">✓ {note || formatKickoff(match.kickoff)}</span>}
        {state === 'error' && <span className="text-red-400">Save failed</span>}
        {state === 'idle' && <span className="text-white/30">{formatKickoff(match.kickoff)}</span>}
      </div>
    </GlassCard>
  );
}

function CreateMatch({
  teams,
  groups,
  onDone,
}: {
  teams: Team[];
  groups: Group[];
  onDone: () => void;
}) {
  const [stage, setStage] = useState<Stage>('group');
  const [homeTeamId, setHome] = useState('');
  const [awayTeamId, setAway] = useState('');
  const [kickoff, setKickoff] = useState('');
  const [groupId, setGroupId] = useState('');
  const [venue, setVenue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setErr(null);
    const payload: Record<string, unknown> = { stage, homeTeamId, awayTeamId, kickoff };
    if (groupId) payload.groupId = groupId;
    if (venue) payload.venue = venue;
    try {
      await api.post('/admin/matches', payload);
      onDone();
    } catch (e) {
      setErr((e as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="mb-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Stage">
          <select className={inputCls} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="Home team">
          <select className={inputCls} value={homeTeamId} onChange={(e) => setHome(e.target.value)}>
            <option value="">Select…</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Away team">
          <select className={inputCls} value={awayTeamId} onChange={(e) => setAway(e.target.value)}>
            <option value="">Select…</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Kickoff">
          <input type="datetime-local" className={inputCls} value={kickoff} onChange={(e) => setKickoff(e.target.value)} />
        </Field>
        <Field label="Group (optional)">
          <select className={inputCls} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">None</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>Group {g.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Venue (optional)">
          <input className={inputCls} value={venue} onChange={(e) => setVenue(e.target.value)} />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={busy || !homeTeamId || !awayTeamId || !kickoff || homeTeamId === awayTeamId}>
          {busy ? 'Creating…' : 'Create match'}
        </Button>
        {err && <span className="text-sm text-red-400">{err}</span>}
      </div>
    </GlassCard>
  );
}
