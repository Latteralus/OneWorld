import Link from "next/link";
import { Card } from "@oneworld/ui";
import { login } from "./actions.js";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {error ? (
        <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300">
          {message}
        </p>
      ) : null}

      <Card>
        <form action={login} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm text-neutral-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-neutral-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Sign in
          </button>
        </form>
      </Card>

      <p className="text-sm text-neutral-400">
        New here?{" "}
        <Link href="/signup" className="text-neutral-100 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
