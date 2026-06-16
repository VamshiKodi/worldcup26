import { motion } from 'framer-motion';

type Tone = 'primary' | 'accent' | 'secondary';

const fill: Record<Tone, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  secondary: 'bg-secondary',
};

/** Horizontal probability/percentage bar with an animated fill. */
export function ProbabilityBar({
  value,
  label,
  tone = 'primary',
  className = '',
}: {
  value: number; // 0–100
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-white/60">
          <span>{label}</span>
          <span className="tabular-nums">{value.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${fill[tone]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
