"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Bell,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Layers,
  BarChart3,
} from "lucide-react";
import type { Portfolio, MarketDataset } from "@/lib/portfolios/types";
import { DATASET_SLUGS } from "@/lib/portfolios/types";
import DataStatusChip from "./DataStatusChip";
import DownloadPdfModal from "./DownloadPdfModal";
import NotificationModal from "./NotificationModal";
import MonthlyReturnMatrix from "./MonthlyReturnMatrix";
import AssetClassQuilt from "./AssetClassQuilt";
import CrossAssetDispersionMatrix from "./CrossAssetDispersionMatrix";
import InstitutionalKeyMetricsBar from "./InstitutionalKeyMetricsBar";

interface PortfoliosSectionProps {
  portfolios: Portfolio[];
  datasets: MarketDataset[];
}

type TabId = "cards" | "heatmap" | "quilt" | "dispersion";

const ALLOC_COLORS = ["bg-forest", "bg-gold"];

export default function PortfoliosSection({ portfolios, datasets }: PortfoliosSectionProps) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(portfolios[0]?._id ?? "");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("cards");

  const quilt = datasets.find((d) => d.slug === DATASET_SLUGS.quilt) ?? null;
  const dispersion = datasets.find((d) => d.slug === DATASET_SLUGS.dispersion) ?? null;

  const currentPortfolio = portfolios.find((p) => p._id === selectedPortfolioId) ?? portfolios[0] ?? null;

  const years = currentPortfolio
    ? Array.from(new Set(currentPortfolio.monthlyReturns.map((m) => m.month.slice(0, 4)))).sort()
    : [];
  const periodLabel = years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : "";

  const scrollToHeatmap = () => {
    setActiveTab("heatmap");
    const el = document.getElementById("portfolio-analytics-subview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="portfolios-interactive-section" className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-panel border border-hairline rounded-full px-3.5 py-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
              <span className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
                EDUCATIONAL MODEL PORTFOLIOS
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-olive tracking-tight">
              Model Portfolios & Monthly Performance
            </h2>
            <p className="text-ink-dim text-sm sm:text-base leading-relaxed">
              Explore how transparent, systematic equity allocation, dividend compounding, and momentum risk-weighting are
              maintained across market cycles{periodLabel ? ` from ${periodLabel}` : ""}.
            </p>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="jump-to-monthly-heatmap-btn"
              onClick={scrollToHeatmap}
              className="px-4 py-2.5 rounded-xl border border-forest/30 bg-forest-surface hover:bg-forest hover:text-white text-forest text-xs font-bold font-mono inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Heatmap</span>
            </button>

            <button
              type="button"
              id="optin-rebalancing-alerts-btn"
              onClick={() => setNotifyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-hairline bg-panel hover:bg-ivory text-ink text-xs font-bold font-mono inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-gold" />
              <span>Rebalancing Updates</span>
            </button>

            <button
              type="button"
              id="download-portfolio-pdf-btn"
              onClick={() => setPdfModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print this page</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Portfolio Cards | Monthly Matrix | Periodic Table / Quilt | Cross-Asset Frontier */}
        <div className="flex items-center justify-between border-b border-hairline pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "cards" as const, label: "Model Portfolios", icon: Layers },
              { id: "heatmap" as const, label: "Monthly Calendar Return Matrix", icon: Calendar },
              { id: "quilt" as const, label: "Asset Class Quilt (Periodic Table)", icon: BarChart3 },
              { id: "dispersion" as const, label: "Cross-Asset Dispersion Frontier", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-mono rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-panel border-forest text-forest font-bold shadow-2xs"
                      : "border-hairline bg-panel/60 hover:bg-panel text-ink-dim hover:text-ink"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Model Selector Pills for Heatmap / Metrics sync */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold mr-1">
              Active Strategy:
            </span>
            {portfolios.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelectedPortfolioId(p._id)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                  currentPortfolio?._id === p._id
                    ? "bg-forest text-white font-bold shadow-2xs"
                    : "bg-panel border border-hairline text-ink-dim hover:text-ink hover:bg-ivory"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {portfolios.length === 0 && (
          <p className="text-sm text-ink-dim font-mono">No model portfolios published yet.</p>
        )}

        {/* Key Metrics Bar linked to current selected portfolio */}
        {currentPortfolio && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-ink-dim">
              <span className="font-bold text-olive">
                KEY RISK & RETURN METRICS ({currentPortfolio.name.toUpperCase()})
              </span>
              {periodLabel && <span>Model period: {periodLabel}</span>}
            </div>
            <InstitutionalKeyMetricsBar portfolio={currentPortfolio} />
          </div>
        )}

        {/* Subview Container */}
        <div id="portfolio-analytics-subview" className="pt-2">
          {activeTab === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolios.map((p, index) => {
                const isSelected = currentPortfolio?._id === p._id;
                const risk = p.profile.riskLabel;
                const totalAlloc = p.profile.allocation.reduce((s, a) => s + a.pct, 0) || 100;
                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPortfolioId(p._id)}
                    className={`bg-panel border rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs ${
                      isSelected
                        ? "border-forest ring-1 ring-forest/30 shadow-md"
                        : "border-hairline hover:border-forest/40 hover:bg-ivory/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase">
                          Portfolio {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DataStatusChip status={p.dataStatus} />
                          {risk && (
                            <span
                              className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                risk.includes("High") ? "bg-red-100 text-red-800" : "bg-forest-surface text-forest"
                              }`}
                            >
                              {risk} Risk
                            </span>
                          )}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-olive mb-2 leading-snug">{p.name}</h3>
                      {p.strategy && <p className="text-xs text-ink-dim leading-relaxed mb-5">{p.strategy}</p>}

                      {/* Stat Tiles */}
                      <div className="grid grid-cols-2 gap-2 mb-5 font-mono">
                        <div className="p-2.5 rounded-lg bg-forest-surface border border-hairline/60">
                          <div className="text-[9px] text-ink-dim uppercase">CAGR</div>
                          <div className="text-sm font-bold text-forest mt-0.5">
                            {p.metrics.cagr !== null ? `${p.metrics.cagr > 0 ? "+" : ""}${p.metrics.cagr}%` : "—"}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-forest-surface border border-hairline/60">
                          <div className="text-[9px] text-ink-dim uppercase">Sharpe Ratio</div>
                          <div className="text-sm font-bold text-olive mt-0.5">
                            {p.metrics.sharpe !== null ? p.metrics.sharpe.toFixed(2) : "—"}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-ivory border border-hairline/60">
                          <div className="text-[9px] text-ink-dim uppercase">Rebalance</div>
                          <div className="text-xs font-semibold text-ink mt-0.5">{p.profile.rebalanceCadence ?? "—"}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-ivory border border-hairline/60">
                          <div className="text-[9px] text-ink-dim uppercase">Win Rate</div>
                          <div className="text-xs font-bold text-forest mt-0.5">
                            {p.metrics.winRate !== null ? `${p.metrics.winRate}% Months` : "—"}
                          </div>
                        </div>
                      </div>

                      {/* Allocation Bars */}
                      {p.profile.allocation.length > 0 && (
                        <div className="mb-5 space-y-2">
                          <div className="flex justify-between font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold">
                            <span>Target Allocation</span>
                            <span>{p.profile.allocation.map((a) => `${a.pct}%`).join(" / ")}</span>
                          </div>
                          <div className="h-2 rounded-full bg-hairline overflow-hidden flex">
                            {p.profile.allocation.map((alloc, i) => (
                              <div
                                key={alloc.label}
                                className={`h-full ${ALLOC_COLORS[i % ALLOC_COLORS.length]}`}
                                style={{ width: `${(alloc.pct / totalAlloc) * 100}%` }}
                                title={`${alloc.label}: ${alloc.pct}%`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-ink-dim font-mono">
                            {p.profile.allocation.map((alloc, i) => (
                              <div key={alloc.label} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${ALLOC_COLORS[i % ALLOC_COLORS.length]}`} />
                                <span>{alloc.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top Holdings preview */}
                      <div className="space-y-1.5 pt-4 border-t border-hairline">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold">
                            Top 4 Constituent Weights
                          </span>
                          <DataStatusChip status={p.dataStatus} />
                        </div>
                        {p.holdings.slice(0, 4).map((h) => (
                          <div
                            key={h.symbol}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-ivory/60 font-mono"
                          >
                            <span className="font-bold text-olive">{h.symbol}</span>
                            <div className="flex items-center gap-2">
                              {h.returnYtd !== null && (
                                <span className="text-[11px] text-forest">
                                  {h.returnYtd > 0 ? "+" : ""}
                                  {h.returnYtd}%
                                </span>
                              )}
                              <span className="text-[11px] text-ink-dim">{h.weight}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPortfolioId(p._id);
                          setActiveTab("heatmap");
                        }}
                        className="text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Monthly Matrix</span>
                        <span>→</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPortfolioId(p._id);
                            setNotifyModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-hairline text-ink-dim hover:text-forest hover:bg-forest-surface transition-colors cursor-pointer"
                          title="Get rebalancing updates by email"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPortfolioId(p._id);
                            setPdfModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-hairline text-ink-dim hover:text-forest hover:bg-forest-surface transition-colors cursor-pointer"
                          title="Print this page"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "heatmap" && currentPortfolio && (
            <div className="bg-panel border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase">
                    MODEL CALENDAR SPREADS
                  </span>
                  <h3 className="text-xl font-bold text-olive">
                    Monthly Calendar Return Matrix: {currentPortfolio.name}
                  </h3>
                  <p className="text-xs text-ink-dim mt-0.5 font-mono">
                    Model monthly distributions{periodLabel ? ` (${periodLabel})` : ""}. Hover or tap any cell to inspect
                    constituent contributors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNotifyModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg border border-hairline bg-ivory text-ink-dim hover:text-forest text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-gold" />
                    <span>Rebalancing Updates</span>
                  </button>
                  <button
                    onClick={() => setPdfModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print this page</span>
                  </button>
                </div>
              </div>

              <MonthlyReturnMatrix portfolio={currentPortfolio} />
            </div>
          )}

          {activeTab === "quilt" && (
            <div className="bg-panel border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs">
              <AssetClassQuilt dataset={quilt} />
            </div>
          )}

          {activeTab === "dispersion" && (
            <div className="bg-panel border border-hairline rounded-2xl p-6 sm:p-8 shadow-xs">
              <CrossAssetDispersionMatrix dataset={dispersion} />
            </div>
          )}
        </div>

        {/* Bottom Disclosures & Methodology Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <p className="text-ink-dim leading-relaxed text-[11px] max-w-3xl">
              <strong>SEBI Regulatory Disclaimer:</strong> Model portfolios and calendar return matrices are illustrative
              frameworks maintained exclusively for educational and pedagogical purposes. They do not constitute investment
              advice, equity research recommendations, or personal portfolio advisory. Past illustrative performance is no
              guarantee of future returns.
            </p>
          </div>
          <Link
            href="/portfolios"
            className="text-forest hover:underline font-mono text-xs font-bold inline-flex items-center gap-1 shrink-0"
          >
            <span>View Full Portfolios Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      {currentPortfolio && (
        <>
          <DownloadPdfModal
            portfolio={currentPortfolio}
            isOpen={pdfModalOpen}
            onClose={() => setPdfModalOpen(false)}
          />

          <NotificationModal
            portfolio={currentPortfolio}
            isOpen={notifyModalOpen}
            onClose={() => setNotifyModalOpen(false)}
          />
        </>
      )}
    </section>
  );
}
