import { describe, expect, it } from "vitest";
import { addHours, addMinutes, formatUtcDateKey, formatUtcIsoWeekKey, isPast, minutesBetween } from "../time.js";

describe("time", () => {
  it("formats a UTC date key", () => {
    expect(formatUtcDateKey(new Date("2026-07-28T23:59:00Z"))).toBe("2026-07-28");
  });

  it("formats an ISO week key", () => {
    // 2026-07-28 is a Tuesday in ISO week 31.
    expect(formatUtcIsoWeekKey(new Date("2026-07-28T00:00:00Z"))).toBe("2026-31");
  });

  it("produces the same week key for every day in the same ISO week", () => {
    const monday = formatUtcIsoWeekKey(new Date("2026-07-27T00:00:00Z"));
    const sunday = formatUtcIsoWeekKey(new Date("2026-08-02T23:00:00Z"));
    expect(monday).toBe(sunday);
  });

  it("adds minutes and hours", () => {
    const start = new Date("2026-07-28T00:00:00Z");
    expect(addMinutes(start, 90).toISOString()).toBe("2026-07-28T01:30:00.000Z");
    expect(addHours(start, 2).toISOString()).toBe("2026-07-28T02:00:00.000Z");
  });

  it("computes minutes between two timestamps", () => {
    const a = new Date("2026-07-28T00:00:00Z");
    const b = new Date("2026-07-28T00:20:00Z");
    expect(minutesBetween(a, b)).toBe(20);
  });

  it("determines whether a timestamp is in the past relative to a reference", () => {
    const reference = new Date("2026-07-28T12:00:00Z");
    expect(isPast(new Date("2026-07-28T11:00:00Z"), reference)).toBe(true);
    expect(isPast(new Date("2026-07-28T13:00:00Z"), reference)).toBe(false);
  });
});
