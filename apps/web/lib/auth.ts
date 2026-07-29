import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase/server.js";

/** The authenticated Supabase user id, or `null` if there's no session. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Redirects to `/login` if there's no session - use at the top of pages that require auth. */
export async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login");
  return userId;
}
