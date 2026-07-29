# OneWorld
## Master Technical Specification and Product Design Document

**Version:** 2.0  
**Status:** Build Specification - Preview Foundation  
**Project Lead:** Chris Barnett  
**Document Date:** July 28, 2026  
**Primary Platform:** Web dashboard plus Windows MSFS tracker  
**Game Type:** Persistent multiplayer aviation career and life-simulation platform  

---

# Table of Contents

1. Executive Summary
2. Product Vision
3. Scope and Release Boundaries
4. Player Experience and Core Loop
5. Time, Timezone, and Persistent State
6. Player Onboarding and Starting State
7. Accounts, Money, and Financial Ledger
8. Civilian Employment System
9. Housing and Social Status
10. Vehicle System
11. Ground Travel System
12. Airport Data, Map, and World Model
13. Passenger System - Preview
14. Passenger Job System
15. Airport Activity and Growth
16. Aircraft Catalog and Rentals
17. Pilot Hours, Qualifications, and Training
18. Simulator Tracker and Flight Engine
19. Fuel and Airport Services
20. Technical Architecture
21. Sources of Truth and Data Ownership
22. Configuration Strategy
23. Core Database Model
24. Service Interfaces and Domain Events
25. Background Workers and Schedules
26. Web Application UX
27. API and Command Design
28. Security, Anti-Abuse, and Administration
29. Observability and Operations
30. Testing Strategy
31. Coding and Repository Standards
32. Implementation Roadmap
33. Preview Acceptance Criteria
34. Future Expansion Rules
35. Open Design Decisions
36. Instructions to the Implementing AI
37. Final Product Definition

---

# Document Purpose

This document is the authoritative product and technical specification for building **OneWorld**. It consolidates the project vision, game rules, first-preview scope, architecture, data ownership, module boundaries, user experience, backend workflows, simulator integration, testing requirements, and long-term extension strategy.

It is written so that an AI development agent or software team can use it as the main project source of truth. When implementation choices conflict with this document, this document controls unless the project lead explicitly approves a change.

The first preview is intentionally narrower than the eventual game. The preview must prove that the persistent aviation simulation is reliable and enjoyable before deeper life-simulation, cargo, FBO, airline, and social systems are added.

---

# 1. Executive Summary

OneWorld is a persistent shared-world flight-simulator career platform inspired by FSEconomy, but designed around a more personal and structured pilot career.

Players use Microsoft Flight Simulator to perform real flights. A web dashboard manages the persistent game world: player location, airport activity, waiting passengers, aircraft rentals, jobs, money, housing, vehicles, employment, pilot qualifications, training, and career progression. A Windows desktop tracker connects the simulator to the cloud backend, validates flight telemetry, and reports departure, flight, landing, fuel, payload, and completion data.

The game begins with the player as a low-income private pilot. The player owns an old car, rents a run-down apartment, holds a Private Pilot License, and has access only to basic passenger flights in entry-level aircraft. The player must build verified flight hours and spend money on training before operating larger or more advanced aircraft.

The world runs at real-world speed. Travel takes real time. Aircraft, players, vehicles, and passengers have persistent locations. Airports grow more active when players move passengers through them. Basic civilian jobs provide a dependable daily wage so that new players can cover much of their basic living cost while learning the game and saving for training.

The first preview focuses on:

- Account creation and player onboarding.
- Starting city, residence, vehicle, balances, PPL, and employment.
- Airport database and interactive map.
- Persistent player and aircraft location.
- Ground travel by personal vehicle or bus.
- Simple airport passenger pools.
- Player-created passenger flight jobs to any supported airport.
- Aircraft rental and qualification checks.
- MSFS tracker integration and telemetry validation.
- Flight completion, payments, and verified flight hours.
- Airport activity and passenger-pool growth.
- Training and early aircraft progression.
- Reliable financial ledgers, scheduled charges, and idempotent workers.

The preview explicitly excludes complex passengers, NPC reactions, social events, cargo, player-owned FBOs, NPC employees, detailed airline schedules, and deep lifestyle simulation.

---

# 2. Product Vision

## 2.1 Core Vision

OneWorld should make the player feel that they are building a persistent aviation life, not merely completing disconnected missions.

The player should be able to look back and understand:

- Where they started.
- Which airports they helped develop.
- How many verified hours they earned.
- Which aircraft families they trained on.
- How their income and living standard changed.
- When they purchased better vehicles and housing.
- How they progressed from basic PPL flying into commercial, charter, regional, or airline aviation.
- How their choices affected the shared world.

The long-term emotional goal is:

> “This is the aviation career and life I built.”

## 2.2 Product Pillars

### Persistent World

The world continues while players are offline. Travel, training, job decisions, wages, rent, reservations, and airport passenger generation use server-controlled real-world timestamps.

### Real Flying Matters

Paid aviation activity must be completed in a supported simulator and validated through the tracker. The web game creates reasons to fly; the simulator is where the flying occurs.

### Career Progression Through Hours and Training

The player does not unlock aircraft simply by reaching a generic level. Advancement requires verified experience, qualifications, training fees, elapsed training time, and check flights where applicable.

### Meaningful Location

Players, aircraft, vehicles, residences, jobs, and airports have locations. A player must physically travel to the origin airport before beginning a flight.

### Shared Airport Development

Player activity changes airports. Moving passengers into and out of an airport increases its activity and supports larger passenger pools.

### Economic Pressure Without Early Ruin

Rent, vehicle maintenance, travel, rental aircraft, fuel, and training create pressure. Civilian employment provides a modest safety net so that new players can survive, recover, and continue progressing.

### Modular Growth

The preview uses simple implementations behind stable service interfaces. Fuel may initially be a fixed airport price, but the architecture must permit later FBO inventory, suppliers, player pricing, and shortages without rewriting flight-job logic.

### Clear, Data-Driven Rules

Economic values, qualifications, vehicle specifications, passenger rates, airport tiers, and other balance rules must be configuration-driven and tested. They must not be scattered through UI components or API handlers.

---

# 3. Scope and Release Boundaries

## 3.1 First Preview Scope

The first playable preview includes:

1. Authentication and player profile creation.
2. Starting city and home-airport selection.
3. Starting PPL, apartment, car, personal cash, and business cash.
4. Real-time world clock and persistent location.
5. Airport import, catalog, search, map, and detail pages.
6. Airport passenger pools with passengers willing to travel to any destination.
7. Player-created passenger flight jobs.
8. Aircraft catalog, supported-simulator mappings, and system rentals.
9. Personal vehicle travel and universal bus travel.
10. Travel countdown and restricted in-transit state.
11. Civilian job postings, applications, one-job rule, and daily wages.
12. Flight tracker authentication and SimConnect integration.
13. Flight preparation, payload/fuel enforcement where supported, and telemetry validation.
14. Flight completion, financial settlement, airport activity, and aircraft relocation.
15. Verified pilot hours and early qualifications.
16. Training enrollment, timers, fees, and check-flight workflow.
17. Financial ledger, recurring weekly charges, and transaction history.
18. Basic housing, vehicle, wealth, and social-status display.
19. Notifications, audit logs, admin support, and recovery tools.
20. Automated tests and observability required for a persistent MMO economy.

## 3.2 Explicit Preview Exclusions

Do not implement the following as full systems during the preview:

- Named or persistent passenger NPCs.
- Passenger personalities, preferences, reactions, satisfaction, or dialogue.
- Social events, friendships, relationships, family, romance, or workplace narratives.
- Cargo or freight.
- Player-owned FBOs.
- Dynamic wholesale fuel supply chains.
- NPC pilots or company employees.
- Manual civilian work shifts or employment minigames.
- Airline duty schedules or seniority systems.
- Player corporations or shared company ownership.
- Detailed vehicle breakdown simulations.
- Detailed aircraft component maintenance.
- Investments, stock markets, real estate markets, or banking beyond basic balances and future-ready ledgers.
- Combat, illegal activity, or unrelated life-simulator systems.

Placeholders may exist only where needed for database compatibility or future interfaces. Do not build empty large modules “for later.”

## 3.3 Long-Term Direction

Later versions may add:

- Route-specific passenger demand.
- Passenger travel purposes and service classes.
- Cargo and industrial supply chains.
- Player-owned aircraft and aircraft markets.
- Full maintenance, insurance, financing, and depreciation.
- FBO ownership and fuel inventory.
- Charter companies, regional airlines, and major airlines.
- Required airline employment as the player’s single job.
- Scheduled flights and duty obligations.
- NPC workers and abstract company operations.
- Social flavor events and persistent contacts.
- More detailed housing, vehicles, status, and lifestyle choices.

These features must build on preview domains rather than bypassing or replacing them.

---

# 4. Player Experience and Core Loop

## 4.1 New-Player Loop

1. Create an account.
2. Create a pilot and company identity.
3. Select a supported starting city and home airport.
4. Receive the starting package.
5. Review weekly expenses and current balances.
6. Apply for a civilian job in the starting city.
7. Travel from the city/residence location to the home airport.
8. Review waiting passengers and available aircraft.
9. Choose any supported destination.
10. Choose a passenger count within aircraft and license limits.
11. Review estimated revenue and expenses.
12. Reserve passengers and rent an aircraft.
13. Connect the tracker and prepare the simulator.
14. Fly the route in MSFS.
15. Land, park, shut down, and submit the flight.
16. Receive a flight debrief, money, hours, and airport activity credit.
17. Decide whether to fly again, travel, work toward training, or manage finances.

## 4.2 Mature Loop

As the player progresses, the same loop gains additional decisions:

- Which qualification to pursue next.
- Whether a faster but more expensive aircraft produces better profit.
- Whether to remain near a busy airport or develop a smaller airport.
- Whether to improve housing or save for training.
- Whether to purchase a more efficient or faster vehicle.
- Whether to continue civilian employment or accept an aviation employer.
- Whether to build a private aviation company or enter airline employment.

## 4.3 Fundamental Game Rule

Every feature should serve at least one of these goals:

- Give the player a reason to fly.
- Make aviation progression understandable.
- Make location and travel meaningful.
- Create a financial decision.
- Make airports feel persistent and shared.
- Help the player recover from setbacks.
- Support future depth without making the preview confusing.

---

# 5. Time, Timezone, and Persistent State

## 5.1 Time Scale

OneWorld uses a permanent **1:1 real-world time scale**.

- One real minute equals one game minute.
- Travel timers use actual elapsed time.
- Training timers use actual elapsed time.
- Job applications use actual elapsed time.
- Daily wages and weekly expenses occur on real schedules.
- The game does not pause when a player logs out.

## 5.2 Authoritative Time

All backend timestamps are stored in UTC.

The default player-facing clock is Eastern Time using the `America/New_York` timezone. This automatically handles daylight saving time. A future user preference may permit local display time, but the server never stores gameplay deadlines as local timestamps.

The authoritative clock is the server clock. Browser clocks and tracker clocks are display and evidence sources only.

## 5.3 Time Rules

- Never calculate final arrival or expiration solely in the client.
- Store `startsAt`, `completesAt`, and `processedAt` timestamps.
- Countdown displays must periodically reconcile with the server.
- A login or page refresh must resolve any state whose completion time has passed.
- Scheduled workers must be idempotent.
- No system may require the player to leave a browser tab open.

---

# 6. Player Onboarding and Starting State

## 6.1 Character Creation

The player provides:

- Account credentials.
- Unique username.
- Pilot display name.
- Company or operating name.
- Starting city.
- Home airport selected from airports connected to that city.

The player may later relocate, but the preview begins with a fixed home city and residence.

## 6.2 Starting License

The player begins with a gameplay version of a **Private Pilot License (PPL)**.

The game’s PPL progression is aviation-inspired and is not intended to reproduce compensation law or serve as legal flight training. It is the entry career tier.

The starting PPL permits:

- Basic passenger jobs.
- Small passenger groups.
- Entry-level single-engine piston aircraft.
- Short regional routes.
- Approved day and basic-weather operations.

It does not permit:

- Multi-engine aircraft.
- Turboprops.
- Jets.
- Advanced instrument-required work.
- Airline employment.
- High-capacity passenger service.

## 6.3 Starting Residence

**Name:** Run-Down Apartment  
**Location:** Starting city  
**Rent:** $800 per week  
**Quality:** Very Poor  
**Parking:** One vehicle  
**Status contribution:** Low  
**Ownership:** Rental  

The player must maintain a residence. The preview should include grace periods for missed rent and a recoverable temporary-lodging state rather than an immediate account lock.

## 6.4 Starting Vehicle

**Name:** 1996 Hunda Attord  
**Type:** Fictional older compact/midsize sedan  
**Starting value:** $500  
**Starting mileage:** Random 170,000-235,000 miles  
**Expected useful lifespan:** Approximately 250,000 miles  
**Weekly maintenance:** $25  
**Fuel efficiency:** Approximately 24 MPG  
**Tank capacity:** Approximately 16 gallons  
**Effective travel speed:** 55 mph baseline  
**Quality:** Very Poor  
**Reliability:** Low  
**Status contribution:** Low  

The car is owned outright. It provides a believable starting asset and enables ground travel.

## 6.5 Recommended Starting Funds

Initial balance values should be configurable. Recommended defaults:

- Personal balance: $2,500.
- Company balance: $5,000.
- First week of apartment rent already paid.
- Starting car owned outright.
- PPL already completed.
- No aircraft ownership.
- No outstanding loan.

The company balance is used for aviation operations. The personal balance is used for housing, vehicles, bus travel, and personal expenses unless an expense is explicitly reimbursed by the company.

## 6.6 Onboarding Protections

- The first required travel tutorial should be short enough to demonstrate the system without imposing a long wait.
- The first passenger flight should use a nearby destination and an affordable rental.
- The player must receive a clear profitability estimate before accepting the first job.
- The first weekly rent charge must not occur immediately after account creation.
- A failed or invalid first flight must explain the problem and allow recovery.
- The player should be directed toward applying for a civilian job during onboarding.

---

# 7. Accounts, Money, and Financial Ledger

## 7.1 Account Separation

Each player has at least two financial accounts:

### Personal Account

Used for:

- Rent.
- Personal vehicle purchase and upkeep.
- Bus fares and personal ground travel.
- Personal training when not company-funded.
- Housing purchases and lifestyle systems later.

### Company Account

Used for:

- Aircraft rentals.
- Aviation fuel.
- Airport and handling fees.
- Aircraft purchases later.
- Maintenance and insurance later.
- Company-paid training.
- Business revenue from passenger flights.

The user interface must clearly state which account will be charged before confirmation.

## 7.2 Ledger-First Accounting

Balances must be derived from or reconciled against an immutable financial ledger. Do not update money without recording a transaction.

Every ledger entry includes:

- Unique transaction ID.
- Account ID.
- Player or company owner ID.
- Signed amount.
- Currency, initially USD.
- Category.
- Description.
- Related entity type and ID.
- Created timestamp.
- Effective date.
- Idempotency key.
- Balance after transaction or a reproducible balance sequence.

Initial categories include:

- Starting funds.
- Passenger flight revenue.
- Aircraft rental.
- Aviation fuel.
- Airport fees.
- Bus fare.
- Ground vehicle fuel.
- Weekly rent.
- Vehicle maintenance.
- Civilian wage.
- Training tuition.
- Salary or owner transfer later.

## 7.3 Idempotency

Every automated payment or charge must use a deterministic idempotency key.

Examples:

```text
employment:{employmentId}:pay:{YYYY-MM-DD}
housing:{tenancyId}:rent:{YYYY-WW}
vehicle:{vehicleId}:maintenance:{YYYY-WW}
flight:{flightId}:settlement
training:{enrollmentId}:tuition
```

Repeated worker execution must not duplicate money, flight hours, passengers, or airport activity.

## 7.4 Economic Design Target

Civilian employment should nearly cover basic fixed living expenses but should not fund rapid aviation advancement.

Starting fixed weekly expenses:

- Apartment rent: $800.
- Vehicle maintenance: $25.
- Total: $825.

A typical civilian job paying $120-$135 per day produces $840-$945 per week before fuel and other expenses. Flying should be necessary to save meaningful amounts for training and better assets.

---

# 8. Civilian Employment System

## 8.1 Purpose

Civilian employment is a realistic early-game safety net. It provides stable daily income while the player builds flight hours and saves for training.

The preview does not simulate work shifts. Employment is abstracted and does not block flying or travel.

## 8.2 One-Job Rule

A player may hold exactly one active job.

The employment slot may later contain:

- Civilian employment.
- Airport employment.
- Flight-school employment.
- Charter-company employment.
- Regional-airline employment.
- Major-airline employment.

Accepting a new position replaces the current job after confirmation.

When the player eventually accepts a large-airline position, that airline position must occupy the one employment slot.

## 8.3 Employment Areas

Jobs belong to an employment area associated with one or more airports and a city.

Example:

- Employment area: Boise, Idaho.
- Connected airport: KBOI.

The player must be physically present in the employment area to apply. Once employed, the player may travel without losing the basic civilian job.

## 8.4 Preview Job Types

Configurable examples:

| Job | Suggested Daily Wage | Availability |
|---|---:|---|
| Dishwasher | $105 | Very High |
| Fast-Food Worker | $115 | Very High |
| Convenience Store Clerk | $120 | High |
| Hotel Housekeeper | $125 | High |
| Warehouse Worker | $135 | High |
| Cook | $140 | Medium |
| Bartender | $150 | Medium |
| Airport Ramp Worker | $155 | Medium |
| Fuel Attendant | $160 | Low |
| Airport Operations Assistant | $175 | Low |

Values are balance configuration, not hard-coded rules.

## 8.5 Job Posting

A posting includes:

- Title.
- Short description.
- City/employment area.
- Daily wage.
- Number of openings.
- Application duration estimate.
- Posted time.
- Expiration time.
- Eligibility rules.

The preview does not require named employers, resumes, interviews, benefits, schedules, coworkers, or promotions.

## 8.6 Application Flow

1. Player opens local jobs.
2. Player selects a posting.
3. Server confirms player location and eligibility.
4. Player submits an application.
5. Application enters `pending` state.
6. A decision is revealed after a configurable real-time delay, recommended two to six hours.
7. If accepted, the player receives an offer.
8. Player accepts or declines.
9. Acceptance creates or replaces active employment.

Low-wage jobs should have high acceptance rates because the system exists to protect the early economy.

## 8.7 Daily Payroll

The active job pays once per real-world day at the configured payroll time.

Payroll rules:

- Backend stores UTC.
- Display uses Eastern Time.
- Finance domain writes the ledger entry.
- Employment domain determines whether pay is owed.
- The wage is deposited into the personal account.
- The payment is idempotent.
- The player receives pay while traveling or flying in the preview.

## 8.8 Preview Non-Effects

Civilian employment initially does not:

- Consume player time.
- Create fatigue.
- Require attendance.
- Block aviation jobs.
- Affect status beyond displaying the current occupation.
- Generate performance, coworker, or manager events.
- Terminate the player for inactivity.

---

# 9. Housing and Social Status

## 9.1 Housing Requirement

The player should ordinarily have a residence. Housing is a persistent asset or tenancy tied to a city.

Preview housing states:

- Active tenancy.
- Payment due.
- Overdue grace period.
- Eviction pending.
- Temporary lodging.
- Unhoused.

Housing failure must be recoverable. It may reduce status and create added lodging cost, but it must not permanently prevent flying.

## 9.2 Preview Housing Categories

Only a few initial records are required:

- Run-Down Apartment.
- Basic Apartment.
- Comfortable Apartment.
- Townhouse.
- Suburban House.
- Luxury residence placeholders for later progression.

Housing primarily affects:

- Weekly cost.
- City/home location.
- Parking capacity.
- Displayed quality.
- Social-status score.

Rest, family, social events, and detailed storage are future systems.

## 9.3 Wealth and Status

Track numeric net worth separately from descriptive social status.

Net worth may include:

```text
Personal cash
+ personal asset value
+ estimated company equity
- personal debt
- attributable business debt
```

Status is a descriptive score influenced by:

- Housing quality.
- Vehicle quality.
- Personal liquidity.
- Stable employment.
- Aircraft or company ownership later.
- Debt and financial distress later.

Recommended public status labels:

1. Destitute.
2. Poor.
3. Lower Class.
4. Upper-Lower Class.
5. Lower-Middle Class.
6. Middle Class.
7. Upper-Middle Class.
8. Affluent.
9. Wealthy.
10. High Society.
11. Elite.

Status is primarily flavor and profile presentation during the preview. It must not create large direct payout bonuses.

---

# 10. Vehicle System

## 10.1 Vehicle Role

Vehicles provide persistent ground transportation and contribute to player status. A player should have access to a car, but the universal bus system prevents permanent stranding.

## 10.2 Vehicle Attributes

Every vehicle type includes:

- Manufacturer and model display name.
- Model year or year range.
- Purchase price.
- Base resale value.
- Quality tier.
- Reliability tier.
- Effective travel speed in miles per hour.
- Fuel efficiency in MPG.
- Fuel tank capacity in gallons.
- Expected lifespan in miles.
- Weekly maintenance cost.
- Status contribution.

Every owned vehicle includes:

- Owner ID.
- Vehicle type ID.
- Current location.
- Current mileage.
- Current fuel quantity.
- Current condition.
- Purchase time.
- Current estimated value.
- Active travel lock.

## 10.3 Mileage and Lifespan

Ground travel increases mileage by route distance.

A vehicle does not instantly fail at its expected lifespan. Instead, later systems may increase maintenance and breakdown risk. In the preview, mileage and lifespan are recorded and displayed, but breakdowns may be disabled.

## 10.4 Ground Fuel

Basic formula:

```text
Fuel used = route miles / vehicle MPG
Fuel cost = fuel used * regional ground-fuel price
```

For preview simplicity, required fuel may be automatically purchased when travel begins. The service interface must permit manual refueling and location-specific fuel providers later.

## 10.5 Vehicle Maintenance

The preview charges a configured weekly maintenance amount. This abstractly represents insurance, servicing, registration, and minor repairs.

Later versions may separate these categories.

---

# 11. Ground Travel System

## 11.1 Location Requirement

A player can only begin a paid flight at the airport where the player is physically located.

The player’s persistent location is one of:

- City/residence.
- Airport.
- In ground transit.
- In simulator flight.
- Passenger on another flight later.

## 11.2 Travel Modes

Preview travel modes:

- Personal vehicle.
- Bus.

Future modes:

- Taxi or rideshare.
- Rental vehicle.
- Train.
- Commercial airline.
- Player-operated passenger flight.
- Private charter.

## 11.3 Personal Vehicle Travel

Estimated duration:

```text
travel hours = estimated road miles / vehicle effective speed
```

Estimated road miles may initially use:

```text
great-circle miles * configurable road-distance multiplier
```

A default multiplier near 1.25 may be used until a routing provider or stored road network is introduced.

Driving consumes:

- Real elapsed time.
- Vehicle fuel.
- Vehicle mileage.
- Proportional wear data.

## 11.4 Bus Service

Bus service is a universal fallback available between supported airport/city nodes.

The “bus” represents a combination of public transportation, shuttles, and coach travel. It does not need to model an actual published route network during the preview.

Recommended initial formula:

```text
bus duration = estimated road miles / 40 mph + 30 minutes boarding time
bus fare = $15 + ($0.20 * estimated road miles)
```

Both values must be configuration-driven.

## 11.5 Travel State Machine

```text
AVAILABLE
  -> PREPARING
  -> TRAVELING
  -> ARRIVED
```

Exceptional states:

```text
CANCELLED
INTERRUPTED
FAILED
UNDER_REVIEW
```

The active-travel record stores origin, destination, mode, vehicle, distance, cost, departure time, arrival time, and status.

The player location should not be directly changed to the destination at departure. The player enters an in-transit state and is moved on completion.

## 11.6 Travel Screen

The travel page should show:

- Origin.
- Destination.
- Travel method.
- Vehicle, when applicable.
- Distance.
- Departure timestamp.
- Arrival timestamp.
- Remaining countdown.
- Progress bar.
- Cost and fuel used.
- Minimal travel flavor text.

The player should be restricted from location-dependent actions while traveling.

Allowed while traveling:

- View profile and finances.
- Read notifications.
- Browse airports, aircraft, training, and future jobs.
- Plan future actions.

Not allowed while traveling:

- Begin another trip.
- Begin a flight.
- Apply for a local job at the destination before arrival.
- Sell or relocate the vehicle in use.
- Accept an immediate-departure flight.
- Perform location-dependent purchases.

---

# 12. Airport Data, Map, and World Model

## 12.1 Airport Catalog Strategy

Do not manually enter the global airport catalog.

Use import adapters to ingest one or more external airport datasets into staging tables. Normalize the data into OneWorld’s canonical airport model. Potential providers include a global public airport dataset and authoritative national datasets such as FAA aeronautical data for U.S. enrichment.

Before production import, document the source, update frequency, license, attribution requirements, field mapping, and data-quality limitations.

MSFS/SimConnect should be used to confirm simulator availability and installed facilities, not as the sole website database.

## 12.2 Canonical Airport Record

The canonical airport model includes:

- Internal UUID.
- Primary identifier.
- ICAO code where available.
- Local/GPS identifiers where applicable.
- Airport name.
- Municipality/city.
- State or region.
- Country.
- Latitude and longitude.
- Elevation.
- Airport physical tier/type.
- Scheduled-service indicator where available.
- Active/closed status.
- Preview-enabled flag.
- Source provenance.

## 12.3 Physical Tier Versus Activity

Keep real-world airport characteristics separate from player-generated activity.

### Physical Airport Tier

Examples:

- Small airfield.
- Local airport.
- Regional airport.
- Major airport.
- International hub.

This affects baseline passenger target, likely aircraft support, and physical capabilities.

### Player Activity Rating

Examples:

- Quiet.
- Light.
- Active.
- Busy.
- Major Hub Activity.

This changes based on player flights.

A small airport can be physically small but currently busy. A major airport can be physically large but quiet in the game.

## 12.4 Airport Detail Page

Display:

- Name and identifiers.
- City and region.
- Map location.
- Physical tier.
- Activity status and score.
- Waiting passengers.
- Available rental aircraft.
- Players present.
- Current fuel price.
- Nearby airports.
- Recent arrivals and departures.
- Route/job builder.
- Local civilian jobs when the airport is connected to an employment area.

## 12.5 Map Technology

Use a replaceable web-map layer, such as MapLibre GL JS, with a production-appropriate tile provider.

Do not depend on Microsoft Flight Simulator’s map UI.

Map overlays should include:

- Airport markers.
- Airport activity.
- Waiting passengers.
- Available aircraft.
- Player location.
- Active flights later.
- Selected route line.
- Ground travel route estimate.

The map provider must be configured through environment/configuration settings so it can be changed without touching airport-domain logic.

## 12.6 Simulator Airport Reports

The tracker may report:

- Whether an airport exists in the local simulator installation.
- Simulator version.
- Runway count.
- Longest runway.
- Installed scenery/package data if safely detectable.
- Last reported time.

These reports are compatibility evidence. They do not overwrite canonical airport identity or game activity.

---

# 13. Passenger System - Preview

## 13.1 Passenger Philosophy

Passengers are deliberately simple during the preview.

They are not named NPCs. They do not have personalities, reactions, destinations, urgency, income classes, satisfaction, or social events.

A waiting passenger means:

> One passenger at this airport who is willing to travel to any supported destination selected by the player.

## 13.2 Airport Passenger Pool

Each airport maintains aggregate counts:

- Waiting passengers.
- Reserved passengers.
- In-flight passengers.
- Updated timestamp.

Individual passenger rows are not required for the preview.

## 13.3 Pool Configuration

Each airport has:

- Base passenger target.
- Minimum pool.
- Maximum pool.
- Generation rate.
- Activity modifier.

Example configurable targets:

| Physical Tier | Example Target |
|---|---:|
| Small airfield | 10 |
| Local airport | 30 |
| Regional airport | 75 |
| Major airport | 200 |
| International hub | 600 |

Values must be tuned through configuration and analytics.

## 13.4 Passenger Generation

Preview generation should be understandable:

```text
passengers generated per interval
= base generation rate * airport activity modifier
```

Generation moves the waiting count toward the adjusted target, up to the configured maximum.

The first preview does not need demographic, tourism, route, schedule, or economic demand models.

## 13.5 Reservation

When a player creates a flight job:

1. Server locks the origin pool.
2. Server verifies enough waiting passengers exist.
3. Selected count moves from waiting to reserved.
4. A passenger reservation is created.
5. The reservation expires if the player fails to begin in time.
6. Expired or cancelled passengers return to waiting.

Database locking or an atomic stored transaction must prevent negative pools and double reservations.

## 13.6 Passenger State Flow

```text
WAITING -> RESERVED -> IN_FLIGHT -> DELIVERED
```

Exceptional paths:

```text
RESERVED -> RETURNED_TO_POOL
IN_FLIGHT -> UNDER_REVIEW
```

On valid arrival, passengers are absorbed into destination traffic. The preview does not need to add them to a persistent destination passenger identity pool as named individuals.

---

# 14. Passenger Job System

## 14.1 Job Creation Model

The preview does not require a large pre-generated assignment board.

The player creates a passenger flight opportunity by choosing:

- Current origin airport.
- Supported destination airport.
- Number of passengers.
- Eligible aircraft.

The server returns a quote and validates the job.

## 14.2 Job Validation

The server must confirm:

- Player is at the origin airport.
- Player is not traveling or in another flight.
- Origin and destination are enabled.
- Origin and destination are different.
- Enough waiting passengers are available.
- Passenger count is positive.
- Aircraft is located at origin.
- Aircraft is available.
- Aircraft has enough usable passenger seats.
- Pilot has the required license and aircraft-family qualification.
- Route is within preview license limits.
- Aircraft and route are supported by the tracker.
- Player/company can afford required deposits or estimated charges.

## 14.3 Preview Pricing

Use a simple, transparent formula:

```text
gross passenger revenue
= passenger count * distance NM * rate per passenger-NM
```

Recommended initial placeholder:

```text
$1.25 per passenger per nautical mile
```

Use a configurable minimum fare per passenger, such as $75.

The final price must be configuration-driven and tested against aircraft rental, fuel, and weekly living costs.

Preview pricing does not include:

- VIP multipliers.
- Urgency.
- Passenger satisfaction.
- Route-specific demand.
- Time-of-day pricing.
- Reputation bonuses.
- Social status.

## 14.4 Quote

The quote displays:

- Origin and destination.
- Great-circle distance.
- Passenger count.
- Aircraft.
- Estimated flight time.
- Gross revenue.
- Estimated rental cost.
- Estimated fuel cost.
- Estimated airport fees.
- Estimated net company profit.
- Qualification validation.
- Reservation expiration.

The quote must clearly state that fuel and certain final costs are estimates until flight telemetry is validated.

## 14.5 Job State Machine

```text
DRAFT
 -> QUOTED
 -> RESERVED
 -> PREPARING
 -> IN_FLIGHT
 -> COMPLETED
```

Exceptional states:

```text
CANCELLED
EXPIRED
INVALIDATED
UNDER_REVIEW
```

## 14.6 Completion

A valid flight completion atomically or idempotently performs:

- Mark flight completed.
- Mark passenger reservation delivered.
- Reduce in-flight passenger count.
- Relocate aircraft to destination.
- Relocate player to destination airport.
- Calculate final flight settlement.
- Write revenue and cost ledger entries.
- Award verified hours.
- Record departure activity at origin.
- Record arrival activity at destination.
- Update route statistics.
- Publish notifications and audit records.

No individual step may silently succeed while the overall settlement is duplicated.

---

# 15. Airport Activity and Growth

## 15.1 Activity Inputs

The preview activity model should consider:

- Passengers departed.
- Passengers arrived.
- Completed flights.
- Unique destinations served.
- Recent activity window.

## 15.2 Example Activity Calculation

A simple event-based model may award:

- One activity point per departing passenger.
- One activity point per arriving passenger.
- One completion bonus per valid flight.

The airport domain owns the exact formula.

## 15.3 Decay

Activity should decay gradually during inactivity so that airport demand reflects current use rather than permanent historical grinding.

Decay must be bounded and must not reduce the physical airport tier or erase historical totals.

## 15.4 Passenger Modifier

Example activity modifiers:

| Activity Class | Passenger Target Modifier |
|---|---:|
| Quiet | 0.75x |
| Light | 0.90x |
| Active | 1.00x |
| Busy | 1.20x |
| Major Hub Activity | 1.50x |

These values are configuration only.

## 15.5 Route Statistics

Store aggregate route pairs:

- Origin.
- Destination.
- Completed flights.
- Passengers transported.
- Last service time.
- Recent completion rate.
- Average actual flight duration.

Route-specific demand is future functionality, but collecting statistics now allows later migration.

---

# 16. Aircraft Catalog and Rentals

## 16.1 Aircraft Data Strategy

No single online list can reliably represent every aircraft installed by every player.

Use two layers:

1. **Canonical OneWorld aircraft types** for game rules and economics.
2. **Simulator aircraft mappings** that map installed MSFS titles/packages to canonical types.

The tracker may discover installed aircraft definitions. Detection does not automatically approve an aircraft for paid jobs.

## 16.2 Canonical Aircraft Type

Core fields:

- Internal ID.
- ICAO type designator.
- Manufacturer.
- Model/family.
- Aircraft class.
- Engine category.
- Total seats.
- Usable passenger seats.
- Empty weight.
- Maximum takeoff weight.
- Usable fuel capacity.
- Planning cruise speed.
- Planning fuel burn.
- Planning range.
- Required qualification.
- Rental-rate model.
- Preview-enabled flag.

These values support planning and game balance. Actual flight telemetry controls final fuel use and duration.

## 16.3 Supported Preview Aircraft

Begin with a curated list of approximately eight to twelve common aircraft. Candidate families include:

- Cessna 152.
- Cessna 172.
- Piper PA-28 family.
- Diamond DA40.
- Cessna 182.
- Cessna 206.
- Beechcraft Bonanza.
- Diamond DA62.
- Beechcraft Baron.
- Cessna 208 Caravan, potentially later in preview progression.

The exact list should reflect simulator availability and tracker reliability.

## 16.4 Simulator Mapping

A mapping may match:

- Simulator title.
- Package name.
- ICAO type.
- Manufacturer/model metadata.
- Simulator version.

Mapping statuses:

- Official.
- Community verified.
- Automatically inferred.
- Unsupported.

Unsupported aircraft may be detected and displayed but cannot be used for paid jobs.

## 16.5 Aircraft Instance

Each rentable or owned aircraft instance includes:

- Registration.
- Canonical type ID.
- Owner ID or system owner.
- Current airport.
- Fuel quantities.
- Rental status.
- Renter ID.
- Reservation lock.
- Airframe hours.
- Engine hours later.
- Condition.
- Current value later.
- Maintenance state later.

## 16.6 System Rentals

The preview uses system-owned rental aircraft.

Rental rules:

- Aircraft must be at origin.
- One active renter/reservation at a time.
- Rental quote shows estimated cost.
- Rental charges may be wet or dry according to configuration.
- Aircraft relocates on valid completion.
- Cancelled reservations release the aircraft.
- Invalidated flights require a defined recovery rule.

## 16.7 Rental Pricing

The first system may use:

- Hourly dry rate plus actual fuel, or
- Hourly wet rate.

Choose one primary model for preview clarity. Store both concepts in the type model if future compatibility is needed, but do not expose confusing choices until supported.

---

# 17. Pilot Hours, Qualifications, and Training

## 17.1 Verified Hours

Only server-accepted tracker flights award hours.

Track:

- Total verified time.
- Pilot-in-command time.
- Single-engine piston.
- Multi-engine piston.
- Turboprop.
- Jet.
- Day.
- Night.
- Instrument.
- Cross-country.
- Aircraft-family time.
- Takeoffs and landings.
- Completed passenger flights.
- Invalidated flights and safety flags.

## 17.2 Qualification Philosophy

Aircraft access requires a combination of:

- General license/rating.
- Aircraft class or family qualification.
- Required verified hours.
- Training fee.
- Real-time training duration.
- Check flight when applicable.

Do not use one generic experience level as the primary gate.

## 17.3 Preview Progression

### Starting PPL

Allows entry-level single-engine piston aircraft and one to three passengers.

### High-Performance Endorsement

Example requirements:

- 20 total verified hours.
- 10 single-engine hours.
- $2,500 training fee.
- Four-hour training period.
- Check flight.

### Instrument Rating

Example requirements:

- 40 total verified hours.
- Cross-country requirement.
- Night requirement.
- $8,000 training fee.
- Twenty-four-hour training period.
- Instrument check flight.

### Multi-Engine Rating

Example requirements:

- 75 total verified hours.
- Instrument Rating.
- Cross-country requirement.
- $12,000 training fee.
- Forty-eight-hour training period.
- Multi-engine check flight.

Turboprop, commercial, jet, airline transport, and type ratings are later stages unless preview testing expands.

## 17.4 Training Enrollment

Training workflow:

1. Player views qualification.
2. Server evaluates prerequisites.
3. Player selects funding account.
4. Tuition is charged once.
5. Enrollment starts.
6. Real-time timer runs while player is online or offline.
7. Enrollment becomes ready for check flight or completion.
8. Required check flight is created.
9. Valid check flight awards qualification.

## 17.5 Configuration

All qualification requirements must be data/config driven:

- Required hours by category.
- Prerequisite qualifications.
- Tuition.
- Duration.
- Check-flight aircraft.
- Check-flight route/conditions.
- Aircraft types unlocked.

The UI reads rules from the qualification service; it does not reproduce the rules.

---

# 18. Simulator Tracker and Flight Engine

## 18.1 Tracker Role

The Windows tracker:

- Authenticates the player.
- Connects to MSFS through SimConnect.
- Detects the simulator version and aircraft.
- Confirms the selected aircraft mapping.
- Confirms origin airport and player/job state.
- Injects or verifies required payload and fuel where technically supported.
- Tracks flight state and telemetry.
- Detects prohibited behavior.
- Reports signed flight evidence to the server.

The tracker reports evidence. The server makes the authoritative validity decision.

## 18.2 Flight State Machine

```text
IDLE/RAMP
 -> PREPARING
 -> TAXI/TAKEOFF
 -> EN_ROUTE
 -> TOUCHDOWN
 -> TAXI_IN
 -> SHUTDOWN
 -> SUBMITTED
 -> ACCEPTED or INVALIDATED or UNDER_REVIEW
```

## 18.3 Telemetry

Recommended periodic telemetry fields:

- Timestamp.
- Latitude and longitude.
- Altitude MSL and AGL when available.
- Ground speed.
- Airspeed.
- Vertical speed.
- Heading.
- On-ground state.
- Engine state.
- Parking brake state.
- Fuel quantity by tank or total.
- Payload/passenger weight.
- Aircraft title and identifiers.
- Sim rate.
- Slew state.
- Pause state.
- Crash state where available.

Avoid storing unnecessarily high-frequency raw data forever. Retain enough evidence for validation and dispute review; aggregate or expire detailed telemetry according to policy.

## 18.4 Departure Detection

Departure should require a defensible sequence rather than only speed:

- Correct origin proximity.
- Correct aircraft.
- Valid active job.
- Required payload present.
- Engines operating.
- Movement/taxi.
- Airborne confirmation.

## 18.5 Arrival Detection

Completion should require:

- Touchdown near destination.
- On-ground state.
- Plausible landing rate.
- Taxi or stopped state.
- Engines shut down when required.
- Parking brake or stable parking condition.
- Final submission.

## 18.6 Anti-Cheat Rules

Initial checks should include:

- Slew/teleport detection.
- Implausible coordinate jumps.
- Unauthorized simulation-rate changes.
- Aircraft mismatch.
- Origin/destination mismatch.
- Payload tampering.
- Fuel tampering beyond defined tolerances.
- Impossible flight duration.
- Duplicate flight submission.
- Reused telemetry/session identifiers.
- Tracker disconnect patterns requiring review.

Do not automatically invalidate every network interruption. Support reconnect and evidence recovery within clear limits.

## 18.7 Landing Consequences

Landing quality should not arbitrarily erase most passenger revenue.

During preview, landing data may affect:

- Flight debrief.
- Safety record.
- Maintenance inspection flag later.
- Review flag for extreme events.

Do not apply large passenger satisfaction or social consequences before those systems exist.

## 18.8 Tracker Security

- Use short-lived access tokens.
- Bind flight sessions to a server-issued flight/session ID.
- Sign or hash telemetry batches.
- Include monotonically increasing sequence numbers.
- Reject replayed submissions.
- Store tracker version and require minimum supported versions.
- Never trust client-provided payout, hours, or final status.

---

# 19. Fuel and Airport Services

## 19.1 Preview Fuel Model

For the preview, an airport may simply provide a configured fuel price and effectively sufficient supply.

The flight/job system calls a fuel-service interface. It must not read a hard-coded airport field directly throughout the application.

## 19.2 Fuel Quote Interface

A fuel quote should return:

- Airport.
- Fuel type.
- Unit price.
- Available quantity or unlimited/null.
- Provider ID.
- Quote expiration.

## 19.3 Future Compatibility

The same service may later consider:

- FBO owner.
- Storage capacity.
- Current inventory.
- Player-set retail price.
- Wholesale deliveries.
- Competing providers.
- Taxes.
- Shortages.
- Contract pricing.

The flight settlement should depend on the returned purchase record, not on how the provider calculated it.

---

# 20. Technical Architecture

## 20.1 Deployment Shape

Recommended architecture:

- **Web dashboard:** Next.js App Router application deployed to Vercel or equivalent.
- **Backend/database:** Supabase-managed PostgreSQL with PostGIS, Auth, Realtime where useful, storage, and server functions/workers as appropriate.
- **Desktop tracker:** Electron Windows tray application using a maintained SimConnect bridge.
- **Monorepo:** pnpm workspaces plus Turborepo.
- **Database access:** Drizzle ORM and migrations.
- **Testing:** Vitest for TypeScript units/integration, plus browser and tracker end-to-end tests.
- **CI/CD:** GitHub Actions.

Use current stable, mutually compatible versions at project initialization. Pin versions through the lockfile and automated dependency review rather than copying stale versions from this document.

## 20.2 Monorepo Structure

```text
apps/
  web/
  tracker/
  worker/
  admin/

packages/
  config/
  contracts/
  db/
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
  domain-employment/
  domain-finance/
  domain-qualifications/
  domain-training/
  domain-fuel/
  domain-time/
  domain-notifications/
  domain-audit/
  data-import-airports/
  data-import-aircraft/
  ui/
  utils/
  testing/
```

Do not create one giant “game service” or “simulation.ts” file.

## 20.3 Domain Package Pattern

Example:

```text
packages/domain-vehicles/src/
  application/
    vehicle.service.ts
    vehicle.commands.ts
    vehicle.queries.ts
  domain/
    vehicle.entity.ts
    vehicle.rules.ts
    vehicle.types.ts
    vehicle.events.ts
  infrastructure/
    vehicle.repository.ts
    vehicle.mapper.ts
  vehicle.config.ts
  index.ts
```

Other packages import only from the domain’s public `index.ts` exports or the shared contracts package. They must not import private repository paths from another domain.

## 20.4 Layering

Recommended layering:

1. Domain rules and pure calculations.
2. Application services and use cases.
3. Repository interfaces.
4. Infrastructure/database implementations.
5. API/server actions.
6. UI.

React components must not contain authoritative economic, travel, qualification, or passenger formulas.

---

# 21. Sources of Truth and Data Ownership

## 21.1 Core Rule

Every important state or calculation must have one authoritative owner.

## 21.2 Ownership Matrix

| Concern | Authoritative Owner |
|---|---|
| Player profile | Player domain/database |
| Player current location | Location/travel domain |
| Current server time | Time service/server clock |
| Waiting passengers | Passenger domain |
| Airport activity | Airport domain |
| Aircraft location and rental lock | Aircraft domain |
| Job state | Job domain |
| Flight validity | Flight domain after telemetry validation |
| Raw tracker evidence | Telemetry domain |
| Pilot hours | Qualification/pilot-record domain |
| Training status | Training domain |
| Employment status | Employment domain |
| Financial balances | Finance ledger/reconciliation |
| Rent obligation | Housing domain |
| Vehicle mileage/fuel | Vehicle domain |
| Balance configuration | Config package |

## 21.3 Client Trust Boundary

The browser and tracker may request or report actions, but they do not authoritatively decide:

- Money.
- Flight validity.
- Hours.
- Passenger counts.
- Aircraft location.
- Player location.
- Training completion.
- Application acceptance.
- Airport activity.

## 21.4 Utility and Calculation Sources

Pure calculations should be located in the domain that owns them and exported through stable functions.

Examples:

- `calculateGreatCircleDistanceNm` - shared geographic utility.
- `estimateRoadDistanceMiles` - travel domain.
- `calculateGroundTravelDuration` - travel domain.
- `calculateVehicleFuelUse` - vehicle domain.
- `calculatePassengerRevenue` - jobs domain.
- `calculateAirportPassengerTarget` - airport/passenger contract.
- `calculateTrainingEligibility` - training domain.
- `calculateStatusScore` - housing/status domain.
- `calculateFlightSettlement` - flight/finance orchestration.

Do not duplicate calculations in API handlers, database triggers, UI components, and workers.

---

# 22. Configuration Strategy

## 22.1 Typed Configuration

Balance values should be typed and centrally accessible.

Suggested files:

```text
packages/config/src/
  game-clock.config.ts
  onboarding.config.ts
  economy.config.ts
  employment.config.ts
  housing.config.ts
  vehicle.config.ts
  travel.config.ts
  airport.config.ts
  passenger.config.ts
  job.config.ts
  aircraft.config.ts
  qualification.config.ts
  training.config.ts
  tracker.config.ts
  feature-flags.config.ts
```

## 22.2 Database Versus Code Configuration

Use code configuration for rules that require deployment and review:

- State-machine definitions.
- Validation tolerances.
- Supported enum values.
- Critical anti-cheat rules.

Use database/admin configuration for balance values that need live tuning:

- Wages.
- Rent.
- Fuel prices.
- Passenger rates.
- Passenger targets.
- Rental rates.
- Training fees and durations.
- Enabled airports and aircraft.

All database configuration changes require audit history.

## 22.3 Feature Flags

Use feature flags for incomplete modules and staged rollout.

Initial examples:

- `passenger_jobs_enabled`.
- `ground_vehicle_fuel_enabled`.
- `employment_applications_enabled`.
- `instrument_training_enabled`.
- `multi_engine_enabled`.
- `airport_activity_decay_enabled`.
- `tracker_payload_lock_enabled`.

Do not use feature flags as a substitute for clean module boundaries.

---

# 23. Core Database Model

This section defines conceptual tables. Exact SQL types and indexes belong in migrations.

## 23.1 Identity and Profiles

### `profiles`

- `id` linked to auth user.
- `username` unique.
- `display_name`.
- `company_name`.
- `home_city_id`.
- `home_airport_id`.
- `current_location_type` or location reference.
- `created_at`.
- `updated_at`.

Balances should not be the only accounting record. If cached balances are stored, reconcile them against the ledger.

### `financial_accounts`

- `id`.
- `owner_type`.
- `owner_id`.
- `account_type` personal/company.
- `currency`.
- `cached_balance`.
- `created_at`.

### `ledger_entries`

- `id`.
- `account_id`.
- `amount`.
- `category`.
- `description`.
- `related_type`.
- `related_id`.
- `idempotency_key` unique.
- `effective_at`.
- `created_at`.
- `balance_after` optional/cache.

## 23.2 Locations and Cities

### `cities`

- `id`.
- `name`.
- `region`.
- `country_code`.
- `latitude`.
- `longitude`.
- `employment_tier`.
- `enabled`.

### `city_airports`

- `city_id`.
- `airport_id`.
- `is_primary`.
- `surface_distance_miles` optional.

### `player_locations`

- `player_id` unique.
- `location_type` city/airport/in_transit/in_flight.
- `city_id` nullable.
- `airport_id` nullable.
- `active_travel_id` nullable.
- `active_flight_id` nullable.
- `updated_at`.

Use constraints so only the fields valid for the location type are populated.

## 23.3 Airports

### `airports`

- `id`.
- `ident`.
- `icao` nullable.
- `local_code` nullable.
- `name`.
- `municipality`.
- `region_code`.
- `country_code`.
- `latitude`.
- `longitude`.
- `elevation_ft`.
- `physical_tier`.
- `source_status`.
- `preview_enabled`.
- `created_at`.
- `updated_at`.

Indexes:

- Identifier indexes.
- PostGIS geography index.
- Country/region.
- Preview-enabled.

### `airport_game_state`

- `airport_id` unique.
- `activity_score`.
- `activity_class` cache.
- `base_passenger_target`.
- `last_activity_at`.
- `updated_at`.

### `airport_passenger_pools`

- `airport_id` unique.
- `waiting_count`.
- `reserved_count`.
- `in_flight_count`.
- `version` for optimistic concurrency if used.
- `updated_at`.

### `airport_activity_events`

- `id`.
- `airport_id`.
- `flight_id`.
- `event_type` departure/arrival/completion.
- `passenger_count`.
- `points`.
- `idempotency_key`.
- `created_at`.

### `route_statistics`

- `origin_airport_id`.
- `destination_airport_id`.
- `completed_flights`.
- `passengers_transported`.
- `total_duration_minutes`.
- `last_served_at`.
- `updated_at`.

## 23.4 Passengers and Jobs

### `passenger_reservations`

- `id`.
- `player_id`.
- `origin_airport_id`.
- `destination_airport_id`.
- `passenger_count`.
- `aircraft_id`.
- `status`.
- `reserved_at`.
- `expires_at`.
- `departed_at` nullable.
- `completed_at` nullable.

### `passenger_jobs`

- `id`.
- `player_id`.
- `reservation_id`.
- `origin_airport_id`.
- `destination_airport_id`.
- `aircraft_id`.
- `passenger_count`.
- `distance_nm`.
- `quoted_gross_revenue`.
- `quoted_costs_json`.
- `status`.
- `created_at`.
- `expires_at`.
- `completed_at`.

## 23.5 Aircraft

### `aircraft_types`

- Canonical type and planning specifications.
- Required qualification.
- Preview enabled.

### `simulator_aircraft_mappings`

- Simulator title/package match.
- Simulator version.
- Canonical aircraft type.
- Verification status.

### `aircraft`

- Registration.
- Type.
- Owner.
- Current airport.
- Fuel.
- Airframe hours.
- Condition.
- Rental availability.

### `aircraft_reservations`

- Aircraft.
- Player.
- Job.
- Status.
- Start and expiration.
- Idempotency/version data.

## 23.6 Flights and Telemetry

### `flight_sessions`

- `id`.
- `job_id`.
- `player_id`.
- `aircraft_id`.
- `tracker_installation_id`.
- `status`.
- `issued_at`.
- `started_at`.
- `departed_at`.
- `landed_at`.
- `submitted_at`.
- `validated_at`.
- `invalid_reason`.

### `flight_summaries`

- Distance.
- Duration.
- Fuel start/end/used.
- Landing rate.
- Origin/destination proximity.
- Max sim rate.
- Teleport/slew flags.
- Awarded hours.
- Settlement totals.

### `telemetry_batches`

- Session.
- Sequence start/end.
- Hash/signature.
- Compressed payload/storage reference.
- Received timestamp.

## 23.7 Qualifications and Training

### `qualification_definitions`

- ID.
- Name.
- Type.
- Prerequisite configuration.
- Tuition.
- Duration.
- Check-flight requirement.
- Enabled.

### `player_qualifications`

- Player.
- Qualification.
- Awarded time.
- Source enrollment/check flight.

### `pilot_hour_totals`

- Player.
- Category.
- Minutes.
- Updated time.

### `flight_hour_entries`

- Player.
- Flight.
- Category.
- Minutes.
- Idempotency key.

### `training_enrollments`

- Player.
- Qualification.
- Status.
- Funding account.
- Started at.
- Completes at.
- Check flight ID.
- Completed at.

## 23.8 Housing and Vehicles

### `residence_types`

- Name.
- Quality.
- Weekly rent/upkeep.
- Parking capacity.
- Status score.

### `player_residences`

- Player.
- Residence type.
- City.
- Tenancy status.
- Next rent due.
- Grace deadline.

### `vehicle_types`

- Name.
- Year.
- Value.
- Speed.
- MPG.
- Tank.
- Lifespan.
- Maintenance.
- Quality.
- Reliability.
- Status score.

### `player_vehicles`

- Player.
- Vehicle type.
- Current location.
- Mileage.
- Fuel.
- Condition.
- Estimated value.
- Next maintenance due.

### `ground_travel`

- Player.
- Mode.
- Vehicle nullable.
- Origin and destination.
- Distance.
- Cost.
- Fuel.
- Status.
- Departed at.
- Arrives at.
- Completed at.

## 23.9 Employment

### `job_templates`

- Title.
- Category.
- Base daily wage.
- Availability weight.
- Acceptance chance.
- Career-stage bounds.

### `job_postings`

- Employment area/city.
- Template.
- Wage.
- Openings.
- Status.
- Posted at.
- Expires at.

### `job_applications`

- Player.
- Posting.
- Status.
- Submitted at.
- Decision at.
- Determined result.

### `player_employment`

- Player.
- Job template/posting.
- City.
- Title.
- Daily wage.
- Hired at.
- Next pay at.
- Status.
- Ended at.

## 23.10 Audit and Notifications

### `domain_events`

Use an outbox pattern or equivalent reliable event publication.

### `audit_log`

- Actor.
- Action.
- Entity.
- Before/after summary.
- Request/session ID.
- Timestamp.

### `notifications`

- Player.
- Type.
- Title.
- Body.
- Related entity.
- Read state.
- Created time.

---

# 24. Service Interfaces and Domain Events

## 24.1 Service Boundary Rule

A domain may request another domain’s public service or consume an event. It must not directly mutate another domain’s tables.

## 24.2 Important Services

### Passenger Service

- Get airport pool.
- Reserve passengers.
- Mark passengers departed.
- Complete arrival.
- Return reservation to pool.
- Regenerate pools.

### Job Service

- Create quote.
- Validate eligibility.
- Reserve job.
- Start preparation.
- Mark in flight.
- Complete or invalidate.

### Travel Service

- Quote personal vehicle trip.
- Quote bus trip.
- Start travel.
- Complete travel.
- Cancel if allowed.
- Reconcile overdue travel.

### Aircraft Service

- Search available aircraft.
- Reserve aircraft.
- Verify eligibility.
- Release aircraft.
- Relocate aircraft.
- Record hours.

### Training Service

- Evaluate eligibility.
- Enroll.
- Complete timer.
- Generate check flight.
- Award qualification.

### Employment Service

- Search local postings.
- Apply.
- Resolve decision.
- Accept offer.
- Replace employment.
- Process payroll.

### Finance Service

- Quote affordability.
- Post ledger transaction.
- Post grouped settlement.
- Transfer between accounts later.
- Retrieve statements.

## 24.3 Domain Events

Initial event set:

```text
PlayerCreated
StartingAssetsGranted
GroundTravelStarted
GroundTravelCompleted
JobPostingCreated
JobApplicationSubmitted
JobApplicationAccepted
JobApplicationRejected
PlayerEmployed
DailyWageEarned
PassengersReserved
PassengerReservationExpired
AircraftReserved
FlightSessionCreated
FlightDeparted
FlightSubmitted
FlightCompleted
FlightInvalidated
PassengersDelivered
AircraftRelocated
PilotHoursAwarded
AirportActivityRecorded
TrainingStarted
TrainingReadyForCheck
QualificationAwarded
RentCharged
VehicleMaintenanceCharged
PaymentIssued
```

## 24.4 Transaction and Event Consistency

Use a transactional outbox or equivalent pattern so database state and event publication cannot silently diverge.

Consumers must be idempotent.

---

# 25. Background Workers and Schedules

## 25.1 Worker Responsibilities

The worker application handles:

- Ground-travel completion.
- Passenger generation.
- Passenger reservation expiration.
- Aircraft reservation expiration.
- Employment application decisions.
- Daily payroll.
- Weekly rent.
- Weekly vehicle maintenance.
- Training-timer completion.
- Airport activity decay.
- Notifications.
- Reconciliation jobs.

## 25.2 Worker Requirements

- Safe to run more than once.
- Use database locks or claims for concurrent workers.
- Maintain structured logs and run IDs.
- Record failures for retry.
- Use bounded retries and dead-letter/error queues where appropriate.
- Never perform unbounded full-table scans at high frequency.
- Support administrative replay of a specific entity or date.

## 25.3 Reconciliation

Provide periodic reconciliation for:

- Cached balances versus ledger.
- Passenger pool totals.
- Active travel whose arrival passed.
- Expired reservations.
- Aircraft locks with no active job.
- Flight settlements missing one expected side effect.
- Training ready but not processed.
- Payroll and recurring charges.

---

# 26. Web Application UX

## 26.1 Design Direction

The interface should feel like a modern persistent browser-based game and aviation management dashboard, not a spreadsheet dump and not a 3D life simulator.

Use clear status cards, maps, tables, timelines, progress bars, and transaction summaries.

## 26.2 Primary Navigation

Suggested navigation:

- Dashboard.
- Map/Airports.
- Fly.
- Aircraft.
- Travel.
- Career/Training.
- Employment.
- Home/Assets.
- Finances.
- History.
- Notifications.

## 26.3 Dashboard

Display:

- Current location or travel state.
- Active job/flight/travel.
- Personal and company balances.
- Current civilian employment and next wage.
- Residence and next rent.
- Vehicle and next maintenance.
- Waiting passengers at current airport.
- Available aircraft count.
- Pilot hours.
- Qualifications.
- Next recommended career goal.
- Recent transactions and flights.

## 26.4 Airport Browser and Map

Provide:

- Search by code, name, city, region.
- Filters by distance, activity, physical tier, waiting passengers, and available aircraft.
- Map and list modes.
- Current-player marker.
- Route-distance preview.

## 26.5 Job Builder

Steps:

1. Choose destination.
2. Choose passenger count.
3. Choose eligible aircraft.
4. Review quote and qualification checks.
5. Reserve.
6. Launch tracker/prepare flight.

Prevent the user from reaching confirmation with an invalid selection. Explain locked aircraft and qualifications.

## 26.6 Travel Screen

Display a Torn-like travel state with exact countdown, progress, route, vehicle/mode, and arrival time. Limit location-dependent actions while allowing informational browsing.

## 26.7 Tracker Connection Screen

Display:

- Tracker online/offline.
- Simulator detected.
- Correct aircraft.
- Correct airport.
- Payload/fuel status.
- Validation checklist.
- Start-flight readiness.
- Connection troubleshooting.

## 26.8 Flight Debrief

Display:

- Validity result.
- Origin/destination.
- Aircraft.
- Passengers.
- Actual time and distance.
- Fuel use.
- Landing rate.
- Gross revenue.
- Costs.
- Net company income.
- Hours awarded.
- Airport activity awarded.
- Aircraft and player new location.

## 26.9 Career and Training

Display:

- Total and category hours.
- Owned qualifications.
- Available qualifications.
- Requirements with pass/fail status.
- Tuition and duration.
- Training status/countdown.
- Check-flight action.

## 26.10 Employment

Display:

- Current job.
- Daily wage.
- Next payroll.
- Total earned.
- Pending application.
- Available local jobs.
- Application result/offer.

---

# 27. API and Command Design

## 27.1 General Principles

- Use typed request/response contracts shared between web, tracker, and backend.
- Validate all input server-side.
- Return stable error codes plus human-readable messages.
- Use request IDs and correlation IDs.
- Protect state-changing endpoints against duplicate submission.
- Prefer command endpoints for state transitions rather than generic row mutation.

## 27.2 Example Commands

```text
POST /api/onboarding/create-player
POST /api/travel/quote
POST /api/travel/start
POST /api/employment/apply
POST /api/employment/accept-offer
POST /api/jobs/passenger/quote
POST /api/jobs/passenger/reserve
POST /api/flights/session
POST /api/flights/telemetry-batch
POST /api/flights/submit
POST /api/training/enroll
POST /api/training/start-check-flight
```

## 27.3 Example Queries

```text
GET /api/dashboard
GET /api/airports
GET /api/airports/{id}
GET /api/aircraft/available
GET /api/employment/local
GET /api/career
GET /api/finances/transactions
GET /api/travel/active
GET /api/flights/{id}
```

## 27.4 Concurrency

Critical operations require database transactions and locking:

- Passenger reservation.
- Aircraft reservation.
- Job acceptance.
- Flight settlement.
- Ledger posting.
- Qualification awarding.
- Employment offer acceptance.

Use optimistic concurrency/version columns where appropriate and pessimistic locks for scarce pool reservations.

---

# 28. Security, Anti-Abuse, and Administration

## 28.1 Authentication and Authorization

- Supabase Auth or equivalent.
- Row-level security where practical.
- Server-side authorization for every command.
- Separate admin roles.
- Tracker device registration and revocation.

## 28.2 Economy Abuse Prevention

Protect against:

- Duplicate submissions.
- Race-condition reservations.
- Negative passenger pools.
- Multiple aircraft rentals.
- Repeated payroll.
- Repeated rent/maintenance charges.
- Client-edited quote values.
- Clock manipulation.
- Replay attacks.
- Unsupported aircraft mappings.
- Multiple active travel/flight states.

## 28.3 Administrative Tools

The admin application should support:

- Search player.
- View current state.
- View ledger.
- View flight evidence and validation flags.
- View passenger and aircraft reservations.
- Release stuck locks.
- Re-run reconciliation.
- Correct state through audited compensating transactions.
- Enable/disable airports and aircraft.
- Edit balance configuration.
- Review unsupported-aircraft mapping submissions.
- Suspend or restrict accounts.

Never “fix” money by silently editing a balance. Use audited adjustments.

## 28.4 Privacy

Collect only the simulator and gameplay data required to validate flights and operate the world. Publish a clear telemetry/privacy policy before public release.

Do not collect unrelated local files, personal documents, or unnecessary device information.

---

# 29. Observability and Operations

## 29.1 Structured Logging

Every service and worker should log structured events with:

- Timestamp.
- Environment.
- Request/run ID.
- Player/entity ID where safe.
- Command/event name.
- Result.
- Error code.
- Duration.

Do not log access tokens or sensitive payloads.

## 29.2 Metrics

Track:

- New players completing onboarding.
- Time to first passenger flight.
- Valid versus invalid flights.
- Tracker connection failure rate.
- Passenger pool levels.
- Airport activity distribution.
- Average flight profitability by aircraft.
- Civilian wage versus fixed-expense coverage.
- Training enrollment and completion.
- Stuck travel/reservation counts.
- Worker lag and failures.
- Ledger reconciliation differences.

## 29.3 Alerts

Alert on:

- Duplicate-settlement attempts.
- Negative or impossible pool values.
- Ledger mismatch.
- Worker backlog.
- High flight-validation failure rate.
- Tracker API errors.
- Database lock contention.
- Authentication anomalies.

---

# 30. Testing Strategy

## 30.1 Unit Tests

Required for every pure rule:

- Distance calculations.
- Travel duration and fare.
- Vehicle fuel and mileage.
- Passenger revenue.
- Passenger target/activity modifier.
- Qualification eligibility.
- Training completion.
- Employment acceptance and payroll eligibility.
- Recurring expense dates.
- Flight settlement math.
- Telemetry plausibility rules.

## 30.2 Integration Tests

Required for:

- Atomic passenger reservation under concurrency.
- Atomic aircraft reservation.
- Flight settlement and all side effects.
- Idempotent payroll.
- Idempotent weekly charges.
- Travel completion while offline.
- Reservation expiration and restoration.
- Training timer and qualification award.
- Location state constraints.

## 30.3 End-to-End Web Tests

Cover:

- Complete onboarding.
- Apply for a job.
- Start and complete ground travel.
- Build and reserve a passenger job.
- View tracker readiness.
- Complete a simulated test flight through a mock tracker.
- View debrief and updated balances/hours.

## 30.4 Tracker Tests

Use simulator adapters and recorded telemetry fixtures.

Cover:

- Normal flight.
- Disconnect/reconnect.
- Pause.
- Sim-rate violation.
- Slew/teleport.
- Wrong aircraft.
- Wrong airport.
- Payload mismatch.
- Fuel mismatch.
- Hard landing.
- Duplicate submission.

## 30.5 Load and Race Tests

Test:

- Many players reserving the same airport pool.
- Many players renting limited aircraft.
- Scheduled payroll for all users.
- Passenger generation across all airports.
- High-volume telemetry ingestion.
- Flight settlement bursts.

## 30.6 Test Data

Provide deterministic fixtures:

- Small preview region.
- Known airports and distances.
- Several aircraft types.
- Starting player.
- Passenger pools.
- Employment postings.
- Valid and invalid telemetry sessions.

---

# 31. Coding and Repository Standards

## 31.1 TypeScript

- Strict TypeScript enabled.
- No untyped `any` without an explicit documented exception.
- Enforce consistent filename and import casing.
- Validate runtime inputs with a schema library.
- Use branded IDs or strongly typed identifiers where useful.
- Distinguish money decimals from floating-point display values.

## 31.2 Money

- Store money using PostgreSQL numeric/decimal or integer cents.
- Never use JavaScript floating-point arithmetic for authoritative settlement without a decimal-money abstraction.
- Format currency using `en-US` USD conventions in the preview.

## 31.3 Distances and Units

Define canonical units:

- Aviation distance: nautical miles.
- Ground distance: statute miles.
- Aircraft weight: pounds.
- Fuel: gallons by fuel type for preview.
- Speed: knots in flight, mph on ground.
- Time: seconds/minutes internally with timestamps for deadlines.

Conversion utilities must be centralized and tested.

## 31.4 Error Handling

Use typed domain errors, such as:

- `PLAYER_NOT_AT_ORIGIN`.
- `INSUFFICIENT_PASSENGERS`.
- `AIRCRAFT_NOT_AVAILABLE`.
- `QUALIFICATION_REQUIRED`.
- `TRAVEL_ALREADY_ACTIVE`.
- `FLIGHT_SESSION_INVALID`.
- `INSUFFICIENT_FUNDS`.
- `APPLICATION_ALREADY_PENDING`.

UI messages should translate stable codes into helpful explanations.

## 31.5 Documentation

Each domain package requires:

- README with ownership and public API.
- State-machine documentation.
- Configuration reference.
- Key invariants.
- Testing instructions.

Architectural decision records should document significant deviations.

---

# 32. Implementation Roadmap

## Phase 0 - Repository and Architecture

Deliver:

- Monorepo.
- Shared TypeScript configuration.
- Linting/formatting/testing.
- CI.
- Environment validation.
- Database and migrations.
- Auth.
- Contracts package.
- Domain event/outbox foundation.
- Finance ledger foundation.
- Worker framework.
- Audit logging.

Exit criteria:

- All apps build.
- Local development works from documented commands.
- CI runs tests and migrations safely.
- A sample idempotent ledger transaction works.

## Phase 1 - Airport World and Player Onboarding

Deliver:

- Airport importer and canonical catalog.
- Preview airport selection.
- Cities and airport links.
- Map and airport pages.
- Player creation.
- Starting PPL, apartment, car, and balances.
- Current location.
- Dashboard.

Exit criteria:

- New player can complete onboarding.
- Starting assets are granted exactly once.
- Airport search/map work.

## Phase 2 - Employment and Recurring Economy

Deliver:

- Job templates and local postings.
- Applications and decisions.
- One active employment.
- Daily payroll.
- Weekly rent.
- Weekly vehicle maintenance.
- Ledger statements and notifications.

Exit criteria:

- Payroll and charges are idempotent.
- Starting economic balance is testable.
- Players can recover after missed payments.

## Phase 3 - Ground Travel

Deliver:

- Travel quoting.
- Personal vehicle travel.
- Bus travel.
- Fuel/mileage.
- Travel countdown.
- Offline completion.
- Location restrictions.

Exit criteria:

- Player cannot be in multiple locations.
- Travel completes without an open browser.
- Vehicle cannot be reused while traveling.

## Phase 4 - Passenger Pools and Job Builder

Deliver:

- Passenger pools.
- Passenger generation.
- Airport activity state.
- Destination selection.
- Passenger job quotes.
- Atomic passenger reservations.
- Job expiration.

Exit criteria:

- Pools never become negative.
- Concurrent reservations are safe.
- Quotes are explainable and configurable.

## Phase 5 - Aircraft and Tracker Integration

Deliver:

- Canonical aircraft catalog.
- Simulator mappings.
- System rental fleet.
- Aircraft reservation.
- Tracker authentication.
- SimConnect adapter.
- Flight session and telemetry ingestion.
- Mock-tracker development mode.

Exit criteria:

- Correct aircraft can be prepared.
- Unsupported aircraft are rejected clearly.
- Flight telemetry is stored and validated.

## Phase 6 - Flight Completion and Career Hours

Deliver:

- Departure and arrival detection.
- Flight submission.
- Validation rules.
- Flight settlement.
- Passenger delivery.
- Player/aircraft relocation.
- Airport activity.
- Verified hours.
- Debrief.

Exit criteria:

- A valid end-to-end flight completes exactly once.
- An invalid flight pays nothing and explains why.
- All side effects reconcile.

## Phase 7 - Training and Early Progression

Deliver:

- Qualification definitions.
- Eligibility engine.
- Training enrollment and timers.
- Check flights.
- High-performance, instrument, and multi-engine progression.
- Career screen.

Exit criteria:

- Players can understand the next goal.
- Training cannot be bypassed.
- Qualification awards are idempotent.

## Phase 8 - Preview Hardening

Deliver:

- Admin tools.
- Metrics and alerts.
- Load tests.
- Economy balancing.
- Tracker recovery.
- Error-state UX.
- Security review.
- Data backup and restore test.
- Closed-preview documentation.

---

# 33. Preview Acceptance Criteria

The preview is not ready until all of the following are true:

## Onboarding

- New player can create a character without admin help.
- Starting assets are granted once.
- Starting city and airport are valid.
- Dashboard clearly explains current state and next step.

## Economy

- Personal and company money remain separate.
- Every change has a ledger record.
- Payroll, rent, maintenance, and flight settlement cannot duplicate.
- Starting job income nearly covers fixed expenses without funding rapid progression.

## Employment

- Player can see local postings, apply, receive a decision, and accept one job.
- A player cannot hold two jobs.
- Daily wage arrives reliably.

## Travel

- Player must be at the origin airport to fly.
- Car and bus travel use server-controlled arrival time.
- Travel completes offline.
- Player cannot begin conflicting actions.

## Airports and Passengers

- Airport catalog and map are usable.
- Passenger pools regenerate predictably.
- Passenger reservations are atomic.
- Pools never become negative.
- Airport activity responds to valid traffic.

## Aircraft and Flight

- Aircraft cannot be double-rented.
- Tracker recognizes supported aircraft.
- Valid flight completes consistently.
- Invalid flight does not pay.
- Aircraft and player relocate correctly.
- Passenger and activity updates occur once.

## Career

- Verified hours are accurate and traceable to flights.
- Qualification prerequisites work.
- Training fees and timers work.
- Check flight awards qualification exactly once.

## Operations

- Admin can inspect and recover stuck state.
- Critical workers are monitored.
- Reconciliation finds intentionally seeded inconsistencies.
- Backup and restore procedure is tested.

---

# 34. Future Expansion Rules

## 34.1 Passenger Complexity

When route-specific passengers are added, preserve the existing reservation and delivery contract. Replace the pool provider with a richer implementation rather than rewriting flight settlement.

## 34.2 Cargo

Cargo should be a separate transport-demand domain sharing job, aircraft, flight, and settlement services. Do not add cargo columns throughout passenger code.

## 34.3 FBO and Fuel Economy

Player FBOs should implement the fuel-provider interface. Flight settlement should continue purchasing from a provider without knowing whether it is system-owned or player-owned.

## 34.4 Airlines

Airline employment must use the existing one-job employment model. It may add schedules, bases, required flights, seniority, and salary rules through an aviation-employment subtype.

## 34.5 Life Simulation

Future NPC reactions, social events, relationships, and narrative flavor should consume domain events such as `FlightCompleted`, `PlayerRelocated`, or `AssetPurchased`. They should not be embedded in core flight validation.

## 34.6 Maintenance

Detailed aircraft and vehicle maintenance should extend recorded hours, mileage, condition, and service records. It must not require replacing canonical asset records.

---

# 35. Open Design Decisions

The following decisions should be resolved through prototypes or balance tests, not guessed deep inside implementation:

1. Final starting personal and company balances.
2. Exact first-preview region versus worldwide enabled airports.
3. Exact supported aircraft list.
4. Wet versus dry rental model for preview.
5. Passenger rate and minimum fare.
6. Airport activity gain and decay rates.
7. Passenger generation interval and targets.
8. PPL route-distance and passenger limits.
9. Application delay and acceptance rates.
10. Exact daily payroll time.
11. Rent grace period and housing-failure consequences.
12. Ground fuel automation versus manual refueling in preview.
13. Tracker support for MSFS 2020, MSFS 2024, or both at first release.
14. Telemetry storage-retention policy.
15. Required check-flight scenarios.

Implement these through configuration with safe defaults so they can be changed without structural rewrites.

---

# 36. Instructions to the Implementing AI

1. Treat this document as the product source of truth.
2. Build in the roadmap order unless a prerequisite requires adjustment.
3. Do not begin with every future feature.
4. Keep domains independent and expose public service interfaces.
5. Never place authoritative formulas in React components.
6. Never trust client-provided money, time, hours, location, passenger counts, or flight results.
7. Use database transactions and idempotency for all scarce resources and money.
8. Write tests before or alongside every critical economic/state transition.
9. Keep configuration centralized and typed.
10. Create migrations; do not mutate production schemas manually.
11. Use UTC in storage and server logic.
12. Use decimal-safe money operations.
13. Preserve explicit state machines.
14. Add audit logs and actionable error codes.
15. Provide mock services for tracker/SimConnect so web and backend development can proceed without the simulator.
16. Keep a running `IMPLEMENTATION_STATUS.md` mapping roadmap requirements to code, tests, and known gaps.
17. Create architectural decision records for changes to this specification.
18. Do not mark a phase complete until its exit criteria pass.
19. Prefer a simple working provider behind a good interface over a speculative complex system.
20. Optimize first for correctness, recovery, and clarity; optimize scale after measuring actual bottlenecks.

---

# 37. Final Product Definition

OneWorld’s first preview succeeds when a new player can enter a persistent aviation world, obtain basic employment, travel to an airport in real time, reserve waiting passengers, rent a qualified aircraft, fly a validated MSFS flight, receive a correct settlement and verified hours, influence airport activity, and understand exactly how to progress toward more advanced aircraft.

The life-simulation layer should make that career feel grounded through housing, a vehicle, employment, expenses, wealth, and status. It should not distract development from the core simulation.

The project should be built so that later cargo, FBO, airline, maintenance, business, and social systems can attach cleanly to the foundation rather than forcing a rewrite.
