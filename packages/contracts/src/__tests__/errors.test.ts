import { describe, expect, it } from "vitest";
import { DomainError } from "../errors.js";

describe("DomainError", () => {
  it("carries a stable code and optional structured details", () => {
    const error = new DomainError("INSUFFICIENT_FUNDS", "Company balance too low", {
      requiredCents: 5000,
      availableCents: 1200,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("INSUFFICIENT_FUNDS");
    expect(error.details).toEqual({ requiredCents: 5000, availableCents: 1200 });
  });
});
