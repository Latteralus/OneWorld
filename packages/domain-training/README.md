# @oneworld/domain-training

Training enrollment timers and check-flight workflow (spec section 17.4, 21.2).

## Ownership

Authoritative owner of **training status** - `training_enrollments`. Pilot
hour totals themselves are owned by `@oneworld/domain-qualifications`; this
domain reads them as input to eligibility, never writes them.

## Public API

```ts
import { calculateTrainingEligibility } from "@oneworld/domain-training";
```

## State machine

`ENROLLED -> IN_PROGRESS -> READY_FOR_CHECK_FLIGHT -> CHECK_FLIGHT_SCHEDULED
-> COMPLETED`, plus `CANCELLED` and `FAILED_CHECK_FLIGHT` (spec section
17.4). The state union lives in `@oneworld/contracts`
(`trainingEnrollmentStates`).

## Key invariants

- Eligibility (prerequisites + required hours by category) is entirely
  config-driven via `@oneworld/config`'s `qualificationConfig` - the UI
  must call `calculateTrainingEligibility` rather than reproducing the
  rules client-side (section 17.5).
- Training timers run in real time regardless of whether the player is
  online (section 17.4) - the worker's training-completion job is
  authoritative, not a client timer.
- Training cannot be bypassed (roadmap Phase 7 exit criterion) - tuition
  charge, timer completion, and (where required) a valid check flight must
  all be satisfied before `QualificationAwarded` fires.

## Roadmap status

Phase 0 delivers the pure eligibility math above. Enrollment, timers, and
check-flight orchestration land in Phase 7 per the implementation roadmap.

## Testing

```bash
pnpm --filter @oneworld/domain-training test
```
