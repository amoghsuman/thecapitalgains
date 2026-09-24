// Deterministic weekly rotation: the same ISO week shows the same item to
// everyone, and every item gets a turn. Pure; safe on server and client.

/** ISO-8601 week number (1–53) of a date, computed in UTC. */
export function isoWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Thursday of the current week decides the year.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
}

/** Index into a list for this week: week number modulo the list length. */
export function weekIndex(length: number, date: Date = new Date()): number {
  if (length <= 0) return 0;
  return isoWeek(date) % length;
}

/** `count` items starting at this week's index, wrapping around; the whole list when it is short. */
export function weekWindow<T>(items: readonly T[], count: number, date: Date = new Date()): T[] {
  if (items.length <= count) return [...items];
  const start = weekIndex(items.length, date);
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(items[(start + i) % items.length]);
  return out;
}
