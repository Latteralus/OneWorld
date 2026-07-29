import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv } from "@oneworld/config";

let browserClient: SupabaseClient | undefined;
let serviceClient: SupabaseClient | undefined;

/** Anon-key client, safe for the browser/web app (auth, storage, realtime). */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const env = loadEnv();
    browserClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return browserClient;
}

/**
 * Service-role client. Server-only (worker, admin, server actions) - never
 * ship the service role key to the browser. Bypasses row-level security,
 * so callers are responsible for authorization (spec section 28.1).
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const env = loadEnv();
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for the service client");
    }
    serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
