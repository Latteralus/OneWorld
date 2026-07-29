import Link from "next/link";
import { Card } from "@oneworld/ui";
import { getAuthenticatedUserId } from "../lib/auth.js";

const PILLARS = [
  {
    title: "Persistent world",
    body: "The world keeps running while you're offline - travel, training, wages, rent, and passenger demand all move on server-controlled real time.",
  },
  {
    title: "Real flying matters",
    body: "Paid aviation work is flown in a supported simulator and validated by the tracker. The web game creates the reason to fly; MSFS is where you fly it.",
  },
  {
    title: "Career progression",
    body: "Advancement comes from verified hours, qualifications, training fees, and check flights - not from hitting a generic level.",
  },
  {
    title: "Meaningful location",
    body: "You, your aircraft, your vehicle, and your jobs all exist somewhere. Travel to the airport before you fly from it.",
  },
  {
    title: "Shared airport development",
    body: "Every flight you fly changes the airports you touch, growing their activity and the passenger pools other pilots see.",
  },
  {
    title: "Economic pressure, not early ruin",
    body: "Rent, maintenance, fuel, and training create real pressure - a civilian job is there so a new pilot can survive and recover.",
  },
] as const;

const NEW_PLAYER_STEPS = [
  "Create an account and a pilot/company identity",
  "Choose a starting city and home airport",
  "Receive your starting PPL, apartment, car, and cash",
  "Apply for a civilian job for steady income",
  "Travel to your home airport and find passengers",
  "Fly the route in MSFS, then land and submit for money and hours",
] as const;

export default async function HomePage() {
  const userId = await getAuthenticatedUserId();

  return (
    <div className="space-y-16">
      <section className="space-y-6 py-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
          Preview build - under active development
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">OneWorld</h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-400">
          A persistent multiplayer aviation career and life-simulation platform. Build a pilot
          career, one verified flight at a time.
        </p>
        <blockquote className="mx-auto max-w-xl text-balance text-neutral-300 italic">
          &ldquo;This is the aviation career and life I built.&rdquo;
        </blockquote>
        <div className="flex justify-center gap-3 pt-2">
          {userId ? (
            <Link
              href="/dashboard"
              className="inline-block rounded bg-neutral-100 px-5 py-2.5 font-medium text-neutral-900"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-block rounded bg-neutral-100 px-5 py-2.5 font-medium text-neutral-900"
              >
                Create your pilot
              </Link>
              <Link
                href="/login"
                className="inline-block rounded border border-neutral-700 px-5 py-2.5 font-medium text-neutral-200"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-xl font-semibold text-neutral-200">
          What makes it different
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title}>
              <h3 className="font-medium text-neutral-100">{pillar.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-xl font-semibold text-neutral-200">How it starts</h2>
        <Card className="mx-auto max-w-2xl">
          <ol className="space-y-3">
            {NEW_PLAYER_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-neutral-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-400">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
        {!userId ? (
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-block rounded bg-neutral-100 px-5 py-2.5 font-medium text-neutral-900"
            >
              Create your pilot
            </Link>
          </div>
        ) : null}
      </section>

      <p className="text-center text-xs text-neutral-600">
        See the project README for setup and roadmap status.
      </p>
    </div>
  );
}
