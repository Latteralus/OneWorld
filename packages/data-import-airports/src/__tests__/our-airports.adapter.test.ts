import { describe, expect, it } from "vitest";
import { ourAirportsAdapter } from "../adapters/our-airports.adapter.js";

describe("ourAirportsAdapter.normalize", () => {
  it("maps a medium_airport row to local_airport tier", () => {
    const record = ourAirportsAdapter.normalize({
      ident: "KBOI",
      type: "medium_airport",
      name: "Boise Air Terminal",
      latitude_deg: 43.5644,
      longitude_deg: -116.2228,
      elevation_ft: 2871,
      iso_country: "US",
      iso_region: "US-ID",
      municipality: "Boise",
      icao_code: "KBOI",
      local_code: "BOI",
    });

    expect(record).toEqual({
      ident: "KBOI",
      icao: "KBOI",
      localCode: "BOI",
      name: "Boise Air Terminal",
      municipality: "Boise",
      regionCode: "US-ID",
      countryCode: "US",
      latitude: 43.5644,
      longitude: -116.2228,
      elevationFt: 2871,
      physicalTier: "local_airport",
      sourceStatus: "active",
      source: "our_airports",
    });
  });

  it("skips rows without a known physical-tier mapping (heliports, closed, etc.)", () => {
    expect(ourAirportsAdapter.normalize({ ident: "US-0001", type: "heliport" })).toBeUndefined();
    expect(ourAirportsAdapter.normalize({ ident: "US-0002", type: "closed" })).toBeUndefined();
  });

  it("skips rows missing required identity or coordinate fields", () => {
    expect(
      ourAirportsAdapter.normalize({ type: "small_airport", latitude_deg: 1, longitude_deg: 1 }),
    ).toBeUndefined();
    expect(
      ourAirportsAdapter.normalize({ ident: "X", type: "small_airport", iso_country: "US" }),
    ).toBeUndefined();
  });
});
