import type { GroundTravelId, PlayerId } from "@oneworld/contracts";
import { DomainError } from "@oneworld/contracts";
import type {
  GroundTravelQuote,
  GroundTravelQuoteInput,
  GroundTravelRecord,
  GroundTravelRepository,
  StartGroundTravelInput,
} from "../domain/travel.types.js";
import { calculateGroundTravelQuote, toEndpointRef } from "../domain/travel.rules.js";

function endpointsEqual(
  a: GroundTravelQuoteInput["origin"],
  b: GroundTravelQuoteInput["destination"],
): boolean {
  if (a.type !== b.type) return false;
  return a.type === "city" ? a.cityId === b.cityId : a.airportId === b.airportId;
}

/**
 * The Travel domain's public read/write path for ground travel (spec
 * section 11, 24.2). Money, player location, and vehicle mileage never
 * move here - only this package's own `ground_travel` data does, mirroring
 * how `@oneworld/domain-employment`/`@oneworld/domain-housing`/
 * `@oneworld/domain-vehicles` stay free of cross-domain writes in their
 * own services. The composition (location guard, funds check, ledger
 * posting, mileage update, location transition) lives in
 * `infrastructure/travel.transaction.ts`.
 */
export class TravelService {
  constructor(private readonly repo: GroundTravelRepository) {}

  quoteTravel(input: GroundTravelQuoteInput): GroundTravelQuote {
    if (endpointsEqual(input.origin, input.destination)) {
      throw new DomainError("ORIGIN_DESTINATION_SAME", "Origin and destination must differ.");
    }
    return calculateGroundTravelQuote(input);
  }

  async getActiveTravel(playerId: PlayerId): Promise<GroundTravelRecord | undefined> {
    return this.repo.getActiveTravelForPlayer(playerId);
  }

  /**
   * Creates the travel record (spec section 11.5: `AVAILABLE -> PREPARING
   * -> TRAVELING`). `PREPARING` is exercised but instantaneous in the
   * preview - see this package's README - so this inserts and immediately
   * departs within the same call.
   */
  async startTravel(
    input: StartGroundTravelInput & { quote: GroundTravelQuote },
  ): Promise<GroundTravelRecord> {
    const existing = await this.repo.getActiveTravelForPlayer(input.playerId);
    if (existing) {
      throw new DomainError(
        "TRAVEL_ALREADY_ACTIVE",
        "You already have travel in progress.",
        { activeTravelId: existing.id },
      );
    }

    const prepared = await this.repo.insertPreparingTravel({
      playerId: input.playerId,
      mode: input.mode,
      vehicleId: input.vehicle?.id,
      origin: toEndpointRef(input.origin),
      destination: toEndpointRef(input.destination),
      distanceMiles: input.quote.distanceMiles,
      costCents: input.quote.costCents,
      fuelGallonsUsed: input.quote.fuelGallonsUsed,
      arrivesAt: new Date(input.now.getTime() + input.quote.durationMinutes * 60_000),
    });

    return this.repo.markDeparted(prepared.id, input.now);
  }

  /** Finds and marks `ARRIVED` every `TRAVELING` record whose `arrivesAt` has passed (spec section 25.1). */
  async completeDueTravel(now: Date): Promise<GroundTravelRecord[]> {
    const due = await this.repo.listDueForCompletion(now);
    const completed: GroundTravelRecord[] = [];
    for (const travel of due) {
      completed.push(await this.repo.markArrived(travel.id, now));
    }
    return completed;
  }

  async getById(travelId: GroundTravelId): Promise<GroundTravelRecord | undefined> {
    return this.repo.getById(travelId);
  }
}
