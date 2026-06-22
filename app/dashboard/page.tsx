import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  learner: "Learner",
  pro: "Pro",
  newsletter: "Newsletter",
  essential: "Essential Research",
  premium: "Premium Research",
  elite: "Elite",
};

const TIER_COLORS: Record<string, string> = {
  free: "text-[#8B7BAB] bg-[#F5F3FF]",
  learner: "text-[#1A7A4A] bg-[#E8F5EE]",
  pro: "text-[#D4860A] bg-[#FDF3E3]",
  newsletter: "text-[#1A7A4A] bg-[#E8F5EE]",
  essential: "text-[#D4860A] bg-[#FDF3E3]",
  premium: "text-[#7C3AED] bg-[#F5F3FF]",
  elite: "text-[#1C0F3F] bg-[#EDE9FF]",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  const user = session.user;

  // Fetch subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end, current_period_start, razorpay_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  // Fetch course enrollments with progress
  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("course_slug, last_lesson_slug, last_accessed_at, completed_at")
    .eq("user_id", user.id)
    .order("last_accessed_at", { ascending: false });

  // Fetch lesson progress counts per course
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("course_slug, lesson_slug")
    .eq("user_id", user.id);

  // Group progress by course
  const progressByCourse: Record<string, number> = {};
  for (const row of progressRows ?? []) {
    progressByCourse[row.course_slug] = (progressByCourse[row.course_slug] ?? 0) + 1;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const tier = sub?.tier ?? "free";
  const tierLabel = TIER_LABELS[tier] ?? tier;
  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.free;

  // Last accessed course for "Continue Learning"
  const lastEnrollment = enrollments?.[0];

  return (
    <div className="bg-[#FAFAF7] min-h-screen pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8B7BAB] mb-2">
            Dashboard
          </p>
          <h1 className="text-[32px] font-bold text-[#1C0F3F] leading-tight">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}.
          </h1>
        </div>

        {/* Top row: Subscription + Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Subscription card */}
          <div className="bg-white border border-[rgba(124,58,237,0.12)] rounded-2xl p-6">
            <p className="font-mono text-[10px] text-[#8B7BAB] tracking-widest uppercase mb-3">
              Subscription
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className={`font-mono text-[12px] font-bold px-3 py-1 rounded-full ${tierColor}`}>
                {tierLabel}
              </span>
              {sub && (
                <span className="font-mono text-[11px] text-[#1A7A4A] bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            {renewalDate && (
              <p className="text-[13px] text-[#4B3F6B]">
                Renews on <span className="font-semibold text-[#1C0F3F]">{renewalDate}</span>
              </p>
            )}
            {!sub && (
              <div>
                <p className="text-[13px] text-[#4B3F6B] mb-3">
                  You are on the free plan. Subscribe to unlock all courses.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block bg-[#D4860A] hover:bg-[#B8720A] text-white text-[13px] font-semibold rounded-lg px-4 py-2 transition-colors"
                >
                  View Plans →
                </Link>
              </div>
            )}
          </div>

          {/* Account card */}
          <div className="bg-white border border-[rgba(124,58,237,0.12)] rounded-2xl p-6">
            <p className="font-mono text-[10px] text-[#8B7BAB] tracking-widest uppercase mb-3">
              Account
            </p>
            <p className="text-[15px] font-semibold text-[#1C0F3F] mb-1">{user.email}</p>
            <p className="text-[13px] text-[#8B7BAB]">Member since {memberSince}</p>
          </div>
        </div>

        {/* Continue Learning */}
        {lastEnrollment && (
          <div className="bg-[#1C0F3F] rounded-2xl p-6 mb-6">
            <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase mb-2">
              Continue Learning
            </p>
            <p className="text-[18px] font-bold text-white mb-1 capitalize">
              {lastEnrollment.course_slug.replace(/-/g, " ")}
            </p>
            <p className="text-[13px] text-white/50 mb-4">
              {progressByCourse[lastEnrollment.course_slug] ?? 0} lessons completed
            </p>
            <Link
              href={`/learn/${lastEnrollment.course_slug}/${lastEnrollment.last_lesson_slug}`}
              className="inline-block bg-[#D4860A] hover:bg-[#B8720A] text-white text-[13px] font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              Resume →
            </Link>
          </div>
        )}

        {/* Course Progress */}
        {enrollments && enrollments.length > 0 ? (
          <div className="bg-white border border-[rgba(124,58,237,0.12)] rounded-2xl p-6 mb-6">
            <p className="font-mono text-[10px] text-[#8B7BAB] tracking-widest uppercase mb-4">
              My Courses
            </p>
            <div className="flex flex-col divide-y divide-[rgba(124,58,237,0.08)]">
              {enrollments.map((enr) => {
                const completed = progressByCourse[enr.course_slug] ?? 0;
                const isCompleted = !!enr.completed_at;
                const lastAccessed = new Date(enr.last_accessed_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });

                return (
                  <div key={enr.course_slug} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1C0F3F] capitalize mb-1">
                          {enr.course_slug.replace(/-/g, " ")}
                        </p>
                        <p className="font-mono text-[11px] text-[#8B7BAB]">
                          {completed} lessons completed · Last accessed {lastAccessed}
                        </p>
                        {isCompleted && (
                          <span className="inline-block mt-1 font-mono text-[10px] text-[#1A7A4A] bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/learn/${enr.course_slug}/${enr.last_lesson_slug}`}
                        className="flex-shrink-0 text-[13px] font-semibold text-[#7C3AED] hover:text-[#1C0F3F] transition-colors"
                      >
                        Resume →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[rgba(124,58,237,0.12)] rounded-2xl p-8 mb-6 text-center">
            <p className="text-[15px] font-semibold text-[#1C0F3F] mb-2">No courses started yet</p>
            <p className="text-[13px] text-[#8B7BAB] mb-4">
              Pick a course and start learning today.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-[#1C0F3F] hover:bg-[#2D1B69] text-white text-[13px] font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              Browse Courses →
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Browse Courses", href: "/courses" },
            { label: "Pricing", href: "/pricing" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-[rgba(124,58,237,0.12)] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#4B3F6B] hover:text-[#1C0F3F] hover:border-[rgba(124,58,237,0.3)] transition-all text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}