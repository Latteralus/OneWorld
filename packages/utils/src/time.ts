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

export function addDays(date: Date, days: number): Date {
  return addHours(date, days * 24);
}

export function isPast(date: Date, referenceNow: Date = nowUtc()): boolean {
  return date.getTime() <= referenceNow.getTime();
}

export function minutesBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60_000;
}

/** Minutes to add to a UTC instant to get `timeZone`'s local wall-clock time at that instant. */
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const localWallClockAsUtcMs = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
  return (localWallClockAsUtcMs - instant.getTime()) / 60_000;
}

/**
 * Next instant (strictly after `fromUtc`) at which `timeZone`'s local wall
 * clock reads `localHour:00:00` - DST-aware, so the result shifts by one
 * UTC hour across a DST transition instead of drifting (spec section 8.7:
 * daily payroll fires at a fixed Eastern-Time hour).
 */
export function nextLocalHourInstantUtc(fromUtc: Date, localHour: number, timeZone: string): Date {
  const dayParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fromUtc);
  const value = (type: string) => Number(dayParts.find((p) => p.type === type)?.value ?? "0");

  const resolve = (year: number, monthIndex: number, day: number): Date => {
    const candidateAsUtc = Date.UTC(year, monthIndex, day, localHour, 0, 0, 0);
    const offset = getTimeZoneOffsetMinutes(fromUtc, timeZone);
    let instantMs = candidateAsUtc - offset * 60_000;
    // The candidate instant can land on the other side of a DST transition
    // from `fromUtc`, where the offset differs - re-resolve against it.
    const offsetAtCandidate = getTimeZoneOffsetMinutes(new Date(instantMs), timeZone);
    if (offsetAtCandidate !== offset) {
      instantMs = candidateAsUtc - offsetAtCandidate * 60_000;
    }
    return new Date(instantMs);
  };

  const year = value("year");
  const monthIndex = value("month") - 1;
  const day = value("day");

  let candidate = resolve(year, monthIndex, day);
  if (candidate.getTime() <= fromUtc.getTime()) {
    const nextDay = new Date(Date.UTC(year, monthIndex, day + 1));
    candidate = resolve(nextDay.getUTCFullYear(), nextDay.getUTCMonth(), nextDay.getUTCDate());
  }
  return candidate;
}
