import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllCourses } from "@/lib/sanity/queries";
import "@/app/premium-theme.css";

export default async function HomePage() {
  const courses = await getAllCourses();
  const courseCount = courses?.length || 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-24 premium-dark border-b border-[rgba(255,255,255,0.05)]">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[rgba(139,92,246,0.08)] blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[50%] rounded-full bg-[rgba(99,102,241,0.06)] blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full px-5 py-2">
              <div className="premium-glow-dot" />
              <span className="font-mono text-[11px] text-[#A78BFA] tracking-[0.2em] font-medium uppercase">
                TEXT-FIRST · READ & APPLY · NO VIDEOS
              </span>
            </div>

            <h1 className="text-6xl font-bold leading-[1.1] tracking-tight text-white">
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

            <div className="flex gap-4 flex-wrap pt-4 pb-8">
              <Link href="/courses" className="premium-button-primary">
                Explore Curriculum →
              </Link>
              <Link href="/pricing" className="premium-button-outline">
                View plans
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-8 pt-10 border-t border-[rgba(255,255,255,0.08)]">
              {[
                { num: courseCount.toString(), label: "PREMIUM COURSES" },
                { num: "₹499", label: "RESEARCH STARTS AT" },
                { num: "EARLY ACCESS", label: "NOW OPEN" },
                { num: "SEBI RA", label: "REGISTERED" },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="text-3xl font-bold text-white tracking-tight">{s.num}</div>
                  <div className="text-[10px] text-[#94A3B8] tracking-[0.2em] font-bold uppercase leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Preview Card */}
          <div className="relative group hidden lg:block">
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
                <span className="bg-[#D4860A20] text-[#D4860A] border border-[#D4860A30] font-mono text-[9px] font-bold rounded px-2.5 py-1.5 tracking-widest uppercase text-white">
                  BESTSELLER
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl">
                  <div className="flex justify-between text-[12px] text-[#94A3B8] mb-2 font-mono uppercase tracking-wider">
                    <span>Portfolio Mastery</span>
                    <span className="text-white">16%</span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 w-[16%]" />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-[#94A3B8]">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                  </div>
                  <span>Join our early access cohort.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE GRID ── */}
      <section className="py-24 max-w-6xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#1C0F3F] tracking-tight">Browse our Curriculum</h2>
          <p className="text-[#4B3F6B] mt-2 font-medium">Structured playbooks to master the markets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course: any) => (
            <Link key={course.slug} href={`/courses/${course.slug}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-2.5 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                    <div className="w-5 h-5 text-violet-600">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                  </div>
                  {course.tag && (
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      {course.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1C0F3F] mb-3 group-hover:text-violet-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-[#4B3F6B] leading-relaxed mb-6 flex-1">
                  {course.subtitle || course.description}
                </p>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Start Learning →</span>
                  <span className="text-[11px] text-slate-400 font-mono uppercase tracking-widest">{course.accessLevel || 'LEARNER+'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-violet-50/50 py-24 border-y border-violet-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1C0F3F] mb-4">Join The Capital Gains Newsletter</h2>
          <p className="text-[#4B3F6B] mb-10 max-w-xl mx-auto font-medium">
            Weekly insights on market trends, trading psychology, and new course announcements. 
            Directly to your inbox.
          </p>
          <div className="max-w-md mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
