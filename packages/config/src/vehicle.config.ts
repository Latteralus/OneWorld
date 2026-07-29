/**
 * Vehicle system balance values (spec section 10).
 */
export const vehicleConfig = {
  /** Weekly maintenance abstractly covers insurance, servicing, and repairs (10.5). */
  defaultWeeklyMaintenanceCents: 2_500,
  /** Ground fuel is auto-purchased on travel start in the preview (10.4, 35.12). */
  autoPurchaseFuelOnTravel: true,
  /** In the preview, mileage/lifespan are tracked and displayed but do not force breakdowns (10.3). */
  breakdownsEnabled: false,
} as const;

export type VehicleConfig = typeof vehicleConfig;
