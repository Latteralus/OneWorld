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
