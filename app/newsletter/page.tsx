import NewsletterForm from '@/components/NewsletterForm'

const whatYouGet = [
  {
    icon: "📈",
    title: "Weekly Market Wrap",
    desc: "What moved, why it moved, and what to watch next week — without the noise. One read, five minutes.",
  },
  {
    icon: "🎯",
    title: "Trade Setup of the Week",
    desc: "One high-probability setup explained in full: entry level, stop loss, rationale, and what invalidates the trade.",
  },
  {
    icon: "📖",
    title: "Concept of the Month",
    desc: "One deep-dive concept pulled from our courses — free for all subscribers. Learn the idea before you pay for the playbook.",
  },
]

const recentIssues = [
  {
    num: "Issue #31",
    date: "24 Mar 2026",
    title: "Why BANKNIFTY sold off despite positive global cues",
    preview:
      "Domestic institutional selling, FII repositioning ahead of expiry, and why the headline didn't tell the full story.",
  },
  {
    num: "Issue #30",
    date: "17 Mar 2026",
    title: "The Iron Condor setup that worked 3 weeks in a row",
    preview:
      "A look at the market conditions that make Iron Condors sing — and the one signal that tells you when to stop running them.",
  },
  {
    num: "Issue #29",
    date: "10 Mar 2026",
    title: "Reading OI data before Budget day",
    preview:
      "How to use open interest build-up, PCR and max pain to position yourself rationally before a high-volatility event.",
  },
]

export default function NewsletterPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-8 pt-16 pb-10 text-center">
        <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-3">
          Newsletter
        </div>
        <h1 className="font-serif text-5xl font-bold text-[#0F2348] leading-[1.1] mb-4">
          One market insight,<br />every week.
        </h1>
        <p className="text-[16px] text-[#5A5A72] leading-relaxed mb-8 max-w-xl mx-auto">
          A concise, no-noise breakdown of what&apos;s moving Indian markets — and why it matters for your trades and investments. Free, always.
        </p>
        <NewsletterForm />
        <p className="font-mono text-[12px] text-[#9494A8] mt-4">
          No spam. Unsubscribe anytime. Join 500+ readers.
        </p>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="max-w-4xl mx-auto px-8 mt-16">
        <h2 className="font-serif text-[28px] font-bold text-[#0F2348] text-center mb-10">
          What lands in your inbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {whatYouGet.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-6"
            >
              <div className="w-10 h-10 bg-[#F4F1EB] rounded-xl flex items-center justify-center text-[20px] mb-4">
                {item.icon}
              </div>
              <div className="font-serif text-[17px] text-[#0F2348] mb-2 leading-snug">
                {item.title}
              </div>
              <p className="text-[13px] text-[#5A5A72] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT ISSUES ── */}
      <section className="max-w-4xl mx-auto px-8 mt-16">
        <h2 className="font-serif text-[28px] font-bold text-[#0F2348] mb-6">
          Recent issues
        </h2>
        <div className="flex flex-col gap-4">
          {recentIssues.map((issue) => (
            <div
              key={issue.num}
              className="bg-white border border-[rgba(15,35,72,0.1)] rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[11px] text-[#D4860A] tracking-wider">
                    {issue.num}
                  </span>
                  <span className="font-mono text-[11px] text-[#9494A8]">
                    {issue.date}
                  </span>
                </div>
                <div className="font-serif text-[16px] text-[#0F2348] mb-1 leading-snug">
                  {issue.title}
                </div>
                <p className="text-[13px] text-[#5A5A72] leading-relaxed">
                  {issue.preview}
                </p>
              </div>
              <div className="flex-shrink-0 sm:pt-1">
                <span className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] cursor-pointer transition-colors whitespace-nowrap">
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-3xl mx-auto px-8 mt-16 pb-20">
        <div className="bg-[#0F2348] rounded-2xl px-10 py-12 text-center">
          <h2 className="font-serif text-[30px] text-white mb-3">
            Start reading this week
          </h2>
          <p className="text-[rgba(255,255,255,0.55)] text-[15px] mb-8 max-w-sm mx-auto">
            Drop your email below and the next issue lands in your inbox on Sunday morning.
          </p>
          <NewsletterForm dark />
          <p className="font-mono text-[11px] text-[rgba(255,255,255,0.3)] mt-4">
            Educational content only. Not investment advice.
          </p>
        </div>
      </section>

    </div>
  )
}
