export default function ProgressBar({ pct, completed }: { pct: number; completed: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-[5px] bg-hairline rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ${completed ? "bg-forest" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-ink-dim whitespace-nowrap">
        {completed ? "✓ Completed" : `${pct}%`}
      </span>
    </div>
  );
}
