const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-forest-surface text-forest",
  Intermediate: "bg-gold-surface text-gold-text",
  Advanced: "bg-ink/[0.06] text-ink",
};

export default function LevelBadge({ level }: { level: string | null }) {
  const label = level || "Core";
  const style = LEVEL_STYLES[label] ?? "bg-forest-surface text-forest";

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${style}`}>
      {label}
    </span>
  );
}
