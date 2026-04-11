import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getAllCourses } from "@/lib/sanity/queries";
import "@/app/premium-theme.css";

export default async function HomePage() {
  const courses = await getAllCourses();
  const courseCount = courses?.length || 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* ── HERO ── (Keeping it Dark/Premium for Impact) */}
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

            <div className="flex gap-4 flex-wrap pt-4">
              <Link href="/courses" className="premium-button-primary">
                Start a free lesson →
              </Link>
              <Link href="/pricing" className="premium-button-outline">
                View plans
              </Link>
            </div>
          </div>

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
                </div>
                <span className="bg-[#D4860A20] text-[#D4860A] border border-[#D4860A30] font-mono text-[9px] font-bold rounded px-2.5 py-1.5 tracking-widest uppercase text-white">
                  BESTSELLER
                </span>
              </div>
              <div className="h-[6px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 w-[16%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE GRID ── (Light Theme with White Cards) */}
      <section className="py-24 max-w-6xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#1C0F3F] tracking-tight">Browse our Curriculum</h2>
          <p className="text-[#4B3F6B] mt-2">Structured playbooks to master the markets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course: any) => (
            <Link key={course.slug} href={`/courses/${course.slug}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-2.5 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                    <div className="w-5 h-5 text-violet-600">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase">
                    {course.category || 'Trading'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1C0F3F] mb-3 group-hover:text-violet-700 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
                  {course.description || "Master the art of high-probability trading with this comprehensive guide."}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                  <span className="text-xs font-semibold text-slate-400">
                    {course.lessonCount || 0} Lessons
                  </span>
                  <span className="text-xs font-bold text-violet-600 flex items-center gap-1">
                    Free Trial <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA / Newsletter ── (Subtle Tinted Section) */}
      <section className="bg-violet-50/50 py-24 border-y border-violet-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1C0F3F] mb-6">Master your capital. Join 5k+ readers.</h2>
          <p className="text-lg text-[#4B3F6B] mb-10">Get actionable market research and financial playbooks delivered to your inbox.</p>
          <div className="max-w-md mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
             <NewsletterForm />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-24 max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
           {[
                { num: courseCount.toString(), label: "Premium Courses" },
                { num: "₹499", label: "Research Starts at" },
                { num: "77%", label: "Reported CAGR" },
                { num: "5000+", label: "Active Students" },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="text-3xl font-bold text-[#1C0F3F] tracking-tight">{s.num}</div>
                  <div className="text-[11px] text-slate-400 tracking-widest font-bold uppercase">{s.label}</div>
                </div>
              ))}
        </div>
      </section>

      {/* ── FOOTER ── (Dark Footer for Professional Contrast) */}
      <footer className="bg-[#0F0720] pt-24 pb-12 border-t border-white/5 text-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white">C</div>
                <span className="font-bold text-xl tracking-tight">The Capital Gains</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Empowering Indian retail investors with high-precision trading playbooks and systematic wealth creation systems.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/portfolios" className="hover:text-white transition-colors">Portfolios</Link></li>
                <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-6">Follow</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-mono">© 2026 The Capital Gains · thecapitalgains.com</p>
            <div className="flex gap-6 text-xs text-slate-500 font-mono">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
