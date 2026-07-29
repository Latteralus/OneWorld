import { describe, expect, it } from "vitest";
import { asAircraftId, asAirportId } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import { buildPassengerJobQuote, calculatePassengerRevenueCents } from "../domain/job.rules.js";

describe("calculatePassengerRevenueCents", () => {
  it("charges $1.25 per passenger per NM (spec section 14.3)", () => {
    // 3 passengers * 100 NM * $1.25 = $375.00
    expect(calculatePassengerRevenueCents(3, 100)).toBe(37_500);
  });

  it("floors each passenger's fare at the configured minimum ($75)", () => {
    // 1 passenger * 10 NM * $1.25 = $12.50, below the $75 minimum.
    expect(calculatePassengerRevenueCents(1, 10)).toBe(7_500);
  });

  it("rejects a non-positive passenger count", () => {
    expect(() => calculatePassengerRevenueCents(0, 100)).toThrow(RangeError);
  });
});

describe("buildPassengerJobQuote", () => {
  it("computes gross revenue, total costs, and net profit", () => {
    const quote = buildPassengerJobQuote({
      originAirportId: asAirportId("origin"),
      destinationAirportId: asAirportId("dest"),
      distanceNm: 100,
      passengerCount: 2,
      aircraftId: asAircraftId("aircraft-1"),
      estimatedRentalCostCents: cents(10_000),
      estimatedFuelCostCents: cents(5_000),
      estimatedAirportFeesCents: cents(1_000),
    });

    expect(quote.grossRevenueCents).toBe(25_000); // 2 * 100 * 125
    expect(quote.estimatedCostsCents).toBe(16_000);
    expect(quote.estimatedNetProfitCents).toBe(9_000);
  });
});
