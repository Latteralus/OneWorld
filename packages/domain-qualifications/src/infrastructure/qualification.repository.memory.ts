import type { Cents } from "@oneworld/utils";
import type { PlayerId, QualificationId } from "@oneworld/contracts";
import { asQualificationId } from "@oneworld/contracts";
import type {
  PilotHourTotals,
  PlayerQualification,
  QualificationDefinition,
  QualificationRepository,
  QualificationType,
} from "../domain/qualification.types.js";
import {
  flightHourCategories,
  pilotHourCategoryToColumnValue,
} from "../domain/qualification.rules.js";

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `mem-qualification-${sequence}`;
}

/**
 * In-memory `QualificationRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `qualification.repository.drizzle.ts` and must uphold the same shape.
 */
export class InMemoryQualificationRepository implements QualificationRepository {
  private readonly definitionsByKey = new Map<string, QualificationDefinition>();
  private readonly playerQualifications: PlayerQualification[] = [];
  private readonly hourTotalsByPlayer = new Map<PlayerId, Map<string, number>>();

  async ensureQualificationDefinition(input: {
    key: string;
    name: string;
    type: QualificationType;
    tuitionCents: Cents;
    durationHours: number;
    requiresCheckFlight: boolean;
  }): Promise<QualificationId> {
    const existing = this.definitionsByKey.get(input.key);
    if (existing) {
      return existing.id;
    }

    const definition: QualificationDefinition = {
      id: asQualificationId(nextId()),
      key: input.key,
      name: input.name,
      type: input.type,
      tuitionCents: input.tuitionCents,
      durationHours: input.durationHours,
      requiresCheckFlight: input.requiresCheckFlight,
    };
    this.definitionsByKey.set(input.key, definition);
    return definition.id;
  }

  async insertPlayerQualification(input: {
    playerId: PlayerId;
    qualificationId: QualificationId;
  }): Promise<PlayerQualification> {
    const qualification: PlayerQualification = {
      playerId: input.playerId,
      qualificationId: input.qualificationId,
      awardedAt: new Date(),
    };
    this.playerQualifications.push(qualification);
    return qualification;
  }

  async initializePilotHourTotals(playerId: PlayerId): Promise<PilotHourTotals> {
    const existingCategories = this.hourTotalsByPlayer.get(playerId) ?? new Map<string, number>();

    for (const category of flightHourCategories) {
      const columnValue = pilotHourCategoryToColumnValue[category];
      if (!existingCategories.has(columnValue)) {
        existingCategories.set(columnValue, 0);
      }
    }
    this.hourTotalsByPlayer.set(playerId, existingCategories);

    const totals = {} as Record<keyof PilotHourTotals, number>;
    for (const category of flightHourCategories) {
      totals[category] = existingCategories.get(pilotHourCategoryToColumnValue[category]) ?? 0;
    }
    return totals as PilotHourTotals;
  }

  async findQualification(
    playerId: PlayerId,
    qualificationKey: string,
  ): Promise<PlayerQualification | undefined> {
    const definition = this.definitionsByKey.get(qualificationKey);
    if (!definition) return undefined;
    return this.playerQualifications.find(
      (q) => q.playerId === playerId && q.qualificationId === definition.id,
    );
  }

  definitionCount(): number {
    return this.definitionsByKey.size;
  }
}
