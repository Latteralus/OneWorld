import { describe, expect, it } from "vitest";
import { isPreviewEligible } from "../preview.js";
import type { CanonicalAirportRecord } from "../types.js";

function record(overrides: Partial<CanonicalAirportRecord> = {}): CanonicalAirportRecord {
  return {
    ident: "KBOI",
    name: "Boise Air Terminal",
    countryCode: "US",
    latitude: 43.5644,
    longitude: -116.2228,
    physicalTier: "local_airport",
    sourceStatus: "active",
    source: "our_airports",
    ...overrides,
  };
}

describe("isPreviewEligible", () => {
  it("enables active U.S. airports (spec section 35 open item #2, resolved placeholder)", () => {
    expect(isPreviewEligible(record())).toBe(true);
  });

  it("excludes non-U.S. airports", () => {
    expect(isPreviewEligible(record({ countryCode: "GB" }))).toBe(false);
  });

  it("excludes closed/unverified airports even in the U.S.", () => {
    expect(isPreviewEligible(record({ sourceStatus: "closed" }))).toBe(false);
    expect(isPreviewEligible(record({ sourceStatus: "unverified" }))).toBe(false);
  });
});
