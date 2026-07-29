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

export function OnboardingForm({ cities, action, defaultCityId }: OnboardingFormProps) {
  const [cityId, setCityId] = useState(defaultCityId);

  const selectedCity = useMemo(() => cities.find((city) => city.id === cityId), [cities, cityId]);
  const airports = selectedCity?.airports ?? [];
  const defaultAirportId = airports.find((a) => a.isPrimary)?.id ?? airports[0]?.id ?? "";

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="username" className="text-sm text-neutral-400">
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
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm text-neutral-400">
          Pilot display name
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={64}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="companyName" className="text-sm text-neutral-400">
          Company / operating name
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          maxLength={64}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="homeCityId" className="text-sm text-neutral-400">
          Starting city
        </label>
        <select
          id="homeCityId"
          name="homeCityId"
          value={cityId}
          onChange={(event) => setCityId(event.target.value)}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.region}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="homeAirportId" className="text-sm text-neutral-400">
          Home airport
        </label>
        <select
          id="homeAirportId"
          name="homeAirportId"
          key={cityId}
          defaultValue={defaultAirportId}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          {airports.map((airport) => (
            <option key={airport.id} value={airport.id}>
              {airport.ident} - {airport.name}
              {airport.isPrimary ? " (primary)" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={airports.length === 0}
        className="w-full rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        Start my career
      </button>
    </form>
  );
}
