/**
 * Starting-city catalog for the preview (spec section 6.1, 12.1, 23.2).
 * Character creation offers one of these as the starting city; the home
 * airport is chosen from the airports linked here. `airportIdent` values
 * must resolve against the canonical `airports` table (populated by
 * `@oneworld/data-import-airports`) - seeding fails loudly if an ident
 * isn't found rather than silently skipping it, so a bad ident here is
 * caught immediately instead of producing a city with no airports.
 *
 * Resolves spec section 35 open item #2 ("preview region vs. worldwide
 * airports") for the *city* catalog specifically: preview launches with a
 * small curated set of major U.S. metro areas. See
 * `data-import-airports`'s preview-curation logic for the airport-catalog
 * side of that same decision.
 */
export const startingCities = [
  {
    key: "denver",
    name: "Denver",
    region: "US-CO",
    countryCode: "US",
    latitude: 39.7392,
    longitude: -104.9903,
    employmentTier: "standard",
    airports: [
      { ident: "KDEN", isPrimary: true },
      { ident: "KAPA", isPrimary: false },
      { ident: "KBJC", isPrimary: false },
    ],
  },
  {
    key: "phoenix",
    name: "Phoenix",
    region: "US-AZ",
    countryCode: "US",
    latitude: 33.4484,
    longitude: -112.074,
    employmentTier: "standard",
    airports: [
      { ident: "KPHX", isPrimary: true },
      { ident: "KDVT", isPrimary: false },
      { ident: "KSDL", isPrimary: false },
    ],
  },
  {
    key: "chicago",
    name: "Chicago",
    region: "US-IL",
    countryCode: "US",
    latitude: 41.8781,
    longitude: -87.6298,
    employmentTier: "premium",
    airports: [
      { ident: "KORD", isPrimary: true },
      { ident: "KMDW", isPrimary: false },
      { ident: "KPWK", isPrimary: false },
    ],
  },
  {
    key: "dallas_fort_worth",
    name: "Dallas-Fort Worth",
    region: "US-TX",
    countryCode: "US",
    latitude: 32.7767,
    longitude: -96.797,
    employmentTier: "standard",
    airports: [
      { ident: "KDFW", isPrimary: true },
      { ident: "KDAL", isPrimary: false },
      { ident: "KADS", isPrimary: false },
    ],
  },
  {
    key: "miami",
    name: "Miami",
    region: "US-FL",
    countryCode: "US",
    latitude: 25.7617,
    longitude: -80.1918,
    employmentTier: "premium",
    airports: [
      { ident: "KMIA", isPrimary: true },
      { ident: "KOPF", isPrimary: false },
      { ident: "KTMB", isPrimary: false },
    ],
  },
] as const;

export const worldConfig = {
  startingCities,
  /** Offered first / pre-selected in the character-creation UI. */
  defaultStartingCityKey: "denver" as const,
} as const;

export type WorldConfig = typeof worldConfig;
export type StartingCityKey = (typeof startingCities)[number]["key"];
