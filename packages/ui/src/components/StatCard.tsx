import { Card } from "./Card.js";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

/** A single dashboard stat tile (spec section 26.3: balances, hours, next payroll, etc.). */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-50">{value}</div>
      {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
    </Card>
  );
}
