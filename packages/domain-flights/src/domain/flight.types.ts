import type { AircraftId, FlightSessionId, PlayerId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export interface FlightSettlementInput {
  flightSessionId: FlightSessionId;
  playerId: PlayerId;
  aircraftId: AircraftId;
  /** From the accepted job quote (spec section 14.3/14.6). */
  grossRevenueCents: Cents;
  rentalCostCents: Cents;
  fuelCostCents: Cents;
  airportFeesCents: Cents;
  /** Minutes of pilot-in-command time verified by telemetry (section 17.1). */
  verifiedMinutes: number;
}

export interface FlightSettlement {
  flightSessionId: FlightSessionId;
  grossRevenueCents: Cents;
  totalCostsCents: Cents;
  netCompanyIncomeCents: Cents;
  awardedMinutes: number;
}
