import Link from "next/link";

export type ContinueLearningItem = {
  slug: string;
  title: string;
  pct: number;
  href: string;
};

export default function ContinueLearningStrip({ items }: { items: ContinueLearningItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold text-ink-dim tracking-widest uppercase mb-3">
        Continue learning
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className="group flex-shrink-0 snap-start w-[220px] rounded-xl border border-hairline bg-panel p-4
              hover:border-gold motion-safe:transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <div className="text-[13px] font-semibold text-ink leading-snug line-clamp-2 mb-3 group-hover:text-forest motion-safe:transition-colors">
              {item.title}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[4px] bg-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full motion-safe:transition-[width] motion-safe:duration-300"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-ink-dim whitespace-nowrap">{item.pct}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
