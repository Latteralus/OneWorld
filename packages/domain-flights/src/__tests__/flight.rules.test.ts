import { describe, expect, it } from "vitest";
import { asAircraftId, asFlightSessionId, asPlayerId } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import { calculateFlightSettlement } from "../domain/flight.rules.js";

describe("calculateFlightSettlement", () => {
  it("nets revenue against all three cost components", () => {
    const settlement = calculateFlightSettlement({
      flightSessionId: asFlightSessionId("flight-1"),
      playerId: asPlayerId("player-1"),
      aircraftId: asAircraftId("aircraft-1"),
      grossRevenueCents: cents(37_500),
      rentalCostCents: cents(15_000),
      fuelCostCents: cents(6_000),
      airportFeesCents: cents(1_500),
      verifiedMinutes: 90,
    });

    expect(settlement.totalCostsCents).toBe(22_500);
    expect(settlement.netCompanyIncomeCents).toBe(15_000);
    expect(settlement.awardedMinutes).toBe(90);
  });

  it("allows a negative net income when costs exceed revenue", () => {
    const settlement = calculateFlightSettlement({
      flightSessionId: asFlightSessionId("flight-2"),
      playerId: asPlayerId("player-1"),
      aircraftId: asAircraftId("aircraft-1"),
      grossRevenueCents: cents(5_000),
      rentalCostCents: cents(15_000),
      fuelCostCents: cents(6_000),
      airportFeesCents: cents(1_500),
      verifiedMinutes: 60,
    });

    expect(settlement.netCompanyIncomeCents).toBe(-17_500);
  });
});
