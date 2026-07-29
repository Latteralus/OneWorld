import Link from "next/link";
import { getAuthenticatedUserId } from "../lib/auth.js";
import { signOut } from "../app/logout/actions.js";

/** Sign-in link or sign-out button, based on the current server-side session. */
export async function AuthStatus() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return (
      <Link href="/login" className="rounded px-3 py-1.5 text-neutral-300 hover:bg-neutral-800">
        Sign in
      </Link>
    );
  }

  return (
    <form action={signOut}>
      <button type="submit" className="rounded px-3 py-1.5 text-neutral-300 hover:bg-neutral-800">
        Sign out
      </button>
    </form>
  );
}
