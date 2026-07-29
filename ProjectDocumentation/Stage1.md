# OneWorld — First Preview Scope

## 1. Preview Objective

The first playable preview must demonstrate that OneWorld’s foundational gameplay loop works:

1. A player creates an account and selects a starting city.
2. The player receives a basic residence, vehicle, PPL, and starting funds.
3. The player travels to an airport.
4. The player finds passengers waiting at that airport.
5. The player selects a destination and creates or accepts a passenger flight.
6. The player rents an eligible aircraft.
7. The desktop tracker validates the simulator flight.
8. The passengers arrive at the destination.
9. The player receives payment and verified flight hours.
10. Airport activity and passenger availability update.

The preview should focus on:

* Player onboarding
* Player location
* Ground travel
* Airports
* Passenger availability
* Flight jobs
* Aircraft rentals
* Simulator tracking
* Flight completion
* Pilot hours
* Basic licensing progression
* Airport activity
* Financial transactions

The preview should not yet include:

* Persistent passenger personalities
* NPC reactions
* Relationships
* Social events
* Passenger satisfaction
* Passenger preferences
* Passenger patience
* Complex passenger demand modeling
* Cargo
* Player-owned FBOs
* NPC employees
* Investments
* Detailed lifestyle systems
* Complex maintenance failures
* Dynamic fuel supply chains

---

# 2. Simplified Passenger Model

Passengers should be treated as fungible airport demand rather than individual NPCs.

Each airport maintains a count of passengers currently waiting to travel.

Passengers are:

* Available to any valid destination
* Not individually named
* Not assigned personalities
* Not concerned with aircraft quality
* Not divided into travel purposes
* Not affected by service quality
* Not subject to social or narrative events

For the preview, a passenger at an airport is simply:

> One person currently willing to fly from this airport to any other supported airport.

## Passenger Pool

Each airport maintains an authoritative passenger pool:

```ts
interface AirportPassengerPool {
  airportId: string;
  waitingPassengers: number;
  reservedPassengers: number;
  inTransitPassengers: number;
  updatedAt: Date;
}
```

The system does not need to create separate passenger records for every person.

A job reservation only needs to record how many passengers were taken from the airport pool.

```ts
interface PassengerReservation {
  id: string;
  pilotId: string;
  originAirportId: string;
  destinationAirportId: string;
  passengerCount: number;
  aircraftId: string;
  status:
    | 'reserved'
    | 'boarding'
    | 'in_flight'
    | 'completed'
    | 'cancelled'
    | 'expired';
  reservedAt: Date;
  expiresAt: Date;
}
```

---

# 3. Passenger Availability

Every airport begins with a configured number of waiting passengers.

Example:

| Airport Type      | Starting Waiting Passengers |
| ----------------- | --------------------------: |
| Small airfield    |                        5–15 |
| Local airport     |                       15–40 |
| Regional airport  |                      40–100 |
| Major airport     |                     100–300 |
| International hub |                   300–1,000 |

These values should be configuration-driven.

```ts
export const PASSENGER_POOL_CONFIG = {
  smallAirfield: {
    minimum: 5,
    target: 10,
    maximum: 20,
  },
  localAirport: {
    minimum: 15,
    target: 30,
    maximum: 60,
  },
  regionalAirport: {
    minimum: 40,
    target: 75,
    maximum: 150,
  },
  majorAirport: {
    minimum: 100,
    target: 200,
    maximum: 400,
  },
  internationalHub: {
    minimum: 300,
    target: 600,
    maximum: 1200,
  },
} as const;
```

Passengers regenerate gradually toward the airport’s target passenger population.

For the preview:

```text
Passengers Generated Per Hour =
Airport Base Generation Rate
× Airport Activity Modifier
```

The exact formula should remain simple and easy to balance.

---

# 4. Passenger Destination Selection

Passengers do not have predetermined destinations in the first preview.

The player chooses:

* Origin airport
* Destination airport
* Number of passengers

The selected passengers are then considered willing to travel to that destination.

Example:

```text
Boise Airport has 48 waiting passengers.

The player selects:
Destination: McCall
Passengers: 3

Boise Airport now has:
45 waiting
3 reserved
```

This avoids requiring:

* Route-specific demand
* Destination matching
* Passenger expiry by route
* Individual passenger records
* Complex job generation

Later versions can replace this with destination-specific passenger demand without changing the surrounding flight and reservation systems.

---

# 5. Simplified Job Creation

Passenger jobs should be created from the player’s choices rather than requiring a large list of pre-generated assignments.

The player selects:

1. Current airport
2. Destination
3. Number of passengers
4. Eligible aircraft
5. Proposed departure

The server then validates:

* The player is at the origin airport.
* Enough passengers are available.
* The destination is supported.
* The selected aircraft has sufficient passenger capacity.
* The player is qualified to fly the aircraft.
* The route is within the player’s license restrictions.
* The aircraft is at the origin.
* The aircraft is available for rent.
* The expected flight is economically valid.

The system then calculates the fare and creates the reservation.

```ts
interface CreatePassengerJobInput {
  pilotId: string;
  originAirportId: string;
  destinationAirportId: string;
  passengerCount: number;
  aircraftId: string;
}
```

```ts
interface PassengerJobQuote {
  distanceNm: number;
  passengerCount: number;
  grossRevenue: number;
  estimatedAircraftRental: number;
  estimatedFuelCost: number;
  estimatedAirportFees: number;
  estimatedNetIncome: number;
}
```

The quote is an estimate. Final expenses may be calculated from validated flight telemetry.

---

# 6. Initial Passenger Payout

The first formula should be understandable and easy to tune.

Recommended structure:

```text
Gross Passenger Revenue =
Passenger Count
× Distance in Nautical Miles
× Passenger Rate per Nautical Mile
```

Example starting rate:

```text
$1.25 per passenger per nautical mile
```

Example:

```text
3 passengers
× 100 nautical miles
× $1.25
= $375 gross revenue
```

A minimum fare should prevent very short trips from being worthless.

```text
Final Gross Revenue =
Maximum of:
Calculated Passenger Revenue
or
Minimum Flight Fare
```

Possible minimum:

```text
$75 per passenger
```

The first preview should not yet include:

* VIP multipliers
* Passenger-class multipliers
* Urgency bonuses
* Satisfaction bonuses
* Tourism modifiers
* Business-travel modifiers
* Reputation multipliers
* Dynamic ticket pricing

These can be added after the base economy is stable.

---

# 7. Passenger State Flow

The passenger system should use a small and explicit state flow.

```text
WAITING
   ↓
RESERVED
   ↓
IN_FLIGHT
   ↓
ARRIVED
```

Exceptional flows:

```text
RESERVED → RETURNED_TO_POOL
IN_FLIGHT → FLIGHT_REVIEW
```

## Waiting

Passengers are part of the airport’s available pool.

## Reserved

Passengers are temporarily removed from availability when the player accepts the job.

Reservations should expire if the player does not begin the flight within a configured period.

Recommended preview reservation period:

```text
30 real-world minutes
```

When the reservation expires, the passengers return to the airport pool.

## In Flight

Once the tracker validates departure:

* Reserved passenger count decreases.
* In-transit passenger count increases.
* The job status becomes `in_flight`.

## Arrived

After a valid landing and shutdown:

* In-transit passenger count decreases.
* The flight completes.
* The player receives payment.
* The destination airport records arriving traffic.
* The origin records departing traffic.
* The pilot receives verified hours.

The passengers do not need to remain as persistent individuals at the destination. They are absorbed into the destination’s general airport activity.

---

# 8. Airport Simulation

Airports are the center of the first preview.

Each airport should contain:

```ts
interface Airport {
  id: string;
  icao: string;
  name: string;
  city: string;
  region: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt: number;
  airportTier: AirportTier;
  activityRating: number;
  basePassengerTarget: number;
  currentPassengerCount: number;
  fuelAvailable: boolean;
  avgasPrice: number | null;
  jetAPrice: number | null;
  isActive: boolean;
}
```

## Airport Preview Page

Each airport page should display:

* Airport name
* ICAO
* City and region
* Airport tier
* Current activity rating
* Waiting passengers
* Aircraft currently available
* Players currently present
* Fuel prices
* Nearby airports
* Recent departures
* Recent arrivals

This gives airports a sense of place without needing NPCs or graphical environments.

---

# 9. Airport Activity Rating

Airport activity should increase when players transport passengers.

For the preview, track:

* Passengers departed
* Passengers arrived
* Completed flights
* Unique destinations served
* Recent activity

The initial formula can be simple:

```text
Activity Earned =
Passengers Departed
+ Passengers Arrived
+ Completed Flight Bonus
```

Example:

```text
3 passengers depart: +3 activity
3 passengers arrive: +3 activity
Completed flight: +1 activity

Total world activity generated: 7
```

Airport activity should decay slowly when the airport is unused.

Activity influences:

* Target passenger count
* Passenger regeneration speed
* Visibility in airport browsing
* Airport activity classification

Suggested preview classes:

| Rating | Airport Activity |
| -----: | ---------------- |
|   0–19 | Quiet            |
|  20–39 | Light            |
|  40–59 | Active           |
|  60–79 | Busy             |
| 80–100 | Major Hub        |

The airport’s real-world size should remain separate from player-generated activity.

A major airport can be:

> Major airport — currently quiet

A small airport can be:

> Small airport — currently busy

This prevents activity ratings from misrepresenting the airport’s physical capabilities.

---

# 10. Airport Passenger Growth

Airport activity should affect passenger availability, but growth should be controlled.

Recommended structure:

```text
Passenger Target =
Base Passenger Target
× Activity Modifier
```

Example modifiers:

| Activity  | Modifier |
| --------- | -------: |
| Quiet     |    0.75× |
| Light     |    0.90× |
| Active    |    1.00× |
| Busy      |    1.20× |
| Major Hub |    1.50× |

Example:

```text
Base passenger target: 40
Current activity: Busy
Modifier: 1.20

Adjusted target: 48 passengers
```

This means player activity can grow an airport without allowing unlimited exponential passenger creation.

---

# 11. Player Onboarding

The preview’s onboarding should introduce each major system in sequence.

## Step 1: Account Creation

The player creates:

* Username
* Character name
* Company name
* Starting city
* Home airport

## Step 2: Starting Package

The player receives:

* Private Pilot License
* Run-down apartment
* 1990s Hunda Attord
* Personal starting funds
* Business starting funds
* No aircraft
* No additional qualifications

## Step 3: Life Overview

The player is shown:

```text
Residence:
Run-Down Apartment
Rent: $800 per week

Vehicle:
1996 Hunda Attord
Maintenance: $25 per week

Total Fixed Weekly Expenses:
$825
```

## Step 4: Travel Tutorial

The player travels from their apartment or city location to their home airport.

The tutorial explains:

* Current location matters.
* Travel takes real-world time.
* Cars use fuel and gain mileage.
* Bus service is always available as a fallback.
* Flight jobs can only begin at the player’s current airport.

## Step 5: Passenger Tutorial

At the airport, the player sees:

```text
Waiting Passengers: 24
```

The tutorial instructs the player to:

* Choose a destination
* Select one to three passengers
* Review aircraft options
* Review projected revenue and costs

## Step 6: Aircraft Rental

The player rents an entry-level aircraft permitted by the PPL.

The tutorial explains:

* Aircraft have locations.
* Aircraft have passenger limits.
* Players require qualifications.
* Rental and fuel costs reduce profit.
* The aircraft will remain at the destination after landing.

## Step 7: Tracker Connection

The player launches the tracker and connects it to the simulator.

The tracker verifies:

* Correct aircraft
* Correct airport
* Correct passenger payload
* Valid fuel state
* Flight start
* Flight telemetry
* Arrival and shutdown

## Step 8: Flight Completion

The player receives:

* Passenger revenue
* Expense breakdown
* Net profit
* Verified flight hours
* Airport activity contribution
* Updated location
* Updated aircraft location

## Step 9: Career Goal

The onboarding ends by showing the player’s next qualification.

```text
Next Qualification:
High-Performance Single-Engine

Requirements:
20 verified flight hours
10 single-engine hours
$2,500 training cost
```

---

# 12. Preview License Progression

The preview only needs enough training progression to prove the career system.

Recommended initial qualifications:

## Private Pilot License

Starting qualification.

Allows:

* One to three passengers
* Entry-level single-engine piston aircraft
* Short regional flights
* Basic airports

## High-Performance Endorsement

Requirements:

* 20 total verified hours
* 10 hours in single-engine piston aircraft
* Training fee
* Training timer
* Check flight

Allows:

* Faster single-engine piston aircraft
* Larger passenger capacity
* Longer routes

## Instrument Rating

Requirements:

* 40 total verified hours
* Cross-country hours
* Training fee
* Training timer
* Instrument check flight

Allows:

* Longer-distance passenger jobs
* Instrument flight validation
* More advanced aircraft prerequisites

## Multi-Engine Rating

Requirements:

* 75 total verified hours
* Instrument Rating
* Training fee
* Training timer
* Multi-engine check flight

Allows:

* Basic twin-engine aircraft
* More passengers
* Higher revenue potential

Turboprops, jets, and airline operations can wait until after the preview.

---

# 13. Required Preview Interfaces

The web application needs these primary screens:

## Player Dashboard

Displays:

* Current location
* Current travel state
* Personal balance
* Company balance
* Residence
* Vehicle
* Weekly expenses
* Pilot hours
* Qualifications
* Current job
* Next career goal

## Airport Browser

Displays:

* Supported airports
* Airport tier
* Distance from player
* Activity
* Waiting passengers
* Available aircraft

## Airport Detail

Displays:

* Airport information
* Waiting passengers
* Destination selector
* Aircraft rentals
* Fuel prices
* Players present
* Recent activity

## Job Builder

Displays:

* Origin
* Destination
* Distance
* Passenger count
* Aircraft
* Expected duration
* Gross revenue
* Estimated costs
* Estimated profit
* Qualification validation

## Travel Screen

Displays:

* Travel method
* Origin
* Destination
* Departure
* Arrival
* Countdown
* Progress
* Vehicle details

## Active Flight Screen

Displays:

* Flight status
* Origin
* Destination
* Aircraft
* Passengers
* Tracker connection
* Telemetry status
* Flight progress

## Flight Debrief

Displays:

* Validated flight time
* Distance
* Passengers carried
* Revenue
* Fuel cost
* Rental cost
* Fees
* Net income
* Pilot hours awarded
* Airport activity generated

## Training Screen

Displays:

* Available qualifications
* Requirements
* Current progress
* Training cost
* Duration
* Check-flight requirement

---

# 14. Preview Domain Modules

The preview should initially contain these independent domains:

```text
packages/
  domain-players/
  domain-locations/
  domain-airports/
  domain-passengers/
  domain-jobs/
  domain-aircraft/
  domain-flights/
  domain-telemetry/
  domain-travel/
  domain-vehicles/
  domain-housing/
  domain-finance/
  domain-qualifications/
  domain-training/
  domain-time/
```

Modules that should not yet be created beyond placeholders:

```text
domain-cargo/
domain-relationships/
domain-social-events/
domain-npc-employees/
domain-fbo-economy/
domain-investments/
```

Do not build empty complex systems merely because they may exist later.

Instead, preserve extension points through interfaces and domain events.

---

# 15. Essential Domain Events

The first preview only needs events related to the simulation loop:

```text
PlayerCreated
StartingAssetsGranted
GroundTravelStarted
GroundTravelCompleted
PassengersReserved
PassengerReservationExpired
FlightPrepared
FlightDeparted
FlightCompleted
FlightInvalidated
PassengersDelivered
AircraftRelocated
PilotHoursAwarded
PaymentIssued
AirportActivityRecorded
QualificationStarted
QualificationCompleted
```

No social or narrative event engine is needed for the preview.

---

# 16. Preview Source-of-Truth Rules

## Player Location

Owned by the location and travel domains.

## Waiting Passengers

Owned by the passenger domain.

## Airport Activity

Owned by the airport domain.

## Aircraft Location and Availability

Owned by the aircraft domain.

## Flight Validity

Owned by the flight domain after evaluating tracker telemetry.

## Pilot Hours

Owned by the pilot qualification domain.

## Financial Balances

Derived from the financial ledger.

## Travel Completion

Determined by server timestamps.

## Game Configuration

Owned by typed configuration files.

React components must display these values but must never calculate or authoritatively change them.

---

# 17. Preview Development Order

## Phase 1: Foundation

* Authentication
* Character creation
* Starting city selection
* Starting assets
* Financial ledger
* Server clock
* Audit records

## Phase 2: Airport World

* Airport database
* Airport browsing
* Player location
* Distance calculations
* Airport activity
* Passenger pools

## Phase 3: Ground Travel

* Vehicle travel
* Bus travel
* Travel countdown
* Arrival processing
* Vehicle fuel and mileage

## Phase 4: Passenger Jobs

* Destination selection
* Passenger reservation
* Basic pricing
* Aircraft eligibility
* Job quote
* Job acceptance

## Phase 5: Simulator Flight

* Tracker authentication
* Flight preparation
* Payload verification
* Telemetry
* Departure detection
* Arrival detection
* Flight validation
* Job completion

## Phase 6: Career

* Verified hours
* Aircraft-category hours
* Qualification requirements
* Training purchases
* Training timers
* Check flights

## Phase 7: Balancing and Preview Readiness

* Job profitability
* Passenger regeneration
* Airport growth
* Weekly costs
* Reservation abuse prevention
* Travel timing
* New-player survivability
* Error recovery
* Administrative tools

---

# 18. Preview Success Criteria

The preview is ready when:

* A new player can complete onboarding without administrator help.
* Player location remains accurate.
* Ground travel completes while the player is offline.
* Passenger pools cannot become negative.
* Two players cannot reserve the same passengers.
* Aircraft cannot be rented by multiple players simultaneously.
* A valid simulator flight consistently completes.
* An invalid flight does not issue payment.
* Payments cannot be duplicated.
* Pilot hours cannot be duplicated.
* Aircraft correctly relocate after flights.
* Airport activity responds to completed flights.
* Passenger pools regenerate predictably.
* PPL restrictions work.
* Players can see and work toward their next qualification.
* Weekly expenses apply exactly once.
* The economy allows active new players to survive and progress.

The preview does not need to feel like a complete life simulator. It needs to prove that the persistent aviation world is reliable, understandable, and enjoyable.
