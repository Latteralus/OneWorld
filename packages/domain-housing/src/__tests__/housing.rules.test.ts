import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import {
  calculateGraceDeadline,
  calculateNextRentDueAt,
  calculateStatusScore,
  nextTenancyState,
} from "../domain/housing.rules.js";

describe("calculateStatusScore", () => {
  it("places a brand-new player near the bottom of the scale (spec section 6.5/9.3)", () => {
    const result = calculateStatusScore({
      housingStatusScore: 1, // Run-Down Apartment
      vehicleStatusScore: 0, // 1996 Hunda Attord, "low" contribution
      personalLiquidityCents: cents(250_000), // $2,500 starting balance
      hasStableEmployment: false,
    });
    // 1 + 0 + floor(2500/2500)=1 + 0 = 2
    expect(result.score).toBe(2);
    expect(result.label).toBe("Lower Class");
  });

  it("clamps at the top of the scale", () => {
    const result = calculateStatusScore({
      housingStatusScore: 8,
      vehicleStatusScore: 8,
      personalLiquidityCents: cents(10_000_000),
      hasStableEmployment: true,
    });
    expect(result.score).toBe(10);
    expect(result.label).toBe("Elite");
  });

  it("never goes below zero", () => {
    const result = calculateStatusScore({
      housingStatusScore: 0,
      vehicleStatusScore: 0,
      personalLiquidityCents: cents(0),
      hasStableEmployment: false,
    });
    expect(result.score).toBe(0);
    expect(result.label).toBe("Destitute");
  });
});

describe("calculateNextRentDueAt / calculateGraceDeadline", () => {
  it("advances the due date by 7 days", () => {
    const from = new Date("2026-07-28T00:00:00Z");
    expect(calculateNextRentDueAt(from).toISOString()).toBe("2026-08-04T00:00:00.000Z");
  });

  it("advances the grace deadline by the configured grace period (72h)", () => {
    const from = new Date("2026-07-28T00:00:00Z");
    expect(calculateGraceDeadline(from).toISOString()).toBe("2026-07-31T00:00:00.000Z");
  });
});

describe("nextTenancyState", () => {
  const now = new Date("2026-07-28T12:00:00Z");

  it("jumps straight back to ACTIVE on a successful payment from any state (housing failure must always be recoverable)", () => {
    for (const currentState of [
      "ACTIVE",
      "PAYMENT_DUE",
      "OVERDUE_GRACE_PERIOD",
      "EVICTION_PENDING",
    ] as const) {
      const result = nextTenancyState({ currentState, paymentSucceeded: true, now });
      expect(result.nextState).toBe("ACTIVE");
      expect(result.nextGraceDeadlineAt).toBeUndefined();
      expect(result.nextRentDueAt?.toISOString()).toBe(calculateNextRentDueAt(now).toISOString());
    }
  });

  it("moves ACTIVE to PAYMENT_DUE on the first missed charge, setting a grace deadline", () => {
    const result = nextTenancyState({ currentState: "ACTIVE", paymentSucceeded: false, now });
    expect(result.nextState).toBe("PAYMENT_DUE");
    expect(result.nextGraceDeadlineAt?.toISOString()).toBe(calculateGraceDeadline(now).toISOString());
    expect(result.nextRentDueAt).toBeUndefined();
  });

  it("stays PAYMENT_DUE while still unpaid and the grace deadline hasn't elapsed", () => {
    const graceDeadlineAt = new Date(now.getTime() + 60_000); // 1 minute in the future
    const result = nextTenancyState({
      currentState: "PAYMENT_DUE",
      paymentSucceeded: false,
      now,
      graceDeadlineAt,
    });
    expect(result.nextState).toBe("PAYMENT_DUE");
    expect(result.nextGraceDeadlineAt).toBe(graceDeadlineAt);
  });

  it("escalates PAYMENT_DUE to OVERDUE_GRACE_PERIOD once the grace deadline has elapsed", () => {
    const graceDeadlineAt = new Date(now.getTime() - 1_000); // just passed
    const result = nextTenancyState({
      currentState: "PAYMENT_DUE",
      paymentSucceeded: false,
      now,
      graceDeadlineAt,
    });
    expect(result.nextState).toBe("OVERDUE_GRACE_PERIOD");
    expect(result.nextGraceDeadlineAt?.toISOString()).toBe(calculateGraceDeadline(now).toISOString());
  });

  it("escalates OVERDUE_GRACE_PERIOD to EVICTION_PENDING once its own deadline elapses", () => {
    const graceDeadlineAt = new Date(now.getTime() - 1_000);
    const result = nextTenancyState({
      currentState: "OVERDUE_GRACE_PERIOD",
      paymentSucceeded: false,
      now,
      graceDeadlineAt,
    });
    expect(result.nextState).toBe("EVICTION_PENDING");
    expect(result.nextGraceDeadlineAt).toBeUndefined();
  });

  it("evicts into TEMPORARY_LODGING with a fresh weekly due date, never blocking flying", () => {
    const result = nextTenancyState({ currentState: "EVICTION_PENDING", paymentSucceeded: false, now });
    expect(result.nextState).toBe("TEMPORARY_LODGING");
    expect(result.nextRentDueAt?.toISOString()).toBe(calculateNextRentDueAt(now).toISOString());
  });

  it("falls back from TEMPORARY_LODGING to UNHOUSED on non-payment, and stays UNHOUSED", () => {
    const toUnhoused = nextTenancyState({
      currentState: "TEMPORARY_LODGING",
      paymentSucceeded: false,
      now,
    });
    expect(toUnhoused.nextState).toBe("UNHOUSED");

    const staysUnhoused = nextTenancyState({ currentState: "UNHOUSED", paymentSucceeded: false, now });
    expect(staysUnhoused.nextState).toBe("UNHOUSED");
  });
});
