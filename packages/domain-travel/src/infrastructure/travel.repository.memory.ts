import type { GroundTravelId, PlayerId, VehicleId } from "@oneworld/contracts";
import type { Cents } from "@oneworld/utils";
import type {
  GroundTravelRecord,
  GroundTravelRepository,
  TravelEndpointRef,
  TravelMode,
} from "../domain/travel.types.js";

let sequence = 0;
function nextId(): string {
  sequence += 1;
  return `mem-travel-${sequence}`;
}

/**
 * In-memory `GroundTravelRepository` for unit tests and local prototyping
 * (spec section 20.4). The Postgres-backed implementation lives in
 * `travel.repository.drizzle.ts` and must uphold the same contract.
 */
export class InMemoryTravelRepository implements GroundTravelRepository {
  private readonly travels = new Map<string, GroundTravelRecord>();

  async insertPreparingTravel(input: {
    playerId: PlayerId;
    mode: TravelMode;
    vehicleId?: VehicleId;
    origin: TravelEndpointRef;
    destination: TravelEndpointRef;
    distanceMiles: number;
    costCents: Cents;
    fuelGallonsUsed?: number;
    arrivesAt: Date;
  }): Promise<GroundTravelRecord> {
    const travel: GroundTravelRecord = {
      id: nextId() as GroundTravelId,
      playerId: input.playerId,
      mode: input.mode,
      vehicleId: input.vehicleId,
      origin: input.origin,
      destination: input.destination,
      distanceMiles: input.distanceMiles,
      costCents: input.costCents,
      fuelGallonsUsed: input.fuelGallonsUsed,
      status: "PREPARING",
      arrivesAt: input.arrivesAt,
    };
    this.travels.set(travel.id, travel);
    return travel;
  }

  async markDeparted(travelId: GroundTravelId, departedAt: Date): Promise<GroundTravelRecord> {
    const existing = this.travels.get(travelId);
    if (!existing) throw new Error(`Unknown travel: ${travelId}`);
    const updated: GroundTravelRecord = { ...existing, status: "TRAVELING", departedAt };
    this.travels.set(travelId, updated);
    return updated;
  }

  async markArrived(travelId: GroundTravelId, completedAt: Date): Promise<GroundTravelRecord> {
    const existing = this.travels.get(travelId);
    if (!existing) throw new Error(`Unknown travel: ${travelId}`);
    const updated: GroundTravelRecord = { ...existing, status: "ARRIVED", completedAt };
    this.travels.set(travelId, updated);
    return updated;
  }

  async getActiveTravelForPlayer(playerId: PlayerId): Promise<GroundTravelRecord | undefined> {
    return [...this.travels.values()].find(
      (t) => t.playerId === playerId && (t.status === "PREPARING" || t.status === "TRAVELING"),
    );
  }

  async getById(travelId: GroundTravelId): Promise<GroundTravelRecord | undefined> {
    return this.travels.get(travelId);
  }

  async listDueForCompletion(now: Date): Promise<GroundTravelRecord[]> {
    return [...this.travels.values()].filter(
      (t) => t.status === "TRAVELING" && t.arrivesAt.getTime() <= now.getTime(),
    );
  }
}
