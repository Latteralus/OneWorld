/**
 * Branded ID types (spec section 31.1) so a `PlayerId` and an `AirportId`
 * can't be silently swapped even though both are strings at runtime.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type PlayerId = Brand<string, "PlayerId">;
export type AirportId = Brand<string, "AirportId">;
export type CityId = Brand<string, "CityId">;
export type AircraftId = Brand<string, "AircraftId">;
export type AircraftTypeId = Brand<string, "AircraftTypeId">;
export type FlightSessionId = Brand<string, "FlightSessionId">;
export type PassengerJobId = Brand<string, "PassengerJobId">;
export type PassengerReservationId = Brand<string, "PassengerReservationId">;
export type GroundTravelId = Brand<string, "GroundTravelId">;
export type FinancialAccountId = Brand<string, "FinancialAccountId">;
export type LedgerEntryId = Brand<string, "LedgerEntryId">;
export type EmploymentId = Brand<string, "EmploymentId">;
export type JobPostingId = Brand<string, "JobPostingId">;
export type JobApplicationId = Brand<string, "JobApplicationId">;
export type QualificationId = Brand<string, "QualificationId">;
export type TrainingEnrollmentId = Brand<string, "TrainingEnrollmentId">;
export type ResidenceId = Brand<string, "ResidenceId">;
export type VehicleId = Brand<string, "VehicleId">;

function brand<B extends string>(value: string): Brand<string, B> {
  return value as Brand<string, B>;
}

export const asPlayerId = (value: string): PlayerId => brand(value);
export const asAirportId = (value: string): AirportId => brand(value);
export const asCityId = (value: string): CityId => brand(value);
export const asAircraftId = (value: string): AircraftId => brand(value);
export const asAircraftTypeId = (value: string): AircraftTypeId => brand(value);
export const asFlightSessionId = (value: string): FlightSessionId => brand(value);
export const asPassengerJobId = (value: string): PassengerJobId => brand(value);
export const asPassengerReservationId = (value: string): PassengerReservationId => brand(value);
export const asGroundTravelId = (value: string): GroundTravelId => brand(value);
export const asFinancialAccountId = (value: string): FinancialAccountId => brand(value);
export const asLedgerEntryId = (value: string): LedgerEntryId => brand(value);
export const asEmploymentId = (value: string): EmploymentId => brand(value);
export const asJobPostingId = (value: string): JobPostingId => brand(value);
export const asJobApplicationId = (value: string): JobApplicationId => brand(value);
export const asQualificationId = (value: string): QualificationId => brand(value);
export const asTrainingEnrollmentId = (value: string): TrainingEnrollmentId => brand(value);
export const asResidenceId = (value: string): ResidenceId => brand(value);
export const asVehicleId = (value: string): VehicleId => brand(value);
