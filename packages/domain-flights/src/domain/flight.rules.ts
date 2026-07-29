import { addCents, subtractCents } from "@oneworld/utils";
import type { FlightSettlement, FlightSettlementInput } from "./flight.types.js";

/**
 * Combines a validated flight's quote and telemetry-verified costs into a
 * final settlement (spec section 14.6, 21.4: `calculateFlightSettlement` -
 * "flight/finance orchestration"). This function is pure math; actually
 * posting the resulting ledger entries and awarding hours happens in the
 * Phase 6 flight-completion service via `@oneworld/domain-finance` and
 * `@oneworld/domain-qualifications`.
 */
export function calculateFlightSettlement(input: FlightSettlementInput): FlightSettlement {
  const totalCostsCents = addCents(
    input.rentalCostCents,
    input.fuelCostCents,
    input.airportFeesCents,
  );

  return {
    flightSessionId: input.flightSessionId,
    grossRevenueCents: input.grossRevenueCents,
    totalCostsCents,
    netCompanyIncomeCents: subtractCents(input.grossRevenueCents, totalCostsCents),
    awardedMinutes: input.verifiedMinutes,
  };
}
