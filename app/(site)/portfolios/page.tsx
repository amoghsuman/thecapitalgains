import Link from "next/link";
import { getPortfolios, getMarketDatasets } from "@/lib/sanity/queries";
import PortfoliosSection from "@/components/portfolios/PortfoliosSection";

export const revalidate = 300;

const howItWorks = [
  {
    title: "Selection criteria",
    body: "Each stock is chosen to illustrate a specific concept: liquidity, dividend yield, F&O availability, or sector balance. No personal financial situation is considered.",
  },
  {
    title: "Rebalancing logic",
    body: "Rebalancing decisions are documented with reasoning, showing how drift is corrected, when to trim, and how weights are restored to target allocation.",
  },
  {
    title: "What we track",
    body: "We track allocation drift, dividend income, and drawdowns over time. The goal is to make portfolio management decisions visible and learnable.",
  },
];

// Server component: every number on this page comes from the `portfolio` and
// `marketDataset` documents in Sanity, passed down as props.
export default async function PortfoliosPage() {
  const [portfolios, datasets] = await Promise.all([getPortfolios(), getMarketDatasets()]);

  const anyIllustrative = portfolios.some((p) => p.dataStatus === "illustrative") ||
    datasets.some((d) => d.dataStatus === "illustrative");

  return (
    <div className="min-h-screen overflow-x-hidden pt-24 sm:pt-28">
      {/* ── HERO BANNER ── */}
      <section className="site-container pt-8 pb-4">
        <div className="font-mono text-[11px] text-gold-text tracking-widest uppercase mb-2">
          Model Portfolios
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink leading-[1.1] mb-3">
          See how a model portfolio is built &amp; rebalanced
        </h1>
        <p className="text-[16px] text-ink-dim max-w-2xl mb-4 leading-relaxed">
          Three model portfolios maintained for educational purposes, showing how allocation, selection, risk metrics, and rebalancing decisions are executed across Indian market cycles.
        </p>
        <div className="inline-flex items-center gap-2 bg-gold-surface border border-gold rounded-lg px-4 py-2.5">
          <span className="text-gold-text text-[13px]">⚠</span>
          <span className="font-mono text-[11px] text-gold-text tracking-wide">
            Educational illustrations only &middot; Not investment advice &middot; Do not invest based on this content
          </span>
        </div>

        {anyIllustrative && (
          <div
            role="note"
            id="illustrative-data-banner"
            className="mt-4 bg-panel border border-hairline rounded-lg px-4 py-3 text-[13px] text-ink leading-relaxed max-w-2xl"
          >
            <strong className="font-semibold">Illustrative sample data.</strong> These are not actual or backtested returns.
          </div>
        )}
      </section>

      {/* ── INTERACTIVE PORTFOLIOS SUITE ── */}
      <div id="portfolios-suite">
        <PortfoliosSection portfolios={portfolios} datasets={datasets} />
      </div>

      {/* ── HOW WE MAINTAIN THESE ── */}
      <section className="site-container py-12">
        <div className="bg-forest rounded-2xl px-8 sm:px-10 py-10">
          <div className="font-mono text-[11px] text-[rgba(255,255,255,0.4)] tracking-widest uppercase mb-3">
            Methodology &middot; Indian Equity Architecture
          </div>
          <h2 className="text-[28px] text-white mb-8">
            How these portfolios work in practice
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {howItWorks.map((item) => (
              <div
                key={item.title}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6"
              >
                <div className="text-[17px] text-white font-bold mb-2">{item.title}</div>
                <div className="text-[13px] text-[rgba(255,255,255,0.65)] leading-relaxed">
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION CTA ── */}
      <section className="site-container mb-12">
        <div className="bg-gold-surface border border-gold rounded-2xl px-8 sm:px-10 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="font-mono text-[11px] text-gold-text tracking-widest uppercase mb-2">
              Subscriber Access
            </div>
            <h3 className="text-[24px] font-bold text-ink mb-2">
              Subscribe to follow along with rebalancing
            </h3>
            <p className="text-[15px] text-ink-dim max-w-md">
              Track how these portfolios evolve month by month with research teardowns and rebalancing notes.
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-forest hover:bg-forest-dark text-white rounded-lg px-8 py-3 text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0 shadow-xs"
          >
            Go Pro →
          </Link>
        </div>
      </section>

      {/* ── LEGAL DISCLAIMER ── */}
      <section className="site-container pb-12">
        <div className="bg-panel border border-hairline rounded-lg px-6 py-5 font-mono text-[10px] text-ink-dim leading-relaxed">
          These model portfolios are maintained purely for educational purposes to illustrate portfolio construction principles. Stock names mentioned are for illustrative purposes only and do not constitute buy, sell, or hold recommendations. They do not constitute investment advice or SEBI-registered research. Past illustrative performance does not guarantee future results. Do not invest based on this content without consulting a SEBI-registered financial advisor or research analyst.
        </div>
      </section>
    </div>
  );
}
