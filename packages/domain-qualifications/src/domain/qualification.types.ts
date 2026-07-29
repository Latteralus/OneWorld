import type { Cents } from "@oneworld/utils";
import type { FlightSessionId, PlayerId, QualificationId } from "@oneworld/contracts";

/** Verified pilot hour totals by category (spec section 17.1). Minutes internally, hours for display. */
export interface PilotHourTotals {
  total: number;
  pic: number;
  singleEnginePiston: number;
  multiEnginePiston: number;
  turboprop: number;
  jet: number;
  day: number;
  night: number;
  instrument: number;
  crossCountry: number;
}

export type FlightHourCategory = keyof PilotHourTotals;

export interface FlightHourEntry {
  playerId: PlayerId;
  flightSessionId: FlightSessionId;
  category: FlightHourCategory;
  minutes: number;
  idempotencyKey: string;
}

export interface PlayerQualification {
  playerId: PlayerId;
  qualificationId: QualificationId;
  awardedAt: Date;
}

export type QualificationType = "license" | "endorsement" | "rating";

/** A row of the `qualification_definitions` catalog, keyed by the stable `key` from `@oneworld/config`. */
export interface QualificationDefinition {
  id: QualificationId;
  key: string;
  name: string;
  type: QualificationType;
  tuitionCents: Cents;
  durationHours: number;
  requiresCheckFlight: boolean;
}

/** Everything the onboarding flow supplies to grant a player their starting qualification. */
export interface GrantStartingQualificationInput {
  playerId: PlayerId;
  qualificationKey: string;
  qualificationName: string;
  type: QualificationType;
  tuitionCents: Cents;
  durationHours: number;
  requiresCheckFlight: boolean;
}

/**
 * Repository interface owned by this domain (spec section 20.4). Callers
 * compose this alongside other domains' repositories inside one shared
 * `db.transaction`, so every method here accepts whatever `db`/`tx` the
 * caller constructed the repository with.
 */
export interface QualificationRepository {
  ensureQualificationDefinition(input: {
    key: string;
    name: string;
    type: QualificationType;
    tuitionCents: Cents;
    durationHours: number;
    requiresCheckFlight: boolean;
  }): Promise<QualificationId>;
  insertPlayerQualification(input: {
    playerId: PlayerId;
    qualificationId: QualificationId;
  }): Promise<PlayerQualification>;
  initializePilotHourTotals(playerId: PlayerId): Promise<PilotHourTotals>;
  findQualification(
    playerId: PlayerId,
    qualificationKey: string,
  ): Promise<PlayerQualification | undefined>;
}
