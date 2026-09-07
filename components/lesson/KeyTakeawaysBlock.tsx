export type KeyTakeawaysValue = { points?: string[] };

export default function KeyTakeawaysBlock({ value }: { value: KeyTakeawaysValue }) {
  const points = value.points ?? [];

  return (
    <div className="mt-8 border-2 border-forest rounded-xl bg-forest-surface px-6 py-5">
      <div className="font-mono text-[11px] text-forest tracking-widest uppercase mb-4">Key Takeaways</div>
      <ul className="flex flex-col gap-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-ink leading-relaxed">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-forest text-white text-[11px] flex items-center justify-center mt-0.5">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
