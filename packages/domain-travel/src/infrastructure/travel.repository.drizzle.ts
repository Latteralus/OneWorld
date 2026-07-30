import { and, eq, lte, or } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { cents, type Cents } from "@oneworld/utils";
import type { AirportId, CityId, GroundTravelId, PlayerId, VehicleId } from "@oneworld/contracts";
import type {
  GroundTravelRecord,
  GroundTravelRepository,
  TravelEndpointRef,
  TravelMode,
} from "../domain/travel.types.js";

function toEndpointRef(
  type: string,
  cityId: string | null,
  airportId: string | null,
): TravelEndpointRef {
  if (type === "city") {
    if (!cityId) throw new Error('Ground travel row has origin/destination type "city" but no cityId');
    return { type: "city", cityId: cityId as CityId };
  }
  if (!airportId) throw new Error('Ground travel row has origin/destination type "airport" but no airportId');
  return { type: "airport", airportId: airportId as AirportId };
}

function toDomainTravel(row: typeof schema.groundTravel.$inferSelect): GroundTravelRecord {
  return {
    id: row.id as GroundTravelId,
    playerId: row.playerId as PlayerId,
    mode: row.mode as TravelMode,
    vehicleId: row.vehicleId ? (row.vehicleId as VehicleId) : undefined,
    origin: toEndpointRef(row.originType, row.originCityId, row.originAirportId),
    destination: toEndpointRef(row.destinationType, row.destinationCityId, row.destinationAirportId),
    distanceMiles: row.distanceMiles,
    costCents: cents(row.costCents),
    fuelGallonsUsed: row.fuelGallonsUsed ?? undefined,
    status: row.status,
    departedAt: row.departedAt ?? undefined,
    arrivesAt: row.arrivesAt,
    completedAt: row.completedAt ?? undefined,
  };
}

/** Postgres-backed `GroundTravelRepository`. */
export class DrizzleTravelRepository implements GroundTravelRepository {
  constructor(private readonly db: DbOrTx) {}

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
    const [inserted] = await this.db
      .insert(schema.groundTravel)
      .values({
        playerId: input.playerId,
        mode: input.mode,
        vehicleId: input.vehicleId,
        originType: input.origin.type,
        originCityId: input.origin.type === "city" ? input.origin.cityId : undefined,
        originAirportId: input.origin.type === "airport" ? input.origin.airportId : undefined,
        destinationType: input.destination.type,
        destinationCityId: input.destination.type === "city" ? input.destination.cityId : undefined,
        destinationAirportId: input.destination.type === "airport" ? input.destination.airportId : undefined,
        distanceMiles: input.distanceMiles,
        costCents: input.costCents,
        fuelGallonsUsed: input.fuelGallonsUsed,
        status: "PREPARING",
        arrivesAt: input.arrivesAt,
      })
      .returning();
    if (!inserted) throw new Error("Failed to create ground travel record");
    return toDomainTravel(inserted);
  }

  async markDeparted(travelId: GroundTravelId, departedAt: Date): Promise<GroundTravelRecord> {
    const [updated] = await this.db
      .update(schema.groundTravel)
      .set({ status: "TRAVELING", departedAt })
      .where(eq(schema.groundTravel.id, travelId))
      .returning();
    if (!updated) throw new Error(`Unknown travel: ${travelId}`);
    return toDomainTravel(updated);
  }

  async markArrived(travelId: GroundTravelId, completedAt: Date): Promise<GroundTravelRecord> {
    const [updated] = await this.db
      .update(schema.groundTravel)
      .set({ status: "ARRIVED", completedAt })
      .where(eq(schema.groundTravel.id, travelId))
      .returning();
    if (!updated) throw new Error(`Unknown travel: ${travelId}`);
    return toDomainTravel(updated);
  }

  async getActiveTravelForPlayer(playerId: PlayerId): Promise<GroundTravelRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.groundTravel)
      .where(
        and(
          eq(schema.groundTravel.playerId, playerId),
          or(eq(schema.groundTravel.status, "PREPARING"), eq(schema.groundTravel.status, "TRAVELING")),
        ),
      );
    return row ? toDomainTravel(row) : undefined;
  }

  async getById(travelId: GroundTravelId): Promise<GroundTravelRecord | undefined> {
    const [row] = await this.db.select().from(schema.groundTravel).where(eq(schema.groundTravel.id, travelId));
    return row ? toDomainTravel(row) : undefined;
  }

  async listDueForCompletion(now: Date): Promise<GroundTravelRecord[]> {
    const rows = await this.db
      .select()
      .from(schema.groundTravel)
      .where(and(eq(schema.groundTravel.status, "TRAVELING"), lte(schema.groundTravel.arrivesAt, now)));
    return rows.map(toDomainTravel);
  }
}
