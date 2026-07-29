import Link from "next/link";
import { Card } from "@oneworld/ui";
import { signup } from "./actions.js";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-neutral-500">
        This creates your login. You&apos;ll choose your pilot name, company, and home city next.
      </p>

      {error ? (
        <p className="rounded border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <Card>
        <form action={signup} className="space-y-4">
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
              minLength={6}
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Create account
          </button>
        </form>
      </Card>

      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-100 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
