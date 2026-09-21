import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllCourses, getCourseWhyPicked, getFullCourseForReader, getFindYourPathData } from "@/lib/sanity/queries";
import { PathNavigator } from "@/components/FindYourPath";
import HeroCanvasBackground from "@/components/home/HeroCanvasBackground";
import HeroStats from "@/components/home/HeroStats";
import UserSummaryDashboard from "@/components/home/UserSummaryDashboard";
import FeaturedPlaybookCard from "@/components/home/FeaturedPlaybookCard";
import MarketTickerBar from "@/components/home/MarketTickerBar";
import InteractiveTerminalVisual from "@/components/home/InteractiveTerminalVisual";
import InteractiveScenarioCheck from "@/components/home/InteractiveScenarioCheck";
import InstitutionalComparison from "@/components/home/InstitutionalComparison";
import SampleChapterTrigger from "@/components/home/SampleChapterTrigger";
import CuratedTracksSection from "@/components/home/CuratedTracksSection";
import InstitutionalFaq from "@/components/home/InstitutionalFaq";
import SebiDisclosureBanner from "@/components/home/SebiDisclosureBanner";
import FloatingJumpDock from "@/components/home/FloatingJumpDock";
import "@/app/premium-theme.css";

const FEATURED_CARD_COURSE_SLUG = "options-trading-from-zero";

// Matches the projection in getAllCourses() (lib/sanity/queries.ts) exactly —
// title/slug are always present (required in the Sanity schema), everything
// else is an optional course field.
export type CourseSummary = {
  _id: string;
  title: string;
  slug: string;
  tag?: string;
  price?: number;
  accessLevel?: string;
  badge?: string;
  subtitle?: string;
  lessonsCount?: number;
  duration?: string;
  description?: string;
  topics?: string[];
  whatYouLearn?: string[];
  learningPath?: string;
  orderRank?: number;
};

export default async function HomePage() {
  const [courses, featuredWhyPicked, featuredCourseForReader, findYourPathPersonas]: [
    CourseSummary[],
    string | null,
    Awaited<ReturnType<typeof getFullCourseForReader>>,
    Awaited<ReturnType<typeof getFindYourPathData>>
  ] = await Promise.all([
    getAllCourses(),
    getCourseWhyPicked(FEATURED_CARD_COURSE_SLUG),
    getFullCourseForReader(FEATURED_CARD_COURSE_SLUG),
    getFindYourPathData(),
  ]);

  const courseCount = courses?.length ?? 0;
  const featuredCourse = courses?.find((c: CourseSummary) => c.slug === FEATURED_CARD_COURSE_SLUG) || courses?.[0];
  const activeFeaturedSlug = featuredCourse?.slug || FEATURED_CARD_COURSE_SLUG;

  const featuredFirstLessonSlug = featuredCourseForReader?.chapters?.[0]?.lessons?.[0]?.slug ?? null;
  const featuredCardHref = featuredFirstLessonSlug
    ? `/learn/${activeFeaturedSlug}/${featuredFirstLessonSlug}`
    : `/courses/${activeFeaturedSlug}`;

  return (
    <div className="min-h-screen font-sans">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20 border-b border-hairline bg-ivory">
        {/* Cinematic Ambient Financial Grid & Parallax Canvas */}
        <HeroCanvasBackground />

        {/* Personalized Student Summary Dashboard for Logged-In Users */}
        <div className="site-container relative z-10 mb-6 sm:mb-8 empty:hidden">
          <UserSummaryDashboard />
        </div>

        <div className="site-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Context Pill Tag */}
            <div className="inline-flex items-center gap-2.5 bg-panel border border-hairline rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-mono text-[10px] sm:text-[11px] text-ink font-semibold tracking-wider uppercase">
                NSE · BSE Playbooks for Indian Retail Investors
              </span>
            </div>

            {/* Main Value Proposition */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.12] tracking-tight text-olive">
              Master the markets with{" "}
              <span className="text-forest font-serif italic font-normal">
                Playbook-Style
              </span>{" "}
              financial education.
            </h1>

            <p className="text-base sm:text-lg text-ink-dim leading-relaxed max-w-xl">
              Built explicitly for Indian equity, F&amp;O, and mutual fund investors tired of Telegram noise.
              Step-by-step institutional mental models, margin-of-safety screeners, and real market telemetry.
            </p>

            {/* Prominent High-Conversion Call To Actions */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3.5 flex-wrap">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-forest text-white text-sm sm:text-base font-bold shadow-xs hover:bg-forest-dark hover:shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Curriculum Playbooks</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-panel border border-hairline text-ink hover:text-forest hover:border-forest/40 text-sm font-semibold transition-all shadow-2xs"
                >
                  <span>Research Passes (₹1)</span>
                </Link>

                <SampleChapterTrigger buttonText="Preview Sample Chapter" />
              </div>

              {/* Retail Investor Assurance Micro-copy */}
              <div className="flex items-center gap-4 text-[11px] text-ink-dim font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Zero brokerage links</span>
                </div>
                <span className="text-hairline">·</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>SEBI compliant syllabus</span>
                </div>
                <span className="text-hairline">·</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pure execution frameworks</span>
                </div>
              </div>
            </div>

            {/* Animated Stats Row */}
            <HeroStats courseCount={courseCount} />
          </div>

          {/* Right — Featured Playbook Card with Integrated Recharts & Framer Motion Hover Animations */}
          <FeaturedPlaybookCard
            href={featuredCardHref}
            featuredCourse={featuredCourse}
            featuredWhyPicked={featuredWhyPicked}
          />
        </div>
      </section>

      {/* ── LIVE MARKET TICKER BAR ── */}
      <MarketTickerBar />

      {/* ── CINEMATIC INTERACTIVE TERMINAL VISUALIZER ── */}
      <section className="py-16 md:py-20 bg-ivory border-b border-hairline">
        <div className="site-container space-y-9">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              APPLIED FINANCIAL LABS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Interactive Curriculum Simulators: Experience the Logic
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-2 leading-relaxed">
              We replace abstract lectures with hands-on models. Test option payoff geometries under dynamic Greeks, or adjust Free Cash Flow growth to reveal fair valuation cushions in real time.
            </p>
          </div>

          {/* Interactive Lab Component */}
          <div className="w-full max-w-5xl mx-auto">
            <InteractiveTerminalVisual />
          </div>
        </div>
      </section>

      {/* ── THE 3 PILLARS ── */}
      <section id="three-pillars-section" className="py-16 md:py-20 border-b border-hairline bg-panel">
        <div className="site-container space-y-10">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              THE CAPITAL GAINS ECOSYSTEM
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Three interconnected pillars for Indian market mastery.
            </h2>
            <p className="text-ink-dim text-base mt-2.5 leading-relaxed">
              Most platforms sell disjointed tips or theoretical videos. We provide an integrated stack: learn the principles, read the institutional teardowns, and observe portfolio execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="bg-ivory/60 border border-hairline rounded-2xl p-7 flex flex-col justify-between hover:border-forest/40 hover:bg-panel transition-all shadow-2xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-forest-surface flex items-center justify-center text-forest border border-hairline">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <div className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
                  PILLAR 01 · FOUNDATIONS
                </div>
                <h3 className="text-xl font-bold text-olive">Playbook Courses</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Interactive, text-first playbooks crafted for fast comprehension. Read chapters with real Indian financial statements, cash flow models, and option payoff mechanics.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-ink-dim border-t border-hairline font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Beginner to Advanced progression
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Worked mathematical exercises & scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Bite-sized chapters with progress tracking
                  </li>
                </ul>
              </div>
              <Link href="/courses" className="mt-8 text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1">
                Browse Curriculum →
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-ivory/60 border border-hairline rounded-2xl p-7 flex flex-col justify-between hover:border-forest/40 hover:bg-panel transition-all shadow-2xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-forest-surface flex items-center justify-center text-forest border border-hairline">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
                  PILLAR 02 · FORENSIC INTEL
                </div>
                <h3 className="text-xl font-bold text-olive">Deep Research</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Institutional-caliber company teardowns and macroeconomic briefings. Unconflicted analysis starting at ₹1, making high-conviction research universally accessible.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-ink-dim border-t border-hairline font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Micro-priced access (starts at ₹1)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Forensic accounting & red flag screening
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Zero broker affiliation or promotional noise
                  </li>
                </ul>
              </div>
              <Link href="/pricing" className="mt-8 text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1">
                View Research Access →
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-ivory/60 border border-hairline rounded-2xl p-7 flex flex-col justify-between hover:border-forest/40 hover:bg-panel transition-all shadow-2xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-forest-surface flex items-center justify-center text-forest border border-hairline">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                </div>
                <div className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
                  PILLAR 03 · ALLOCATION
                </div>
                <h3 className="text-xl font-bold text-olive">Model Portfolios</h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  Three distinct, transparent portfolio frameworks demonstrating asset allocation, risk weighting, and rebalancing cadence across market cycles.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-ink-dim border-t border-hairline font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Long-term Wealth Builder (80/20 equity)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Dividend & Income compounding book
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Active Trader Liquidity Watchlist
                  </li>
                </ul>
              </div>
              <Link href="/portfolios" className="mt-8 text-xs font-bold text-forest hover:text-forest-dark inline-flex items-center gap-1">
                Inspect Model Portfolios →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURATED TRACKS SHELF (Interactive with Filter Pills & Framer Motion) ── */}
      <CuratedTracksSection courses={courses ?? []} />

      {/* ── INSTITUTIONAL COMPARISON MATRIX ── */}
      <InstitutionalComparison />

      {/* ── PEDAGOGY / THE CAPITAL GAINS STANDARD ── */}
      <section className="py-16 md:py-20 bg-ivory border-b border-hairline">
        <div className="site-container">
          <div className="max-w-3xl mb-10">
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              OUR METHODOLOGY
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              The Capital Gains Standard: Why We Reject Market Noise
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-2 leading-relaxed">
              Retail market participants in India lose capital not from a lack of information, but from relying on emotional tips, ungrounded technical indicators, and speculative advice. Here is how our curriculum is structured differently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Zero Tips, Zero Hype",
                desc: "We do not run Telegram advisory channels, call-outs, or speculative predictions. We equip you with fundamental mental models you can execute independently.",
              },
              {
                num: "02",
                title: "Indian Market Reality",
                desc: "Every case study is grounded in NSE/BSE corporate filings, RBI monetary stance, SEBI regulatory mandates, and India-specific taxation rules.",
              },
              {
                num: "03",
                title: "Risk-First Frameworks",
                desc: "Capital preservation precedes alpha. We emphasize margin of safety, downside risk budgets, position sizing formulas, and drawdown mitigation.",
              },
              {
                num: "04",
                title: "Playbook Reference",
                desc: "Written in concise, text-first playbook format. You don't have to sit through hours of fluff video — search, read, calculate, and implement immediately.",
              },
            ].map((std) => (
              <div key={std.num} className="bg-panel border border-hairline rounded-2xl p-6 space-y-3 shadow-2xs hover:border-forest/40 transition-colors">
                <div className="font-mono text-xs font-bold text-gold tracking-widest">{std.num}</div>
                <h4 className="text-base font-bold text-olive">{std.title}</h4>
                <p className="text-xs text-ink-dim leading-relaxed">{std.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL-WORLD MARKET CHALLENGE ── */}
      <InteractiveScenarioCheck />

      {/* ── INTERACTIVE PATH NAVIGATOR ── */}
      <PathNavigator personas={findYourPathPersonas} />

      {/* ── INSTITUTIONAL FAQ ACCORDION ── */}
      <InstitutionalFaq />

      {/* ── STATUTORY SEBI COMPLIANCE & RISK DISCLOSURE BANNER ── */}
      <SebiDisclosureBanner />

      {/* ── NEWSLETTER ── */}
      <section className="py-16 md:py-20 bg-ivory">
        <div className="site-container text-center">
          <div className="inline-flex items-center gap-2 bg-panel border border-hairline rounded-full px-4 py-1.5 mb-5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            <span className="font-mono text-[10px] text-gold tracking-[0.16em] font-bold uppercase">
              WEEKLY MARKET INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive mb-3 tracking-tight">
            Join The Capital Gains Newsletter
          </h2>
          <p className="text-ink-dim mb-8 max-w-xl mx-auto font-medium text-sm sm:text-base leading-relaxed">
            Weekly deep-dives on Indian market trends, corporate accounting nuances, option volatility dynamics, and new curriculum releases. Zero spam, uncompromised signal.
          </p>
          <div className="max-w-md mx-auto bg-panel p-2 rounded-2xl shadow-xs border border-hairline">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* ── FLOATING QUICK-JUMP TABLE OF CONTENTS DOCK ── */}
      <FloatingJumpDock />
    </div>
  );
}

