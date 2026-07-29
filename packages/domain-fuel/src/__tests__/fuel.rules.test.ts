import { describe, expect, it } from "vitest";
import { asAirportId } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import {
  calculateFuelPurchaseCostCents,
  hasSufficientSupply,
  isQuoteExpired,
} from "../domain/fuel.rules.js";
import { SystemFuelProvider } from "../infrastructure/system-fuel-provider.js";
import type { FuelQuote } from "../domain/fuel.types.js";

describe("calculateFuelPurchaseCostCents", () => {
  it("multiplies unit price by gallons purchased", () => {
    const quote: FuelQuote = {
      airportId: asAirportId("KBOI"),
      fuelType: "avgas_100ll",
      unitPriceCentsPerGallon: cents(650),
      availableGallons: null,
      providerId: "system",
      quoteExpiresAt: new Date(),
    };
    expect(calculateFuelPurchaseCostCents(quote, 10)).toBe(6_500);
    expect(calculateFuelPurchaseCostCents(quote, 5.5)).toBe(3_575);
  });
});

describe("isQuoteExpired / hasSufficientSupply", () => {
  const baseQuote: FuelQuote = {
    airportId: asAirportId("KBOI"),
    fuelType: "avgas_100ll",
    unitPriceCentsPerGallon: cents(650),
    availableGallons: 100,
    providerId: "system",
    quoteExpiresAt: new Date("2026-07-28T12:00:00Z"),
  };

  it("detects expiration relative to a reference time", () => {
    expect(isQuoteExpired(baseQuote, new Date("2026-07-28T12:00:01Z"))).toBe(true);
    expect(isQuoteExpired(baseQuote, new Date("2026-07-28T11:59:59Z"))).toBe(false);
  });

  it("treats null availableGallons as unlimited supply (spec section 19.1)", () => {
    expect(hasSufficientSupply({ ...baseQuote, availableGallons: null }, 1_000_000)).toBe(true);
  });

  it("checks bounded supply", () => {
    expect(hasSufficientSupply(baseQuote, 100)).toBe(true);
    expect(hasSufficientSupply(baseQuote, 101)).toBe(false);
  });
});

describe("SystemFuelProvider", () => {
  it("quotes the configured price for a known airport, falling back to default", async () => {
    const provider = new SystemFuelProvider({ KBOI: 650, default: 700 });
    const kboiQuote = await provider.getQuote(asAirportId("KBOI"), "avgas_100ll");
    expect(kboiQuote.unitPriceCentsPerGallon).toBe(650);

    const otherQuote = await provider.getQuote(asAirportId("KMYL"), "avgas_100ll");
    expect(otherQuote.unitPriceCentsPerGallon).toBe(700);
  });
});
