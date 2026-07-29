/**
 * Centralized, tested unit conversions (spec section 31.3).
 * Canonical units:
 *  - Aviation distance: nautical miles (NM)
 *  - Ground distance: statute miles (SM)
 *  - Aircraft weight: pounds (lb)
 *  - Fuel: gallons
 *  - Speed: knots in flight, mph on the ground
 */

const NM_PER_SM = 0.868976;
const SM_PER_NM = 1 / NM_PER_SM;
const KG_PER_LB = 0.45359237;

export function nauticalMilesToStatuteMiles(nm: number): number {
  return nm * SM_PER_NM;
}

export function statuteMilesToNauticalMiles(sm: number): number {
  return sm * NM_PER_SM;
}

export function knotsToMph(knots: number): number {
  return knots * SM_PER_NM;
}

export function mphToKnots(mph: number): number {
  return mph * NM_PER_SM;
}

export function poundsToKilograms(lb: number): number {
  return lb * KG_PER_LB;
}

export function kilogramsToPounds(kg: number): number {
  return kg / KG_PER_LB;
}
