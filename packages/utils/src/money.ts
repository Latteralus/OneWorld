/**
 * Decimal-safe money helpers (spec section 31.2). Money is always
 * represented as an integer number of cents. Never do arithmetic on
 * dollar floats for anything that touches the ledger.
 */

export type Cents = number & { readonly __brand: "Cents" };

export function cents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new TypeError(`Cents must be an integer, received ${value}`);
  }
  return value as Cents;
}

export function dollarsToCents(dollars: number): Cents {
  // Round at the cent boundary to avoid binary-float drift (e.g. 19.999999999998).
  return cents(Math.round(dollars * 100));
}

export function centsToDollars(value: Cents): number {
  return value / 100;
}

export function addCents(...values: Cents[]): Cents {
  return cents(values.reduce((sum, v) => sum + v, 0));
}

export function subtractCents(a: Cents, b: Cents): Cents {
  return cents(a - b);
}

/**
 * Multiplies a cents amount by a rational factor expressed as
 * `numerator / denominator` so callers never pass a raw floating-point
 * multiplier through to money math. Rounds to the nearest cent.
 */
export function scaleCents(value: Cents, numerator: number, denominator = 1): Cents {
  if (denominator === 0) throw new RangeError("denominator must not be zero");
  return cents(Math.round((value * numerator) / denominator));
}

/**
 * Splits an amount into `parts` integer-cent shares that sum exactly back
 * to the original amount, distributing the remainder to the first shares.
 * Use this instead of naive division when allocating a settlement across
 * multiple ledger entries.
 */
export function allocateCents(value: Cents, parts: number): Cents[] {
  if (parts <= 0) throw new RangeError("parts must be a positive integer");
  const base = Math.floor(value / parts);
  const remainder = value - base * parts;
  return Array.from({ length: parts }, (_, i) => cents(base + (i < remainder ? 1 : 0)));
}

export function isNegative(value: Cents): boolean {
  return value < 0;
}

export function formatUsd(value: Cents): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    centsToDollars(value),
  );
}
