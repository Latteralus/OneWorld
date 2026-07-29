import { gameClockConfig } from "@oneworld/config";
import { nowUtc } from "@oneworld/utils";

/**
 * The authoritative clock (spec section 5.2): "The authoritative clock is
 * the server clock. Browser clocks and tracker clocks are display and
 * evidence sources only." Every other domain reads time through here so
 * it can be mocked in tests and so there is exactly one implementation to
 * audit for correctness.
 */
export function serverNow(): Date {
  return nowUtc();
}

/** Formats a UTC instant for display in the default player-facing timezone (section 5.2). */
export function formatForDisplay(
  date: Date,
  timeZone: string = gameClockConfig.defaultDisplayTimezone,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Resolves whether a deadline has already passed as of `referenceNow`
 * (defaults to the server clock). Used on login/page-refresh to settle any
 * state whose completion time has passed (section 5.3) instead of relying
 * on a client-side timer to fire.
 */
export function hasDeadlinePassed(deadline: Date, referenceNow: Date = serverNow()): boolean {
  return deadline.getTime() <= referenceNow.getTime();
}
