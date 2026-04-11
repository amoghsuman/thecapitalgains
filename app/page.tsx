import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllCourses } from "@/lib/sanity/queries";
import "@/app/premium-theme.css";

export default async function HomePage() {
  const courses = await getAllCourses();
  const courseCount = courses?.length || 0;

  return (
    <div className="premium-dark min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-24">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[rgba(139,92,246,0.08)] blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[50%] rounded-full bg-[rgba(99,102,241,0.06)] blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full px-5 py-2">
              <div className="premium-glow-dot" />
              <span className="font-mono text-[11px] text-[#A78BFA] tracking-[0.2em] font-medium uppercase">
                TEXT-FIRST · READ & APPLY · NO VIDEOS
              </span>
            </div>

            <h1 className="text-6xl font-bold leading-[1.1] tracking-tight">
              Learn to invest like a pro.{" "}
              <span className="block mt-2 text-[#D4860A] drop-shadow-[0_0_15px_rgba(212,134,10,0.2)]">
                Not gamble like a beginner.
              </span>
            </h1>

            <p className="text-[18px] text-[#94A3B8] leading-relaxed max-w-xl">
              Playbook-style courses for Indian retail investors and traders. 
              Read, apply, repeat. No fluff, no video lectures, no jargon. 
              Built for high-precision decision making.
            </p>

            <div className="flex gap-4 flex-wrap pt-4">
              <Link href="/courses" className="premium-button-primary">
                Start a free lesson →
              </Link>
              <Link href="/pricing" className="premium-button-outline">
                View plans
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-[rgba(255,255,255,0.05)]">
              {[
                { num: courseCount.toString(), label: "Courses" },
                { num: "2", label: "Ways to subscribe" },
                { num: "₹0", label: "To start" },
                { num: "₹499", label: "Research from" },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="text-2xl font-bold text-white tracking-tight">{s.num}</div>
                  <div className="text-[11px] text-[#64748B] tracking-widest font-semibold uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Preview Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#1A1138] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="font-mono text-[10px] text-[#A78BFA] tracking-[0.2em] mb-3 font-semibold uppercase">
                    BEGINNER → INTERMEDIATE
                  </div>
                  <h3 className="text-[22px] text-white leading-snug font-bold">
                    Options Trading from Zero
                  </h3>
                  <div className="text-[13px] text-[#94A3B8] mt-2 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#64748B]" />
                    12 lessons · ~4 hrs reading
                  </div>
                </div>
                <span className="bg-[#D4860A20] text-[#D4860A] border border-[#D4860A30] font-mono text-[9px] font-bold rounded px-2.5 py-1.5 tracking-widest uppercase">
                  BESTSELLER
                </span>
              </div>

              {/* Progress Tracker */}
              <div className="mb-8">
                <div className="flex justify-between text-[13px] text-[#94A3B8] mb-3">
                  <span className="font-medium">Portfolio Readiness</span>
                  <span className="font-mono text-white font-bold">16%</span>
                </div>
                <div className="h-[6px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <div className="h-full w-[16%] bg-gradient-to-r from-[#D4860A] to-[#F0A020] rounded-full shadow-[0_0_10px_rgba(212,134,10,0.5)]" />
                </div>
              </div>

              {/* Lesson Items */}
              <div className="space-y-3">
                {[
                  { status: "done", title: "Why Most Retail Traders Lose", time: "8 min" },
                  { status: "active", title: "Options Basics: What You're Buying", time: "12 min" },
                  { status: "locked", title: "Time Decay & Premium", time: "10 min" },
                  { status: "locked", title: "The Greeks: What Actually Matters", time: "15 min" },
                ].map((lesson) => (
                  <div
                    key={lesson.title}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      lesson.status === "done"
                        ? "bg-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.1)]"
                        : lesson.status === "active"
                        ? "bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)]"
                        : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 border ${
                        lesson.status === "done"
                          ? "bg-[#10B981] border-[#10B981] text-white"
                          : lesson.status === "active"
                          ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                          : "bg-transparent border-[#64748B] text-[#64748B]"
                      }`}
                    >
                      {lesson.status === "done" ? "✓" : lesson.status === "active" ? "▶" : "🔒"}
                    </div>
                    <span className="flex-1 text-[14px] text-white font-medium">{lesson.title}</span>
                    <span className="font-mono text-[11px] text-[#64748B]">{lesson.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="border-y border-[rgba(255,255,255,0.05)] bg-[#1A113840] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-10 flex justify-center gap-16 flex-wrap">
          {[
            { icon: "📖", title: "Structured learning", sub: "Deep-dive playbooks" },
            { icon: "✎", title: "No jargon, no fluff", sub: "Active market signal" },
            { icon: "✓", title: "Apply immediately", sub: "Market-ready exercises" },
            { icon: "◷", title: "Learn at your pace", sub: "Always in sync" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 group">
              <div className="w-11 h-11 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] group-hover:border-violet-500/30 group-hover:bg-violet-500/10 rounded-xl flex items-center justify-center text-white text-[16px] transition-all">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-white tracking-tight">{item.title}</div>
                <div className="text-[11px] text-[#64748B] font-semibold tracking-wide uppercase">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEM SECTION ── */}
      <section className="max-w-6xl mx-auto px-8 py-32">
        <div className="text-center mb-20 space-y-4">
          <div className="font-mono text-[12px] text-[#D4860A] tracking-[0.3em] font-bold uppercase">
            The Structural Problem
          </div>
          <h2 className="text-[48px] font-bold text-white leading-tight tracking-tight">
            Why 90% of retail traders<br />
            <span className="text-[#94A3B8]">blow up in 12 months</span>
          </h2>
          <p className="text-[18px] text-[#94A3B8] leading-relaxed max-w-2xl mx-auto">
            It&apos;s not bad luck. It&apos;s a predictable set of structural
            mistakes — and every single one is fixable with the right process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { num: "01", title: "No position sizing framework", body: "Putting 40–60% of capital in a single trade. One adverse move wipes months of careful gains in a single session." },
            { num: "02", title: "Entry without an exit plan", body: "Entering trades on hope, exiting on panic. Without a pre-defined stop loss, emotions make every decision for you." },
            { num: "03", title: "Buying cheap OTM options", body: "Cheap premium looks attractive. But low cost means low probability of profit. Most expire worthless, silently draining capital." },
            { num: "04", title: "Revenge trading after a loss", body: "Doubling down to recover. The market doesn't know you lost, and it certainly doesn't owe you a recovery." },
            { num: "05", title: "Mistaking noise for signal", body: "Acting on tips, Telegram groups, and YouTube calls instead of building a verifiable, repeatable process." },
          ].map((card) => (
            <div key={card.num} className="premium-card p-8 group">
              <div className="font-mono text-[42px] font-black text-[rgba(255,255,255,0.03)] group-hover:text-violet-500/20 mb-4 transition-colors">
                {card.num}
              </div>
              <div className="text-[18px] font-bold text-white mb-3 tracking-tight">{card.title}</div>
              <div className="text-[14px] text-[#94A3B8] leading-relaxed">{card.body}</div>
            </div>
          ))}

          {/* High Contrast Fix Card */}
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div>
              <div className="font-mono text-[12px] text-white/60 tracking-[0.2em] font-bold mb-6 uppercase">
                THE SOLUTION
              </div>
              <p className="text-[22px] text-white font-bold leading-tight mb-8">
                A structured process beats intuition every single time.
              </p>
            </div>
            <Link href="/courses" className="bg-white text-[#1C0F3F] rounded-xl px-6 py-4 text-[14px] font-bold text-center hover:bg-white/90 transition-colors shadow-lg">
              Start learning for free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COURSE GRID ── */}
      <section className="max-w-6xl mx-auto px-8 py-32 bg-[rgba(255,255,255,0.01)] rounded-[3rem] border border-[rgba(255,255,255,0.03)]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4 text-center md:text-left">
            <div className="font-mono text-[12px] text-[#A78BFA] tracking-[0.3em] font-bold uppercase">
              Curated Playbooks
            </div>
            <h2 className="text-[48px] font-bold text-white leading-tight">
              Pick your stack
            </h2>
          </div>
          <Link href="/courses" className="premium-button-outline text-sm font-bold uppercase tracking-widest">
            View all Courses →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              badge: "BESTSELLER",
              tag: "BEGINNER → INTERMEDIATE",
              title: "Options Trading from Zero",
              desc: "A complete mental model for F&O. From basics to strategies to your personal trading system.",
              topics: ["Options basics", "Greeks", "Strategies", "Risk rules"],
              lessons: "12 lessons · ~4 hrs reading",
              cta: "Start free lesson →",
              premium: true
            },
            {
              badge: "NEW",
              tag: "BEGINNER",
              title: "Equity Investing: First Portfolio",
              desc: "Systematic stock picking and portfolio construction for long-term wealth building.",
              topics: ["Stock screening", "Valuation", "SIP strategy"],
              lessons: "10 lessons · ~3.5 hrs reading",
              cta: "Preview course →",
              premium: false
            },
            {
              badge: null,
              tag: "INTERMEDIATE",
              title: "Technical Analysis Playbook",
              desc: "Chart patterns, indicators, and entry/exit setups that work in Indian markets.",
              topics: ["Price action", "S&R levels", "Entry setups"],
              lessons: "14 lessons · ~5 hrs reading",
              cta: "Preview course →",
              premium: false
            },
          ].map((course) => (
            <div key={course.title} className="premium-card flex flex-col group overflow-hidden">
              <div className={`p-8 pb-0 ${course.premium ? 'bg-gradient-to-b from-violet-900/40 to-transparent' : ''}`}>
                {course.badge && (
                  <span className="inline-block bg-[rgba(139,92,246,0.1)] text-[#A78BFA] border border-[rgba(139,92,246,0.2)] font-mono text-[9px] font-bold rounded px-2.5 py-1.5 tracking-widest uppercase mb-4">
                    {course.badge}
                  </span>
                )}
                <div className="font-mono text-[10px] text-[#64748B] tracking-[0.2em] font-bold mb-3 uppercase">
                  {course.tag}
                </div>
                <h3 className="text-[20px] text-white font-bold leading-tight group-hover:text-[#A78BFA] transition-colors">
                  {course.title}
                </h3>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-[14px] text-[#94A3B8] leading-relaxed">{course.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {course.topics.map((t) => (
                    <span key={t} className="font-mono text-[10px] text-[#A78BFA] bg-violet-500/5 border border-violet-500/10 rounded-lg px-2.5 py-1.5 uppercase font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                  <div className="text-[12px] font-mono text-[#64748B] font-bold">{course.lessons}</div>
                  <div className="text-[13px] font-bold text-[#D4860A] tracking-tight">{course.cta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-6xl mx-auto px-8 pb-32 pt-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1138] to-[#0F0720] border border-[rgba(255,255,255,0.05)] rounded-[2.5rem] px-12 py-20 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-violet-600/5 blur-[100px] -z-10" />
          <h2 className="text-[36px] font-bold text-white mb-4 tracking-tight">
            One market insight, every week.
          </h2>
          <p className="text-[#94A3B8] text-[16px] mb-10 max-w-lg mx-auto leading-relaxed">
            Join 12,000+ investors who get a concise, no-noise breakdown of what&apos;s moving Indian markets — and why it matters.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm dark />
          </div>
          <div className="font-mono text-[11px] text-[#64748B] mt-6 tracking-widest font-semibold uppercase">
            No spam. Educational content only.
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="text-xl font-bold text-white tracking-tight">
                The Capital Gains
              </div>
              <p className="text-[14px] text-[#94A3B8] leading-relaxed">
                Text-first, exercise-driven financial education. Built for high-precision decision making in Indian markets.
              </p>
            </div>
            {/* Nav Columns ... similar to before but with premium styling */}
            <div className="space-y-6">
              <div className="font-mono text-[11px] text-white tracking-[0.3em] font-bold uppercase">Learn</div>
              <ul className="space-y-3 text-[14px] text-[#94A3B8]">
                <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
                <li><Link href="/portfolios" className="hover:text-white transition-colors">Model Portfolios</Link></li>
                <li><Link href="/newsletter" className="hover:text-white transition-colors">Weekly Brief</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <div className="font-mono text-[11px] text-white tracking-[0.3em] font-bold uppercase">Platform</div>
              <ul className="space-y-3 text-[14px] text-[#94A3B8]">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Legal Disclosures</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <div className="font-mono text-[11px] text-white tracking-[0.3em] font-bold uppercase">Connect</div>
              <ul className="space-y-3 text-[14px] text-[#94A3B8]">
                <li className="hover:text-white cursor-pointer">Instagram</li>
                <li className="hover:text-white cursor-pointer">Substack</li>
                <li className="hover:text-white cursor-pointer">Telegram</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between gap-6">
            <div className="font-mono text-[11px] text-[#64748B] font-bold uppercase tracking-widest">
              © 2025 The Capital Gains · Precision Finance
            </div>
            <div className="font-mono text-[10px] text-[#64748B] max-w-xl leading-relaxed text-right">
              Content for educational purposes only. No investment advice. 
              Trading involves substantial risk. SEBI registration pending.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}