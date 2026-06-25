import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { isTeamRef, type Group, type StandingRow, type TeamRef } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { Flag } from '../components/ui/Flag';
import { Skeleton } from '../components/ui/Skeleton';
import { StatePanel } from '../components/ui/StatePanel';

/** A standings row whose team is guaranteed populated, for rendering. */
type Row = Omit<StandingRow, 'teamId'> & { team: TeamRef };

const EMPTY: Omit<StandingRow, 'teamId'> = { played: 0, points: 0, gf: 0, ga: 0, gd: 0, rank: 0 };

/** Use real standings when present; otherwise show the drawn teams with a zeroed table. */
function toRows(group: Group): Row[] {
  if (group.standings?.length) {
    return group.standings
      .filter((s) => isTeamRef(s.teamId))
      .map((s) => ({ ...s, team: s.teamId as TeamRef }))
      .sort((a, b) => a.rank - b.rank || b.points - a.points);
  }
  return (group.teamIds ?? [])
    .slice()
    .sort((a, b) => (a.fifaRanking ?? 999) - (b.fifaRanking ?? 999))
    .map((team) => ({ ...EMPTY, team }));
}

export default function Groups() {
  const { body, loading, error, refetch } = useApi<{ data: Group[] }>('/groups');
  const groups = body?.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="12 groups · top 2 + best thirds advance"
        title="Groups & Standings"
        subtitle="The 2026 group stage — 48 teams across 12 groups of four."
      />

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={groups.length === 0}
        onRetry={refetch}
        skeleton={
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        }
        emptyTitle="No groups yet"
        emptyMessage="Run the backend seed script to populate the draw."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, i) => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            >
              <GroupTable group={group} />
            </motion.div>
          ))}
        </div>
      </StatePanel>
    </main>
  );
}

function GroupTable({ group }: { group: Group }) {
  const rows = toRows(group);
  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 font-display text-2xl font-bold">
        Group <span className="text-gradient">{group.name}</span>
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[0.65rem] uppercase tracking-wide text-white/40">
            <th className="pb-2 font-medium">Team</th>
            <th className="pb-2 text-center font-medium">MP</th>
            <th className="pb-2 text-center font-medium">GD</th>
            <th className="pb-2 text-center font-medium">Pts</th>
            <th className="pb-2 text-center font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.team._id} className="border-t border-white/5">
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <span className={`w-4 text-xs ${idx < 2 ? 'text-accent' : 'text-white/30'}`}>
                    {idx + 1}
                  </span>
                  <Flag code={r.team.code} flagUrl={r.team.flagUrl} size={22} />
                  <span className="truncate">{r.team.name}</span>
                </div>
              </td>
              <td className="py-2 text-center text-white/60">{r.played}</td>
              <td className="py-2 text-center text-white/60">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
              <td className="py-2 text-center font-semibold">{r.points}</td>
              <td className="py-2 text-center">
                <FormIndicator form={r.team.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[0.65rem] text-white/30">
        <span className="text-accent">▮</span> Top two qualify for the knockout stage.
      </p>
    </GlassCard>
  );
}

function FormIndicator({ form }: { form?: string[] }) {
  if (!form || form.length === 0) {
    return <span className="text-white/20">-</span>;
  }
  return (
    <div className="flex gap-1">
      {form.map((result, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-400' : 'bg-red-500'
          }`}
          title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
        />
      ))}
    </div>
  );
}
