import Link from "next/link";
import { getAllCourses } from "@/lib/sanity/queries";

// Card backgrounds cycle by index
const cardBgs = ["bg-[#0F2348]", "bg-[#1A3460]", "bg-[#2A1A5E]"];

// Badge colour mapping
function badgeColor(badge: string | null): string {
  if (badge === "BESTSELLER") return "bg-[rgba(212,134,10,0.2)] text-[#D4860A]";
  if (badge === "NEW") return "bg-[rgba(26,122,74,0.2)] text-[#1A7A4A]";
  return "bg-[rgba(255,255,255,0.15)] text-white";
}

function priceFormatted(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-8">

        {/* ── HERO ── */}
        <div className="pt-14 pb-10">
          <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-2">
            Courses
          </div>
          <h1 className="font-serif text-5xl font-bold text-[#0F2348] leading-[1.1]">
            All Courses
          </h1>
          <p className="text-[16px] text-[#5A5A72] mt-3 mb-12">
            Text-first, exercise-driven playbooks. Buy individually or subscribe for all access.
          </p>
        </div>

        {/* ── COURSE GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: any, i: number) => {
            const bg = cardBgs[i % cardBgs.length];
            const meta = [
              course.lessonsCount ? `${course.lessonsCount} lessons` : null,
              course.duration,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={course.slug}
                className="rounded-2xl overflow-hidden border border-[rgba(15,35,72,0.1)] bg-white hover:shadow-[0_8px_40px_rgba(15,35,72,0.1)] hover:-translate-y-0.5 transition-all"
              >
                {/* Dark top */}
                <div className={`${bg} p-6 min-h-[140px] flex flex-col justify-end`}>
                  {course.badge && (
                    <span className={`font-mono text-[9px] font-medium rounded px-2 py-1 tracking-wider ${badgeColor(course.badge)} inline-block mb-3 self-start`}>
                      {course.badge}
                    </span>
                  )}
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.4)] tracking-widest mb-2">
                    {course.tag?.toUpperCase()}
                  </div>
                  <div className="font-serif text-[17px] text-white leading-snug">
                    {course.title}
                  </div>
                </div>

                {/* White bottom */}
                <div className="p-6">
                  <p className="text-[13px] text-[#5A5A72] leading-relaxed mb-4">
                    {course.subtitle || course.description}
                  </p>
                  {course.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.topics.map((t: string) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] text-[#9494A8] bg-[#F4F1EB] rounded px-2 py-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {meta && (
                    <div className="text-[12px] text-[#9494A8] mb-4">{meta}</div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-[rgba(15,35,72,0.08)]">
                    <div>
                      <span className="font-mono text-[18px] font-medium text-[#0F2348]">
                        {priceFormatted(course.price)}
                      </span>
                      <span className="text-[11px] text-[#9494A8] ml-1.5">one-time</span>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] transition-colors"
                    >
                      Preview free →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SUBSCRIPTION NUDGE ── */}
        <div className="mt-6 bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)] rounded-xl px-8 py-5 flex justify-between items-center gap-4 pb-14">
          <div>
            <div className="font-mono text-[11px] text-[#D4860A] mb-1">BETTER VALUE</div>
            <div className="text-[15px] font-medium text-[#0F2348]">
              Access all courses from ₹299/month — cheaper than buying individually.
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap"
          >
            Compare plans →
          </Link>
        </div>

      </div>
    </div>
  );
}
