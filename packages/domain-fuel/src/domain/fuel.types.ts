import type { AirportId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";

export type FuelType = "avgas_100ll" | "jet_a";

/**
 * The fuel-provider contract (spec section 19.2). Flight settlement
 * depends on the returned quote/purchase record, not on how the provider
 * calculated it - so the same interface can later be backed by a
 * player-owned FBO instead of the system price (section 19.3, 34.3).
 */
export interface FuelQuote {
  airportId: AirportId;
  fuelType: FuelType;
  unitPriceCentsPerGallon: Cents;
  /** `null` means effectively unlimited supply (preview default, section 19.1). */
  availableGallons: number | null;
  providerId: string;
  quoteExpiresAt: Date;
}

export interface FuelProvider {
  getQuote(airportId: AirportId, fuelType: FuelType): Promise<FuelQuote>;
}
