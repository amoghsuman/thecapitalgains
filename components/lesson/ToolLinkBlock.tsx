export type ToolLinkValue = { label?: string; url?: string; description?: string };

export default function ToolLinkBlock({ value }: { value: ToolLinkValue }) {
  if (!value.url) return null;

  return (
    <a
      href={value.url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex items-center justify-between gap-4 border-2 border-forest rounded-xl bg-forest-surface px-5 py-4 hover:bg-forest hover:text-white group transition-colors"
    >
      <div>
        <div className="text-[15px] font-bold text-forest group-hover:text-white transition-colors">{value.label}</div>
        {value.description && (
          <div className="text-[13px] text-ink-dim group-hover:text-white/80 transition-colors mt-0.5">{value.description}</div>
        )}
      </div>
      <span className="font-mono text-[13px] text-forest group-hover:text-white transition-colors flex-shrink-0">↗</span>
    </a>
  );
}
