"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server.js";

export async function signup(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    // Email confirmation is disabled for this project - the account is immediately usable.
    redirect("/onboarding");
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Check your email to confirm your account, then sign in."),
  );
}
