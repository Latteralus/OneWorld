import { Card } from "@oneworld/ui";

/** Admin tool categories (spec section 28.3). Each is a placeholder until Phase 8. */
const TOOL_CATEGORIES = [
  "Player search & state inspection",
  "Ledger viewer",
  "Flight evidence & validation flags",
  "Passenger & aircraft reservations",
  "Stuck-lock release",
  "Reconciliation re-run",
  "Audited compensating transactions",
  "Airport / aircraft enable-disable",
  "Balance configuration",
  "Unsupported-aircraft mapping review",
  "Account suspension",
] as const;

export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-neutral-500">
        Planned admin tool surface (spec section 28.3) - not yet implemented (roadmap Phase 8).
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOL_CATEGORIES.map((tool) => (
          <Card key={tool}>{tool}</Card>
        ))}
      </div>
    </div>
  );
}
