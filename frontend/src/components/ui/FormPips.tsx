const tone: Record<string, string> = {
  W: 'bg-accent/80 text-bg',
  D: 'bg-secondary/80 text-bg',
  L: 'bg-red-500/80 text-white',
};

/** Recent-form dots, e.g. ['W','D','L']. */
export function FormPips({ form }: { form: string[] }) {
  if (!form?.length) return <span className="text-xs text-white/30">—</span>;
  return (
    <div className="flex gap-1">
      {form.slice(-5).map((r, i) => (
        <span
          key={i}
          className={`grid h-5 w-5 place-items-center rounded text-[0.65rem] font-bold ${
            tone[r] ?? 'bg-white/10 text-white/60'
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
