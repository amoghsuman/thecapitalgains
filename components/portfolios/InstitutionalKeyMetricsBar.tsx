"use client";

import type { Portfolio } from "@/lib/portfolios/types";
import { TrendingUp, Percent, Award, AlertCircle, BarChart2, Shield } from "lucide-react";
import DataStatusChip from "./DataStatusChip";

interface KeyMetricsBarProps {
  portfolio: Portfolio;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[Number(m) - 1] ?? m} ${y}`;
}

function fmtPct(v: number | null, signed = false): string {
  if (v === null) return "—";
  return `${signed && v > 0 ? "+" : ""}${v}%`;
}

export default function InstitutionalKeyMetricsBar({ portfolio }: KeyMetricsBarProps) {
  const { metrics, monthlyReturns } = portfolio;
  const monthsTotal = monthlyReturns.length;
  const monthsPositive = monthlyReturns.filter((m) => m.portfolioReturn > 0).length;

  // Best/worst month labels are found in the series, not typed by hand.
  const best = monthlyReturns.reduce<typeof monthlyReturns[number] | null>(
    (acc, m) => (acc === null || m.portfolioReturn > acc.portfolioReturn ? m : acc),
    null
  );
  const worst = monthlyReturns.reduce<typeof monthlyReturns[number] | null>(
    (acc, m) => (acc === null || m.portfolioReturn < acc.portfolioReturn ? m : acc),
    null
  );

  const metricsList = [
    {
      label: "POSITIVE MONTH WIN RATE",
      value: fmtPct(metrics.winRate),
      sub: monthsTotal > 0 ? `${monthsPositive} / ${monthsTotal} months in green` : "No monthly data",
      icon: Award,
      color: "text-forest",
    },
    {
      label: "BEST SINGLE MONTH",
      value: fmtPct(metrics.bestMonth ?? best?.portfolioReturn ?? null, true),
      sub: best ? monthLabel(best.month) : "—",
      icon: TrendingUp,
      color: "text-forest",
    },
    {
      label: "WORST SINGLE MONTH",
      value: fmtPct(metrics.worstMonth ?? worst?.portfolioReturn ?? null),
      sub: worst ? monthLabel(worst.month) : "—",
      icon: AlertCircle,
      color: "text-red-700",
    },
    {
      label: "AVERAGE MONTHLY RETURN",
      value: fmtPct(metrics.avgMonthlyReturn, true),
      sub: "Compounding pace",
      icon: Percent,
      color: "text-olive",
    },
    {
      label: "ANNUALISED VOLATILITY",
      value: fmtPct(metrics.annualisedVol),
      sub: metrics.benchmarkVol !== null ? `vs ${metrics.benchmarkVol}% ${portfolio.benchmark ?? "benchmark"}` : "—",
      icon: BarChart2,
      color: "text-olive",
    },
    {
      label: "SHARPE RATIO",
      value: metrics.sharpe !== null ? metrics.sharpe.toFixed(2) : "—",
      sub: "Rf = 6.5% G-Sec",
      icon: Shield,
      color: "text-gold font-bold",
    },
  ];

  return (
    <div className="space-y-2" id="institutional-key-metrics-bar">
      <div className="flex justify-end">
        <DataStatusChip status={portfolio.dataStatus} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsList.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-3.5 bg-panel border border-hairline rounded-xl flex flex-col justify-between hover:border-forest/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] text-ink-dim uppercase tracking-wider font-bold truncate">
                  {m.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              </div>
              <div>
                <div className={`font-mono text-lg font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[10px] text-ink-dim font-mono mt-0.5 truncate">{m.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
