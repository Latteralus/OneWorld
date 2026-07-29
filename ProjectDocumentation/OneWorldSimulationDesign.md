# OneWorld — Early-Game Career, Travel, and Life Simulation Design

## 1. Foundational Design Principles

OneWorld is a persistent multiplayer aviation career and life simulator operating continuously in real-world time.

The game’s initial release will focus exclusively on passenger aviation. Cargo, complex fuel logistics, player-owned FBO services, and broader economic systems will be added as separate modules after the passenger gameplay loop has been completed and balanced.

The initial gameplay experience should emphasize:

* Starting with limited money and qualifications
* Flying basic passenger jobs under a Private Pilot License
* Accumulating verified flight hours
* Paying for aircraft-specific training
* Advancing into larger and more profitable aircraft
* Maintaining housing and transportation
* Traveling physically between airports
* Developing personal wealth and social status
* Contributing to the growth or decline of airports
* Existing in the same persistent world as other players

Players should feel as though they are building an aviation career and personal life rather than merely selecting missions from a menu.

---

# 2. World Time

## 2.1 Real-Time Progression

OneWorld operates at a permanent **1:1 real-world time scale**.

One real-world minute equals one in-game minute.

The user-facing game clock may display Eastern Time, but all backend timestamps should be stored in UTC. The web client can then display Eastern Time or another configured timezone without introducing daylight-saving-time errors.

The backend must treat UTC timestamps as the authoritative source for:

* Travel completion
* Job expiration
* Rent and maintenance payments
* Aircraft reservations
* Flight start and completion
* Training completion
* Passenger generation
* Airport activity
* Weekly expenses
* Player status updates

No gameplay system should depend on the player leaving the website open.

---

# 3. Starting Character

Every new player begins in a city selected during character creation.

The city determines:

* Starting residential location
* Starting airport or airport group
* Local passenger demand
* Nearby airports
* Initial job availability
* Ground transportation distances
* Regional cost and activity modifiers added later

## 3.1 Starting Assets

Each player begins with:

### Pilot License

**Private Pilot License**

The PPL allows the player to accept a limited category of basic passenger assignments using approved entry-level aircraft.

### Residence

**Run-Down Apartment**

* Location: Player’s selected starting city
* Rent: $800 per week
* Quality: Very Poor
* Required: Yes
* Occupancy: Single player
* Parking: One vehicle
* Rest quality: Basic
* Status contribution: Low
* Description: An inexpensive and poorly maintained apartment near the player’s starting airport.

### Vehicle

**1990s Hunda Attord**

The intentionally fictional name avoids licensing concerns while clearly communicating what type of vehicle it represents.

* Purchase value: $500
* Starting mileage: Randomized between approximately 170,000 and 235,000 miles
* Expected lifespan: Approximately 250,000 miles
* Weekly maintenance: $25
* Quality: Very Poor
* Fuel efficiency: Approximately 24 MPG
* Fuel tank: Approximately 16 gallons
* Speed rating: Standard
* Reliability: Low
* Status contribution: Low
* Condition: Used
* Required: Yes

The player is not required to keep this exact car permanently, but must ordinarily possess access to both housing and transportation.

## 3.2 Starting Financial Position

The player should start with enough money to avoid immediate failure while still feeling financially constrained.

Recommended starting finances:

* Personal cash: $2,500
* Business cash: $5,000
* Apartment security deposit already paid
* First week of rent already paid
* Starting vehicle owned outright
* PPL already completed
* No aircraft ownership
* No business debt

This gives the player enough room to begin flying without removing financial pressure.

---

# 4. Housing Requirement

Every player must maintain a valid primary residence.

A player who loses housing should not have their account locked, but should enter an unstable housing condition.

Possible housing states:

1. Housed
2. Rent overdue
3. Eviction pending
4. Temporary lodging
5. Homeless

Homelessness should create financial and narrative consequences without permanently preventing gameplay.

Possible consequences include:

* Reduced personal status
* Lower-quality rest
* Increased daily living expenses
* Certain premium clients refusing service
* Negative flavor events
* Restrictions on purchasing luxury assets
* Requirement to use hotels or temporary airport lodging

Players should be able to recover by renting another residence.

## 4.1 Housing Categories

Initial housing progression could include:

| Housing               | Weekly Cost | Quality     | General Status     |
| --------------------- | ----------: | ----------- | ------------------ |
| Run-Down Apartment    |        $800 | Very Poor   | Poor               |
| Basic Apartment       |      $1,200 | Poor        | Lower Class        |
| Comfortable Apartment |      $1,800 | Average     | Lower Middle Class |
| Townhouse             |      $2,800 | Good        | Middle Class       |
| Suburban House        |      $4,000 | Very Good   | Upper Middle Class |
| Luxury Condominium    |      $7,500 | Excellent   | Affluent           |
| Estate                |    $15,000+ | Luxury      | Wealthy            |
| Hangar Residence      |      Varies | Specialized | Aviation Elite     |

These figures can later vary by city through a housing-market module.

For the initial version, housing may use standardized prices to reduce balancing complexity.

---

# 5. Vehicles

Vehicles provide ground transportation between the player’s residence and airports, as well as between nearby airports.

A vehicle should be a persistent personal asset rather than a cosmetic inventory item.

## 5.1 Vehicle Statistics

Every vehicle should have the following authoritative attributes:

### Purchase Price

The amount required to purchase the vehicle.

### Current Value

The estimated resale value based on:

* Age
* Mileage
* Condition
* Quality
* Reliability
* Market demand

### Mileage

The total number of miles driven.

Ground travel increases vehicle mileage according to the route distance.

### Expected Lifespan

A general mileage threshold representing the vehicle’s expected useful life.

Most ordinary passenger vehicles should last approximately 200,000–300,000 miles.

Reaching the expected lifespan does not immediately destroy the vehicle. Instead:

* Reliability declines
* Maintenance expenses increase
* Breakdown chances increase
* Resale value decreases

### Travel Speed

Travel speed determines estimated journey duration.

The value should represent realistic average travel speed rather than maximum advertised speed.

Example speed categories:

| Category  | Average Effective Speed |
| --------- | ----------------------: |
| Very Slow |                  35 mph |
| Slow      |                  45 mph |
| Standard  |                  55 mph |
| Fast      |                  62 mph |
| Premium   |                  68 mph |

Effective speed may later account for:

* Road conditions
* Urban congestion
* Weather
* Vehicle condition
* Route type

### Fuel Efficiency

Fuel efficiency is measured in miles per gallon.

Fuel consumed:

```text
Fuel Used = Route Miles ÷ Vehicle MPG
```

Travel cost:

```text
Fuel Cost = Fuel Used × Regional Fuel Price
```

### Fuel Tank Capacity

A vehicle cannot begin a journey requiring more fuel than is currently available unless the route contains an eligible refueling stop.

For the early version, the system may automatically calculate and purchase required fuel before departure.

Later versions can introduce:

* Manual refueling
* Regional fuel prices
* Fuel stations
* Player-owned stations
* Electric vehicles
* Breakdown and towing services

### Quality

Quality represents the condition, comfort, age, presentation, and desirability of the vehicle.

Suggested quality tiers:

1. Derelict
2. Very Poor
3. Poor
4. Average
5. Good
6. Very Good
7. Excellent
8. Luxury
9. Elite

### Reliability

Reliability should remain separate from quality.

A vehicle can be:

* Old and unattractive but mechanically reliable
* Expensive and attractive but poorly maintained
* Cheap but recently repaired
* High-quality and highly reliable

### Weekly Maintenance

Weekly maintenance represents routine ownership costs.

Later versions may separate this into:

* Insurance
* Registration
* Routine servicing
* Repairs
* Tires
* Depreciation

For the initial release, one weekly maintenance cost is sufficient.

---

# 6. Ground Transportation

Players must physically travel between their current location and the airport from which they intend to fly.

A player cannot accept or begin a flight at an airport where they are not currently located.

## 6.1 Travel Methods

Initial transportation methods:

* Personal vehicle
* Bus service
* Passenger flight operated by another player
* Later: taxi, rideshare, train, rental vehicle, commercial airline and private charter

## 6.2 Personal Vehicle Travel

Driving time should be calculated using route distance and the vehicle’s effective speed.

```text
Travel Duration = Route Distance ÷ Effective Vehicle Speed
```

Example:

* Distance: 110 miles
* Effective speed: 55 mph
* Travel time: 2 hours

The player receives an exact estimated arrival timestamp before confirming travel.

Driving should consume:

* In-game time
* Vehicle fuel
* Vehicle mileage
* A proportional amount of vehicle wear

The player may not use the same vehicle in two places simultaneously.

## 6.3 Bus Service

Every eligible airport should provide access to a standardized public bus service.

The bus exists primarily as a fallback so players are never permanently stranded.

Bus characteristics:

* Available at all supported airports
* Does not require vehicle ownership
* Slower than most personal vehicles
* Charges a fixed base fare plus distance
* Travels using realistic estimated surface travel time
* Does not increase the player’s vehicle mileage
* May require additional waiting or boarding time

Recommended initial bus model:

```text
Bus Duration =
Route Distance ÷ 40 mph
+ 30-minute boarding delay
```

Recommended fare model:

```text
Bus Fare =
$15 base fare
+ $0.20 per mile
```

The route does not need to represent a literal direct bus line. It represents the collection of public transportation, shuttle transfers, and coach services needed to reach the destination.

For extremely long distances, the bus may take many real-world hours. This is intentional, although commercial passenger travel should later become the practical long-distance alternative.

## 6.4 Airport Connectivity

Not every airport should necessarily connect directly to every other airport by surface transportation.

Each airport should eventually have:

* Road accessibility
* Nearest city
* Nearby airports
* Bus availability
* Surface travel distance
* Terrain category
* Remote-access status

For the first version, the bus may travel between any two airports using estimated straight-line distance multiplied by a road-distance factor.

Example:

```text
Estimated Road Distance =
Great-Circle Distance × 1.25
```

This is sufficient until a proper road-routing service or stored route network is introduced.

---

# 7. Travel State

When a player begins traveling, their character enters a dedicated travel state.

Travel states include:

* Driving
* Riding bus
* Flying as passenger
* Flying as pilot
* Awaiting simulator connection
* Arrived

## 7.1 Travel Screen

The interface should resemble Torn’s travel system.

It should display:

* Transportation method
* Origin
* Destination
* Departure time
* Estimated arrival time
* Remaining travel time
* Progress percentage
* Relevant vehicle or flight information
* Short rotating flavor text

Example:

```text
Traveling to McCall Municipal Airport

Method: Personal Vehicle
Vehicle: 1996 Hunda Attord
Distance: 109 miles
Departure: 2:14 PM EST
Arrival: 4:13 PM EST
Time Remaining: 1:27:42
```

Possible flavor text:

> The Attord rattles as you climb into the mountains. The heater works, although only when the engine is above 2,500 RPM.

## 7.2 Restrictions While Traveling

While traveling, the player should not be able to:

* Begin another journey
* Begin a flight
* Purchase or sell the vehicle being used
* Move inventory between locations
* Accept an immediate-departure assignment
* Perform location-dependent actions
* Change residence
* Enter training requiring attendance elsewhere

The player should still be able to:

* View their profile
* Read messages
* Review finances
* Browse markets
* Review jobs
* View aircraft
* Plan future routes
* Communicate with other players
* Manage company operations that do not require physical presence

The player should not be rendered completely unable to interact with the game.

---

# 8. Private Pilot License Gameplay

The player begins with a PPL rather than starting as a student pilot.

The PPL permits basic passenger assignments, but only under limited conditions.

## 8.1 Initial PPL Job Restrictions

Basic jobs should generally be limited to:

* Small passenger groups
* Day or visual-weather operations
* Short regional routes
* Entry-level single-engine piston aircraft
* Lower-value passengers
* Non-urgent travel
* Airports within the pilot’s current qualification
* Jobs below defined passenger and distance limits

Example initial restrictions:

* Maximum passengers: 3
* Maximum route distance: 250 nautical miles
* Aircraft: Approved single-engine piston trainers
* No VIP jobs
* No medical jobs
* No night-required jobs
* No instrument-required jobs
* No high-performance aircraft
* No multi-engine aircraft
* No turbine aircraft

The game does not need to enforce real-world FAA commercial compensation law exactly. The PPL is a gameplay starting tier representing inexperienced entry-level flying privileges.

This should be communicated as a fictionalized certification system inspired by aviation rather than a legal training simulator.

---

# 9. Pilot Flight Hours

Verified flight hours are one of the main progression requirements.

The tracker records:

* Total verified hours
* Pilot-in-command hours
* Aircraft-specific hours
* Aircraft-category hours
* Day hours
* Night hours
* Instrument hours
* Cross-country hours
* Successful passenger legs
* Takeoffs
* Landings
* Safety events

Hours should only count when the flight:

* Uses a supported simulator
* Is tracked by the OneWorld client
* Begins and ends correctly
* Does not use prohibited teleportation or slew
* Uses an approved aircraft
* Meets minimum flight-duration requirements
* Produces plausible telemetry

## 9.1 Hour Categories

Recommended hour categories:

* Total Flight Time
* Single-Engine Piston
* Multi-Engine Piston
* Turboprop
* Jet
* Rotorcraft, later
* Night
* Instrument
* Cross-Country
* Aircraft-Type Time

These become prerequisites for training and job access.

---

# 10. Training and Aircraft Qualifications

Owning or renting an aircraft does not automatically qualify the player to operate it commercially.

Players must complete training for more advanced aircraft and ratings.

Training requires:

* Prerequisite flight hours
* Money
* A training location
* Real-world elapsed time
* In some cases, a simulator check flight
* Prior qualifications

## 10.1 Qualification Categories

### General Ratings

* Night Qualification
* Instrument Rating
* Commercial Pilot Qualification
* Multi-Engine Rating
* High-Performance Endorsement
* Complex Aircraft Endorsement
* Turboprop Qualification
* Jet Qualification
* Airline Transport Qualification

### Aircraft Family Qualifications

A player should not need a completely separate qualification for every minor variant.

Aircraft may be organized into training families:

* Cessna 152/172 family
* Piper PA-28 family
* Cessna 206 family
* Beechcraft Baron family
* Cessna Caravan family
* King Air family
* Citation family
* Boeing 737 family

Individual aircraft can still require differences training where appropriate.

## 10.2 Example Progression

### Entry-Level Single-Engine Qualification

Starting privilege.

Allows:

* C152
* C172
* PA-28
* Similar aircraft

### High-Performance Single-Engine

Requirements:

* 20 verified total hours
* 10 single-engine hours
* $2,500 training fee
* 4-hour training period
* One successful check flight

Unlocks aircraft such as:

* C182
* C206
* Bonanza-class aircraft

### Instrument Rating

Requirements:

* 40 verified total hours
* 10 cross-country hours
* 5 night hours
* $8,000 training fee
* 24-hour training period
* Instrument check flight

Unlocks:

* Instrument-required assignments
* Poor-weather jobs
* Higher-paying business travel
* Reduced weather cancellation risk

### Multi-Engine Rating

Requirements:

* 75 verified total hours
* Instrument Rating
* 25 cross-country hours
* $12,000 training fee
* 48-hour training period
* Multi-engine check flight

Unlocks:

* Light twins
* Larger passenger groups
* Longer regional routes

### Turboprop Qualification

Requirements:

* 150 total hours
* 40 multi-engine hours, where applicable
* Commercial Pilot Qualification
* Instrument Rating
* $30,000 training fee
* 72-hour training period
* Aircraft-family check flight

### Jet Qualification

Requirements:

* 350 total hours
* 100 turbine hours
* Commercial Pilot Qualification
* Instrument Rating
* Excellent safety standing
* $75,000 or more in training costs
* Type-specific check flight

The exact values should be configurable rather than hard-coded.

---

# 11. Training Experience

Training should be a meaningful purchase, but should not consist only of paying money and waiting.

A training course may contain:

1. Enrollment
2. Real-time training period
3. Optional educational flavor text
4. Required simulator check flight
5. Evaluation
6. Qualification award

Example:

```text
Cessna 208 Qualification Course

Training Center: Boise Air Training
Course Fee: $18,500
Duration: 36 hours
Prerequisites:
✓ 100 total hours
✓ Instrument Rating
✓ Commercial Pilot Qualification
✗ 25 high-performance hours
```

Training expenses may be paid by:

* The player personally
* The player’s company
* An employer
* A loan
* A scholarship or event reward, later

---

# 12. Passenger System

At launch, passengers are the only transported commodity.

Every airport maintains a population of passengers waiting to travel.

Passengers are not generic units only. Each passenger group should have at least a lightweight identity.

## 12.1 Passenger Group Data

Each waiting passenger group should include:

* Group ID
* Origin airport
* Desired destination
* Number of passengers
* Creation time
* Expiration or patience
* Travel purpose
* Service expectation
* Maximum acceptable price
* Urgency
* Minimum aircraft quality
* Minimum pilot qualification
* Required arrival window
* Generated flavor profile

Example:

```text
Passenger Group: OW-PAX-10452

Passengers: 2
Origin: KBOI
Destination: KMYL
Purpose: Weekend tourism
Urgency: Low
Service Tier: Economy
Maximum Fare: $640
Patience: 18 hours
Requirements:
- Single-engine passenger aircraft allowed
- Day flight
- PPL job eligible
```

## 12.2 Passenger Generation

Passenger generation should depend on:

* Airport rating
* Population served
* Recent passenger traffic
* Number of active players nearby
* Historical completion rate
* Available destinations
* Time of day
* Day of week
* Season
* Tourism and business modifiers added later

For the initial release, use a simplified generation formula with configurable weights.

Example:

```text
Passenger Spawn Rate =
Base Airport Demand
× Airport Rating Modifier
× Recent Service Modifier
× Time Modifier
```

---

# 13. Airport Rating and Growth

Every airport has a persistent rating reflecting its activity and attractiveness.

The rating should not simply rise whenever any passenger arrives. It should reflect sustained, successful service.

## 13.1 Airport Rating Inputs

Positive factors:

* Passengers successfully departed
* Passengers successfully arrived
* High job-completion rate
* Reliable scheduled service
* Variety of destinations
* Low passenger waiting times
* Continued player activity
* Availability of aircraft
* Passenger satisfaction

Negative factors:

* Passengers repeatedly expire without transportation
* Excessive cancellations
* Long waiting times
* Poor service
* Severe incidents
* Loss of active routes
* Extended inactivity

## 13.2 Suggested Airport Rating Scale

| Rating | Name       | Passenger Demand |
| -----: | ---------- | ---------------- |
|    0–9 | Dormant    | Very Low         |
|  10–24 | Remote     | Low              |
|  25–39 | Local      | Modest           |
|  40–54 | Active     | Average          |
|  55–69 | Regional   | High             |
|  70–84 | Major      | Very High        |
| 85–100 | Global Hub | Exceptional      |

An airport should possess a natural baseline so that major real-world airports do not begin with the same demand as tiny airfields.

Recommended distinction:

* **Base demand:** Determined by real-world airport characteristics
* **Player activity rating:** Changed by gameplay
* **Current demand:** Produced from both values

This prevents players from turning a tiny private strip into the equivalent of Atlanta solely through repetitive flights, while still allowing meaningful growth.

## 13.3 Route Development

Repeated successful service between two airports should create a route relationship.

A route can gain:

* Awareness
* Passenger demand
* Reliability
* Business interest
* Tourism interest
* Scheduled-service potential

Example:

```text
KBOI → KMYL

Route Level: Established
Flights Completed: 184
Completion Rate: 94%
Average Wait: 2h 14m
Current Demand: High
```

This gives groups of players a reason to develop regional networks.

---

# 14. Passenger Movement and World Conservation

Passenger jobs should preferably represent actual waiting passengers rather than infinitely generated mission cards.

When a player reserves a group:

* The passengers are removed from general availability
* They enter a reserved state
* They remain at the origin until departure
* They enter in-transit status during the flight
* They arrive at the destination after successful completion
* The destination airport receives traffic credit

If the reservation expires:

* The passengers return to the waiting pool
* Their patience decreases
* They may choose another destination or leave the system

This creates the foundation for a more genuine transport economy.

---

# 15. Player Social Status

Status is a mostly descriptive system showing how wealthy and socially established a player appears.

It should not determine a person’s actual value or skill. It reflects visible lifestyle, assets, income, housing, vehicles, and financial security.

## 15.1 Wealth Versus Status

Two different values should be tracked.

### Net Worth

A numeric financial calculation:

```text
Net Worth =
Cash
+ Personal Asset Value
+ Company Equity
+ Investments
− Personal Debt
− Business Debt Attributable to Owner
```

### Status Score

A presentation score influenced by:

* Housing quality
* Vehicle quality
* Personal liquidity
* Stable income
* Company ownership
* Aircraft ownership
* Luxury assets
* Debt burden
* Recent financial distress
* Public reputation

A player with a $2 million company but no personal cash may have high business standing but only moderate personal status.

## 15.2 Proposed Status Classes

| Status Score | Social Class       |
| -----------: | ------------------ |
|         0–99 | Destitute          |
|      100–199 | Poor               |
|      200–299 | Lower Class        |
|      300–399 | Upper-Lower Class  |
|      400–499 | Lower-Middle Class |
|      500–599 | Middle Class       |
|      600–699 | Upper-Middle Class |
|      700–799 | Affluent           |
|      800–899 | Wealthy            |
|      900–949 | High Society       |
|     950–1000 | Elite              |

For cleaner user-facing language, avoid extremely granular labels such as “Middle-Lower Class” and “Lower-Middle Class” appearing next to one another. The distinctions can exist internally while the public-facing titles remain understandable.

## 15.3 Status Presentation

A player profile could display:

```text
Chris Barnett
Career: Commercial Charter Pilot
Home: Boise, Idaho
Social Status: Lower-Middle Class
Estimated Net Worth: $48,000
Company Standing: Emerging Operator
```

Status should mainly affect:

* Flavor text
* Profile presentation
* NPC reactions
* Social events
* Certain VIP-client expectations
* Luxury purchases
* Invitations and opportunities

It should not provide large direct payment multipliers.

---

# 16. Weekly Expenses

At a defined weekly timestamp, the system processes recurring personal expenses.

Initial recurring costs:

* Rent
* Vehicle maintenance
* Vehicle financing, later
* Insurance, later
* Lifestyle cost, later
* Loan payments
* Property upkeep

For the starting player:

```text
Run-Down Apartment: $800
Hunda Attord Maintenance: $25
Total Weekly Fixed Expenses: $825
```

This equals $42,900 per 52-week year before fuel or other living expenses, making the starting player financially pressured. Entry-level jobs must therefore produce enough income for active players to survive without making progression trivial.

Recommended design target:

* A moderately active entry-level player can cover basic expenses.
* A lightly active player slowly loses savings.
* A highly active and skilled player can save for training.
* Missing several weeks should not immediately delete assets or end the career.

Use a grace system:

1. Payment due
2. Seven-day overdue period
3. Warning
4. Late fee
5. Eviction or repossession proceedings
6. Asset loss only after an extended period

---

# 17. Modular Technical Architecture

OneWorld must be organized around independent domain modules.

No single file should contain the complete economy, travel system, vehicle system, passenger system, and flight system.

Each module should expose a narrow public interface and depend on shared contracts rather than directly modifying another module’s internal database state.

## 17.1 Recommended Monorepo Structure

```text
apps/
  web/
  tracker/
  admin/
  worker/

packages/
  config/
  contracts/
  db/
  domain-airports/
  domain-passengers/
  domain-jobs/
  domain-pilots/
  domain-certifications/
  domain-training/
  domain-travel/
  domain-vehicles/
  domain-housing/
  domain-finance/
  domain-status/
  domain-aircraft/
  domain-flights/
  domain-fuel/
  domain-time/
  domain-events/
  domain-notifications/
  domain-audit/
  ui/
  utils/
  testing/
```

## 17.2 Domain Ownership

Each domain owns its own:

* Types
* Validation rules
* Database queries
* Business logic
* Events
* Tests
* Public service interface

Example:

```text
packages/domain-vehicles/
  src/
    vehicle.types.ts
    vehicle.schema.ts
    vehicle.repository.ts
    vehicle.service.ts
    vehicle.rules.ts
    vehicle.events.ts
    vehicle.constants.ts
    index.ts
```

Other modules import only from:

```text
@oneworld/domain-vehicles
```

They should not import internal files such as:

```text
@oneworld/domain-vehicles/src/vehicle.repository
```

---

# 18. Sources of Truth

Each important game concept needs exactly one authoritative source.

## 18.1 Database Source of Truth

The database is authoritative for persistent state:

* Player location
* Player balances
* Owned assets
* Passenger location
* Vehicle mileage
* Training progress
* Certification ownership
* Aircraft state
* Active travel
* Flight records
* Airport ratings

The browser interface must never be authoritative.

## 18.2 Server Time Source of Truth

The server clock is authoritative for:

* Current time
* Arrival calculations
* Expiration
* Weekly charges
* Training completion
* Reservation windows

The client may display countdowns, but must periodically reconcile with the server.

## 18.3 Simulator Telemetry Source of Truth

The desktop tracker is the evidence source for simulator activity, but the server remains responsible for validating and accepting the flight.

The tracker reports facts.

The server decides whether the flight is valid.

## 18.4 Configuration Source of Truth

Game balance should be stored in typed configuration rather than scattered constants.

Recommended files:

```text
packages/config/src/
  aircraft.config.ts
  airport.config.ts
  certification.config.ts
  economy.config.ts
  housing.config.ts
  passenger.config.ts
  status.config.ts
  training.config.ts
  travel.config.ts
  vehicle.config.ts
```

Example:

```ts
export const STARTING_CHARACTER_CONFIG = {
  personalCash: 2500,
  businessCash: 5000,
  startingResidenceId: 'residence_run_down_apartment',
  startingVehicleId: 'vehicle_hunda_attord_1996',
  startingCertificationId: 'cert_ppl',
} as const;
```

## 18.5 Calculation Source of Truth

Every major calculation should exist in one shared function.

Examples:

```text
calculateGroundTravelDuration()
calculateGroundFuelConsumption()
calculateVehicleWear()
calculatePassengerSpawnRate()
calculateAirportActivityRating()
calculatePlayerNetWorth()
calculatePlayerStatus()
calculateTrainingEligibility()
calculateJobPayout()
calculateWeeklyExpenses()
```

Do not duplicate these formulas in:

* React components
* API routes
* Database triggers
* Worker jobs
* Tracker code

The appropriate domain package should own each formula.

---

# 19. Future-Proof Service Interfaces

Early implementations should be deliberately simple while using interfaces that can later support deeper systems.

## 19.1 Fuel Example

Initial implementation:

```ts
interface FuelQuote {
  airportIcao: string;
  fuelType: 'AVGAS_100LL' | 'JET_A';
  unitPrice: number;
  availableQuantity: number | null;
  providerId: string;
}

interface FuelService {
  getQuote(input: GetFuelQuoteInput): Promise<FuelQuote>;
  purchaseFuel(input: PurchaseFuelInput): Promise<FuelPurchaseResult>;
}
```

Version one may return a system-defined airport price with unlimited quantity.

Later, the same service can consider:

* FBO inventory
* Player-set prices
* Fuel deliveries
* Regional wholesale cost
* Storage capacity
* Competing suppliers
* Fuel shortages
* Taxes

The consumer of the service does not need to know how the price was produced.

## 19.2 Passenger Example

```ts
interface PassengerService {
  searchWaitingGroups(
    input: SearchPassengerGroupsInput,
  ): Promise<PassengerGroup[]>;

  reserveGroup(
    input: ReservePassengerGroupInput,
  ): Promise<PassengerReservation>;

  markDeparted(
    input: PassengerDepartureInput,
  ): Promise<void>;

  completeArrival(
    input: PassengerArrivalInput,
  ): Promise<PassengerArrivalResult>;
}
```

Initial passenger generation can be formula-based.

Later, passengers may be generated by:

* City population
* Tourism
* Industry
* Route history
* Player pricing
* Seasonal events
* Economic conditions
* Persistent NPC travel needs

The reservation and transportation interfaces remain stable.

---

# 20. Event-Driven Communication

Modules should communicate through domain events rather than directly invoking large chains of unrelated logic.

Example flight completion events:

```text
FlightCompleted
PassengersArrived
AirportTrafficRecorded
PilotHoursAdded
VehicleOrAircraftLocationChanged
JobPaymentIssued
ReputationUpdated
```

The flight module should not directly contain airport-growth logic.

Instead:

1. Flight module validates the flight.
2. Flight module emits `FlightCompleted`.
3. Passenger module completes passenger arrival.
4. Airport module records traffic.
5. Pilot module adds flight hours.
6. Finance module issues payment.
7. Event module generates flavor text.

This separation makes later systems easier to add.

---

# 21. Travel State Machine

Travel should use an explicit state machine.

```text
AVAILABLE
   ↓
PREPARING
   ↓
TRAVELING
   ↓
ARRIVED
```

Possible exceptional states:

```text
CANCELLED
INTERRUPTED
FAILED
UNDER_REVIEW
```

An active travel record should contain:

```ts
interface ActiveTravel {
  id: string;
  playerId: string;
  mode: 'personal_vehicle' | 'bus' | 'passenger_flight';
  originLocationId: string;
  destinationLocationId: string;
  vehicleId?: string;
  departedAt: Date;
  arrivesAt: Date;
  distanceMiles: number;
  status: TravelStatus;
}
```

Player location should not be changed at departure.

Instead:

* The player receives an active travel record.
* The player remains marked in transit.
* The destination becomes authoritative when arrival is processed.
* The arrival worker completes expired journeys.
* Login also reconciles any journey that should already be complete.

---

# 22. Background Workers

Because time continues while players are offline, scheduled systems should be handled by worker processes.

Worker responsibilities:

* Complete ground travel
* Complete passive training timers
* Generate passengers
* Expire passenger groups
* Expire reservations
* Process weekly rent
* Process vehicle maintenance
* Recalculate airport activity
* Send notifications
* Process overdue accounts

Workers must be idempotent.

Running the same worker twice should not:

* Charge rent twice
* Complete travel twice
* Award flight hours twice
* Generate duplicate payments
* Move passengers twice

Every financial transaction should use a unique idempotency key.

---

# 23. Financial Ledger

Balances should not be changed without recording a ledger transaction.

Each transaction should record:

* Transaction ID
* Account ID
* Amount
* Currency
* Category
* Description
* Related entity
* Timestamp
* Idempotency key
* Balance after transaction

Examples:

```text
Passenger Job Revenue
Aircraft Rental
Fuel Purchase
Weekly Rent
Vehicle Maintenance
Training Tuition
Bus Fare
Vehicle Purchase
Vehicle Sale
Owner Salary
```

A ledger is essential in an MMO because players will challenge missing money, duplicate charges, and disputed payouts.

---

# 24. Initial Passenger-Only Development Stages

## Stage 0 — Technical Foundation

* Monorepo
* Authentication
* Database
* Typed configuration
* Ledger
* Server-time service
* Audit logs
* Domain-event framework
* Worker framework
* Shared contracts

## Stage 1 — Player and Life Foundation

* Character creation
* Starting city
* Starting apartment
* Starting vehicle
* Personal and business balances
* Player location
* Weekly expenses
* Player status
* Asset profiles

## Stage 2 — Ground Travel

* Airport locations
* Surface-distance estimates
* Personal vehicle travel
* Bus travel
* Countdown interface
* Travel restrictions
* Offline arrival processing
* Fuel and mileage consumption

## Stage 3 — Passenger Foundation

* Waiting passenger groups
* Passenger generation
* Airport demand
* Passenger reservation
* Passenger expiration
* Basic passenger profiles
* Passenger search interface

## Stage 4 — Basic Flight Jobs

* PPL-eligible assignments
* Aircraft rentals
* Tracker connection
* Flight validation
* Passenger departure
* Passenger arrival
* Payment
* Flight debrief
* Airport traffic updates

## Stage 5 — Career Progression

* Verified flight hours
* Hour categories
* Training eligibility
* Training purchases
* Check flights
* Aircraft-family qualifications
* Advanced passenger jobs

## Stage 6 — Airport Growth

* Airport activity ratings
* Route development
* Passenger-demand response
* Player-visible airport statistics
* Scheduled-route opportunities

Only after these systems are stable should development begin on:

* Cargo
* FBO ownership
* Player fuel inventory
* NPC employees
* Full businesses
* Investments
* Complex maintenance
* Player corporations

---

# 25. Initial Player Experience

A new player’s first session should look like this:

1. Create a character.
2. Choose a starting city.
3. Receive a PPL, run-down apartment, and old Hunda Attord.
4. View weekly personal expenses.
5. Review nearby airports.
6. Drive or take the bus to the starting airport.
7. Browse waiting passenger groups.
8. Select a small passenger assignment.
9. Rent an eligible single-engine aircraft.
10. Connect the tracker.
11. Fly the assignment in MSFS.
12. Shut down at the destination.
13. Receive payment and verified flight hours.
14. See the airport and route gain activity.
15. Decide whether to fly again, travel home, or save for training.

The immediate medium-term goal should be visible:

```text
Next Career Goal: High-Performance Qualification

Requirements:
12 / 20 Total Hours
8 / 10 Single-Engine Hours
$1,430 / $2,500 Training Funds
```

This gives every flight a clear purpose.

---

# 26. Core Product Rule

Every new feature should answer at least one of these questions:

* Does it give the player a reason to fly?
* Does it make the player’s career more personal?
* Does it make the shared world feel more persistent?
* Does it create a meaningful financial decision?
* Does it create a believable reason to visit another airport?
* Does it support future systems without complicating the current release?

Features that do none of these should not be included in the early game.
