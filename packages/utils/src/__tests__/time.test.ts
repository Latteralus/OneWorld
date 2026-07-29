import { describe, expect, it } from "vitest";
import {
  addDays,
  addHours,
  addMinutes,
  formatUtcDateKey,
  formatUtcIsoWeekKey,
  isPast,
  minutesBetween,
  nextLocalHourInstantUtc,
} from "../time.js";

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

  it("adds days", () => {
    const start = new Date("2026-07-28T00:00:00Z");
    expect(addDays(start, 7).toISOString()).toBe("2026-08-04T00:00:00.000Z");
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

  describe("nextLocalHourInstantUtc", () => {
    const tz = "America/New_York";

    it("resolves 9am Eastern to 14:00 UTC in standard time (EST, UTC-5)", () => {
      const from = new Date("2026-01-15T12:00:00Z"); // 07:00 EST
      expect(nextLocalHourInstantUtc(from, 9, tz).toISOString()).toBe("2026-01-15T14:00:00.000Z");
    });

    it("resolves 9am Eastern to 13:00 UTC in daylight time (EDT, UTC-4)", () => {
      const from = new Date("2026-07-15T12:00:00Z"); // 08:00 EDT
      expect(nextLocalHourInstantUtc(from, 9, tz).toISOString()).toBe("2026-07-15T13:00:00.000Z");
    });

    it("rolls over to the next day once the local hour has already passed", () => {
      const from = new Date("2026-01-15T15:00:00Z"); // 10:00 EST, past 9am
      expect(nextLocalHourInstantUtc(from, 9, tz).toISOString()).toBe("2026-01-16T14:00:00.000Z");
    });

    it("shifts the UTC instant by one hour across the spring-forward transition (2026-03-08)", () => {
      const beforeTransition = new Date("2026-03-07T12:00:00Z"); // 07:00 EST
      expect(nextLocalHourInstantUtc(beforeTransition, 9, tz).toISOString()).toBe(
        "2026-03-07T14:00:00.000Z",
      );

      const afterTransition = new Date("2026-03-08T12:00:00Z"); // 08:00 EDT
      expect(nextLocalHourInstantUtc(afterTransition, 9, tz).toISOString()).toBe(
        "2026-03-08T13:00:00.000Z",
      );
    });

    it("shifts the UTC instant by one hour across the fall-back transition (2026-11-01)", () => {
      const beforeTransition = new Date("2026-10-31T12:00:00Z"); // 08:00 EDT
      expect(nextLocalHourInstantUtc(beforeTransition, 9, tz).toISOString()).toBe(
        "2026-10-31T13:00:00.000Z",
      );

      const afterTransition = new Date("2026-11-01T12:00:00Z"); // 07:00 EST
      expect(nextLocalHourInstantUtc(afterTransition, 9, tz).toISOString()).toBe(
        "2026-11-01T14:00:00.000Z",
      );
    });
  });
});
