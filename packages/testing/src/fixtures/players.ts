/**
 * A deterministic starting player used across onboarding, finance, and
 * travel tests (spec section 30.6).
 */
export const fixturePlayer = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "test_pilot",
  displayName: "Test Pilot",
  companyName: "Test Air Charters",
  homeCityIdent: "boise-id",
  homeAirportIdent: "KBOI",
} as const;

export type FixturePlayer = typeof fixturePlayer;
