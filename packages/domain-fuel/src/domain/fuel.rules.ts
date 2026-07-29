import { scaleCents, type Cents } from "@oneworld/utils";
import type { FuelQuote } from "./fuel.types.js";

/** Cost in cents for a given quote and quantity. The only place this math lives. */
export function calculateFuelPurchaseCostCents(quote: FuelQuote, gallons: number): Cents {
  if (gallons < 0) throw new RangeError("gallons must not be negative");
  return scaleCents(quote.unitPriceCentsPerGallon, Math.round(gallons * 100), 100);
}

export function isQuoteExpired(quote: FuelQuote, referenceNow: Date): boolean {
  return quote.quoteExpiresAt.getTime() <= referenceNow.getTime();
}

export function hasSufficientSupply(quote: FuelQuote, requestedGallons: number): boolean {
  return quote.availableGallons === null || quote.availableGallons >= requestedGallons;
}
