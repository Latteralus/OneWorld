/**
 * Starting funds and fixed weekly expenses (spec section 6.5, 7.4).
 * Recommended defaults - tune via balance testing per section 35 item 1.
 */
export const economyConfig = {
  currency: "USD",
  startingPersonalBalanceCents: 250_000, // $2,500
  startingCompanyBalanceCents: 500_000, // $5,000
  /** First week of apartment rent is pre-paid so it does not fire immediately (6.6). */
  firstWeekRentPrepaid: true,
  /** Grace period before a missed rent/maintenance charge escalates (11, 35.11). */
  recurringChargeGracePeriodHours: 72,
} as const;

export type EconomyConfig = typeof economyConfig;
