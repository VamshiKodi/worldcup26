import { useState } from 'react';
import { api } from '../lib/api';
import type { SimulationResult, SimTeamResult } from '../lib/types';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GlassCard } from '../components/ui/GlassCard';
import { Flag } from '../components/ui/Flag';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProbabilityBar } from '../components/ui/ProbabilityBar';
import { EmptyState } from '../components/ui/EmptyState';

const RUN_OPTIONS = [100, 500, 1000] as const;

export default function Simulator() {
  const [runs, setRuns] = useState<number>(1000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ data: SimulationResult }>('/simulate', { runs });
      setResult(data.data);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ??
        'Simulation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const top = result?.teams.slice(0, 12) ?? [];

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <SectionHeading
        eyebrow="Monte Carlo"
        title="Tournament Simulator"
        subtitle="Play out the entire tournament thousands of times to see how often each nation lifts the trophy."
      />

      <GlassCard className="mb-8 flex flex-wrap items-center gap-4">
        <span className="text-sm text-white/60">Iterations</span>
        <div className="flex gap-2">
          {RUN_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setRuns(n)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                runs === n ? 'bg-primary text-bg' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>
        <Button variant="accent" onClick={run} disabled={loading} className="ml-auto">
          {loading ? 'Simulating…' : 'Run simulation'}
        </Button>
      </GlassCard>

      {error && <EmptyState icon="⚠️" title="Simulation failed" message={error} />}

      {!result && !error && (
        <EmptyState
          icon="🎲"
          title="No simulation yet"
          message="Pick an iteration count and run the model to see championship probabilities."
        />
      )}

      {result && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              Championship probability
              <Badge tone="muted">{result.runs.toLocaleString()} runs</Badge>
            </h2>
            <div className="space-y-3">
              {top.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <Flag code={t.code} flagUrl={t.flagUrl} size={24} />
                  <div className="flex-1">
                    <ProbabilityBar value={t.win} label={t.name} tone="accent" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-bold">Stage-reach probability</h2>
            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[0.65rem] uppercase tracking-wide text-white/40">
                    <th className="px-4 py-3 font-medium">Team</th>
                    <Th>R16</Th>
                    <Th>QF</Th>
                    <Th>SF</Th>
                    <Th>Final</Th>
                    <Th>Win</Th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((t) => (
                    <Row key={t.id} t={t} />
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </section>
        </div>
      )}
    </main>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-2 py-3 text-center font-medium">{children}</th>
);

function Row({ t }: { t: SimTeamResult }) {
  const cell = (v: number) => (
    <td className="px-2 py-2 text-center tabular-nums text-white/70">{v.toFixed(0)}%</td>
  );
  return (
    <tr className="border-t border-white/5">
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <Flag code={t.code} flagUrl={t.flagUrl} size={20} />
          <span className="truncate">{t.name}</span>
        </div>
      </td>
      {cell(t.reachR16)}
      {cell(t.reachQF)}
      {cell(t.reachSF)}
      {cell(t.reachFinal)}
      <td className="px-2 py-2 text-center font-semibold tabular-nums text-accent">{t.win.toFixed(1)}%</td>
    </tr>
  );
}
