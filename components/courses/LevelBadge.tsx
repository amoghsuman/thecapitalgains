// `-badge` tints (not `-surface`) — `-surface` is tuned for large-area fills
// and reads as a flat, near-indistinguishable grey at small pill sizes,
// which is what made every level look the same regardless of `tag`.
// Intermediate pairs its background with `gold-text`, not `gold` DEFAULT:
// DEFAULT (#A9822F) on this background is ~2.9:1, well under the 4.5:1 AA
// floor for text this size; `gold-text` (#6E5620) clears ~5.8:1.
const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-forest-badge text-forest",
  Intermediate: "bg-gold-badge text-gold-text",
  Advanced: "bg-ink text-white",
};

export default function LevelBadge({ level }: { level: string | null }) {
  const label = level || "Core";
  const style = LEVEL_STYLES[label] ?? "bg-forest-badge text-forest";

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${style}`}>
      {label}
    </span>
  );
}
