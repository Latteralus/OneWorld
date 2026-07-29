"use client";

import { useMemo, useState } from "react";

export interface OnboardingCityOption {
  id: string;
  name: string;
  region: string;
  airports: Array<{ id: string; ident: string; name: string; isPrimary: boolean }>;
}

export interface OnboardingFormProps {
  cities: OnboardingCityOption[];
  action: (formData: FormData) => void;
  defaultCityId: string;
}

const fieldLabel = "text-sm font-medium text-neutral-300";
const textInput =
  "w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none";

function SelectableCard({
  selected,
  onSelect,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        selected
          ? "border-neutral-300 bg-neutral-800 text-neutral-50"
          : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{title}</span>
        {badge ? (
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-neutral-200">
            {badge}
          </span>
        ) : null}
      </div>
      {subtitle ? <div className="mt-0.5 text-xs text-neutral-500">{subtitle}</div> : null}
    </button>
  );
}

export function OnboardingForm({ cities, action, defaultCityId }: OnboardingFormProps) {
  const [cityId, setCityId] = useState(defaultCityId);
  const selectedCity = useMemo(() => cities.find((city) => city.id === cityId), [cities, cityId]);
  const airports = selectedCity?.airports ?? [];

  const [airportId, setAirportId] = useState(
    () => airports.find((a) => a.isPrimary)?.id ?? airports[0]?.id ?? "",
  );

  function selectCity(nextCityId: string) {
    setCityId(nextCityId);
    const nextCity = cities.find((city) => city.id === nextCityId);
    const nextAirports = nextCity?.airports ?? [];
    setAirportId(nextAirports.find((a) => a.isPrimary)?.id ?? nextAirports[0]?.id ?? "");
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="homeCityId" value={cityId} />
      <input type="hidden" name="homeAirportId" value={airportId} />

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          1. Your identity
        </legend>
        <div className="space-y-1">
          <label htmlFor="username" className={fieldLabel}>
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            title="Letters, numbers, and underscores only"
            placeholder="skywalker"
            className={textInput}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="displayName" className={fieldLabel}>
            Pilot display name
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            maxLength={64}
            placeholder="Alex Rivera"
            className={textInput}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="companyName" className={fieldLabel}>
            Company / operating name
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            maxLength={64}
            placeholder="Rivera Air Services"
            className={textInput}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          2. Starting city
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {cities.map((city) => (
            <SelectableCard
              key={city.id}
              selected={city.id === cityId}
              onSelect={() => selectCity(city.id)}
              title={city.name}
              subtitle={city.region}
              badge={`${city.airports.length} airport${city.airports.length === 1 ? "" : "s"}`}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          3. Home airport
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {airports.map((airport) => (
            <SelectableCard
              key={airport.id}
              selected={airport.id === airportId}
              onSelect={() => setAirportId(airport.id)}
              title={airport.ident}
              subtitle={airport.name}
              badge={airport.isPrimary ? "Primary" : undefined}
            />
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={airports.length === 0 || !airportId}
        className="w-full rounded bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        Start my career
      </button>
    </form>
  );
}
