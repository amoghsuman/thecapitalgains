type ComparisonColumn = { label?: string; points?: string[] };

export type ComparisonValue = { title?: string; columns?: ComparisonColumn[] };

// Alternates Forest/Gold per column so options read as genuinely distinct
// choices rather than mirrored duplicates; cycles if there are more than 2.
const ACCENTS = [
  { border: "border-forest", header: "bg-forest-surface", text: "text-forest", bullet: "text-forest" },
  { border: "border-gold", header: "bg-gold-surface", text: "text-gold-text", bullet: "text-gold-text" },
];

export default function ComparisonBlock({ value }: { value: ComparisonValue }) {
  const columns = value.columns ?? [];

  return (
    <div className="mt-8">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">{value.title}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {columns.map((col, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div key={i} className={`border-2 ${accent.border} rounded-xl bg-panel overflow-hidden`}>
              <div className={`font-mono text-[11px] ${accent.text} tracking-widest uppercase px-5 py-3 ${accent.header} border-b-2 ${accent.border}`}>
                {col.label}
              </div>
              <ul className="flex flex-col gap-2.5 p-5">
                {(col.points ?? []).map((point, pi) => (
                  <li key={pi} className="text-[14px] text-ink-dim leading-relaxed flex gap-2">
                    <span className={`${accent.bullet} flex-shrink-0`}>·</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
