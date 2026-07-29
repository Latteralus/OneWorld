import { addCents, cents, type Cents } from "@oneworld/utils";

/** Pure balance math - the only place this calculation should exist (spec section 21.4). */
export function computeBalanceAfter(currentBalanceCents: Cents, amountCents: Cents): Cents {
  return addCents(currentBalanceCents, amountCents);
}

/**
 * Deterministic idempotency-key builders matching the examples in spec
 * section 7.3, kept centralized so every caller formats keys identically.
 */
export const buildIdempotencyKey = {
  startingFunds: (playerId: string, accountType: string) =>
    `onboarding:${playerId}:starting-funds:${accountType}`,
  employmentPay: (employmentId: string, dateKey: string) =>
    `employment:${employmentId}:pay:${dateKey}`,
  housingRent: (tenancyId: string, isoWeekKey: string) => `housing:${tenancyId}:rent:${isoWeekKey}`,
  vehicleMaintenance: (vehicleId: string, isoWeekKey: string) =>
    `vehicle:${vehicleId}:maintenance:${isoWeekKey}`,
  flightSettlement: (flightId: string) => `flight:${flightId}:settlement`,
  trainingTuition: (enrollmentId: string) => `training:${enrollmentId}:tuition`,
};

export function isCredit(amountCents: Cents): boolean {
  return amountCents > 0;
}

export function isDebit(amountCents: Cents): boolean {
  return amountCents < 0;
}

export function assertNonZeroAmount(amountCents: Cents): void {
  if (amountCents === 0) {
    throw new RangeError("Ledger entries must have a non-zero amount");
  }
}

export { cents };
