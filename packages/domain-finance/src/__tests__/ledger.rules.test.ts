import { describe, expect, it } from "vitest";
import { buildIdempotencyKey } from "../domain/ledger.rules.js";

describe("buildIdempotencyKey.startingFunds", () => {
  it("is stable and distinct per player/account type", () => {
    expect(buildIdempotencyKey.startingFunds("player-1", "personal")).toBe(
      "onboarding:player-1:starting-funds:personal",
    );
    expect(buildIdempotencyKey.startingFunds("player-1", "company")).not.toBe(
      buildIdempotencyKey.startingFunds("player-1", "personal"),
    );
  });
});
