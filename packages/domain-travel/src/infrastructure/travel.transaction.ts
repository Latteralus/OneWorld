import { randomUUID } from "node:crypto";
import type { Database } from "@oneworld/db";
import { insertDomainEvent } from "@oneworld/db";
import { DomainError } from "@oneworld/contracts";
import { cents } from "@oneworld/utils";
import { buildIdempotencyKey, DrizzleLedgerRepository, LedgerService } from "@oneworld/domain-finance";
import { DrizzleLocationRepository, LocationService } from "@oneworld/domain-locations";
import { DrizzleVehicleRepository, VehicleService } from "@oneworld/domain-vehicles";
import { TravelService } from "../application/travel.service.js";
import { DrizzleTravelRepository } from "./travel.repository.drizzle.js";
import { doesLocationMatchOrigin, toEndpointRef } from "../domain/travel.rules.js";
import type { GroundTravelRecord, StartGroundTravelInput } from "../domain/travel.types.js";

/**
 * Starts ground travel inside one Postgres transaction, composing every
 * domain the action touches - mirrors `runOnboardingTransaction`
 * (`@oneworld/domain-players`) and Phase 2's worker-job orchestrators.
 * `TravelService`/`HousingService`-style domain services stay free of
 * cross-domain writes; this is the one place that sequences them:
 *
 * 1. The player must be physically at the stated origin (11.1) -
 *    otherwise `PLAYER_NOT_AT_ORIGIN`, or `TRAVEL_ALREADY_ACTIVE` if
 *    they're already in transit/flight.
 * 2. `personal_vehicle` mode requires an owned vehicle (`NO_VEHICLE_OWNED`).
 * 3. The trip is quoted and funds are checked before anything is written -
 *    `INSUFFICIENT_FUNDS` rolls back the whole transaction, creating no
 *    travel record (starting travel is voluntary, unlike Phase 2's
 *    unavoidable recurring charges).
 * 4. `TravelService.startTravel` creates the record, the fare/fuel charge
 *    posts through `LedgerService`, the vehicle's mileage advances, and
 *    the player's location moves to `IN_GROUND_TRANSIT`.
 */
export async function runStartGroundTravelTransaction(
  db: Database,
  input: StartGroundTravelInput,
): Promise<GroundTravelRecord> {
  return db.transaction(async (tx) => {
    const travelService = new TravelService(new DrizzleTravelRepository(tx));
    const locationService = new LocationService(new DrizzleLocationRepository(tx));
    const vehicleService = new VehicleService(new DrizzleVehicleRepository(tx));
    const ledgerService = new LedgerService(new DrizzleLedgerRepository(tx));

    const location = await locationService.getLocation(input.playerId);
    const originRef = toEndpointRef(input.origin);

    if (!location || !doesLocationMatchOrigin(location, originRef)) {
      if (location?.locationType === "IN_GROUND_TRANSIT" || location?.locationType === "IN_SIMULATOR_FLIGHT") {
        throw new DomainError("TRAVEL_ALREADY_ACTIVE", "You already have travel in progress.");
      }
      throw new DomainError(
        "PLAYER_NOT_AT_ORIGIN",
        "You must be physically at the stated origin to begin travel.",
      );
    }

    let vehicleForQuote: StartGroundTravelInput["vehicle"];
    let ownedVehicle: Awaited<ReturnType<typeof vehicleService.getVehicleForPlayer>>;
    if (input.mode === "personal_vehicle") {
      ownedVehicle = await vehicleService.getVehicleForPlayer(input.playerId);
      if (!ownedVehicle) {
        throw new DomainError("NO_VEHICLE_OWNED", "You do not own a vehicle.");
      }
      vehicleForQuote = {
        id: ownedVehicle.id,
        effectiveTravelSpeedMph: ownedVehicle.effectiveTravelSpeedMph,
        fuelEfficiencyMpg: ownedVehicle.fuelEfficiencyMpg,
      };
    }

    const quote = travelService.quoteTravel({
      mode: input.mode,
      origin: input.origin,
      destination: input.destination,
      vehicle: vehicleForQuote,
    });

    const personalAccount = await ledgerService.openAccount({
      ownerType: "player",
      ownerId: input.playerId,
      accountType: "personal",
    });
    const balance = await ledgerService.getAccountBalance(personalAccount.id);
    if (balance < quote.costCents) {
      throw new DomainError("INSUFFICIENT_FUNDS", "Insufficient funds to start this trip.", {
        requiredCents: quote.costCents,
        availableCents: balance,
      });
    }

    const travel = await travelService.startTravel({ ...input, vehicle: vehicleForQuote, quote });

    await ledgerService.postEntry({
      accountId: personalAccount.id,
      amountCents: cents(-quote.costCents),
      category: input.mode === "bus" ? "bus_fare" : "ground_vehicle_fuel",
      description: input.mode === "bus" ? "Bus fare" : "Ground vehicle fuel",
      relatedType: "ground_travel",
      relatedId: travel.id,
      idempotencyKey:
        input.mode === "bus"
          ? buildIdempotencyKey.groundTravelFare(travel.id)
          : buildIdempotencyKey.groundTravelFuel(travel.id),
    });

    if (input.mode === "personal_vehicle" && ownedVehicle) {
      await vehicleService.recordTripDistance({
        vehicleId: ownedVehicle.id,
        currentMileage: ownedVehicle.mileage,
        distanceMiles: quote.distanceMiles,
      });
    }

    await locationService.setLocation({
      playerId: input.playerId,
      locationType: "IN_GROUND_TRANSIT",
      activeTravelId: travel.id,
    });

    await insertDomainEvent(tx, {
      id: randomUUID(),
      type: "GroundTravelStarted",
      occurredAt: input.now.toISOString(),
      idempotencyKey: `ground-travel:${travel.id}:started`,
      data: {
        travelId: travel.id,
        playerId: input.playerId,
        mode: input.mode,
        distanceMiles: quote.distanceMiles,
      },
    });

    return travel;
  });
}

/**
 * Completes every ground-travel record whose `arrivesAt` has passed
 * (spec section 25.1) - authoritative and worker-driven, so travel
 * completes without an open browser (5.3). For each completed trip, moves
 * the player out of `IN_GROUND_TRANSIT` to the destination.
 */
export async function runGroundTravelCompletionSweep(db: Database, now: Date): Promise<void> {
  await db.transaction(async (tx) => {
    const travelService = new TravelService(new DrizzleTravelRepository(tx));
    const locationService = new LocationService(new DrizzleLocationRepository(tx));

    const completed = await travelService.completeDueTravel(now);

    for (const travel of completed) {
      await locationService.setLocation(
        travel.destination.type === "city"
          ? { playerId: travel.playerId, locationType: "CITY_RESIDENCE", cityId: travel.destination.cityId }
          : { playerId: travel.playerId, locationType: "AIRPORT", airportId: travel.destination.airportId },
      );

      await insertDomainEvent(tx, {
        id: randomUUID(),
        type: "GroundTravelCompleted",
        occurredAt: now.toISOString(),
        idempotencyKey: `ground-travel:${travel.id}:completed`,
        data: { travelId: travel.id, playerId: travel.playerId },
      });
    }
  });
}
