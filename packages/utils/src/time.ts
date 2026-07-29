/**
 * UTC time helpers (spec section 5.2). The server clock is authoritative;
 * these helpers exist so idempotency keys and scheduling math are computed
 * consistently everywhere (section 7.3).
 */

/** Returns the current authoritative time. Centralized so it can be mocked in tests/workers. */
export function nowUtc(): Date {
  return new Date();
}

/** Formats a date as `YYYY-MM-DD` in UTC, e.g. for daily-payroll idempotency keys. */
export function formatUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Formats a date as an ISO week key `YYYY-WW` in UTC, e.g. for weekly rent
 * idempotency keys (section 7.3). Uses the ISO-8601 week-numbering rule
 * (weeks start Monday, week 1 contains the year's first Thursday).
 */
export function formatUtcIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // ISO weekday: Monday = 1 ... Sunday = 7
  const isoWeekday = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - isoWeekday);
  const isoYear = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${isoYear}-${String(week).padStart(2, "0")}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

export function isPast(date: Date, referenceNow: Date = nowUtc()): boolean {
  return date.getTime() <= referenceNow.getTime();
}

export function minutesBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60_000;
}
