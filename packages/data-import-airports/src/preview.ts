import { airportConfig } from "@oneworld/config";
import type { CanonicalAirportRecord } from "./types.js";

/**
 * Resolves spec section 35 open item #2 ("preview region vs. worldwide
 * airports"): an imported airport is preview-enabled when it's active and
 * its country is in `airportConfig.previewCountryCodes` (U.S.-only for
 * now). Placeholder pending real curation/testing - see the change log.
 */
export function isPreviewEligible(record: CanonicalAirportRecord): boolean {
  return (
    record.sourceStatus === "active" &&
    airportConfig.previewCountryCodes.includes(record.countryCode)
  );
}
