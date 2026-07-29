import { cents } from "@oneworld/utils";
import { addMinutes } from "@oneworld/utils";
import type { AirportId } from "@oneworld/contracts";
import type { FuelProvider, FuelQuote, FuelType } from "../domain/fuel.types.js";

/**
 * Preview fuel provider (spec section 19.1): a configured price and
 * effectively unlimited supply per airport. Implements the same
 * `FuelProvider` interface a future player-owned FBO provider will use
 * (section 19.3, 34.3), so flight settlement never needs to know which
 * kind of provider answered the quote.
 */
export class SystemFuelProvider implements FuelProvider {
  constructor(
    private readonly pricesCentsPerGallon: Record<string, number>,
    private readonly quoteTtlMinutes = 15,
  ) {}

  async getQuote(airportId: AirportId, fuelType: FuelType): Promise<FuelQuote> {
    const priceCents = this.pricesCentsPerGallon[airportId] ?? this.pricesCentsPerGallon.default;
    if (priceCents === undefined) {
      throw new Error(`No fuel price configured for airport ${airportId}`);
    }

    return {
      airportId,
      fuelType,
      unitPriceCentsPerGallon: cents(priceCents),
      availableGallons: null,
      providerId: "system",
      quoteExpiresAt: addMinutes(new Date(), this.quoteTtlMinutes),
    };
  }
}
