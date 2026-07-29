import { describe, expect, it } from "vitest";
import {
  calculateApplicationDecisionDelayMinutes,
  calculateNextPayrollAt,
  canHoldAdditionalJob,
  isPayrollDue,
  resolveApplicationAcceptance,
} from "../domain/employment.rules.js";

describe("canHoldAdditionalJob", () => {
  it("enforces the one-job rule (spec section 8.2)", () => {
    expect(canHoldAdditionalJob(0)).toBe(true);
    expect(canHoldAdditionalJob(1)).toBe(false);
  });
});

describe("calculateApplicationDecisionDelayMinutes", () => {
  it("stays within the configured 2-6 hour window", () => {
    expect(calculateApplicationDecisionDelayMinutes(0)).toBe(120);
    expect(calculateApplicationDecisionDelayMinutes(0.5)).toBe(240);
    expect(calculateApplicationDecisionDelayMinutes(0.999)).toBeCloseTo(360, 0);
  });
});

describe("resolveApplicationAcceptance", () => {
  it("accepts very-high-availability jobs at a high rate", () => {
    expect(resolveApplicationAcceptance("very_high", 0.5)).toBe(true);
    expect(resolveApplicationAcceptance("very_high", 0.99)).toBe(false);
  });

  it("rejects low-availability jobs above their acceptance threshold", () => {
    expect(resolveApplicationAcceptance("low", 0.9)).toBe(false);
  });
});

describe("calculateNextPayrollAt / isPayrollDue", () => {
  it("rolls to the next day once the payroll hour has passed", () => {
    const afterPayroll = new Date("2026-07-28T15:00:00Z"); // payroll hour default 9
    const next = calculateNextPayrollAt(afterPayroll);
    expect(next.toISOString()).toBe("2026-07-29T09:00:00.000Z");
  });

  it("uses today's payroll hour if it hasn't passed yet", () => {
    const beforePayroll = new Date("2026-07-28T05:00:00Z");
    const next = calculateNextPayrollAt(beforePayroll);
    expect(next.toISOString()).toBe("2026-07-28T09:00:00.000Z");
  });

  it("is due once the reference time reaches nextPayAt", () => {
    const nextPayAt = new Date("2026-07-28T09:00:00Z");
    expect(isPayrollDue(nextPayAt, new Date("2026-07-28T09:00:00Z"))).toBe(true);
    expect(isPayrollDue(nextPayAt, new Date("2026-07-28T08:59:00Z"))).toBe(false);
  });
});
