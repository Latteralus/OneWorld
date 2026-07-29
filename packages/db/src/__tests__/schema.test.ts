import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import * as schema from "../schema/index.js";

describe("schema", () => {
  it("defines every core table from the spec's data model (section 23)", () => {
    const expectedTables = [
      schema.profiles,
      schema.financialAccounts,
      schema.ledgerEntries,
      schema.cities,
      schema.cityAirports,
      schema.playerLocations,
      schema.airports,
      schema.airportGameState,
      schema.airportPassengerPools,
      schema.airportActivityEvents,
      schema.routeStatistics,
      schema.passengerReservations,
      schema.passengerJobs,
      schema.aircraftTypes,
      schema.simulatorAircraftMappings,
      schema.aircraft,
      schema.aircraftReservations,
      schema.flightSessions,
      schema.flightSummaries,
      schema.telemetryBatches,
      schema.qualificationDefinitions,
      schema.playerQualifications,
      schema.pilotHourTotals,
      schema.flightHourEntries,
      schema.trainingEnrollments,
      schema.residenceTypes,
      schema.playerResidences,
      schema.vehicleTypes,
      schema.playerVehicles,
      schema.groundTravel,
      schema.jobTemplates,
      schema.jobPostings,
      schema.jobApplications,
      schema.playerEmployment,
      schema.domainEvents,
      schema.auditLog,
      schema.notifications,
    ];

    for (const table of expectedTables) {
      expect(getTableName(table)).toEqual(expect.any(String));
    }
    expect(expectedTables).toHaveLength(37);
  });

  it("gives every ledger entry an idempotency key column (section 7.3)", () => {
    expect(schema.ledgerEntries.idempotencyKey).toBeDefined();
    expect(schema.airportActivityEvents.idempotencyKey).toBeDefined();
    expect(schema.flightHourEntries.idempotencyKey).toBeDefined();
    expect(schema.domainEvents.idempotencyKey).toBeDefined();
  });
});
