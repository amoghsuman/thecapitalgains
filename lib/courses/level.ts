// `course.tag` is free text in Sanity. Most values are one of the three
// levels, but real outliers exist ("Foundation", "Beginner → Intermediate"),
// and an exact-match filter silently dropped those courses. Everything that
// filters or counts by level goes through mapLevel() instead.

export type Level = "Beginner" | "Intermediate" | "Advanced";

export const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced"];

export function mapLevel(tag: string | null | undefined): Level | null {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes("advanced")) return "Advanced";
  // "Beginner → Intermediate" counts as Intermediate: it is where the course ends up.
  if (t.includes("intermediate")) return "Intermediate";
  if (t.includes("beginner") || t.includes("foundation")) return "Beginner";
  return null;
}

// "~3.5 hrs" → 3.5, "6-8 hours" → 7 (midpoint). null when there is no number.
export function parseDurationHours(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const nums = duration.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length === 0) return null;
  if (nums.length >= 2 && /[-–]|to/.test(duration)) return (nums[0] + nums[1]) / 2;
  return nums[0];
}
