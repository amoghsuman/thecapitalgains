"use client";

import { useMemo, useState } from "react";
import type { MarketDataset, DatasetRow } from "@/lib/portfolios/types";
import { valueOf } from "@/lib/portfolios/types";
import DataStatusChip from "./DataStatusChip";

interface AssetClassQuiltProps {
  dataset: MarketDataset | null;
}

// Tile colours are presentation only, assigned by row order. The first row is
// styled as the model-portfolio row.
const TILE_STYLES = [
  "bg-forest text-white border-forest-dark",
  "bg-amber-100 text-amber-900 border-amber-300",
  "bg-yellow-100 text-yellow-900 border-yellow-300",
  "bg-emerald-100 text-emerald-900 border-emerald-300",
  "bg-sky-100 text-sky-900 border-sky-300",
  "bg-slate-100 text-slate-800 border-slate-300",
  "bg-stone-100 text-stone-700 border-stone-300",
];

export default function AssetClassQuilt({ dataset }: AssetClassQuiltProps) {
  const [highlightedAsset, setHighlightedAsset] = useState<string | null>(null);

  const rows = useMemo(() => dataset?.rows ?? [], [dataset]);

  // Years come from the dataset keys, ascending.
  const years = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((r) => r.values.forEach((v) => keys.add(v.key)));
    return Array.from(keys).sort();
  }, [rows]);

  // For each year, sort the asset classes by return descending
  const rankedByYear = useMemo(() => {
    const result: Record<string, Array<{ row: DatasetRow; index: number; returnPct: number }>> = {};
    years.forEach((yr) => {
      const yearAssets = rows.map((row, index) => ({ row, index, returnPct: valueOf(row, yr) ?? 0 }));
      yearAssets.sort((a, b) => b.returnPct - a.returnPct);
      result[yr] = yearAssets;
    });
    return result;
  }, [rows, years]);

  if (!dataset || rows.length === 0 || years.length === 0) {
    return <p className="text-xs text-ink-dim font-mono">Asset-class dataset not published yet.</p>;
  }

  const latestYear = years[years.length - 1];

  return (
    <div className="space-y-6" id="asset-class-quilt-container">
      {/* Header Explainer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase mb-1">
            CYCLE ROTATION & DEFENSE
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-olive">
            Asset Class Quilt (Periodic Table of Indian Returns)
          </h3>
          <p className="text-xs sm:text-sm text-ink-dim max-w-2xl mt-1 leading-relaxed">
            Annual leadership across major Indian asset classes from {years[0]} to {latestYear}. Ranked from top
            performer at the top to lowest at the bottom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DataStatusChip status={dataset.dataStatus} />
          {highlightedAsset && (
            <button
              onClick={() => setHighlightedAsset(null)}
              className="text-xs font-mono text-forest bg-forest-surface hover:bg-forest hover:text-white px-3 py-1.5 rounded-lg border border-hairline transition-colors cursor-pointer"
            >
              Clear Highlight ({highlightedAsset}) ✕
            </button>
          )}
        </div>
      </div>

      {/* Quilt Grid */}
      <div className="overflow-x-auto rounded-2xl border border-hairline bg-panel p-4 shadow-xs">
        <div className="min-w-[800px] grid gap-3" style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
          {years.map((yr) => {
            const rankedList = rankedByYear[yr];
            return (
              <div key={yr} className="space-y-2.5">
                {/* Year Header */}
                <div className="p-2 text-center bg-ivory rounded-xl border border-hairline font-mono font-bold text-xs text-olive">
                  {yr} {yr === latestYear ? "(YTD)" : ""}
                </div>

                {/* Ranked Asset Stack */}
                <div className="space-y-2">
                  {rankedList.map((item, rankIdx) => {
                    const isHighlighted = highlightedAsset === item.row.label;
                    const isFaded = highlightedAsset && !isHighlighted;
                    const style = TILE_STYLES[item.index % TILE_STYLES.length];

                    return (
                      <div
                        key={item.row.label}
                        onMouseEnter={() => setHighlightedAsset(item.row.label)}
                        className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative flex flex-col justify-between h-[84px] ${style} ${
                          isHighlighted
                            ? "ring-2 ring-gold scale-[1.03] shadow-md z-10"
                            : isFaded
                            ? "opacity-35"
                            : "hover:scale-[1.01] hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] opacity-75 font-semibold">#{rankIdx + 1}</span>
                          <span
                            className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              item.returnPct >= 0 ? "bg-black/15 text-inherit" : "bg-red-800 text-white"
                            }`}
                          >
                            {item.returnPct > 0 ? `+${item.returnPct}%` : `${item.returnPct}%`}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold leading-tight line-clamp-2">{item.row.label}</div>
                          {item.row.sublabel && (
                            <div className="text-[9px] font-mono opacity-80 mt-0.5 truncate">{item.row.sublabel}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-dim font-mono">
        <span>Hover over any tile to track that asset class across the years.</span>
        {dataset.source && <span>Source: {dataset.source}{dataset.asOf ? ` · as of ${dataset.asOf}` : ""}</span>}
      </div>
    </div>
  );
}
