import { describe, expect, it } from "vitest";
import {
  addCents,
  allocateCents,
  cents,
  dollarsToCents,
  formatUsd,
  scaleCents,
  subtractCents,
} from "../money.js";

describe("money", () => {
  it("converts dollars to cents without float drift", () => {
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(0.1 + 0.2)).toBe(30); // classic float trap: 0.30000000000000004
  });

  it("adds and subtracts cents", () => {
    expect(addCents(cents(100), cents(250), cents(-50))).toBe(300);
    expect(subtractCents(cents(500), cents(125))).toBe(375);
  });

  it("scales cents using an exact rational factor", () => {
    // $1.25 per passenger-NM * 3 passengers * 42 NM = 15,750 cents = $157.50
    expect(scaleCents(cents(125), 3 * 42)).toBe(15_750);
  });

  it("allocates cents so the parts always sum back to the original amount", () => {
    const shares = allocateCents(cents(1000), 3);
    expect(shares).toEqual([334, 333, 333]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it("rejects non-integer cent values", () => {
    expect(() => cents(10.5)).toThrow(TypeError);
  });

  it("formats cents as USD", () => {
    expect(formatUsd(cents(250_000))).toBe("$2,500.00");
  });
});
