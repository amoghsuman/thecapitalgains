import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

export default function HomePage() {
  return (
    <div className="bg-[#FAFAF7]">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[rgba(26,122,74,0.2)] rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1A7A4A]" />
            <span className="font-mono text-[11px] text-[#1A7A4A] tracking-widest">
              TEXT-FIRST · READ & APPLY · NO VIDEOS
            </span>
          </div>

          <h1 className="font-serif text-5xl font-bold leading-[1.12] text-[#111111] mb-5">
            Learn to invest like a pro.{" "}
            <span className="text-[#D4860A]">Not gamble like a beginner.</span>
          </h1>

          <p className="text-[17px] text-[#3D3D3D] leading-relaxed mb-9 max-w-lg">
            Playbook-style courses for Indian retail investors and traders.
            Read, apply, repeat. No fluff, no video lectures, no jargon.
          </p>

          <div className="flex gap-3 flex-wrap mb-10">
            <Link
              href="/courses"
              className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-7 py-3.5 text-[15px] font-medium transition-colors"
            >
              Start a free lesson →
            </Link>
            <Link
              href="/pricing"
              className="border border-[rgba(17,17,17,0.2)] hover:border-[#111111] hover:text-[#111111] text-[#3D3D3D] rounded-lg px-6 py-3.5 text-[15px] transition-all"
            >
              View plans
            </Link>
          </div>

          {/* Proof stats */}
          <div className="flex gap-8 flex-wrap">
            {[
              { num: "3", label: "Courses live" },
              { num: "3", label: "Subscription stacks" },
              { num: "₹0", label: "To start" },
              { num: "₹499", label: "Entry research tier" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-mono text-[22px] font-medium text-[#111111]">
                  {s.num}
                </span>
                <span className="text-[12px] text-[#7A7A8A] mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — course preview card */}
        <div className="bg-white border border-[rgba(17,17,17,0.1)] rounded-2xl p-7 shadow-[0_4px_32px_rgba(17,17,17,0.08)]">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest mb-2">
                BEGINNER → INTERMEDIATE
              </div>
              <h3 className="font-serif text-[18px] text-[#111111] leading-snug">
                Options Trading from Zero
              </h3>
              <div className="text-[12px] text-[#7A7A8A] mt-1">
                12 lessons · ~4 hrs reading
              </div>
            </div>
            <span className="bg-[#FDF3E3] text-[#D4860A] font-mono text-[9px] font-medium rounded px-2 py-1 tracking-wider">
              BESTSELLER
            </span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-[#3D3D3D] mb-1.5">
              <span>Your progress</span>
              <span>2 / 12</span>
            </div>
            <div className="h-1 bg-[#EDE9E0] rounded-full overflow-hidden">
              <div className="h-full w-[16%] bg-[#D4860A] rounded-full" />
            </div>
          </div>

          {/* Lesson list */}
          <div className="flex flex-col gap-2">
            {[
              { status: "done", title: "Why Most Retail Traders Lose", time: "8 min" },
              { status: "active", title: "Options Basics: What You're Buying", time: "12 min" },
              { status: "locked", title: "Time Decay & Premium", time: "10 min" },
              { status: "locked", title: "The Greeks: What Actually Matters", time: "15 min" },
            ].map((lesson) => (
              <div
                key={lesson.title}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                  lesson.status === "done"
                    ? "bg-[#E8F5EE]"
                    : lesson.status === "active"
                    ? "bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)]"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                    lesson.status === "done"
                      ? "bg-[#1A7A4A] text-white"
                      : lesson.status === "active"
                      ? "bg-[#D4860A] text-white"
                      : "bg-[#EDE9E0] text-[#7A7A8A]"
                  }`}
                >
                  {lesson.status === "done" ? "✓" : lesson.status === "active" ? "▶" : "🔒"}
                </div>
                <span className="flex-1 text-[13px] text-[#111111]">{lesson.title}</span>
                <span className="font-mono text-[11px] text-[#7A7A8A]">{lesson.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-[#F4F1EB] border-y border-[rgba(17,17,17,0.1)]">
        <div className="max-w-6xl mx-auto px-8 py-7 flex justify-center gap-14 flex-wrap">
          {[
            { icon: "📖", title: "Structured learning", sub: "Chapter-by-chapter, not a playlist" },
            { icon: "✎", title: "No jargon, no fluff", sub: "Written by an active market practitioner" },
            { icon: "✓", title: "Apply immediately", sub: "Every lesson has a real market exercise" },
            { icon: "◷", title: "Learn at your pace", sub: "Read anywhere, resume anytime" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#111111] rounded-lg flex items-center justify-center text-white text-[14px]">
                {item.icon}
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#111111]">{item.title}</div>
                <div className="text-[11px] text-[#7A7A8A]">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEM SECTION ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-3">
          The Problem
        </div>
        <div className="flex justify-between items-end flex-wrap gap-6 mb-12">
          <div>
            <h2 className="font-serif text-[34px] font-bold text-[#111111] leading-snug">
              Why 90% of retail traders<br />blow up in 12 months
            </h2>
            <p className="text-[16px] text-[#3D3D3D] leading-relaxed mt-3 max-w-lg">
              It&apos;s not bad luck. It&apos;s a predictable set of structural
              mistakes — and every single one is fixable with the right process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: "01", title: "No position sizing framework", body: "Putting 40–60% of capital in a single trade. One adverse move wipes months of careful gains in a single session." },
            { num: "02", title: "Entry without an exit plan", body: "Entering trades on hope, exiting on panic. Without a pre-defined stop loss, emotions make every decision for you." },
            { num: "03", title: "Buying cheap OTM options", body: "Cheap premium looks attractive. But low cost means low probability of profit. Most expire worthless, silently draining capital." },
            { num: "04", title: "Revenge trading after a loss", body: "Doubling down to recover. The market doesn't know you lost, and it certainly doesn't owe you a recovery." },
            { num: "05", title: "Mistaking noise for signal", body: "Acting on tips, Telegram groups, and YouTube calls instead of building a verifiable, repeatable process." },
          ].map((card) => (
            <div
              key={card.num}
              className="bg-white border border-[rgba(17,17,17,0.1)] rounded-xl p-6"
            >
              <div className="font-mono text-[32px] font-medium text-[#EDE9E0] mb-3">
                {card.num}
              </div>
              <div className="text-[15px] font-medium text-[#111111] mb-2">{card.title}</div>
              <div className="text-[13px] text-[#3D3D3D] leading-relaxed">{card.body}</div>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[12px] text-[rgba(255,255,255,0.4)] mb-4">
                THE FIX
              </div>
              <p className="font-serif text-[17px] text-white leading-snug mb-6">
                A structured process beats intuition every single time.
              </p>
            </div>
            <Link
              href="/courses"
              className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-5 py-3 text-[13px] font-medium text-center transition-colors"
            >
              Start learning for free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className="bg-[#111111]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="font-mono text-[11px] text-[rgba(255,255,255,0.4)] tracking-widest uppercase mb-3">
            How It Works
          </div>
          <h2 className="font-serif text-[34px] text-white mb-14">Read. Apply. Track.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { step: "STEP 01", title: "Read the playbook", body: "Every lesson is structured like a trading desk brief — concept, example, key insight. No videos, no 2-hour rambles. Pure signal." },
              { step: "STEP 02", title: "Apply in your broker", body: "Each lesson ends with a real market exercise. Open your broker or NSE option chain and actually do it. Learning that sticks." },
              { step: "STEP 03", title: "Track your progress", body: "Mark lessons complete. Follow model portfolios. Come back when the market does something you've already studied — and recognise it." },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-8"
              >
                <div className="font-mono text-[12px] text-[#D4860A] tracking-wider mb-4">
                  {s.step}
                </div>
                <div className="font-serif text-[20px] text-white mb-3">{s.title}</div>
                <div className="text-[13px] text-[rgba(255,255,255,0.55)] leading-relaxed">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COURSES ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="flex justify-between items-end mb-3">
          <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase">
            Courses
          </div>
          <Link href="/courses" className="font-mono text-[12px] text-[#D4860A]">
            View all →
          </Link>
        </div>
        <h2 className="font-serif text-[34px] font-bold text-[#111111] mb-12">
          Pick your playbook
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              bg: "bg-[#111111]",
              badge: "BESTSELLER",
              badgeColor: "bg-[rgba(212,134,10,0.2)] text-[#D4860A]",
              tag: "BEGINNER → INTERMEDIATE",
              title: "Options Trading from Zero",
              desc: "A complete mental model for F&O. From basics to strategies to your personal trading system.",
              topics: ["Options basics", "Greeks", "Strategies", "Risk rules"],
              lessons: "12 lessons · ~4 hrs · 8 exercises",
              accessBadge: { label: "FREE PREVIEW AVAILABLE", style: "bg-[#E8F5EE] text-[#1A7A4A]" },
              cta: "Start free lesson →",
            },
            {
              bg: "bg-[#2A2A2A]",
              badge: "NEW",
              badgeColor: "bg-[rgba(26,122,74,0.2)] text-[#1A7A4A]",
              tag: "BEGINNER",
              title: "Equity Investing: Build Your First Portfolio",
              desc: "Systematic stock picking and portfolio construction for long-term wealth building.",
              topics: ["Stock screening", "Valuation", "SIP strategy"],
              lessons: "10 lessons · ~3.5 hrs · 6 exercises",
              accessBadge: { label: "LEARN STACK", style: "bg-[rgba(17,17,17,0.1)] text-[#111111]" },
              cta: "Preview →",
            },
            {
              bg: "bg-[#333333]",
              badge: null,
              badgeColor: "",
              tag: "INTERMEDIATE",
              title: "Technical Analysis Playbook",
              desc: "Chart patterns, indicators, and entry/exit setups that actually work in Indian markets.",
              topics: ["Price action", "S&R levels", "Entry setups"],
              lessons: "14 lessons · ~5 hrs · 10 exercises",
              accessBadge: { label: "LEARN STACK", style: "bg-[rgba(17,17,17,0.1)] text-[#111111]" },
              cta: "Preview →",
            },
          ].map((course) => (
            <div
              key={course.title}
              className="bg-white border border-[rgba(17,17,17,0.1)] rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(17,17,17,0.1)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className={`${course.bg} p-6`}>
                {course.badge && (
                  <span className={`font-mono text-[9px] font-medium rounded px-2 py-1 tracking-wider ${course.badgeColor} inline-block mb-3`}>
                    {course.badge}
                  </span>
                )}
                <div className="font-mono text-[10px] text-[rgba(255,255,255,0.4)] tracking-widest mb-2">
                  {course.tag}
                </div>
                <div className="font-serif text-[17px] text-white leading-snug">
                  {course.title}
                </div>
              </div>
              <div className="p-6">
                <p className="text-[13px] text-[#3D3D3D] leading-relaxed mb-4">{course.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.topics.map((t) => (
                    <span key={t} className="font-mono text-[10px] text-[#7A7A8A] bg-[#F4F1EB] rounded px-2 py-1">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-[12px] text-[#7A7A8A] mb-4">{course.lessons}</div>
                <div className="flex justify-between items-center pt-4 border-t border-[rgba(17,17,17,0.08)]">
                  <span className={`font-mono text-[10px] font-medium rounded px-2 py-1 ${course.accessBadge.style}`}>
                    {course.accessBadge.label}
                  </span>
                  <span className="font-mono text-[12px] text-[#D4860A]">{course.cta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription nudge */}
        <div className="mt-5 bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)] rounded-xl px-7 py-5 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="font-serif text-[18px] font-semibold text-[#111111] mb-1">
              One subscription. Three stacks. Everything you need.
            </div>
            <div className="text-[14px] text-[#3D3D3D]">
              Build your bundle — Learn, Research, Community. Pay one monthly total.
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap"
          >
            See pricing →
          </Link>
        </div>
      </section>

      {/* ── MODEL PORTFOLIOS ── */}
      <div className="bg-[#F4F1EB]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-3">
            Model Portfolios
          </div>
          <h2 className="font-serif text-[34px] font-bold text-[#111111] mb-3">
            See how a portfolio is built
          </h2>
          <p className="text-[16px] text-[#3D3D3D] leading-relaxed mb-12 max-w-xl">
            Three illustrative portfolios maintained for educational purposes — showing how allocation, selection, and rebalancing decisions are made.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { num: "01", name: "Long-term Wealth Builder", desc: "80% large cap, 20% mid cap. 5-year horizon. Illustrates conservative equity portfolio construction.", horizon: "5 yrs+", stocks: "10", risk: "Moderate", riskColor: "text-[#1A7A4A]", rebalance: "Quarterly" },
              { num: "02", name: "Dividend & Income", desc: "High-yield, low-volatility equities. Illustrates how to screen and weight for consistent dividend income.", horizon: "3 yrs+", stocks: "8", risk: "Low", riskColor: "text-[#1A7A4A]", rebalance: "Half-yearly" },
              { num: "03", name: "Active Trader Watchlist", desc: "High-liquidity stocks with strong F&O interest. Illustrates how an active trader scans for setups.", horizon: "Short-term", stocks: "12", risk: "High", riskColor: "text-[#D4860A]", rebalance: "Weekly" },
            ].map((p) => (
              <div key={p.num} className="bg-white border border-[rgba(17,17,17,0.1)] rounded-xl p-6">
                <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest mb-2">PORTFOLIO {p.num}</div>
                <div className="font-serif text-[16px] text-[#111111] mb-2">{p.name}</div>
                <div className="text-[12px] text-[#3D3D3D] leading-relaxed mb-5">{p.desc}</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "HORIZON", val: p.horizon, color: "" },
                    { label: "STOCKS", val: p.stocks, color: "" },
                    { label: "RISK", val: p.risk, color: p.riskColor },
                    { label: "REBALANCE", val: p.rebalance, color: "" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#F4F1EB] rounded-lg p-3">
                      <div className="font-mono text-[10px] text-[#7A7A8A] mb-1">{stat.label}</div>
                      <div className={`font-mono text-[14px] font-medium text-[#111111] ${stat.color}`}>{stat.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white border border-[rgba(17,17,17,0.08)] rounded-lg px-5 py-4 font-mono text-[10px] text-[#7A7A8A] leading-relaxed">
            ⚠ These model portfolios are maintained purely for educational purposes to illustrate portfolio construction principles. They do not constitute investment advice or SEBI-registered research. Past illustrative performance does not guarantee future results. Do not invest based on this content without consulting a registered financial advisor.
          </div>
        </div>
      </div>

      {/* ── PRICING SUMMARY ── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-3">
          Pricing
        </div>
        <div className="flex justify-between items-end flex-wrap gap-4 mb-12">
          <h2 className="font-serif text-[34px] font-bold text-[#111111]">
            Three stacks. One bundle.
          </h2>
          <Link href="/pricing" className="font-mono text-[12px] text-[#D4860A]">
            Build your bundle →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              stackNum: "STACK 01",
              title: "Learn",
              headerBg: "bg-[#111111]",
              from: "From ₹999/month",
              fromSub: "or free preview",
              features: ["All courses & lessons", "PDF playbooks", "Monthly live workshop (Pro)"],
              cta: "Explore Learn →",
            },
            {
              stackNum: "STACK 02",
              title: "Research",
              headerBg: "bg-[#2A2A2A]",
              from: "From ₹499/month",
              fromSub: "newsletter to full research",
              features: ["Weekly market newsletter", "3 model portfolios", "F&O strategy notes"],
              cta: "Explore Research →",
            },
            {
              stackNum: "STACK 03",
              title: "Community",
              headerBg: "bg-[#333333]",
              from: "From ₹999/month",
              fromSub: "group to 1:1 access",
              features: ["Private WhatsApp community", "Monthly group Q&A", "Unlimited 1:1 async access (Elite)"],
              cta: "Explore Community →",
            },
          ].map((stack) => (
            <div
              key={stack.stackNum}
              className="bg-white border border-[rgba(17,17,17,0.1)] rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(17,17,17,0.08)] hover:-translate-y-0.5 transition-all"
            >
              <div className={`${stack.headerBg} px-6 py-5`}>
                <div className="font-mono text-[10px] text-[rgba(255,255,255,0.4)] tracking-widest mb-2">
                  {stack.stackNum}
                </div>
                <div className="font-serif text-[20px] text-white">{stack.title}</div>
              </div>
              <div className="p-6">
                <div className="font-mono text-[22px] font-bold text-[#111111] leading-none mb-1">
                  {stack.from}
                </div>
                <div className="text-[12px] text-[#7A7A8A] mb-5">{stack.fromSub}</div>
                <div className="flex flex-col gap-2 mb-6">
                  {stack.features.map((f) => (
                    <div key={f} className="flex gap-2 items-start text-[13px] text-[#3D3D3D]">
                      <span className="text-[#1A7A4A] flex-shrink-0">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/pricing"
                  className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] transition-colors"
                >
                  {stack.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-5 bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)] rounded-xl px-7 py-5 flex justify-between items-center flex-wrap gap-4">
          <div className="font-serif text-[18px] text-[#111111]">
            Mix and match. Pay one total.
          </div>
          <Link
            href="/pricing"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap"
          >
            Build your bundle →
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <div className="bg-[#111111] rounded-2xl px-12 py-14 text-center">
          <h2 className="font-serif text-[30px] text-white mb-3">
            One market insight, every week.
          </h2>
          <p className="text-[rgba(255,255,255,0.55)] text-[15px] mb-8 max-w-md mx-auto">
            Join readers who get a concise, no-noise breakdown of what&apos;s moving Indian markets — and why it matters for your portfolio.
          </p>
          <NewsletterForm dark />
          <div className="font-mono text-[11px] text-[rgba(255,255,255,0.3)] mt-4">
            No spam. Unsubscribe anytime. Educational content only.
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#F4F1EB] border-t border-[rgba(17,17,17,0.1)]">
        <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="font-serif font-bold text-[16px] text-[#111111] mb-3">
                The Capital Gains
              </div>
              <div className="text-[13px] text-[#7A7A8A] leading-relaxed">
                Text-first, exercise-driven courses for Indian retail investors and traders. Built for people who want to understand markets — not just follow tips.
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest uppercase mb-4">LEARN</div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">All Courses</Link>
                <Link href="/portfolios" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Model Portfolios</Link>
                <span className="text-[13px] text-[#3D3D3D]">Free Resources</span>
                <Link href="/newsletter" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Newsletter</Link>
                <Link href="/about" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">About</Link>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest uppercase mb-4">PLATFORM</div>
              <div className="flex flex-col gap-2">
                <Link href="/pricing" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Pricing</Link>
                <Link href="/auth/login" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Sign In</Link>
                <Link href="/auth/signup" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Create Account</Link>
                <Link href="/terms" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="text-[13px] text-[#3D3D3D] hover:text-[#111111] transition-colors">Refund Policy</Link>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#7A7A8A] tracking-widest uppercase mb-4">FOLLOW</div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] text-[#3D3D3D]">Instagram</span>
                <span className="text-[13px] text-[#3D3D3D]">Substack</span>
                <span className="text-[13px] text-[#3D3D3D]">Telegram</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[rgba(17,17,17,0.1)] pt-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="font-mono text-[11px] text-[#7A7A8A]">
              © 2025 The Capital Gains · thecapitalgains.com
            </div>
            <div className="font-mono text-[10px] text-[#7A7A8A] max-w-lg leading-relaxed">
              All content is for educational purposes only and does not constitute investment advice, trading recommendations, or SEBI-registered research. Trading in equity and derivatives involves substantial risk of loss.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}