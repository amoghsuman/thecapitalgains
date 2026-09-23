"use client";

import { useMemo, useState } from "react";
import type { Portfolio, PortfolioMonth } from "@/lib/portfolios/types";
import DataStatusChip from "./DataStatusChip";

interface MonthlyReturnMatrixProps {
  portfolio: Portfolio;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function yearOf(m: PortfolioMonth): number {
  return Number(m.month.slice(0, 4));
}
function monthNumOf(m: PortfolioMonth): number {
  return Number(m.month.slice(5, 7));
}
function alphaOf(m: PortfolioMonth): number {
  return Number((m.portfolioReturn - m.benchmarkReturn).toFixed(2));
}

export default function MonthlyReturnMatrix({ portfolio }: MonthlyReturnMatrixProps) {
  const [metricMode, setMetricMode] = useState<"absolute" | "alpha">("absolute");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [selectedCell, setSelectedCell] = useState<PortfolioMonth | null>(null);

  // Years come from the data, newest first.
  const years = useMemo(
    () => Array.from(new Set(portfolio.monthlyReturns.map(yearOf))).sort((a, b) => b - a),
    [portfolio.monthlyReturns]
  );
  const filteredYears = yearFilter === "all" ? years : [yearFilter];
  const benchmark = portfolio.benchmark ?? "benchmark";

  // Helper for color gradient:
  // Forest green for > +6.0%, soft sage for positive, neutral cream for 0, terracotta/crimson for negative
  const getCellColor = (val: number | undefined) => {
    if (val === undefined) return "bg-gray-100 text-gray-400";
    if (val >= 6.0) return "bg-[#18482d] text-white font-bold"; // deep forest green
    if (val >= 3.5) return "bg-[#256e45] text-white font-semibold";
    if (val >= 1.5) return "bg-[#459669] text-white";
    if (val > 0.0) return "bg-[#8ecba6] text-[#0d331c]"; // soft sage
    if (val === 0.0) return "bg-[#f4efe3] text-ink"; // neutral cream
    if (val >= -2.0) return "bg-[#f5c6b8] text-[#6d2112]"; // soft terracotta
    if (val >= -4.5) return "bg-[#e58a74] text-[#4d140a]";
    return "bg-[#b83321] text-white font-bold"; // deep crimson
  };

  if (portfolio.monthlyReturns.length === 0) {
    return <p className="text-xs text-ink-dim font-mono">No monthly returns recorded for this portfolio.</p>;
  }

  return (
    <div className="space-y-6" id="monthly-return-matrix-container">
      {/* Top Controls: Metric Mode Toggle + Year Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold">
            Metric Mode:
          </span>
          <div className="inline-flex rounded-lg bg-ivory border border-hairline p-0.5">
            <button
              type="button"
              onClick={() => setMetricMode("absolute")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                metricMode === "absolute"
                  ? "bg-forest text-white font-bold shadow-xs"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              Absolute Returns (%)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("alpha")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                metricMode === "alpha"
                  ? "bg-forest text-white font-bold shadow-xs"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              Excess vs {benchmark} (%)
            </button>
          </div>
          <DataStatusChip status={portfolio.dataStatus} />
        </div>

        {/* Year Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
            Years:
          </span>
          <button
            type="button"
            onClick={() => setYearFilter("all")}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
              yearFilter === "all"
                ? "bg-panel border-forest text-forest font-bold shadow-2xs"
                : "border-hairline bg-panel hover:bg-ivory text-ink-dim"
            }`}
          >
            All ({years.length}Y)
          </button>
          {years.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setYearFilter(yr)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                yearFilter === yr
                  ? "bg-panel border-forest text-forest font-bold shadow-2xs"
                  : "border-hairline bg-panel hover:bg-ivory text-ink-dim"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline bg-panel shadow-xs">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-ivory/80 border-b border-hairline text-[11px] font-mono text-ink-dim">
              <th className="py-2.5 px-3 text-left font-bold border-r border-hairline">Year</th>
              {MONTHS.map((m) => (
                <th key={m} className="py-2.5 px-2 font-medium">
                  {m}
                </th>
              ))}
              <th className="py-2.5 px-3 font-bold border-l border-hairline bg-forest-surface text-forest">
                YTD / FY
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredYears.map((year) => {
              const yearRecords = portfolio.monthlyReturns.filter((r) => yearOf(r) === year);

              // Calculate cumulative compound return for the year
              const annualReturn = yearRecords.reduce((acc, curr) => {
                const ret = metricMode === "absolute" ? curr.portfolioReturn : alphaOf(curr);
                return acc * (1 + ret / 100);
              }, 1.0);
              const annualPct = (annualReturn - 1) * 100;

              return (
                <tr key={year} className="border-b border-hairline/60 hover:bg-ivory/30 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-olive text-left border-r border-hairline bg-panel">
                    {year}
                  </td>
                  {MONTHS.map((monthStr, idx) => {
                    const record = yearRecords.find((r) => monthNumOf(r) === idx + 1);
                    if (!record) {
                      return (
                        <td key={monthStr} className="p-1">
                          <div className="h-9 rounded-md bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-mono">
                            —
                          </div>
                        </td>
                      );
                    }

                    const val = metricMode === "absolute" ? record.portfolioReturn : alphaOf(record);
                    const isSelected = selectedCell?.month === record.month;

                    return (
                      <td key={monthStr} className="p-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCell(record)}
                          className={`w-full h-9 rounded-md flex flex-col items-center justify-center text-[11px] font-mono transition-all transform hover:scale-105 hover:shadow-md cursor-pointer border ${
                            isSelected ? "ring-2 ring-gold border-black" : "border-black/5"
                          } ${getCellColor(val)}`}
                          title={`Click for memo: ${monthStr} ${year} (${val > 0 ? "+" : ""}${val}%)`}
                        >
                          <span>{val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}</span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 font-mono font-bold border-l border-hairline bg-forest-surface text-forest">
                    {annualPct > 0 ? `+${annualPct.toFixed(1)}%` : `${annualPct.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-ink-dim gap-3 font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-ink">Gradient:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#18482d]" />
            <span>&gt;+6.0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#459669]" />
            <span>+1.5% to +6%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#8ecba6]" />
            <span>0 to +1.5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#f5c6b8]" />
            <span>0 to -2%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#b83321]" />
            <span>Drawdown (&lt;-4%)</span>
          </div>
        </div>

        <div className="text-ink-muted">
          * Click any cell above to inspect holding contribution & macroeconomic teardown.
        </div>
      </div>

      {/* Interactive Cell Inspection Popover / Teardown Drawer */}
      {selectedCell && (
        <div className="p-4 sm:p-5 rounded-2xl bg-forest/5 border border-forest/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <h4 className="font-bold text-sm text-olive">
                Model Performance Memo: {MONTHS[monthNumOf(selectedCell) - 1]} {yearOf(selectedCell)}
              </h4>
              <DataStatusChip status={portfolio.dataStatus} />
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-ink-dim hover:text-ink font-mono px-2 py-0.5 rounded hover:bg-forest/10"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-panel p-3 rounded-xl border border-hairline">
              <div className="text-[10px] text-ink-dim uppercase">Portfolio Return</div>
              <div className="text-base font-bold text-forest mt-0.5">
                {selectedCell.portfolioReturn > 0 ? `+${selectedCell.portfolioReturn}%` : `${selectedCell.portfolioReturn}%`}
              </div>
            </div>
            <div className="bg-panel p-3 rounded-xl border border-hairline">
              <div className="text-[10px] text-ink-dim uppercase">{benchmark}</div>
              <div className="text-base font-bold text-ink mt-0.5">
                {selectedCell.benchmarkReturn > 0 ? `+${selectedCell.benchmarkReturn}%` : `${selectedCell.benchmarkReturn}%`}
              </div>
            </div>
            <div className="bg-panel p-3 rounded-xl border border-hairline">
              <div className="text-[10px] text-ink-dim uppercase">Excess Return</div>
              <div className="text-base font-bold text-gold mt-0.5">
                {alphaOf(selectedCell) > 0 ? `+${alphaOf(selectedCell).toFixed(1)}%` : `${alphaOf(selectedCell).toFixed(1)}%`}
              </div>
            </div>
            <div className="bg-panel p-3 rounded-xl border border-hairline">
              <div className="text-[10px] text-ink-dim uppercase">Top Constituent Contributor</div>
              <div className="text-sm font-bold text-olive mt-0.5 truncate">
                {selectedCell.topHolding ?? "—"}
              </div>
            </div>
          </div>

          {selectedCell.memo && (
            <div className="p-3 bg-panel rounded-xl border border-hairline text-xs space-y-1">
              <div className="font-mono text-[10px] text-gold font-bold uppercase tracking-wider">
                Macroeconomic Context & Allocation Memo:
              </div>
              <p className="text-ink-dim leading-relaxed">{selectedCell.memo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
