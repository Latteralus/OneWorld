import type { WorkerJob } from "../scheduler.js";
import { groundTravelCompletionJob } from "./ground-travel.job.js";
import { passengerGenerationJob, passengerReservationExpirationJob } from "./passenger-pool.job.js";
import { aircraftReservationExpirationJob } from "./aircraft-reservation.job.js";
import { dailyPayrollJob, employmentApplicationDecisionJob } from "./employment.job.js";
import { weeklyRentJob } from "./housing.job.js";
import { weeklyVehicleMaintenanceJob } from "./vehicle.job.js";
import { trainingTimerCompletionJob } from "./training.job.js";
import { airportActivityDecayJob } from "./airport-activity.job.js";
import { reconciliationJob } from "./reconciliation.job.js";

/** Every registered job (spec section 25.1). Each is currently a no-op placeholder - see its file for the roadmap phase that implements it. */
export const allJobs: WorkerJob[] = [
  groundTravelCompletionJob,
  passengerGenerationJob,
  passengerReservationExpirationJob,
  aircraftReservationExpirationJob,
  employmentApplicationDecisionJob,
  dailyPayrollJob,
  weeklyRentJob,
  weeklyVehicleMaintenanceJob,
  trainingTimerCompletionJob,
  airportActivityDecayJob,
  reconciliationJob,
];
