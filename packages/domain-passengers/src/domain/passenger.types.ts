import type { AirportId, PassengerReservationId, PlayerId } from "@oneworld/contracts";

export interface AirportPassengerPool {
  airportId: AirportId;
  waitingCount: number;
  reservedCount: number;
  inFlightCount: number;
}

export interface PassengerReservation {
  id: PassengerReservationId;
  playerId: PlayerId;
  originAirportId: AirportId;
  destinationAirportId: AirportId;
  passengerCount: number;
  status: string; // see passengerStates in @oneworld/contracts
  expiresAt: Date;
}
