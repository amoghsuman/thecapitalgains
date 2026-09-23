"use client";

import type { MarketDataset } from "@/lib/portfolios/types";
import { valueOf } from "@/lib/portfolios/types";
import { ShieldCheck } from "lucide-react";
import DataStatusChip from "./DataStatusChip";

interface CrossAssetDispersionMatrixProps {
  dataset: MarketDataset | null;
}

function fmt(v: number | null, digits: number, signed = false, suffix = ""): string {
  if (v === null) return "—";
  return `${signed && v >= 0 ? "+" : ""}${v.toFixed(digits)}${suffix}`;
}

export default function CrossAssetDispersionMatrix({ dataset }: CrossAssetDispersionMatrixProps) {
  if (!dataset || dataset.rows.length === 0) {
    return <p className="text-xs text-ink-dim font-mono">Dispersion dataset not published yet.</p>;
  }

  return (
    <div className="space-y-6" id="cross-asset-dispersion-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase mb-1">
            5-YEAR RISK-ADJUSTED FRONTIER
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-olive">Cross-Asset Class Dispersion Matrix</h3>
          <p className="text-xs sm:text-sm text-ink-dim max-w-2xl mt-1 leading-relaxed">
            Side-by-side comparison across asset classes showing 5-year annualised CAGRs, volatility, Sharpe ratios,
            drawdowns and correlation to the benchmark.
          </p>
        </div>
        <DataStatusChip status={dataset.dataStatus} />
      </div>

      {/* Dispersion Table */}
      <div className="overflow-x-auto rounded-2xl border border-hairline bg-panel shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-ivory border-b border-hairline font-mono text-[11px] text-ink-dim">
              <th className="py-3 px-4 font-bold">Asset Class / Index</th>
              <th className="py-3 px-3 font-bold text-right">5Y CAGR (%)</th>
              <th className="py-3 px-3 font-bold text-right">Annualised Vol (%)</th>
              <th className="py-3 px-3 font-bold text-right">Sharpe Ratio</th>
              <th className="py-3 px-3 font-bold text-right">Max Drawdown</th>
              <th className="py-3 px-4 font-bold text-right">Corr to NIFTY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {dataset.rows.map((row, i) => {
              const isTop = i === 0;
              return (
                <tr
                  key={row.label}
                  className={`hover:bg-ivory/50 transition-colors ${isTop ? "bg-forest-surface font-semibold" : ""}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isTop && <span className="w-2 h-2 rounded-full bg-forest" />}
                      <div>
                        <div className={`font-bold ${isTop ? "text-forest text-[13px]" : "text-olive"}`}>{row.label}</div>
                        {row.sublabel && <div className="font-mono text-[10px] text-ink-dim">{row.sublabel}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-right text-olive">
                    {fmt(valueOf(row, "cagr"), 1, true, "%")}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-ink-dim">{fmt(valueOf(row, "volatility"), 1, false, "%")}</td>
                  <td className="py-3 px-3 font-mono font-bold text-right text-forest">{fmt(valueOf(row, "sharpe"), 2)}</td>
                  <td className="py-3 px-3 font-mono text-right text-red-700">{fmt(valueOf(row, "maxDrawdown"), 1, false, "%")}</td>
                  <td className="py-3 px-4 font-mono text-right text-ink-dim">{fmt(valueOf(row, "correlation"), 2, true)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-ivory rounded-xl border border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-ink-dim font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest" />
          <span>Sharpe ratio computed assuming 6.5% risk-free rate (91-Day Indian Treasury Bills)</span>
        </div>
        {dataset.source && (
          <span className="text-[10px]">
            Source: {dataset.source}
            {dataset.asOf ? ` · as of ${dataset.asOf}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
