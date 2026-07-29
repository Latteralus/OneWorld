import type { AircraftId, AirportId, PassengerJobId, PlayerId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export interface PassengerJobQuoteInput {
  originAirportId: AirportId;
  destinationAirportId: AirportId;
  distanceNm: number;
  passengerCount: number;
  aircraftId: AircraftId;
  estimatedRentalCostCents: Cents;
  estimatedFuelCostCents: Cents;
  estimatedAirportFeesCents: Cents;
}

export interface PassengerJobQuote {
  distanceNm: number;
  passengerCount: number;
  grossRevenueCents: Cents;
  estimatedCostsCents: Cents;
  estimatedNetProfitCents: Cents;
}

export interface PassengerJob {
  id: PassengerJobId;
  playerId: PlayerId;
  originAirportId: AirportId;
  destinationAirportId: AirportId;
  aircraftId: AircraftId;
  passengerCount: number;
  distanceNm: number;
  quotedGrossRevenueCents: Cents;
  status: string; // see passengerJobStates in @oneworld/contracts
}
