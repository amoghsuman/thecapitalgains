type ComparisonColumn = { label?: string; points?: string[] };

export type ComparisonValue = { title?: string; columns?: ComparisonColumn[] };

export default function ComparisonBlock({ value }: { value: ComparisonValue }) {
  const columns = value.columns ?? [];

  return (
    <div className="my-6">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">{value.title}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {columns.map((col, i) => (
          <div key={i} className="border border-hairline rounded-xl bg-panel p-5">
            <div className="font-mono text-[11px] text-ink tracking-widest uppercase mb-4 pb-3 border-b border-hairline">
              {col.label}
            </div>
            <ul className="flex flex-col gap-2.5">
              {(col.points ?? []).map((point, pi) => (
                <li key={pi} className="text-[14px] text-ink-dim leading-relaxed flex gap-2">
                  <span className="text-gold flex-shrink-0">·</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
