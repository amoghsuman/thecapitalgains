"use client";

// Small shared input/output primitives reused across all embedded lesson
// calculators, so every calculator looks and behaves consistently without
// each one reimplementing its own input styling.

export function CalcInput({
  label,
  value,
  onChange,
  suffix,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{label}</span>
      <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2 bg-ivory focus-within:border-gold transition-colors">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-ink outline-none"
        />
        {suffix && <span className="font-mono text-[12px] text-ink-dim flex-shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

export function CalcOutput({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{label}</span>
      <span className="text-[19px] font-bold text-forest leading-tight break-words">{value}</span>
    </div>
  );
}

export function formatINR(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
