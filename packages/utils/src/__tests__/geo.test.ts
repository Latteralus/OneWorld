import { describe, expect, it } from "vitest";
import { calculateGreatCircleDistanceNm } from "../geo.js";
import { fixtureAirports } from "@oneworld/testing";

describe("calculateGreatCircleDistanceNm", () => {
  it("returns zero for identical points", () => {
    const kboi = fixtureAirports[0];
    expect(calculateGreatCircleDistanceNm(kboi, kboi)).toBeCloseTo(0, 5);
  });

  it("matches the known great-circle distance between KBOI and KSLC (~262 NM)", () => {
    const kboi = fixtureAirports[0];
    const kslc = fixtureAirports[3];
    const distance = calculateGreatCircleDistanceNm(kboi, kslc);
    expect(distance).toBeGreaterThan(255);
    expect(distance).toBeLessThan(270);
  });

  it("is symmetric", () => {
    const kboi = fixtureAirports[0];
    const kmyl = fixtureAirports[1];
    expect(calculateGreatCircleDistanceNm(kboi, kmyl)).toBeCloseTo(
      calculateGreatCircleDistanceNm(kmyl, kboi),
      6,
    );
  });
});
