# OneWorld — Local Employment System

## 1. Purpose

Players in the early stages of their aviation career may hold one civilian job in their current city.

Civilian employment provides a small, reliable daily income while the player:

* Builds flight hours
* Pays weekly rent
* Maintains a vehicle
* Saves for training
* Recovers from unsuccessful flights
* Learns the game’s economy

The system acts as a realistic economic safety net without directly giving players free money.

The job does not initially require the player to perform shifts, complete minigames, or remain online.

Once hired, the player receives the listed wage automatically each day.

---

# 2. One-Job Rule

A player may hold only one active job at a time.

An active job may later be:

* Civilian employment
* Airport employment
* Flight-school employment
* Charter-company employment
* Regional-airline employment
* Major-airline employment

The same employment slot is used throughout the player’s career.

This creates a meaningful choice later:

> A player cannot remain employed as a bartender while also receiving a salary from a major airline.

When a player accepts a new position, they must leave their existing job.

---

# 3. Early Civilian Jobs

Each supported city or airport area should contain several entry-level jobs.

Initial examples:

| Job                          | Daily Wage | General Availability |
| ---------------------------- | ---------: | -------------------- |
| Dishwasher                   |       $105 | Very High            |
| Fast-Food Worker             |       $115 | Very High            |
| Convenience Store Clerk      |       $120 | High                 |
| Hotel Housekeeper            |       $125 | High                 |
| Warehouse Worker             |       $135 | High                 |
| Cook                         |       $140 | Medium               |
| Bartender                    |       $150 | Medium               |
| Airport Ramp Worker          |       $155 | Medium               |
| Fuel Attendant               |       $160 | Low                  |
| Airport Operations Assistant |       $175 | Low                  |

These amounts are examples and should be balanced against:

* $800 weekly rent
* $25 weekly vehicle maintenance
* Vehicle fuel
* Bus fares
* Aircraft rental
* Flight training
* Average PPL job profit

A player should not become wealthy through basic employment.

## Recommended Economic Target

A normal starting job should pay approximately:

```text
$115–$150 per day
```

At $125 per day:

```text
$125 × 7 days = $875 per week
```

That would nearly cover the starting player’s fixed expenses:

```text
Apartment Rent:       $800
Vehicle Maintenance:   $25
Total Fixed Expenses: $825
```

The player would have approximately $50 remaining before:

* Vehicle fuel
* Ground travel
* Food or lifestyle costs added later
* Training
* Aircraft expenses

This makes employment a survival mechanism while flying remains necessary for progression.

---

# 4. City Employment Markets

Each airport should be connected to a city or employment area.

The employment market belongs to the city rather than literally to the runway or airport property.

For example:

```text
Airport: KBOI
Employment Area: Boise, Idaho
```

The Boise job market may contain:

* Dishwasher
* Cook
* Bartender
* Warehouse Worker
* Hotel Housekeeper
* Airport Ramp Worker

A smaller airport may have fewer available jobs.

Example:

```text
Airport: KMYL
Employment Area: McCall, Idaho
```

Possible jobs:

* Hotel Housekeeper
* Cook
* Bartender
* Convenience Store Clerk
* Airport Fuel Attendant

This allows employment availability to reflect the city’s size without requiring a complex simulated labor economy.

---

# 5. Employment Market Data

Each employment area should have a configured pool of job templates.

```ts
interface EmploymentArea {
  id: string;
  cityName: string;
  regionCode: string;
  countryCode: string;
  connectedAirportIds: string[];
  employmentTier:
    | 'remote'
    | 'small_town'
    | 'regional_city'
    | 'major_city';
}
```

```ts
interface JobTemplate {
  id: string;
  title: string;
  description: string;
  category:
    | 'hospitality'
    | 'retail'
    | 'warehouse'
    | 'airport'
    | 'aviation'
    | 'airline';

  baseDailyWage: number;
  minimumCareerStage: CareerStage;
  maximumCareerStage?: CareerStage;
  aviationRelated: boolean;
}
```

Available job postings should be separate from job templates.

```ts
interface JobPosting {
  id: string;
  employmentAreaId: string;
  jobTemplateId: string;
  dailyWage: number;
  openings: number;
  postedAt: Date;
  expiresAt: Date;
  status: 'open' | 'filled' | 'expired';
}
```

This lets multiple cities use the same job type while offering different wages and openings.

---

# 6. Applying for a Job

Players should not instantly select any job from a dropdown.

They must submit an application.

For the preview, the application process should remain simple.

## Application Requirements

The player must:

* Be physically located in the employment area
* Have no pending application elsewhere
* Meet any career-stage requirement
* Not already hold an incompatible job
* Apply before the posting expires

The application contains no résumé-writing minigame.

```ts
interface JobApplication {
  id: string;
  playerId: string;
  postingId: string;
  submittedAt: Date;
  decisionAt: Date;
  status:
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'withdrawn'
    | 'expired';
}
```

## Application Delay

Recommended initial decision time:

```text
2–6 real-world hours
```

This makes employment feel like a process while remaining accessible.

The application outcome should be determined and stored when submitted, but revealed when the decision time arrives.

This avoids rerolling outcomes if a worker executes more than once.

---

# 7. Application Success

Early civilian jobs should have generous acceptance rates because the system is intended to prevent economic collapse.

Suggested acceptance rates:

| Job Availability | Acceptance Chance |
| ---------------- | ----------------: |
| Very High        |               95% |
| High             |               85% |
| Medium           |               70% |
| Low              |               50% |

Possible modifiers added later:

* Prior employment history
* Player status
* Reliability
* Qualifications
* Criminal or disciplinary history
* Local labor demand
* Previous work in the same field

These modifiers are not needed for the first preview.

For the preview, the acceptance result can be based only on:

* Base acceptance rate
* Remaining openings
* Player eligibility

---

# 8. Hiring

When an application is accepted, the player may receive an offer.

The player must choose:

* Accept offer
* Decline offer

Accepting the offer creates an active employment record.

```ts
interface PlayerEmployment {
  id: string;
  playerId: string;
  postingId: string;
  jobTemplateId: string;
  employmentAreaId: string;
  title: string;
  dailyWage: number;
  hiredAt: Date;
  nextPayAt: Date;
  status:
    | 'active'
    | 'resigned'
    | 'terminated'
    | 'replaced';
}
```

The accepted wage should remain fixed for that employment record unless the game later adds raises or wage changes.

---

# 9. Daily Pay

An employed player receives one wage payment per real-world day.

Recommended initial payment schedule:

```text
12:00 AM Eastern Time
```

However, the backend must store and process timestamps in UTC.

The game may display Eastern Time to players while still using UTC internally.

Each payment creates a financial-ledger entry.

```text
Employment Income — Bartender
+$150.00
Boise, Idaho
```

The payment must use a unique idempotency key.

Example:

```text
employment:{employmentId}:pay:{paymentDate}
```

This prevents a player from receiving the same daily wage twice.

---

# 10. No Shift Simulation in the Preview

Civilian employment should not initially:

* Consume a portion of the player’s day
* Prevent flying during work hours
* Require scheduled attendance
* Require manual clock-in
* Require minigames
* Cause performance events
* Generate coworkers
* Generate manager interactions
* Affect fatigue
* Require uniforms or equipment

The job is represented abstractly.

The assumption is that the character performs the job around their flying schedule.

The system should clearly label this simplification:

> Civilian employment is currently abstracted. Your daily wage is paid automatically while employed.

A more detailed scheduling system can be added later without changing the employment records or payment ledger.

---

# 11. Changing Jobs

A player may apply for another job while already employed.

However, the player cannot accept the new offer until they resign from or replace their current job.

When accepting a new offer, the game should display:

```text
You are currently employed as a Cook.

Accepting this position will end your current employment.

Current Job:
Cook — $140 per day

New Job:
Airport Ramp Worker — $155 per day
```

The player confirms the replacement.

The old employment record becomes:

```text
replaced
```

The new employment record becomes:

```text
active
```

---

# 12. Resignation

Players may resign at any time.

Resignation should take effect immediately in the first preview.

The player receives no payment for future days.

There should be no major punishment for resigning from an entry-level civilian job.

Later systems may track:

* Employment duration
* Notice given
* Rehire eligibility
* Professional reputation

These are outside the preview scope.

---

# 13. Location Rules

A player must be physically present in the job’s employment area when applying.

Once employed, the player may travel and fly elsewhere without losing the job.

This is necessary because employment should support the aviation loop rather than trap the player in one city.

For the preview:

* Players can continue receiving wages while traveling.
* Players can continue receiving wages while flying.
* Players do not need to return home for shifts.
* The job does not end when the player changes airport.

Later airline employment may impose:

* Assigned base
* Duty schedule
* Required flights
* Attendance expectations

Those rules should not be applied to basic civilian work.

---

# 14. Job Availability

Each employment area should maintain a small number of active postings.

Recommended posting counts:

| Employment Area | Active Postings |
| --------------- | --------------: |
| Remote          |             2–4 |
| Small Town      |             3–6 |
| Regional City   |            5–10 |
| Major City      |            8–15 |

The system should replenish expired or filled listings periodically.

For the preview, postings may be generated from fixed weighted templates.

Example Boise weights:

```ts
const BOISE_JOB_WEIGHTS = {
  dishwasher: 12,
  fastFoodWorker: 12,
  convenienceClerk: 10,
  hotelHousekeeper: 8,
  warehouseWorker: 10,
  cook: 7,
  bartender: 6,
  rampWorker: 4,
  fuelAttendant: 2,
} as const;
```

This is not intended to replicate the real labor market. It provides believable variety.

---

# 15. Player-Facing Job Information

Each job posting should show only basic information.

Example:

```text
Bartender

Location: Boise, Idaho
Daily Wage: $150
Openings: 2
Application Time: Approximately 4 hours

A local bar is hiring a bartender to serve customers and maintain the bar area.
No prior experience is required.
```

The posting does not need:

* Named employers
* Manager personalities
* Shift schedules
* Detailed benefits
* Interviews
* Skill checks
* Promotion tracks

Named businesses can be added later.

---

# 16. Employment Screen

The employment page should contain three sections.

## Current Employment

```text
Current Job: Warehouse Worker
Location: Boise, Idaho
Daily Wage: $135
Hired: August 3, 2026
Next Pay: 4h 18m
Total Earned: $1,485
```

## Pending Applications

```text
Airport Ramp Worker
Status: Application Pending
Decision Expected: 2h 42m
```

## Available Jobs

Shows the player’s current local employment market.

The player should not be able to browse or apply for local employment in another city unless physically present there.

---

# 17. Relationship to Flight Progression

Civilian employment is intended for early and lower aviation stages.

It supports players while they hold qualifications such as:

* Private Pilot License
* High-Performance Endorsement
* Instrument Rating
* Early Commercial Qualification
* Multi-Engine Rating

The player may continue holding a civilian job while independently flying passenger jobs.

Eventually, aviation employers become available.

Examples:

* Flight school
* Small charter operator
* Regional cargo carrier
* Regional airline
* Major airline

These aviation positions use the same one-job employment slot.

---

# 18. Airline Employment

When a player accepts employment with a large airline, it replaces their civilian job.

An airline position should later include:

* Assigned airline
* Assigned base
* Salary or daily pay
* Required aircraft qualifications
* Seniority
* Assigned routes
* Minimum activity
* Flight obligations
* Career advancement

Example:

```text
Current Employment:
Bartender — $150 per day

Offer:
First Officer, Regional Air
Base: KBOI
Salary: $280 per day

Accepting this offer will end your civilian employment.
```

Unlike civilian employment, airline employment should eventually require the player to perform airline flights.

For the first preview, airline employment should either be excluded or represented only as a future locked career stage.

---

# 19. Economic Safeguards

The employment system should prevent severe early failure without replacing aviation gameplay.

## Civilian Wages Should Cover

* Most or all basic rent
* Basic vehicle maintenance
* Some fuel or bus travel

## Civilian Wages Should Not Easily Cover

* Advanced training
* Aircraft purchases
* Expensive aircraft rentals
* Luxury housing
* High-status vehicles
* Major business investment

The player should need flight profits to advance.

A useful economic relationship is:

```text
Civilian Job = Survival and stability
Passenger Flying = Career growth
Aircraft Ownership = Wealth building
Airline Employment = Career specialization
```

---

# 20. Failure Protection

A player who loses their job should not immediately collapse financially.

Recommended safeguards:

* Frequent basic job openings
* High acceptance rates for low-wage positions
* Several days before missed rent creates serious consequences
* Bus transportation available without a car
* Ability to downgrade housing
* No permanent application rejection
* Reapplication allowed after a short cooldown

This makes recovery possible without simply crediting free money.

---

# 21. Employment Domain

Employment should be its own domain module.

```text
packages/domain-employment/
  src/
    application/
      application.service.ts
      application.rules.ts
      application.types.ts

    employment/
      employment.service.ts
      employment.rules.ts
      employment.types.ts

    postings/
      posting.generator.ts
      posting.repository.ts
      posting.types.ts

    payroll/
      payroll.service.ts
      payroll.rules.ts

    employment.events.ts
    employment.config.ts
    index.ts
```

The finance domain remains responsible for recording money.

The employment domain determines whether a payment is owed.

---

# 22. Employment Events

Initial domain events:

```text
JobPostingCreated
JobPostingExpired
JobApplicationSubmitted
JobApplicationAccepted
JobApplicationRejected
JobOfferAccepted
PlayerEmployed
PlayerResigned
EmploymentReplaced
DailyWageEarned
```

When `DailyWageEarned` is emitted, the finance domain records the payment.

The employment module should not directly update a balance column.

---

# 23. Preview Configuration

All jobs and wage values should be configurable.

```ts
export const CIVILIAN_JOB_CONFIG = {
  dishwasher: {
    title: 'Dishwasher',
    dailyWage: 105,
    acceptanceChance: 0.95,
    postingWeight: 12,
  },

  fastFoodWorker: {
    title: 'Fast-Food Worker',
    dailyWage: 115,
    acceptanceChance: 0.95,
    postingWeight: 12,
  },

  convenienceClerk: {
    title: 'Convenience Store Clerk',
    dailyWage: 120,
    acceptanceChance: 0.85,
    postingWeight: 10,
  },

  warehouseWorker: {
    title: 'Warehouse Worker',
    dailyWage: 135,
    acceptanceChance: 0.85,
    postingWeight: 10,
  },

  cook: {
    title: 'Cook',
    dailyWage: 140,
    acceptanceChance: 0.70,
    postingWeight: 7,
  },

  bartender: {
    title: 'Bartender',
    dailyWage: 150,
    acceptanceChance: 0.70,
    postingWeight: 6,
  },

  rampWorker: {
    title: 'Airport Ramp Worker',
    dailyWage: 155,
    acceptanceChance: 0.70,
    postingWeight: 4,
  },

  fuelAttendant: {
    title: 'Airport Fuel Attendant',
    dailyWage: 160,
    acceptanceChance: 0.50,
    postingWeight: 2,
  },
} as const;
```

No wages, application chances, or job-generation weights should be hard-coded inside UI components or worker functions.

---

# 24. Preview Scope

## Include

* One active job per player
* Local job postings
* Basic civilian job types
* Application submission
* Delayed acceptance or rejection
* Job offers
* Daily wage
* Employment replacement
* Resignation
* Employment ledger history
* City-specific job availability

## Exclude

* Manual shifts
* Work schedules
* Employee performance
* Promotions
* Coworkers
* Social interactions
* Workplace events
* Benefits
* Taxes
* Detailed employers
* Interviews
* Résumés
* Skills
* Fatigue from employment
* Termination for inactivity

---

# 25. Core Rule

Civilian employment must provide stability, but aviation must provide progression.

A player should be able to survive on a basic job.

A player should not be able to build a serious aviation career without flying.
