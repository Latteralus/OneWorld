import { dollarsToCents, type Cents } from "@oneworld/utils";

/**
 * Fuel used for a ground trip (spec section 10.4):
 * `fuel used = route miles / vehicle MPG`.
 * This is the one place this formula should exist (section 21.4).
 */
export function calculateVehicleFuelUseGallons(
  routeMiles: number,
  fuelEfficiencyMpg: number,
): number {
  if (fuelEfficiencyMpg <= 0) {
    throw new RangeError("fuelEfficiencyMpg must be positive");
  }
  return routeMiles / fuelEfficiencyMpg;
}

/** `fuel cost = fuel used * regional ground-fuel price` (spec section 10.4). */
export function calculateVehicleFuelCostCents(
  fuelGallonsUsed: number,
  pricePerGallonDollars: number,
): Cents {
  return dollarsToCents(fuelGallonsUsed * pricePerGallonDollars);
}

/** Mileage after a trip - ground travel increases mileage by route distance (section 10.3). */
export function calculateMileageAfterTrip(currentMileage: number, routeMiles: number): number {
  return currentMileage + routeMiles;
}

/**
 * Fraction of expected lifespan consumed. Preview does not force
 * breakdowns from this (section 10.3, `vehicleConfig.breakdownsEnabled`
 * gates any future consequence) - it is display/tracking data only.
 */
export function calculateLifespanFractionUsed(
  currentMileage: number,
  expectedLifespanMiles: number,
): number {
  if (expectedLifespanMiles <= 0) {
    throw new RangeError("expectedLifespanMiles must be positive");
  }
  return Math.min(1, currentMileage / expectedLifespanMiles);
}

/** Inclusive random starting mileage for a granted vehicle (spec section 6.4). */
export function pickRandomStartingMileage(min: number, max: number): number {
  if (min > max) {
    throw new RangeError("min must not be greater than max");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
