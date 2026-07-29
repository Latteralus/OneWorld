import { describe, expect, it } from "vitest";
import { asAircraftId, asAircraftTypeId, asAirportId } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import {
  calculateWetRentalCostCents,
  isAircraftAvailableForReservation,
} from "../domain/aircraft.rules.js";
import type { AircraftInstance } from "../domain/aircraft.types.js";

describe("calculateWetRentalCostCents", () => {
  it("prorates the hourly rate by minutes flown", () => {
    expect(calculateWetRentalCostCents(cents(15_000), 60)).toBe(15_000);
    expect(calculateWetRentalCostCents(cents(15_000), 30)).toBe(7_500);
    expect(calculateWetRentalCostCents(cents(15_000), 90)).toBe(22_500);
  });
});

describe("isAircraftAvailableForReservation", () => {
  const kboi = asAirportId("KBOI");
  const kmyl = asAirportId("KMYL");
  const aircraft: AircraftInstance = {
    id: asAircraftId("aircraft-1"),
    registration: "N12345",
    aircraftTypeId: asAircraftTypeId("type-1"),
    currentAirportId: kboi,
    rentalAvailable: true,
    fuelGallons: 40,
  };

  it("is available when at the origin and not locked", () => {
    expect(isAircraftAvailableForReservation(aircraft, kboi)).toBe(true);
  });

  it("is unavailable at a different airport", () => {
    expect(isAircraftAvailableForReservation(aircraft, kmyl)).toBe(false);
  });

  it("is unavailable when already reserved", () => {
    expect(isAircraftAvailableForReservation({ ...aircraft, rentalAvailable: false }, kboi)).toBe(
      false,
    );
  });
});
