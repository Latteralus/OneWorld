import { describe, expect, it } from "vitest";
import { formatForDisplay, hasDeadlinePassed, serverNow } from "../domain/clock.js";

describe("serverNow", () => {
  it("returns a Date close to the real current time", () => {
    const before = Date.now();
    const value = serverNow().getTime();
    const after = Date.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });
});

describe("formatForDisplay", () => {
  it("formats a UTC instant in the default America/New_York timezone", () => {
    // 2026-07-28T16:00:00Z is noon EDT.
    const formatted = formatForDisplay(new Date("2026-07-28T16:00:00Z"));
    expect(formatted).toContain("2026");
    expect(formatted).toMatch(/12:00/);
  });
});

describe("hasDeadlinePassed", () => {
  it("compares against an explicit reference time rather than the wall clock", () => {
    const reference = new Date("2026-07-28T12:00:00Z");
    expect(hasDeadlinePassed(new Date("2026-07-28T11:00:00Z"), reference)).toBe(true);
    expect(hasDeadlinePassed(new Date("2026-07-28T13:00:00Z"), reference)).toBe(false);
  });
});
