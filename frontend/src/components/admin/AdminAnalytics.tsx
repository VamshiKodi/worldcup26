import { useApi } from '../../hooks/useApi';
import type { AdminAnalytics as Analytics } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ProbabilityBar } from '../ui/ProbabilityBar';
import { Skeleton } from '../ui/Skeleton';
import { StatePanel } from '../ui/StatePanel';

export function AdminAnalytics() {
  const { body, loading, error, refetch } = useApi<{ data: Analytics }>('/admin/analytics');
  const a = body?.data;

  return (
    <StatePanel loading={loading} error={error} onRetry={refetch} skeleton={<Skeleton className="h-96" />}>
      {a && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(a.totals).map(([label, value]) => (
              <GlassCard key={label}>
                <p className="text-xs capitalize text-white/50">{label}</p>
                <p className="font-display text-3xl text-primary">
                  <AnimatedNumber value={value} />
                </p>
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <h3 className="mb-4 font-display text-lg font-bold">Predictions by type</h3>
              <BarList
                items={a.predictionsByType.map((p) => ({ label: p._id, value: p.count }))}
                tone="primary"
              />
            </GlassCard>

            <GlassCard>
              <h3 className="mb-4 font-display text-lg font-bold">Settlement</h3>
              <BarList
                items={[
                  { label: 'settled', value: a.settlement.settled },
                  { label: 'pending', value: a.settlement.pending },
                ]}
                tone="accent"
              />
              <h3 className="mb-3 mt-6 font-display text-lg font-bold">Match status</h3>
              <BarList items={a.matchStatus.map((m) => ({ label: m._id, value: m.count }))} tone="secondary" />
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <h3 className="mb-4 font-display text-lg font-bold">New users (last 14 days)</h3>
              <Signups data={a.signups} />
            </GlassCard>

            <GlassCard>
              <h3 className="mb-4 font-display text-lg font-bold">Top predictors</h3>
              {a.topPredictors.length === 0 ? (
                <p className="text-sm text-white/40">No predictors yet.</p>
              ) : (
                <div className="space-y-2">
                  {a.topPredictors.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <span className="w-5 text-white/40">{i + 1}</span>
                      <span className="flex-1 truncate">{u.name}</span>
                      <span className="text-xs text-white/40">{u.accuracy}%</span>
                      <span className="font-display text-lg text-primary">{u.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </StatePanel>
  );
}

function BarList({ items, tone }: { items: Array<{ label: string; value: number }>; tone: 'primary' | 'accent' | 'secondary' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-sm text-white/40">No data.</p>;
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <div className="mb-1 flex justify-between text-xs text-white/60">
            <span className="capitalize">{i.label}</span>
            <span>{i.value}</span>
          </div>
          <ProbabilityBar value={(i.value / max) * 100} tone={tone} />
        </div>
      ))}
    </div>
  );
}

function Signups({ data }: { data: Array<{ _id: string; count: number }> }) {
  if (data.length === 0) return <p className="text-sm text-white/40">No signups recorded.</p>;
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d) => (
        <div key={d._id} className="flex flex-1 flex-col items-center gap-1" title={`${d._id}: ${d.count}`}>
          <div
            className="w-full rounded-t bg-primary/70"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: 2 }}
          />
          <span className="text-[0.55rem] text-white/30">{d._id.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
