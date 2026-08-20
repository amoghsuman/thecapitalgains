// ─── Entitlements — single source of truth for subscription access ─────────────
//
// Two independent subscription stacks (see CLAUDE.md):
//   Learn:    learner < pro
//   Research: newsletter < essential < premium
//
// A tier in one stack grants NOTHING in the other stack. Course access is
// governed by the Learn stack only; research features by the Research stack only.

export type Tier =
  | "free"
  | "learner"
  | "pro"
  | "newsletter"
  | "essential"
  | "premium";

// Course/lesson gate value authored in Sanity (`course.accessLevel`).
export type CourseAccessLevel = "free" | "learner" | "pro";

// Rank of the Learn access a tier grants. Research tiers grant 0 (no courses).
const LEARN_RANK: Record<string, number> = {
  free: 0,
  learner: 1,
  pro: 2,
};

// Rank required by a course, keyed by its authored accessLevel.
const COURSE_REQUIRED_RANK: Record<string, number> = {
  free: 0,
  learner: 1,
  pro: 2,
};

// Rank of the Research access a tier grants. Learn tiers grant 0.
const RESEARCH_RANK: Record<string, number> = {
  newsletter: 1,
  essential: 2,
  premium: 3,
};

function learnRank(tier: string | null | undefined): number {
  return LEARN_RANK[tier ?? "free"] ?? 0;
}

function researchRank(tier: string | null | undefined): number {
  return RESEARCH_RANK[tier ?? ""] ?? 0;
}

/**
 * Can this tier open a whole course? A course with no authored accessLevel
 * defaults to "learner" (matching the Sanity schema default).
 */
export function canAccessCourse(
  tier: string | null | undefined,
  courseAccessLevel: string | null | undefined = "learner"
): boolean {
  const required = COURSE_REQUIRED_RANK[courseAccessLevel ?? "learner"] ?? 1;
  return learnRank(tier) >= required;
}

/**
 * Can this tier open a specific lesson? Free-preview lessons are always open;
 * otherwise the tier must satisfy the parent course's access level.
 */
export function canAccessLesson(
  tier: string | null | undefined,
  courseAccessLevel: string | null | undefined,
  isFree: boolean | null | undefined
): boolean {
  if (isFree) return true;
  return canAccessCourse(tier, courseAccessLevel);
}

/**
 * Why a lesson is locked — lets the UI tailor the upsell message.
 * Returns null when the lesson is accessible.
 */
export function lessonLockReason(
  tier: string | null | undefined,
  courseAccessLevel: string | null | undefined,
  isFree: boolean | null | undefined
): "needs-subscription" | "needs-pro" | null {
  if (canAccessLesson(tier, courseAccessLevel, isFree)) return null;
  return (courseAccessLevel ?? "learner") === "pro" ? "needs-pro" : "needs-subscription";
}

/** Research-stack gate — for portfolios / research features. */
export function canAccessResearch(
  tier: string | null | undefined,
  requiredTier: "newsletter" | "essential" | "premium" = "newsletter"
): boolean {
  return researchRank(tier) >= researchRank(requiredTier);
}
