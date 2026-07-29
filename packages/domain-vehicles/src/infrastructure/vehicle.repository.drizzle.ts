import { eq } from "drizzle-orm";
import type { DbOrTx } from "@oneworld/db";
import { schema } from "@oneworld/db";
import { cents } from "@oneworld/utils";
import type { Cents } from "@oneworld/utils";
import type { CityId, PlayerId, VehicleId } from "@oneworld/contracts";
import type {
  PlayerVehicle,
  VehicleQuality,
  VehicleReliability,
  VehicleRepository,
} from "../domain/vehicle.types.js";

function toDomainVehicle(
  row: typeof schema.playerVehicles.$inferSelect,
  vehicleTypeKey: string,
): PlayerVehicle {
  return {
    id: row.id as VehicleId,
    ownerId: row.playerId as PlayerId,
    vehicleTypeKey,
    mileage: row.mileage,
    fuelGallons: row.fuelGallons,
    condition: row.condition,
    estimatedValueCents: cents(row.estimatedValueCents),
  };
}

/** Postgres-backed `VehicleRepository`. */
export class DrizzleVehicleRepository implements VehicleRepository {
  constructor(private readonly db: DbOrTx) {}

  /**
   * `vehicle_types.key` has no unique constraint in the schema yet, so
   * this is a plain select-then-insert-if-absent rather than
   * `onConflictDoNothing`.
   */
  async ensureVehicleType(input: {
    key: string;
    name: string;
    valueCents: Cents;
    speedMph: number;
    fuelEfficiencyMpg: number;
    tankCapacityGallons: number;
    expectedLifespanMiles: number;
    weeklyMaintenanceCents: Cents;
    quality: VehicleQuality;
    reliability: VehicleReliability;
    statusScore: number;
  }): Promise<string> {
    const [existing] = await this.db
      .select()
      .from(schema.vehicleTypes)
      .where(eq(schema.vehicleTypes.key, input.key));
    if (existing) return existing.id;

    const [inserted] = await this.db
      .insert(schema.vehicleTypes)
      .values({
        key: input.key,
        name: input.name,
        valueCents: input.valueCents,
        speedMph: input.speedMph,
        fuelEfficiencyMpg: input.fuelEfficiencyMpg,
        tankCapacityGallons: input.tankCapacityGallons,
        expectedLifespanMiles: input.expectedLifespanMiles,
        weeklyMaintenanceCents: input.weeklyMaintenanceCents,
        quality: input.quality,
        reliability: input.reliability,
        statusScore: input.statusScore,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to create vehicle type: ${input.key}`);
    return inserted.id;
  }

  async insertPlayerVehicle(input: {
    playerId: PlayerId;
    vehicleTypeId: string;
    vehicleTypeKey: string;
    currentCityId: CityId;
    mileage: number;
    fuelGallons: number;
    condition: string;
    estimatedValueCents: Cents;
  }): Promise<PlayerVehicle> {
    const [inserted] = await this.db
      .insert(schema.playerVehicles)
      .values({
        playerId: input.playerId,
        vehicleTypeId: input.vehicleTypeId,
        currentCityId: input.currentCityId,
        mileage: input.mileage,
        fuelGallons: input.fuelGallons,
        condition: input.condition,
        estimatedValueCents: input.estimatedValueCents,
      })
      .returning();
    if (!inserted) throw new Error("Failed to insert player vehicle");
    return toDomainVehicle(inserted, input.vehicleTypeKey);
  }

  async findVehicleForPlayer(playerId: PlayerId): Promise<PlayerVehicle | undefined> {
    const [row] = await this.db
      .select({ vehicle: schema.playerVehicles, vehicleTypeKey: schema.vehicleTypes.key })
      .from(schema.playerVehicles)
      .innerJoin(
        schema.vehicleTypes,
        eq(schema.playerVehicles.vehicleTypeId, schema.vehicleTypes.id),
      )
      .where(eq(schema.playerVehicles.playerId, playerId));
    return row ? toDomainVehicle(row.vehicle, row.vehicleTypeKey) : undefined;
  }
}
