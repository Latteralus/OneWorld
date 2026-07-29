import type { AirportId } from "@oneworld/contracts";
import type { AirportActivityClass, AirportPhysicalTier } from "@oneworld/config";

export interface AirportGameState {
  airportId: AirportId;
  physicalTier: AirportPhysicalTier;
  activityScore: number;
  activityClass: AirportActivityClass;
  basePassengerTarget: number;
}

export interface RouteStatistics {
  originAirportId: AirportId;
  destinationAirportId: AirportId;
  completedFlights: number;
  passengersTransported: number;
}
