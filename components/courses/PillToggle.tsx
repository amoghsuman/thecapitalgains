export type Pill = { value: string; label: string };

export default function PillToggleGroup({
  pills,
  active,
  onChange,
  ariaLabel,
}: {
  pills: Pill[];
  active: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {pills.map((pill) => {
        const isActive = active === pill.value;
        return (
          <button
            key={pill.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(pill.value)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border motion-safe:transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory
              ${
                isActive
                  ? "bg-forest border-forest text-white"
                  : "bg-panel border-hairline text-ink-dim hover:border-forest hover:text-ink"
              }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
