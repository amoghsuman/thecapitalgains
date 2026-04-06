import Link from "next/link";
import { getAllCourses } from "@/lib/sanity/queries";

export const revalidate = 0

// Card backgrounds cycle by index
const cardBgs = ["bg-[#1E1245]", "bg-[#2D1B69]", "bg-[#3D2785]"];

// Badge colour mapping
function badgeColor(badge: string | null): string {
  if (badge === "BESTSELLER") return "bg-[rgba(212,134,10,0.2)] text-[#D4860A]";
  if (badge === "NEW") return "bg-[rgba(26,122,74,0.2)] text-[#1A7A4A]";
  return "bg-[rgba(255,255,255,0.15)] text-white";
}

function AccessBadge({ level }: { level?: string }) {
  if (level === "free")
    return <span className="font-mono text-[10px] font-medium bg-[#E8F5EE] text-[#1A7A4A] rounded px-2 py-1">FREE</span>;
  if (level === "pro")
    return <span className="font-mono text-[10px] font-medium bg-[rgba(212,134,10,0.15)] text-[#D4860A] rounded px-2 py-1">PRO</span>;
  return <span className="font-mono text-[10px] font-medium bg-[rgba(30,18,69,0.1)] text-[#1E1245] rounded px-2 py-1">LEARNER+</span>;
}

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-8">

        {/* ── HERO ── */}
        <div className="pt-14 pb-10">
          <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-2">
            Courses
          </div>
          <h1 className="font-serif text-5xl font-bold text-[#1E1245] leading-[1.1]">
            All Courses
          </h1>
          <p className="text-[16px] text-[#3D3D3D] mt-3 mb-12">
            Subscribe to access all courses. Free previews available — no card required.
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
                className="rounded-2xl overflow-hidden border border-[rgba(30,18,69,0.1)] bg-white hover:shadow-[0_8px_40px_rgba(30,18,69,0.1)] hover:-translate-y-0.5 transition-all"
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
                  <p className="text-[13px] text-[#3D3D3D] leading-relaxed mb-4">
                    {course.subtitle || course.description}
                  </p>
                  {course.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.topics.map((t: string) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] text-[#7A7A8A] bg-[#F4F1EB] rounded px-2 py-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {meta && (
                    <div className="text-[12px] text-[#7A7A8A] mb-4">{meta}</div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-[rgba(30,18,69,0.08)]">
                    <AccessBadge level={course.accessLevel} />
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] transition-colors"
                    >
                      {course.accessLevel === "free" ? "Start free lesson →" : "Preview →"}
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
            <div className="text-[15px] font-medium text-[#1E1245]">
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
