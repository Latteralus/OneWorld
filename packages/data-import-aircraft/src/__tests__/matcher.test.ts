import { describe, expect, it } from "vitest";
import { matchSimulatorAircraft } from "../matcher.js";

describe("matchSimulatorAircraft", () => {
  const knownMappings = [
    {
      simulatorTitle: "Cessna 172 Skyhawk Asobo",
      canonicalIcaoType: "C172",
      status: "official" as const,
    },
  ];

  it("returns the known mapping on an exact (case-insensitive) title match", () => {
    const result = matchSimulatorAircraft(
      { simulatorTitle: "cessna 172 skyhawk asobo" },
      knownMappings,
    );
    expect(result).toEqual(knownMappings[0]);
  });

  it("falls back to an automatically-inferred match from an ICAO type hint", () => {
    const result = matchSimulatorAircraft(
      { simulatorTitle: "Some Community C152 Mod", icaoTypeHint: "C152" },
      knownMappings,
    );
    expect(result.status).toBe("automatically_inferred");
    expect(result.canonicalIcaoType).toBe("C152");
  });

  it("marks anything unmatched as unsupported (spec section 16.1: detection does not equal approval)", () => {
    const result = matchSimulatorAircraft(
      { simulatorTitle: "Unknown Homebuilt Mod" },
      knownMappings,
    );
    expect(result.status).toBe("unsupported");
  });
});
