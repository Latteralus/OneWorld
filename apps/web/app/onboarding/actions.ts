"use server";

import { redirect } from "next/navigation";
import { getDb } from "@oneworld/db";
import { runOnboardingTransaction } from "@oneworld/domain-players";
import { asAirportId, asCityId, DomainError } from "@oneworld/contracts";
import { requireAuthenticatedUserId } from "../../lib/auth.js";

export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const authUserId = await requireAuthenticatedUserId();

  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const homeCityId = String(formData.get("homeCityId") ?? "");
  const homeAirportId = String(formData.get("homeAirportId") ?? "");

  if (!username || !displayName || !companyName || !homeCityId || !homeAirportId) {
    redirect(`/onboarding?error=${encodeURIComponent("All fields are required.")}`);
  }

  try {
    await runOnboardingTransaction(getDb(), {
      authUserId,
      username,
      displayName,
      companyName,
      homeCityId: asCityId(homeCityId),
      homeAirportId: asAirportId(homeAirportId),
    });
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/dashboard");
}
