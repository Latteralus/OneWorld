import { describe, expect, it } from "vitest";
import { cents } from "@oneworld/utils";
import type { PlayerId } from "@oneworld/contracts";
import { asPlayerId } from "@oneworld/contracts";
import { QualificationService } from "../application/qualification.service.js";
import { InMemoryQualificationRepository } from "../infrastructure/qualification.repository.memory.js";
import { flightHourCategories } from "../domain/qualification.rules.js";

function makeService() {
  const repo = new InMemoryQualificationRepository();
  return { repo, service: new QualificationService(repo) };
}

const pplInput = {
  qualificationKey: "PPL",
  qualificationName: "Private Pilot License",
  type: "license" as const,
  tuitionCents: cents(0),
  durationHours: 0,
  requiresCheckFlight: false,
};

describe("QualificationService.grantStartingQualification", () => {
  it("grants the PPL and initializes all ten hour categories at zero", async () => {
    const { service } = makeService();
    const playerId: PlayerId = asPlayerId("player-1");

    const { qualification, hourTotals } = await service.grantStartingQualification({
      playerId,
      ...pplInput,
    });

    expect(qualification.playerId).toBe(playerId);
    expect(qualification.qualificationId).toBeTruthy();

    expect(Object.keys(hourTotals)).toHaveLength(flightHourCategories.length);
    for (const category of flightHourCategories) {
      expect(hourTotals[category]).toBe(0);
    }
  });

  it("creates the PPL definition only once even if ensured twice at the repository level", async () => {
    const { repo } = makeService();

    const firstId = await repo.ensureQualificationDefinition({
      key: "PPL",
      name: "Private Pilot License",
      type: "license",
      tuitionCents: cents(0),
      durationHours: 0,
      requiresCheckFlight: false,
    });
    const secondId = await repo.ensureQualificationDefinition({
      key: "PPL",
      name: "Private Pilot License",
      type: "license",
      tuitionCents: cents(0),
      durationHours: 0,
      requiresCheckFlight: false,
    });

    expect(secondId).toBe(firstId);
    expect(repo.definitionCount()).toBe(1);
  });

  it("grants a qualification that references the ensured definition", async () => {
    const { service, repo } = makeService();
    const playerId: PlayerId = asPlayerId("player-2");

    const { qualification } = await service.grantStartingQualification({
      playerId,
      ...pplInput,
    });

    const found = await repo.findQualification(playerId, "PPL");
    expect(found).toEqual(qualification);
  });
});
