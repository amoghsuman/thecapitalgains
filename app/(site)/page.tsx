import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllCourses, getCourseWhyPicked, getFullCourseForReader, getFindYourPathData } from "@/lib/sanity/queries";
import { PathNavigator } from "@/components/FindYourPath";
import "@/app/premium-theme.css";

const FEATURED_CARD_COURSE_SLUG = "options-trading-from-zero";

export default async function HomePage() {
  const [courses, featuredWhyPicked, featuredCourseForReader, findYourPathPersonas] = await Promise.all([
    getAllCourses(),
    getCourseWhyPicked(FEATURED_CARD_COURSE_SLUG),
    getFullCourseForReader(FEATURED_CARD_COURSE_SLUG),
    getFindYourPathData(),
  ]);
  const courseCount = courses?.length || 0;
  const featuredFirstLessonSlug = featuredCourseForReader?.chapters?.[0]?.lessons?.[0]?.slug ?? null;
  const featuredCardHref = featuredFirstLessonSlug
    ? `/learn/${FEATURED_CARD_COURSE_SLUG}/${featuredFirstLessonSlug}`
    : `/courses/${FEATURED_CARD_COURSE_SLUG}`; // fallback if a course somehow has no first lesson yet

  return (
    <div className="min-h-screen font-sans">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="site-container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-forest-surface border border-hairline rounded-full px-5 py-2">
              <div className="premium-glow-dot" />
              <span className="font-mono text-[11px] text-gold-text tracking-[0.2em] font-medium uppercase">
                COURSES · RESEARCH · MODEL PORTFOLIOS
              </span>
            </div>

            <h1 className="text-4xl md:text-[54px] font-bold leading-[1.1] tracking-tight text-ink">
              Learn to invest like a pro.{" "}
              <span className="block mt-2 text-gold drop-shadow-[0_0_15px_rgba(169,130,47,0.2)]">
                And build a process you can repeat.
              </span>
            </h1>

            <p className="text-[18px] text-ink-dim leading-relaxed max-w-xl">
              Playbook-style courses, research, and model portfolios for Indian investors and traders.
              Read, apply, repeat, built for high-precision decision making.
            </p>

            <div className="flex gap-4 flex-wrap pt-4 pb-8">
              <Link href="/courses" className="premium-button-primary">
                Explore Curriculum →
              </Link>
              <Link href="/pricing" className="premium-button-outline">
                View plans
              </Link>
            </div>

            {/* Stats Row — 3 items, no enrollment/cohort slot to fill a 4th */}
            <div className="grid grid-cols-3 gap-x-6 sm:gap-x-12 gap-y-8 pt-10 border-t border-hairline">
              {[
                { num: courseCount.toString(), label: "PREMIUM COURSES" },
                { num: "₹1", label: "RESEARCH STARTS AT" },
                { num: "3", label: "MODEL PORTFOLIOS" },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="text-3xl font-bold text-ink tracking-tight">{s.num}</div>
                  <div className="text-[10px] text-ink-dim tracking-[0.2em] font-bold uppercase leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Preview Card. The whole card is one link (not
              just the bottom line) to the course's first lesson; the CTA bar
              inside it is a styled element, not a second nested anchor. */}
          <div className="relative group hidden lg:block">
            <div className="absolute -inset-1 bg-gradient-to-r from-forest to-gold rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Link
              href={featuredCardHref}
              className="relative block bg-panel border border-hairline rounded-2xl p-8 shadow-2xl backdrop-blur-xl
                hover:border-forest/50 hover:shadow-[0_16px_40px_rgba(27,58,43,0.18)] motion-safe:transition-all motion-safe:duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="font-mono text-[10px] text-gold-text tracking-[0.2em] mb-3 font-semibold uppercase">
                    BEGINNER → INTERMEDIATE
                  </div>
                  <h3 className="text-[22px] text-ink leading-snug font-bold">
                    Options Trading from Zero
                  </h3>
                  <div className="text-[13px] text-ink-dim mt-2 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-ink-dim" />
                    12 lessons · ~4 hrs reading
                  </div>
                </div>
                <span className="bg-forest text-white font-mono text-[9px] font-bold rounded px-2.5 py-1.5 tracking-widest uppercase">
                  FEATURED
                </span>
              </div>

              <div className="space-y-6">
                {featuredWhyPicked && (
                  <div className="p-4 bg-ivory border border-hairline rounded-xl">
                    <p className="text-[13px] text-ink-dim leading-relaxed">{featuredWhyPicked}</p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-[13px] font-bold text-white bg-forest rounded-xl py-3
                  group-hover:bg-forest-dark motion-safe:transition-colors">
                  Start learning →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <PathNavigator personas={findYourPathPersonas} />

      {/* ── NEWSLETTER ── */}
      <section className="py-24">
        <div className="site-container text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">Join The Capital Gains Newsletter</h2>
          <p className="text-ink-dim mb-10 max-w-xl mx-auto font-medium">
            Weekly insights on market trends, trading psychology, and new course announcements.
            Directly to your inbox.
          </p>
          <div className="max-w-md mx-auto bg-panel p-2 rounded-2xl shadow-sm border border-hairline">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
