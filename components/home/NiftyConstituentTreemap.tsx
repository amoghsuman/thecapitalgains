"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { niftyWeights, asOfLabel, type NiftyConstituent } from "@/lib/market/constants";
import { liveLabel, type MarketQuote } from "@/lib/market/client";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";

// A constituent joined with its live quote. `change`/`price` are null when
// the feed has no quote for it; tiles then render grey and unlabelled.
type Tile = NiftyConstituent & {
  change: number | null;
  price: number | null;
};

type TreemapDatum = { name: string; children?: TreemapDatum[]; tile?: Tile; value?: number };
type TreemapNode = d3.HierarchyRectangularNode<TreemapDatum>;

export default function NiftyConstituentTreemap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStock, setSelectedStock] = useState<Tile | null>(null);
  const [filterSector, setFilterSector] = useState<string>("All");
  const [reloadKey, setReloadKey] = useState(0);

  const market = useMarketSnapshot();
  const isLive = market.status === "ready" && market.data.constituents !== null;

  const sectors = useMemo(() => {
    return ["All", ...Array.from(new Set(niftyWeights.constituents.map((s) => s.sector)))];
  }, []);

  // Join weights (constants) with quotes (feed).
  const data: Tile[] = useMemo(() => {
    const quotes = new Map<string, MarketQuote>();
    if (market.status === "ready" && market.data.constituents) {
      for (const q of market.data.constituents) quotes.set(q.symbol, q);
    }
    return niftyWeights.constituents.map((c) => {
      const q = quotes.get(c.symbol);
      return { ...c, change: q ? q.changePct : null, price: q ? q.last : null };
    });
  }, [market]);

  // D3 Treemap layout calculation
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 460;

    // Filter stocks
    const filtered = filterSector === "All" ? data : data.filter((s) => s.sector === filterSector);

    // D3 Hierarchy
    const rootData: TreemapDatum = {
      name: "Nifty50",
      children: Array.from(d3.group(filtered, (d) => d.sector)).map(([sector, children]) => ({
        name: sector,
        children: children.map((c) => ({ name: c.symbol, tile: c, value: c.weight })),
      })),
    };

    const root = d3
      .hierarchy<TreemapDatum>(rootData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<TreemapDatum>().size([width, height]).paddingTop(18).paddingInner(3).round(true)(root);
    const laidOut = root as TreemapNode;

    // Render SVG via D3
    d3.select(containerRef.current).select("svg").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "font-sans select-none rounded-xl overflow-hidden");

    // Color mapper for % change; grey when there is no quote.
    const getColor = (change: number | null) => {
      if (change === null) return "#9aa39d";
      if (change >= 2.0) return "#18482d"; // dark forest green
      if (change >= 0.8) return "#256e45";
      if (change > 0) return "#459669";
      if (change === 0) return "#4b5563";
      if (change >= -1.0) return "#e58a74";
      return "#b83321"; // crimson red
    };

    // Sector Groups
    const sectorNodes = (laidOut.children ?? []) as TreemapNode[];

    // Draw Sector Titles
    svg
      .selectAll("text.sector-title")
      .data(sectorNodes)
      .enter()
      .append("text")
      .attr("class", "sector-title font-mono text-[9px] font-bold fill-ink-dim tracking-wider uppercase")
      .attr("x", (d) => d.x0 + 4)
      .attr("y", (d) => d.y0 + 12)
      .text((d) => d.data.name);

    // Leaf Nodes (Stocks)
    const leaves = laidOut.leaves() as TreemapNode[];

    const cell = svg
      .selectAll("g.leaf")
      .data(leaves)
      .enter()
      .append("g")
      .attr("class", "leaf cursor-pointer group")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .on("click", (_event, d) => {
        if (d.data.tile) setSelectedStock(d.data.tile);
      });

    // Rectangles
    cell
      .append("rect")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d) => getColor(d.data.tile?.change ?? null))
      .attr("rx", 6)
      .attr("class", "transition-all duration-300 stroke-panel/40 stroke-1 hover:brightness-110");

    // Stock Symbol text
    cell
      .append("text")
      .attr("x", (d) => (d.x1 - d.x0) / 2)
      .attr("y", (d) => (d.y1 - d.y0) / 2 - 3)
      .attr("text-anchor", "middle")
      .attr("class", "font-mono font-bold fill-white text-[11px] sm:text-xs")
      .text((d) => {
        const w = d.x1 - d.x0;
        const symbol = d.data.tile?.symbol ?? "";
        return w > 50 ? symbol : w > 30 ? symbol.slice(0, 4) : "";
      });

    // % Change Text
    cell
      .append("text")
      .attr("x", (d) => (d.x1 - d.x0) / 2)
      .attr("y", (d) => (d.y1 - d.y0) / 2 + 12)
      .attr("text-anchor", "middle")
      .attr("class", "font-mono font-semibold fill-white/90 text-[9px] sm:text-[10px]")
      .text((d) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        const change = d.data.tile?.change;
        if (w < 45 || h < 32 || change === null || change === undefined) return "";
        return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
      });
  }, [data, filterSector, reloadKey]);

  const headerLabel = isLive ? liveLabel(market.data.fetchedAt) : "Sample data";

  return (
    <div id="nifty-treemap-section" className="space-y-6">
      {/* Treemap Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase mb-1">
            NSE MARKET HEATMAP
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-olive">
            NIFTY 50 Weight &amp; Momentum Treemap
          </h3>
          <p className="text-xs sm:text-sm text-ink-dim max-w-2xl mt-0.5 leading-relaxed">
            D3-powered hierarchical market cap distribution. Tile dimensions scale proportionally to index constituent
            weighting; colour maps the day&apos;s price change.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-ink-dim flex items-center gap-1.5 bg-ivory px-3 py-1.5 rounded-lg border border-hairline">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-forest" : "bg-hairline"}`} />
            <span>{headerLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="p-2 rounded-lg border border-hairline bg-panel hover:bg-ivory text-ink-dim hover:text-forest transition-colors cursor-pointer"
            title="Redraw"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sector filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-hairline">
        <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1 shrink-0">
          Sectors:
        </span>
        {sectors.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setFilterSector(sec)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
              filterSector === sec
                ? "bg-forest text-white font-bold shadow-xs"
                : "bg-panel border border-hairline text-ink-dim hover:text-ink hover:bg-ivory"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* D3 Treemap Canvas Box */}
      <div className="bg-panel border border-hairline rounded-2xl p-4 sm:p-5 shadow-xs relative">
        <div ref={containerRef} className="w-full min-h-[460px]" />

        {/* Selected Stock Detail Callout (when a tile is tapped) */}
        {selectedStock && (
          <div className="mt-4 p-4 rounded-xl bg-forest-surface border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-olive">{selectedStock.name}</span>
                <span className="bg-ivory text-forest font-bold px-2 py-0.5 rounded text-[11px] border border-hairline">
                  {selectedStock.symbol}
                </span>
                <span className="text-ink-dim text-[11px]">{selectedStock.sector}</span>
              </div>
              <div className="text-[11px] text-ink-dim">
                Price: {selectedStock.price !== null ? `₹${selectedStock.price.toLocaleString("en-IN")}` : "Unavailable"} &middot;
                Nifty Weight: {selectedStock.weight}%
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-ink-dim uppercase">Day Change</div>
                <div
                  className={`text-base font-bold ${
                    selectedStock.change === null ? "text-ink-dim" : selectedStock.change >= 0 ? "text-forest" : "text-red-700"
                  }`}
                >
                  {selectedStock.change === null
                    ? "Unavailable"
                    : `${selectedStock.change >= 0 ? "+" : ""}${selectedStock.change.toFixed(2)}%`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStock(null)}
                className="text-xs text-ink-dim hover:text-ink px-2.5 py-1 rounded bg-panel border border-hairline cursor-pointer"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-ink-dim">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-ink">Momentum Gradient:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#18482d]" />
            <span>&gt;+2%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#459669]" />
            <span>0 to +2%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#e58a74]" />
            <span>0 to -1%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#b83321]" />
            <span>&lt;-1%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#9aa39d]" />
            <span>No quote</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>
            Weights: {niftyWeights.source}, {asOfLabel(niftyWeights.asOf)}
            {isLive ? ` · Prices: ${market.data.source}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
