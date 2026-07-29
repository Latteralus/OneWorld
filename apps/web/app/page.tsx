import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">OneWorld</h1>
      <p className="text-neutral-400">
        Persistent aviation career and life-simulation platform. This preview build is under active
        development - see the project README for setup and roadmap status.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded bg-neutral-100 px-4 py-2 text-neutral-900"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
