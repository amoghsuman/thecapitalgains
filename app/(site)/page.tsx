import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import {
  getAllCourses,
  getCourseWhyPicked,
  getFullCourseForReader,
  getFindYourPathData,
  getTestimonials,
  getFeaturedLearningPaths,
  getPortfolios,
  getGlossaryTerms,
  getMarketFactCards,
} from "@/lib/sanity/queries";
import { PathNavigator } from "@/components/FindYourPath";
import HeroCanvasBackground from "@/components/home/HeroCanvasBackground";
import HeroStats from "@/components/home/HeroStats";
import UserSummaryDashboard from "@/components/home/UserSummaryDashboard";
import FeaturedPlaybookCard from "@/components/home/FeaturedPlaybookCard";
import MarketTickerBar from "@/components/home/MarketTickerBar";
import FindYourCourseSection from "@/components/home/FindYourCourseSection";
import HomeLabsSection from "@/components/home/HomeLabsSection";
import MarketDeskSection from "@/components/home/MarketDeskSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import HowYouLearnSection from "@/components/home/HowYouLearnSection";
import StudentLearningPath from "@/components/home/StudentLearningPath";
import StudentTestimonialsCarousel from "@/components/home/StudentTestimonialsCarousel";
import InstitutionalFaq from "@/components/home/InstitutionalFaq";
import FloatingJumpDock from "@/components/home/FloatingJumpDock";
import MarketPulseToast from "@/components/home/MarketPulseToast";
import SampleChapterTrigger from "@/components/home/SampleChapterTrigger";
import MarketClocks from "@/components/home/MarketClocks";
import { buildMarketFacts } from "@/lib/home/marketFacts";
import { TIP_COURSE_SLUGS } from "@/lib/market/marketNote";
import { getReference } from "@/lib/market/reference";
import "@/app/premium-theme.css";

const FEATURED_CARD_COURSE_SLUG = "options-trading-from-zero";

// Matches the projection in getAllCourses() (lib/sanity/queries.ts) exactly
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
  const [courses, featuredWhyPicked, featuredCourseForReader, findYourPathPersonas, testimonials, featuredPaths, portfolios, glossaryTerms, factCards]: [
    CourseSummary[],
    string | null,
    Awaited<ReturnType<typeof getFullCourseForReader>>,
    Awaited<ReturnType<typeof getFindYourPathData>>,
    Awaited<ReturnType<typeof getTestimonials>>,
    Awaited<ReturnType<typeof getFeaturedLearningPaths>>,
    Awaited<ReturnType<typeof getPortfolios>>,
    Awaited<ReturnType<typeof getGlossaryTerms>>,
    Awaited<ReturnType<typeof getMarketFactCards>>
  ] = await Promise.all([
    getAllCourses(),
    getCourseWhyPicked(FEATURED_CARD_COURSE_SLUG),
    getFullCourseForReader(FEATURED_CARD_COURSE_SLUG),
    getFindYourPathData(),
    // Only consented testimonials come back; the section is omitted while empty.
    getTestimonials().catch(() => []),
    // Paths flagged featuredOnHome in Sanity; empty until scripts/flag-featured-paths.mjs --apply runs.
    getFeaturedLearningPaths().catch(() => []),
    // Only the count is used here (QuickAccessCategories portfolios card).
    getPortfolios().catch(() => []),
    // Weekly-rotated glossary terms and fact cards; empty until scripts/seed-glossary-facts.mjs --apply runs.
    getGlossaryTerms().catch(() => []),
    getMarketFactCards().catch(() => []),
  ]);

  // Sourced facts: the market_reference table wins over the constants when it
  // is fresher; every fact carries its as-of date and freshness budget.
  const facts = buildMarketFacts({ reference: await getReference(["gsec_10y", "nifty_tri_cagr_inception"]) });

  const courseCount = courses?.length ?? 0;
  const courseTitles: Record<string, string> = Object.fromEntries((courses ?? []).map((c) => [c.slug, c.title]));
  // Only the courses the market-note tips can link to cross to the client.
  const marketNoteCourseTitles: Record<string, string> = Object.fromEntries(
    TIP_COURSE_SLUGS.filter((slug) => courseTitles[slug]).map((slug) => [slug, courseTitles[slug]])
  );
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
              Built explicitly for Indian equity, F&O, and mutual fund investors tired of Telegram noise.
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

            {/* Global vs Indian Market Time Observatory Clocks */}
            <div className="pt-2">
              <MarketClocks />
            </div>
          </div>

          {/* Right — Featured Playbook Card with Integrated Recharts & Framer Motion Hover Animations */}
          <FeaturedPlaybookCard
            href={featuredCardHref}
            firstLessonHref={featuredFirstLessonSlug ? `/learn/${activeFeaturedSlug}/${featuredFirstLessonSlug}` : null}
            featuredCourse={featuredCourse}
            featuredWhyPicked={featuredWhyPicked}
          />
        </div>
      </section>

      {/* ── LIVE MARKET TICKER BAR ── */}
      <MarketTickerBar />

      {/* ── FIND YOUR COURSE & TRACKS ARCHITECTURE ── */}
      <FindYourCourseSection courses={courses ?? []} featuredPaths={featuredPaths} />

      {/* ── APPLIED FINANCIAL LABS (Terminal, DCF, Forensic, Compounding, Quiz, Scenarios) ── */}
      <HomeLabsSection />

      {/* ── MARKET DESK & TELEMETRY (Observatory Radar, Treemap, Sentiment, Glossary, Facts) ── */}
      <MarketDeskSection courseTitles={marketNoteCourseTitles} facts={facts} glossaryTerms={glossaryTerms} factCards={factCards} />

      {/* ── WHY US: THE CONTRAST (Noise vs Rigor, SEBI stats, 3 Pillars, Tested Myths) ── */}
      <WhyUsSection />

      {/* ── HOW YOU'LL LEARN (4-Step Progression with Playbook Page Turn Stage) ── */}
      <HowYouLearnSection
        facts={facts}
        courseSlugs={(courses ?? []).map((c) => c.slug)}
        courseTitles={courseTitles}
      />

      {/* ── INTERACTIVE PATH NAVIGATOR ── */}
      <PathNavigator personas={findYourPathPersonas} />

      {/* ── VERTICAL LEARNING PATH ROADMAP (Foundations to Advanced Mastery) ── */}
      <StudentLearningPath facts={facts} courseTitles={courseTitles} />

      {/* ── VERIFIED STUDENT TESTIMONIALS CAROUSEL ── */}
      {testimonials.length > 0 && <StudentTestimonialsCarousel testimonials={testimonials} />}

      {/* ── INSTITUTIONAL FAQ ACCORDION ── */}
      <InstitutionalFaq maxQuestions={6} singleOpen={true} />

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

      {/* ── MARKET PULSE NOTIFICATION TOAST (60s Auto-Refresh) ── */}
      <MarketPulseToast facts={facts} cards={factCards} />
    </div>
  );
}
