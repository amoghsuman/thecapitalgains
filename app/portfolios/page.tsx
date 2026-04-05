"use client";

import Link from "next/link";

const portfolios = [
  {
    tag: "PORTFOLIO 01",
    name: "Long-term Wealth Builder",
    desc: "80% large cap, 20% mid cap. 5-year horizon. Illustrates how a conservative equity portfolio is constructed and rebalanced quarterly.",
    stats: [
      { label: "HORIZON", val: "5 yrs+", color: "" },
      { label: "STOCKS", val: "10", color: "" },
      { label: "RISK", val: "Moderate", color: "text-[#1A7A4A]" },
      { label: "REBALANCE", val: "Quarterly", color: "" },
    ],
    bars: [
      { label: "Large Cap", pct: 80, color: "bg-[#1E1245]" },
      { label: "Mid Cap", pct: 20, color: "bg-[#D4860A]" },
    ],
    holdings: [
      { name: "RELIANCE", sector: "Energy", weight: "18%" },
      { name: "INFY", sector: "Technology", weight: "16%" },
      { name: "HDFCBANK", sector: "Banking", weight: "15%" },
      { name: "TCS", sector: "Technology", weight: "12%" },
    ],
  },
  {
    tag: "PORTFOLIO 02",
    name: "Dividend & Income",
    desc: "High-yield, low-volatility equities. Illustrates screening and weighting for consistent dividend income alongside capital preservation.",
    stats: [
      { label: "HORIZON", val: "3 yrs+", color: "" },
      { label: "STOCKS", val: "8", color: "" },
      { label: "RISK", val: "Low", color: "text-[#1A7A4A]" },
      { label: "REBALANCE", val: "Half-yearly", color: "" },
    ],
    bars: [
      { label: "Dividend Stocks", pct: 70, color: "bg-[#1E1245]" },
      { label: "REITs/Bonds", pct: 30, color: "bg-[#D4860A]" },
    ],
    holdings: [
      { name: "ITC", sector: "FMCG", weight: "20%" },
      { name: "COALINDIA", sector: "Commodities", weight: "18%" },
      { name: "POWERGRID", sector: "Utilities", weight: "16%" },
      { name: "ONGC", sector: "Energy", weight: "14%" },
    ],
  },
  {
    tag: "PORTFOLIO 03",
    name: "Active Trader Watchlist",
    desc: "High-liquidity stocks with strong F&O interest. Illustrates how an active trader scans for setups — not a buy recommendation.",
    stats: [
      { label: "HORIZON", val: "Short-term", color: "" },
      { label: "STOCKS", val: "12", color: "" },
      { label: "RISK", val: "High", color: "text-[#D4860A]" },
      { label: "REBALANCE", val: "Weekly", color: "" },
    ],
    bars: [
      { label: "Large Cap F&O", pct: 60, color: "bg-[#1E1245]" },
      { label: "Mid Cap F&O", pct: 40, color: "bg-[#D4860A]" },
    ],
    holdings: [
      { name: "NIFTY50", sector: "Index", weight: "25%" },
      { name: "BANKNIFTY", sector: "Index", weight: "20%" },
      { name: "TATAMOTORS", sector: "Auto", weight: "10%" },
      { name: "SBIN", sector: "Banking", weight: "8%" },
    ],
  },
];

const howItWorks = [
  {
    title: "Selection criteria",
    body: "Each stock is chosen to illustrate a specific concept — liquidity, dividend yield, F&O availability, or sector balance. No personal financial situation is considered.",
  },
  {
    title: "Rebalancing logic",
    body: "Rebalancing decisions are documented with reasoning — showing how drift is corrected, when to trim, and how weights are restored to target allocation.",
  },
  {
    title: "What we track",
    body: "We track allocation drift, dividend income, and drawdowns over time. The goal is to make portfolio management decisions visible and learnable.",
  },
];

export default function PortfoliosPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-10">
        <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-2">
          Model Portfolios
        </div>
        <h1 className="font-serif text-5xl font-bold text-[#1E1245] leading-[1.1] mb-3">
          See how a portfolio is built
        </h1>
        <p className="text-[16px] text-[#5A5A72] max-w-2xl mb-6">
          Three illustrative portfolios maintained for educational purposes — showing how allocation, selection, and rebalancing decisions are made in practice.
        </p>
        <div className="inline-flex items-center gap-2 bg-[#FDF3E3] border border-[rgba(212,134,10,0.25)] rounded-lg px-4 py-2.5">
          <span className="text-[#D4860A] text-[13px]">⚠</span>
          <span className="font-mono text-[11px] text-[#D4860A] tracking-wide">
            Educational illustrations only · Not investment advice · Do not invest based on this content
          </span>
        </div>
      </section>

      {/* ── PORTFOLIO CARDS ── */}
      <section className="max-w-6xl mx-auto px-8 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolios.map((p) => (
            <div
              key={p.tag}
              className="bg-white border border-[rgba(30,18,69,0.1)] rounded-2xl p-6"
            >
              {/* Tag + name */}
              <div className="font-mono text-[10px] text-[#9494A8] tracking-widest mb-1">
                {p.tag}
              </div>
              <div className="font-serif text-[18px] text-[#1E1245] mb-3 leading-snug">
                {p.name}
              </div>
              <p className="text-[13px] text-[#5A5A72] leading-relaxed mb-5">
                {p.desc}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {p.stats.map((s) => (
                  <div key={s.label} className="bg-[#F4F1EB] rounded-lg p-3">
                    <div className="font-mono text-[9px] text-[#9494A8] tracking-widest mb-1">
                      {s.label}
                    </div>
                    <div className={`font-mono text-[13px] font-medium text-[#1E1245] ${s.color}`}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Allocation bars */}
              <div className="mb-5">
                <div className="font-mono text-[10px] text-[#9494A8] tracking-widest mb-3">
                  ALLOCATION
                </div>
                <div className="flex flex-col gap-2">
                  {p.bars.map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-[#5A5A72]">{bar.label}</span>
                        <span className="font-mono text-[11px] text-[#9494A8]">{bar.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#EDE9E0] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bar.color}`}
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample holdings */}
              <div>
                <div className="font-mono text-[10px] text-[#9494A8] tracking-widest mb-3">
                  SAMPLE HOLDINGS
                </div>
                <div className="flex flex-col gap-0">
                  {p.holdings.map((h, i) => (
                    <div
                      key={h.name}
                      className={`flex justify-between items-center px-3 py-2 ${
                        i % 2 === 0 ? "bg-[#F4F1EB]" : "bg-white"
                      } ${i === 0 ? "rounded-t-lg" : ""} ${
                        i === p.holdings.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div>
                        <div className="font-mono text-[12px] font-medium text-[#1E1245]">
                          {h.name}
                        </div>
                        <div className="text-[11px] text-[#9494A8]">{h.sector}</div>
                      </div>
                      <div className="font-mono text-[12px] text-[#5A5A72]">{h.weight}</div>
                    </div>
                  ))}
                </div>
                <div className="font-mono text-[9px] text-[#9494A8] mt-2">
                  * Illustrative only. Not a recommendation.
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW WE MAINTAIN THESE ── */}
      <section className="max-w-6xl mx-auto px-8 mt-16">
        <div className="bg-[#1E1245] rounded-2xl px-10 py-10">
          <div className="font-mono text-[11px] text-[rgba(255,255,255,0.4)] tracking-widest uppercase mb-3">
            Methodology
          </div>
          <h2 className="font-serif text-[28px] text-white mb-10">
            How these portfolios work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {howItWorks.map((item) => (
              <div
                key={item.title}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6"
              >
                <div className="font-serif text-[17px] text-white mb-2">{item.title}</div>
                <div className="text-[13px] text-[rgba(255,255,255,0.55)] leading-relaxed">
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION CTA ── */}
      <section className="max-w-6xl mx-auto px-8 mt-12">
        <div className="bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)] rounded-2xl px-10 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="font-mono text-[11px] text-[#D4860A] tracking-widest uppercase mb-2">
              Subscriber Access
            </div>
            <h3 className="font-serif text-[24px] font-bold text-[#1E1245] mb-2">
              Subscribe to follow along
            </h3>
            <p className="text-[15px] text-[#5A5A72] max-w-md">
              Track how these portfolios evolve month by month. Trader Pro and above.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-8 py-3 text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            Go Pro →
          </Link>
        </div>
      </section>

      {/* ── LEGAL DISCLAIMER ── */}
      <section className="max-w-6xl mx-auto px-8 pb-10 mt-8">
        <div className="bg-white border border-[rgba(30,18,69,0.08)] rounded-lg px-6 py-5 font-mono text-[10px] text-[#9494A8] leading-relaxed">
          These model portfolios are maintained purely for educational purposes to illustrate portfolio construction principles. Stock names mentioned are for illustrative purposes only and do not constitute buy, sell, or hold recommendations. They do not constitute investment advice or SEBI-registered research. Past illustrative performance does not guarantee future results. Do not invest based on this content without consulting a SEBI-registered financial advisor or research analyst.
        </div>
      </section>

    </div>
  );
}
