import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getActiveSubscriptions } from "@/lib/subscription"
import { getLearnerStats } from "@/lib/dashboard/stats"
import { getLearnerCatalog } from "@/lib/dashboard/catalog"
import CourseProgressBar from "@/components/dashboard/CourseProgressBar"

const TIER_LABELS: Record<string, string> = {
  free:       "Free",
  learner:    "Learner",
  pro:        "Pro",
  newsletter: "Newsletter",
  essential:  "Essential Research",
  premium:    "Premium Research",
  elite:      "Elite",
}

const TIER_BADGE: Record<string, { bg: string; color: string }> = {
  free:       { bg: "#EDEFEE", color: "#6E6A5F" },
  learner:    { bg: "#EDEFEE", color: "#1B3A2B" },
  pro:        { bg: "#F6F3EA", color: "#6E5620" },
  newsletter: { bg: "#EDEFEE", color: "#1B3A2B" },
  essential:  { bg: "#F6F3EA", color: "#6E5620" },
  premium:    { bg: "#EDEFEE", color: "#1B3A2B" },
  elite:      { bg: "#EDEFEE", color: "#1A1A18" },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Progress numbers come from the one shared function the home widget also
  // uses (via /api/learner-stats), so the two surfaces always agree.
  const [subs, stats] = await Promise.all([
    // Same read and same validity rule as the lesson reader (lib/subscription.ts):
    // one row per stack, Learn and Research shown as separate cards.
    getActiveSubscriptions(supabase, user.id),
    getLearnerCatalog().then((catalog) => getLearnerStats(supabase, user.id, catalog)),
  ])

  const myCourses = stats.courses

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? null

  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  // A lapsed row (status still "active" but period ended) shows as Free here,
  // exactly as the access gates treat it.
  const stackCards = [
    { key: "learn", heading: "Learn subscription", sub: subs.learn, upsell: "Upgrade to unlock every course and lesson." },
    { key: "research", heading: "Research subscription", sub: subs.research, upsell: "Subscribe for the newsletter, model portfolios and research notes." },
  ].map((c) => {
    const isCurrent = c.sub?.isCurrent ?? false
    const tier = isCurrent && c.sub ? c.sub.tier : "free"
    return {
      ...c,
      isCurrent,
      tierLabel: TIER_LABELS[tier] ?? tier,
      badge: TIER_BADGE[tier] ?? TIER_BADGE.free,
      renewalDate: isCurrent && c.sub?.currentPeriodEnd
        ? new Date(c.sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : null,
    }
  })

  const lastCourse = myCourses[0] ?? null
  const resumeHref = lastCourse
    ? lastCourse.lastLessonSlug
      ? `/learn/${lastCourse.slug}/${lastCourse.lastLessonSlug}`
      : `/courses/${lastCourse.slug}`
    : null

  const card: React.CSSProperties = {
    background: "var(--panel)",
    border: "1px solid var(--hairline)",
    borderRadius: 16,
    padding: "24px",
  }

  const label: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--ink-dim)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    marginBottom: 14,
  }

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingTop: 112, paddingBottom: 80, fontFamily: "var(--font-inter)" }}>
      <div className="site-container--narrow">

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            Dashboard
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, margin: 0 }}>
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </h1>
        </div>

        {/* Learn + Research subscriptions, then Account */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

          {stackCards.map((c) => (
          <div key={c.key} style={card}>
            <p style={label}>{c.heading}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                background: c.badge.bg,
                color: c.badge.color,
                padding: "4px 12px",
                borderRadius: 999,
                fontFamily: "var(--font-inter)",
              }}>
                {c.tierLabel}
              </span>
              {c.isCurrent && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: "var(--forest-surface)",
                  color: "var(--forest)",
                  padding: "3px 8px",
                  borderRadius: 999,
                  fontFamily: "var(--font-inter)",
                }}>
                  Active
                </span>
              )}
            </div>
            {c.renewalDate && (
              <p style={{ fontSize: 13, color: "var(--ink-dim)", margin: 0 }}>
                Renews on{" "}
                <strong style={{ color: "var(--ink)" }}>{c.renewalDate}</strong>
              </p>
            )}
            {!c.isCurrent && (
              <>
                <p style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 16 }}>
                  {c.upsell}
                </p>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-block",
                    background: "var(--forest)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "9px 18px",
                    textDecoration: "none",
                  }}
                >
                  View Plans →
                </Link>
              </>
            )}
          </div>
          ))}

          <div style={card}>
            <p style={label}>Account</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
              {user.email}
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", margin: 0 }}>
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Continue Learning */}
        {lastCourse && resumeHref && (
          <div style={{ background: "var(--forest)", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
              Continue Learning
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
              {lastCourse.title}
            </p>
            <div style={{ marginBottom: 20, maxWidth: 440 }}>
              <CourseProgressBar
                completed={lastCourse.completed}
                total={lastCourse.total}
                variant="hero"
              />
            </div>
            <Link
              href={resumeHref}
              style={{
                display: "inline-block",
                background: "var(--gold)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                padding: "10px 20px",
                textDecoration: "none",
              }}
            >
              Resume →
            </Link>
          </div>
        )}

        {/* My Courses */}
        {myCourses.length > 0 ? (
          <div style={{ ...card, marginBottom: 20 }}>
            <p style={label}>My Courses</p>
            <div>
              {myCourses.map((course, idx) => {
                const completed = course.completed
                const totalLessons = course.total
                const isCompleted = course.isCompleted
                const lastAccessed = course.lastAccessedAt
                  ? new Date(course.lastAccessedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })
                  : "not yet"
                const href = course.lastLessonSlug
                  ? `/learn/${course.slug}/${course.lastLessonSlug}`
                  : `/courses/${course.slug}`

                return (
                  <div
                    key={course.slug}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 20,
                      padding: "18px 0",
                      borderTop: idx === 0 ? "none" : "1px solid var(--hairline)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                          {course.title}
                        </p>
                        {isCompleted && (
                          <span style={{
                            display: "inline-block",
                            fontSize: 10,
                            fontWeight: 600,
                            background: "var(--forest-surface)",
                            color: "var(--forest)",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontFamily: "var(--font-inter)",
                          }}>
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Animated Course Progress Bar */}
                      <div style={{ maxWidth: 360, marginBottom: 8 }}>
                        <CourseProgressBar
                          completed={completed}
                          total={totalLessons}
                        />
                      </div>

                      <p style={{ fontSize: 11, color: "var(--ink-dim)", fontFamily: "var(--font-inter)", margin: 0 }}>
                        Last accessed {lastAccessed}
                      </p>
                    </div>
                    <Link
                      href={href}
                      style={{
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--forest)",
                        textDecoration: "none",
                        marginTop: 4,
                      }}
                    >
                      Resume →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: "48px 24px", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              No courses started yet
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 24 }}>
              Pick a course and start building your edge today.
            </p>
            <Link
              href="/courses"
              style={{
                display: "inline-block",
                background: "var(--forest)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                padding: "10px 20px",
                textDecoration: "none",
              }}
            >
              Browse Courses →
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Browse Courses", href: "/courses" },
            { label: "Pricing",        href: "/pricing" },
            { label: "Portfolios",     href: "/portfolios" },
            { label: "Newsletter",     href: "/newsletter" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                background: "var(--panel)",
                border: "1px solid var(--hairline)",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-dim)",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
