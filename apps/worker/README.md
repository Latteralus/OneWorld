# @oneworld/worker

Background worker: recurring jobs, reconciliation, and outbox dispatch
(spec section 25).

## Structure

- `scheduler.ts` - the recurring-job runner. Real and tested: catches
  per-job failures without stopping other jobs, and logs structured
  `job_completed`/`job_failed` events with a run ID (section 29.1).
- `jobs/*.job.ts` - one file per recurring job from section 25.1. Every job
  is currently a **no-op placeholder** with a `TODO(PhaseN)` comment
  naming the domain service it will call once that roadmap phase lands -
  see `IMPLEMENTATION_STATUS.md` at the repo root for the full list.

## Key invariants

- Every job must be safe to run more than once (section 25.2) - when
  implementing a job body, use the target domain's idempotency-key
  builders (e.g. `@oneworld/domain-finance`'s `buildIdempotencyKey`)
  rather than inventing ad hoc dedupe logic.
- Distributed locking/claims for running more than one worker instance
  (section 25.2) is not yet implemented - single-instance only until that
  lands.

## Local development

```bash
pnpm --filter @oneworld/worker dev
```

## Testing

```bash
pnpm --filter @oneworld/worker test
```
