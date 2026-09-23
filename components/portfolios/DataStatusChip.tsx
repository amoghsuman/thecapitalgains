import { dataStatusLabel, type DataStatus } from "@/lib/portfolios/types";

// The one label every portfolio panel shows for non-live data. Renders
// nothing for "live".
export default function DataStatusChip({ status, className = "" }: { status: DataStatus; className?: string }) {
  const label = dataStatusLabel(status);
  if (!label) return null;
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] text-ink-dim px-2 py-0.5 rounded-full border border-hairline bg-ivory whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
