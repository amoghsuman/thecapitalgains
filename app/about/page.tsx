export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="site-container pt-32 pb-20">
        <div className="font-mono text-[11px] text-gold-text tracking-widest uppercase mb-3">
          About
        </div>
        <h1 className="text-4xl font-bold text-ink mb-10">
          About The Capital Gains
        </h1>

        <div className="flex flex-col gap-10">
          <div>
            <h2 className="text-[20px] font-bold text-ink mb-3">What this is</h2>
            <p className="text-[15px] text-ink-dim leading-relaxed max-w-3xl">
              The Capital Gains is a premium financial education platform built for Indian retail investors,
              traders, and finance professionals. We publish playbook-style courses, model portfolio
              breakdowns, and weekly market research.
            </p>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-ink mb-3">Who runs this</h2>
            <p className="text-[15px] text-ink-dim leading-relaxed max-w-3xl">
              The platform is operated by a SEBI-registered Research Analyst.
            </p>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-ink mb-3">Regulatory</h2>
            <p className="text-[15px] text-ink-dim leading-relaxed max-w-3xl">
              Research and advisory services on this platform are provided under SEBI (Research Analyst)
              Regulations, 2014. Registration No: [SEBI_RA_REG_NO]. Individual subscription fees are
              subject to SEBI-prescribed caps. Educational content is separate from regulated research
              and is provided for informational purposes only.
            </p>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-ink mb-3">Contact</h2>
            <p className="text-[15px] text-ink-dim leading-relaxed max-w-3xl">
              For any queries, write to{" "}
              <a href="mailto:hello@thecapitalgains.com" className="text-gold hover:text-gold-dark transition-colors">
                hello@thecapitalgains.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
