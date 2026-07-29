import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import type { CityId, PlayerId } from "@oneworld/contracts";
import { HousingService } from "../application/housing.service.js";
import { InMemoryHousingRepository } from "../infrastructure/housing.repository.memory.js";

function makeService() {
  const repo = new InMemoryHousingRepository();
  return { repo, service: new HousingService(repo) };
}

describe("HousingService.grantStartingResidence", () => {
  it("grants an active residence with the run-down-apartment terms (spec section 6.5)", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    const cityId = "city-1" as CityId;
    const nextRentDueAt = new Date("2026-08-04T00:00:00Z");

    const residence = await service.grantStartingResidence({
      playerId,
      cityId,
      residenceTypeKey: "run_down_apartment",
      residenceTypeName: "Run-Down Apartment",
      weeklyRentCents: cents(80_000),
      quality: "very_poor",
      parkingCapacity: 1,
      statusScore: 1,
      nextRentDueAt,
    });

    expect(residence.playerId).toBe(playerId);
    expect(residence.cityId).toBe(cityId);
    expect(residence.residenceTypeKey).toBe("run_down_apartment");
    expect(residence.tenancyStatus).toBe("ACTIVE");
    expect(residence.nextRentDueAt).toBe(nextRentDueAt);
  });

  it("does not create a duplicate residence type row for repeated grants of the same key", async () => {
    const { repo } = makeService();

    const firstId = await repo.ensureResidenceType({
      key: "run_down_apartment",
      name: "Run-Down Apartment",
      quality: "very_poor",
      weeklyRentCents: cents(80_000),
      parkingCapacity: 1,
      statusScore: 1,
    });
    const secondId = await repo.ensureResidenceType({
      key: "run_down_apartment",
      name: "Run-Down Apartment",
      quality: "very_poor",
      weeklyRentCents: cents(80_000),
      parkingCapacity: 1,
      statusScore: 1,
    });

    expect(secondId).toBe(firstId);
    expect(repo.residenceTypeCount()).toBe(1);
  });
});

describe("HousingService.getActiveResidence", () => {
  it("returns undefined when the player has no residence yet", async () => {
    const { service } = makeService();
    await expect(service.getActiveResidence("player-1" as PlayerId)).resolves.toBeUndefined();
  });

  it("returns the granted residence", async () => {
    const { service } = makeService();
    const playerId = "player-1" as PlayerId;
    await service.grantStartingResidence({
      playerId,
      cityId: "city-1" as CityId,
      residenceTypeKey: "run_down_apartment",
      residenceTypeName: "Run-Down Apartment",
      weeklyRentCents: cents(80_000),
      quality: "very_poor",
      parkingCapacity: 1,
      statusScore: 1,
      nextRentDueAt: new Date("2026-08-04T00:00:00Z"),
    });

    const residence = await service.getActiveResidence(playerId);
    expect(residence?.residenceTypeKey).toBe("run_down_apartment");
    expect(residence?.weeklyRentCents).toBe(cents(80_000));
  });
});

describe("HousingService rent sweep (listDueForRentSweep / applyRentOutcome)", () => {
  async function grantResidence(service: HousingService, nextRentDueAt: Date) {
    return service.grantStartingResidence({
      playerId: "player-1" as PlayerId,
      cityId: "city-1" as CityId,
      residenceTypeKey: "run_down_apartment",
      residenceTypeName: "Run-Down Apartment",
      weeklyRentCents: cents(80_000),
      quality: "very_poor",
      parkingCapacity: 1,
      statusScore: 1,
      nextRentDueAt,
    });
  }

  it("does not surface a residence before its due date", async () => {
    const { service } = makeService();
    await grantResidence(service, new Date("2026-08-04T00:00:00Z"));
    const due = await service.listDueForRentSweep(new Date("2026-08-03T00:00:00Z"));
    expect(due).toHaveLength(0);
  });

  it("keeps ACTIVE and advances the due date 7 days on a successful charge", async () => {
    const { service } = makeService();
    const dueAt = new Date("2026-08-04T00:00:00Z");
    const residence = await grantResidence(service, dueAt);

    const [due] = await service.listDueForRentSweep(dueAt);
    expect(due?.id).toBe(residence.id);

    const updated = await service.applyRentOutcome({ residence: due!, now: dueAt, paymentSucceeded: true });
    expect(updated.tenancyStatus).toBe("ACTIVE");
    expect(updated.nextRentDueAt.toISOString()).toBe("2026-08-11T00:00:00.000Z");
    expect(updated.graceDeadlineAt).toBeUndefined();
  });

  it("moves to PAYMENT_DUE, keeping the same due date, on a failed charge - and recovers on the next successful sweep", async () => {
    const { service } = makeService();
    const dueAt = new Date("2026-08-04T00:00:00Z");
    const residence = await grantResidence(service, dueAt);

    const afterMiss = await service.applyRentOutcome({ residence, now: dueAt, paymentSucceeded: false });
    expect(afterMiss.tenancyStatus).toBe("PAYMENT_DUE");
    expect(afterMiss.nextRentDueAt).toBe(dueAt);
    expect(afterMiss.graceDeadlineAt).toBeDefined();

    // Still surfaced by the sweep every pass while unpaid (due date hasn't moved).
    const stillDue = await service.listDueForRentSweep(dueAt);
    expect(stillDue).toHaveLength(1);
    expect(stillDue[0]?.tenancyStatus).toBe("PAYMENT_DUE");

    const recovered = await service.applyRentOutcome({
      residence: stillDue[0]!,
      now: new Date(dueAt.getTime() + 60_000),
      paymentSucceeded: true,
    });
    expect(recovered.tenancyStatus).toBe("ACTIVE");
    expect(recovered.graceDeadlineAt).toBeUndefined();
  });

  it("never permanently removes a residence from the sweep before UNHOUSED - housing failure must stay recoverable", async () => {
    const { service } = makeService();
    const dueAt = new Date("2026-08-04T00:00:00Z");
    let residence = await grantResidence(service, dueAt);

    // ACTIVE -> PAYMENT_DUE -> OVERDUE_GRACE_PERIOD -> EVICTION_PENDING -> TEMPORARY_LODGING -> UNHOUSED,
    // missing every charge along the way.
    let now = dueAt;
    for (let i = 0; i < 5; i += 1) {
      now = new Date(now.getTime() + 73 * 60 * 60_000); // past each 72h grace window
      residence = await service.applyRentOutcome({ residence, now, paymentSucceeded: false });
    }
    expect(residence.tenancyStatus).toBe("UNHOUSED");
  });
});
