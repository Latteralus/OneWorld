import type { AirportId, CityId } from "@oneworld/contracts";
import type { AirportPhysicalTier } from "@oneworld/config";

/** A starting/playable city (spec section 23.2). */
export interface City {
  id: CityId;
  name: string;
  region: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  employmentTier: string;
  enabled: boolean;
}

/** Shape accepted by `CityService.seedStartingCities` - matches `@oneworld/config`'s `worldConfig.startingCities` structurally without depending on its exact literal typing. */
export interface StartingCitySeed {
  name: string;
  region: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  employmentTier: string;
  airports: ReadonlyArray<{ ident: string; isPrimary: boolean }>;
}

export interface EnsureCityInput {
  name: string;
  region: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  employmentTier: string;
  enabled: boolean;
}

/** An airport linked to a city, joined with the airport's own identity fields for display. */
export interface CityAirportSummary {
  airportId: AirportId;
  ident: string;
  icao: string | undefined;
  name: string;
  physicalTier: AirportPhysicalTier;
  isPrimary: boolean;
}

/**
 * Repository interface owned by this domain (spec section 20.4). Reads the
 * canonical `airports` table to resolve idents into ids when linking - a
 * read, not a mutation, of another domain's table, so it stays within the
 * section 24.1 service boundary rule.
 */
export interface CityRepository {
  ensureCity(input: EnsureCityInput): Promise<City>;
  /** Links a city to an airport by ident. Throws if the ident isn't in the canonical catalog (fail loud during seeding); no-ops if already linked. */
  ensureCityAirportLink(cityId: CityId, airportIdent: string, isPrimary: boolean): Promise<void>;
  listCities(): Promise<City[]>;
  getCity(cityId: CityId): Promise<City | undefined>;
  listAirportsForCity(cityId: CityId): Promise<CityAirportSummary[]>;
}
