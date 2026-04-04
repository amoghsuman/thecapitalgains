import Link from "next/link";
import { getCourseBySlug } from "@/lib/sanity/queries";

const priceFormatted = (price: number) => `₹${price.toLocaleString("en-IN")}`;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen">
        <div className="max-w-6xl mx-auto px-8 pt-20 text-center">
          <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-4">
            404
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#0F2348] mb-4">
            Course not found
          </h1>
          <p className="text-[16px] text-[#5A5A72] mb-8">
            We couldn&apos;t find a course at this URL.
          </p>
          <Link
            href="/courses"
            className="bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-6 py-3 text-[14px] font-medium transition-colors"
          >
            Browse all courses →
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.lessonsCount ||
    course.chapters?.reduce(
      (sum: number, ch: any) => sum + (ch.lessons?.length ?? 0),
      0
    ) ||
    0;

  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── BREADCRUMB ── */}
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <div className="flex items-center gap-2 font-mono text-[12px] text-[#9494A8]">
          <Link href="/courses" className="hover:text-[#0F2348] transition-colors">
            Courses
          </Link>
          <span>→</span>
          <span className="text-[#0F2348]">{course.title}</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-8 mt-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2">

          {/* Badge + tag */}
          <div className="flex items-center gap-2 mb-3">
            {course.badge && (
              <span className="font-mono text-[9px] font-medium bg-[rgba(212,134,10,0.15)] text-[#D4860A] rounded px-2 py-1 tracking-wider">
                {course.badge}
              </span>
            )}
            <span className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase">
              {course.tag}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl font-bold text-[#0F2348] leading-[1.1] mb-4">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#5A5A72] leading-relaxed mb-6">
            {course.description || course.subtitle}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-5 mb-8 pb-8 border-b border-[rgba(15,35,72,0.1)]">
            {[
              { label: "Lessons", val: `${totalLessons}` },
              { label: "Duration", val: course.duration },
              { label: "Level", val: course.tag },
            ].map((s) => (
              s.val ? (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-1">
                    {s.label}
                  </span>
                  <span className="font-mono text-[15px] font-medium text-[#0F2348]">
                    {s.val}
                  </span>
                </div>
              ) : null
            ))}
          </div>

          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-5">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((point: string) => (
                  <div key={point} className="flex gap-3 items-start">
                    <span className="text-[#1A7A4A] mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-[14px] text-[#5A5A72] leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          {course.chapters?.length > 0 && (
            <div>
              <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-5">
                Curriculum
              </h2>
              <div className="flex flex-col gap-4">
                {course.chapters.map((chapter: any) => (
                  <div
                    key={chapter.title}
                    className="border border-[rgba(15,35,72,0.1)] rounded-xl overflow-hidden"
                  >
                    <div className="bg-[#F4F1EB] px-5 py-3">
                      <span className="font-mono text-[12px] font-medium text-[#0F2348]">
                        {chapter.title}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {chapter.lessons?.map((lesson: any, i: number) => (
                        <div
                          key={lesson.slug || lesson.title}
                          className={`flex items-center justify-between px-5 py-3 ${
                            i !== chapter.lessons.length - 1
                              ? "border-b border-[rgba(15,35,72,0.06)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] text-[#9494A8] flex-shrink-0">
                              {lesson.isFree ? "▶" : "🔒"}
                            </span>
                            {lesson.isFree && lesson.slug ? (
                              <Link
                                href={`/learn/${slug}/${lesson.slug}`}
                                className="text-[14px] text-[#0F2348] hover:text-[#D4860A] transition-colors"
                              >
                                {lesson.title}
                              </Link>
                            ) : (
                              <span className="text-[14px] text-[#9494A8]">
                                {lesson.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            {lesson.duration && (
                              <span className="font-mono text-[11px] text-[#9494A8]">
                                {lesson.duration}
                              </span>
                            )}
                            {lesson.isFree && (
                              <span className="font-mono text-[10px] text-[#1A7A4A] bg-[#E8F5EE] rounded px-2 py-0.5">
                                Free preview
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — STICKY PURCHASE CARD ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-6 shadow-[0_4px_32px_rgba(15,35,72,0.08)]">

            {/* Price */}
            <div className="mb-1">
              <span className="font-mono text-[36px] font-bold text-[#0F2348] leading-none">
                {priceFormatted(course.price)}
              </span>
            </div>
            <div className="text-[12px] text-[#9494A8] mb-5">
              one-time · lifetime access
            </div>

            {/* Enroll CTA */}
            <button className="w-full bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg py-3.5 text-[15px] font-medium transition-colors mb-4">
              Enroll Now — {priceFormatted(course.price)}
            </button>

            {/* Divider + subscription nudge */}
            <div className="border-t border-[rgba(15,35,72,0.08)] pt-4 mb-5">
              <div className="text-[13px] text-[#5A5A72] mb-1">
                Or subscribe for all courses
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[14px] font-medium text-[#0F2348]">
                  from ₹299
                  <span className="font-normal text-[#9494A8] text-[12px]">/month</span>
                </span>
                <Link
                  href="/pricing"
                  className="font-mono text-[12px] text-[#D4860A] hover:text-[#F0A020] transition-colors"
                >
                  Compare plans →
                </Link>
              </div>
            </div>

            {/* Included */}
            <div className="border-t border-[rgba(15,35,72,0.08)] pt-4 mb-5">
              <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-3">
                What&apos;s included
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Lifetime access",
                  "All exercises",
                  "Mobile friendly",
                  "Certificate on completion",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-[13px] text-[#5A5A72]">
                    <span className="text-[#1A7A4A] flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Refund note */}
            <p className="text-[12px] text-[#9494A8] text-center leading-snug">
              30-day refund if you&apos;re not satisfied. No questions asked.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
