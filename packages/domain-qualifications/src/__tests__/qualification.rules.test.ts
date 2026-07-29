import { describe, expect, it } from "vitest";
import {
  applyHourIncrements,
  buildFlightHourIdempotencyKey,
} from "../domain/qualification.rules.js";
import type { PilotHourTotals } from "../domain/qualification.types.js";

const zeroHours: PilotHourTotals = {
  total: 0,
  pic: 0,
  singleEnginePiston: 0,
  multiEnginePiston: 0,
  turboprop: 0,
  jet: 0,
  day: 0,
  night: 0,
  instrument: 0,
  crossCountry: 0,
};

describe("buildFlightHourIdempotencyKey", () => {
  it("is deterministic per flight and category (spec section 7.3)", () => {
    expect(buildFlightHourIdempotencyKey("flight-1", "total")).toBe("flight:flight-1:hours:total");
    expect(buildFlightHourIdempotencyKey("flight-1", "pic")).toBe("flight:flight-1:hours:pic");
  });
});

describe("applyHourIncrements", () => {
  it("adds minutes to only the specified categories", () => {
    const result = applyHourIncrements(zeroHours, { total: 90, pic: 90, singleEnginePiston: 90 });
    expect(result.total).toBe(90);
    expect(result.pic).toBe(90);
    expect(result.singleEnginePiston).toBe(90);
    expect(result.jet).toBe(0);
  });

  it("does not mutate the input totals", () => {
    const result = applyHourIncrements(zeroHours, { total: 30 });
    expect(zeroHours.total).toBe(0);
    expect(result).not.toBe(zeroHours);
  });
});
