/**
 * Shared geographic utilities (spec section 21.4).
 * Canonical units: aviation distance is nautical miles, ground distance is
 * statute miles (section 31.3). Conversions are centralized in `units.ts`.
 */

const EARTH_RADIUS_NM = 3440.065;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle (haversine) distance between two points in nautical miles.
 * This is the shared primitive every domain uses for route distance;
 * do not reimplement haversine elsewhere (section 21.4).
 */
export function calculateGreatCircleDistanceNm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));

  return EARTH_RADIUS_NM * c;
}
