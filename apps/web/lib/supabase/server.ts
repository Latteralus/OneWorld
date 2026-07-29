import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { loadEnv } from "@oneworld/config";

/**
 * Cookie-aware Supabase client for Server Components/Actions/Route
 * Handlers (spec section 28.1: server-side auth is authoritative). The
 * anon key is safe here - Postgres row-level security, not this key,
 * enforces access.
 */
export async function createServerSupabaseClient() {
  const env = loadEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, which can't set cookies -
          // the middleware's session refresh (lib/supabase/middleware.ts) covers this.
        }
      },
    },
  });
}
