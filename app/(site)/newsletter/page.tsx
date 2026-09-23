import NewsletterForm from '@/components/NewsletterForm'

const whatYouGet = [
  {
    icon: "📈",
    title: "Weekly Market Wrap",
    desc: "What moved, why it moved, and what to watch next week, without the noise. One read, five minutes.",
  },
  {
    icon: "🎯",
    title: "Trade Setup of the Week",
    desc: "One high-probability setup explained in full: entry level, stop loss, rationale, and what invalidates the trade.",
  },
  {
    icon: "📖",
    title: "Concept of the Month",
    desc: "One deep-dive concept pulled from our courses, free for all subscribers. Learn the idea before you pay for the playbook.",
  },
]


export default function NewsletterPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="site-container pt-32 pb-10 text-center">
        <div className="font-mono text-[11px] text-gold-text tracking-widest uppercase mb-3">
          Newsletter
        </div>
        <h1 className="text-5xl font-bold text-ink leading-[1.1] mb-4">
          One market insight,<br />every week.
        </h1>
        <p className="text-[16px] text-ink-dim leading-relaxed mb-8 max-w-xl mx-auto">
          A concise, no-noise breakdown of what's moving Indian markets. And why it matters for your trades and investments. Free, always.
        </p>
        <NewsletterForm />
        <p className="font-mono text-[12px] text-ink-dim mt-4">
          No spam. Unsubscribe anytime. Join 500+ readers.
        </p>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="site-container mt-16">
        <h2 className="text-[28px] font-bold text-ink text-center mb-10">
          What lands in your inbox
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {whatYouGet.map((item) => (
            <div
              key={item.title}
              className="bg-panel border border-hairline rounded-2xl p-6"
            >
              <div className="w-10 h-10 bg-forest-surface rounded-xl flex items-center justify-center text-[20px] mb-4">
                {item.icon}
              </div>
              <div className="text-[17px] text-ink mb-2 leading-snug">
                {item.title}
              </div>
              <p className="text-[13px] text-ink-dim leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT ISSUES ── */}
      <section className="site-container mt-16">
        <h2 className="text-[28px] font-bold text-ink mb-6">
          Recent issues
        </h2>
        <div className="bg-panel border border-hairline rounded-xl px-6 py-5">
          <p className="text-[15px] text-ink-dim leading-relaxed">
            Issues are published every Sunday. Subscribe below to receive the next one directly in your inbox.
          </p>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="site-container mt-16 pb-20">
        <div className="bg-forest rounded-2xl px-10 py-12 text-center">
          <h2 className="text-[30px] text-white mb-3">
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
