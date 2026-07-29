/**
 * Deterministic small preview region for tests (spec section 30.6).
 * Real-world identifiers and coordinates, chosen for well-known
 * short/medium/long distance pairs used across travel and job tests.
 */
export const fixtureAirports = [
  {
    ident: "KBOI",
    icao: "KBOI",
    name: "Boise Air Terminal",
    municipality: "Boise",
    regionCode: "US-ID",
    countryCode: "US",
    latitude: 43.5644,
    longitude: -116.2228,
    elevationFt: 2871,
    physicalTier: "regional_airport",
  },
  {
    ident: "KMYL",
    icao: "KMYL",
    name: "McCall Municipal Airport",
    municipality: "McCall",
    regionCode: "US-ID",
    countryCode: "US",
    latitude: 44.8897,
    longitude: -116.0994,
    elevationFt: 5024,
    physicalTier: "local_airport",
  },
  {
    ident: "KTWF",
    icao: "KTWF",
    name: "Joslin Field - Magic Valley Regional Airport",
    municipality: "Twin Falls",
    regionCode: "US-ID",
    countryCode: "US",
    latitude: 42.4818,
    longitude: -114.4876,
    elevationFt: 4154,
    physicalTier: "local_airport",
  },
  {
    ident: "KSLC",
    icao: "KSLC",
    name: "Salt Lake City International Airport",
    municipality: "Salt Lake City",
    regionCode: "US-UT",
    countryCode: "US",
    latitude: 40.7899,
    longitude: -111.9791,
    elevationFt: 4227,
    physicalTier: "major_airport",
  },
] as const;

export type FixtureAirport = (typeof fixtureAirports)[number];
