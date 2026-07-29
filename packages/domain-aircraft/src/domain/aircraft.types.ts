import type { AircraftId, AircraftTypeId, AirportId, PlayerId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export interface AircraftType {
  id: AircraftTypeId;
  icaoType: string;
  manufacturer: string;
  model: string;
  usablePassengerSeats: number;
  requiredQualification: string;
  hourlyWetRateCents: Cents;
  previewEnabled: boolean;
}

export interface AircraftInstance {
  id: AircraftId;
  registration: string;
  aircraftTypeId: AircraftTypeId;
  currentAirportId: AirportId;
  rentalAvailable: boolean;
  fuelGallons: number;
}

export interface AircraftReservation {
  aircraftId: AircraftId;
  playerId: PlayerId;
  startedAt: Date;
  expiresAt?: Date;
}
