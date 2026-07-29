import { StatCard } from "@oneworld/ui";
import { economyConfig, onboardingConfig } from "@oneworld/config";
import { cents, formatUsd } from "@oneworld/utils";

/**
 * Placeholder dashboard (spec section 26.3) showing the starting-state
 * defaults from config. Wired to real player/finance/travel data once the
 * onboarding service (Phase 1) and finance queries (Phase 2) exist.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-neutral-500">
        Showing starting-state configuration defaults - not a live player yet.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Personal balance"
          value={formatUsd(cents(economyConfig.startingPersonalBalanceCents))}
        />
        <StatCard
          label="Company balance"
          value={formatUsd(cents(economyConfig.startingCompanyBalanceCents))}
        />
        <StatCard
          label="Residence"
          value={onboardingConfig.startingResidence.name}
          hint={`${formatUsd(cents(onboardingConfig.startingResidence.weeklyRentCents))}/week`}
        />
        <StatCard
          label="Vehicle"
          value={onboardingConfig.startingVehicle.name}
          hint={`${formatUsd(cents(onboardingConfig.startingVehicle.weeklyMaintenanceCents))}/week maintenance`}
        />
      </div>
    </div>
  );
}
