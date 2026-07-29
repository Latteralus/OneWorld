import { addCents, cents, scaleCents, subtractCents, type Cents } from "@oneworld/utils";
import { jobConfig } from "@oneworld/config";
import type { PassengerJobQuote, PassengerJobQuoteInput } from "./job.types.js";

/**
 * Gross passenger revenue (spec section 14.3):
 * `passenger count * distance NM * rate per passenger-NM`, floored at a
 * configurable minimum fare per passenger. The one implementation of this
 * formula (section 21.4).
 */
export function calculatePassengerRevenueCents(passengerCount: number, distanceNm: number): Cents {
  if (passengerCount <= 0) throw new RangeError("passengerCount must be positive");
  if (distanceNm < 0) throw new RangeError("distanceNm must not be negative");

  const perPassengerRaw = scaleCents(
    cents(jobConfig.ratePerPassengerNmCents),
    Math.round(distanceNm),
  );
  const perPassengerFare = Math.max(perPassengerRaw, jobConfig.minimumFarePerPassengerCents);

  return cents(perPassengerFare * passengerCount);
}

export function buildPassengerJobQuote(input: PassengerJobQuoteInput): PassengerJobQuote {
  const grossRevenueCents = calculatePassengerRevenueCents(input.passengerCount, input.distanceNm);
  const estimatedCostsCents = addCents(
    input.estimatedRentalCostCents,
    input.estimatedFuelCostCents,
    input.estimatedAirportFeesCents,
  );

  return {
    distanceNm: input.distanceNm,
    passengerCount: input.passengerCount,
    grossRevenueCents,
    estimatedCostsCents,
    estimatedNetProfitCents: subtractCents(grossRevenueCents, estimatedCostsCents),
  };
}
