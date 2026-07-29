Yes—we should import most of this information rather than manually building it, but no single source should control everything.

The best approach is a hybrid system:

Open global dataset for the game’s airport database
MapLibre with an external map-tile provider for the visual map
MSFS/SimConnect to confirm what exists in the player’s installed simulator
A curated OneWorld aircraft catalog for gameplay and economic statistics

This fits the existing design where Supabase holds the persistent world and the Electron tracker communicates with MSFS.

Airports: import them
Recommended starting source: OurAirports

OurAirports provides nightly updated CSV downloads covering airports worldwide, along with airport frequencies, countries, and regions. Its data is released into the public domain, although it carries no accuracy guarantee.

It can give us:

Airport identifier
ICAO or local code
Name
Latitude and longitude
Elevation
Country and region
Municipality
Airport type
Scheduled-service flag
GPS and local codes
Frequencies through a separate dataset

This is likely the best dataset for the initial global airport seed because it is easy to import into PostgreSQL.

U.S. airport supplement: FAA NASR

For U.S. airports, the FAA publishes much more authoritative aeronautical data on a 28-day cycle. Its downloadable NASR datasets include airports, frequencies, navigation aids, instrument landing systems, airspace, weather facilities, and other information in CSV and AIXM formats.

A sensible system would be:

Global baseline: OurAirports
United States enrichment: FAA NASR
Simulator compatibility: SimConnect
OneWorld gameplay values: Our database

For the preview, OurAirports alone is probably sufficient. NASR import can come later when runway and facility accuracy becomes more important.

MSFS airport information

SimConnect can request the simulator’s installed airport facilities. The base airport structure returns an airport identifier, region, latitude, longitude, and altitude. MSFS 2024 can also expose deeper facility data including runways, parking, taxi paths, frequencies, approaches, departures, arrivals, jetways, and pavement information.

MSFS 2024 also supports requesting the full facilities list, although Microsoft warns that the result can be large and may arrive in several packets.

We should not make SimConnect our primary airport database, because:

MSFS must be running to query it.
Different players have different scenery and add-ons.
Airports may differ between MSFS 2020 and MSFS 2024.
Add-on airports can replace or modify default facilities.
The website needs airport data even when no simulator is connected.

Instead, SimConnect should answer:

Does this airport exist in this player’s installed simulator, and what facilities does their version contain?

That gives us a useful compatibility check.

Proposed airport architecture
airport_catalog
    Permanent OneWorld airport record

airport_source_records
    Imported OurAirports, FAA and other source records

simulator_airport_reports
    What individual tracker installations report from MSFS

airport_game_config
    OneWorld-specific activity, passenger and economic settings

Example:

interface AirportCatalogEntry {
  id: string;
  primaryIdent: string;
  name: string;
  municipality: string | null;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt: number | null;
  airportType: AirportType;
  sourceStatus: 'active' | 'closed' | 'unknown';
}

interface AirportGameConfig {
  airportId: string;
  isEnabled: boolean;
  previewTier: AirportTier;
  basePassengerTarget: number;
  activityRating: number;
  avgasPrice: number | null;
  jetAPrice: number | null;
}

interface SimulatorAirportReport {
  airportId: string;
  simulator: 'MSFS_2020' | 'MSFS_2024';
  installed: boolean;
  runwayCount: number | null;
  longestRunwayFt: number | null;
  lastReportedAt: Date;
}

The imported geographic record and the gameplay configuration should remain separate. This prevents an airport-data refresh from overwriting passenger counts, activity ratings, or fuel prices.

Aircraft require a different strategy

There is no single reliable online list covering every aircraft that a player may have installed in MSFS.

Players may own:

Base-game aircraft
Premium-edition aircraft
Marketplace aircraft
Third-party store aircraft
Freeware aircraft
Custom variants
Liveries
Modified aircraft

Every MSFS 2024 aircraft has a mandatory aircraft.cfg. That file includes information such as its unique title, UI manufacturer, UI type, ICAO type designator, ICAO manufacturer, model, engine classification, and object class.

Therefore, the tracker should scan the player’s installed aircraft definitions and report what it finds.

Tracker-discovered aircraft

The tracker can extract:

Unique MSFS title
Manufacturer
Model
Variation or livery
ICAO type designator
Engine type
Aircraft category
Package identifier
Simulator version

Example:

interface InstalledAircraftDefinition {
  simulatorTitle: string;
  packageName: string;
  uiManufacturer: string | null;
  uiType: string | null;
  uiVariation: string | null;
  icaoTypeDesignator: string | null;
  icaoManufacturer: string | null;
  engineType: string | null;
  objectClass: string | null;
  simulator: 'MSFS_2020' | 'MSFS_2024';
}

However, we should not trust aircraft configuration files for the entire game economy.

Third-party aircraft may contain:

Missing values
Incorrect ICAO codes
Unusual naming
Unrealistic performance
Multiple titles for effectively the same aircraft
Separate entries for every livery
Modified payload or fuel capacities
OneWorld aircraft catalog

OneWorld should maintain a curated record for each supported aircraft family.

interface AircraftType {
  id: string;
  icaoType: string;
  manufacturer: string;
  model: string;

  aircraftClass:
    | 'single_engine_piston'
    | 'multi_engine_piston'
    | 'turboprop'
    | 'jet';

  seats: number;
  usablePassengerSeats: number;
  emptyWeightLbs: number;
  maximumTakeoffWeightLbs: number;
  usableFuelGallons: number;
  cruiseSpeedKts: number;
  estimatedFuelBurnGph: number;
  maximumRangeNm: number;

  requiredQualificationId: string;
  hourlyRentalRate: number;
  isPreviewEnabled: boolean;
}

Then maintain mappings between simulator aircraft and the canonical type:

interface SimulatorAircraftMapping {
  simulatorTitlePattern: string;
  packagePattern?: string;
  aircraftTypeId: string;
  verificationStatus:
    | 'official'
    | 'community_verified'
    | 'automatic'
    | 'unsupported';
}

For example:

"Asobo C172sp Classic"
"WB-Sim C172 Classic"
"Black Square Analog C172"

            ↓

OneWorld aircraft type:
Cessna 172 Skyhawk
ICAO: C172

This prevents every livery or add-on version from becoming a separate economic aircraft type.

Where aircraft specifications should come from

For the initially supported aircraft, specifications should be compiled from:

Manufacturer documentation
Aircraft operating handbooks where legally usable
Official MSFS aircraft configuration
Verified add-on developer documentation
Manual OneWorld balancing decisions

We should record both:

Real-world specification
OneWorld gameplay value

For example, real cruise speeds vary by altitude, engine settings, weather, weight, and aircraft variant. OneWorld may use one normalized cruise speed for estimated job duration.

interface AircraftPerformanceProfile {
  realWorldCruiseRangeKts: {
    minimum: number;
    maximum: number;
  };

  gamePlanningCruiseKts: number;
  gameFuelBurnGph: number;
}

The simulator telemetry determines what actually occurred during the flight. The catalog values are primarily used for:

Job eligibility
Passenger capacity
Estimated trip time
Rental pricing
Training requirements
Aircraft browsing
Basic profitability projections
Map recommendation

We should not try to extract or reuse Microsoft Flight Simulator’s world map.

Use MapLibre GL JS in the web dashboard. MapLibre is an open-source TypeScript mapping library capable of rendering GPU-accelerated vector maps.

Then overlay our own aviation data:

Airport markers
Player locations
Available aircraft
Passenger counts
Active routes
Current flights
Airport activity
Ground-travel routes
Home city and residence
Later, FBOs and fuel availability
Map tiles

OpenStreetMap data can be used, but the public tile.openstreetmap.org servers should not be treated as production infrastructure. Their policy requires attribution and caching, prohibits bulk scraping and prefetching, provides no service guarantee, and warns commercial or high-volume applications that access may be withdrawn.

For development, standard OSM tiles may be acceptable within the policy.

For a public MMO, use:

A commercial OSM-derived tile provider, or
Hosted vector tiles, or
Self-hosted vector tiles later

The map layer should be replaceable:

interface MapProviderConfig {
  styleUrl: string;
  attribution: string;
  maximumZoom: number;
}

Nothing in the airport or gameplay system should directly depend on a particular tile provider.

Recommended preview implementation
Airport data

Import OurAirports into a staging table, then normalize enabled airports into the OneWorld airport catalog.

For the first preview, enable a manageable region rather than every airport on Earth—perhaps:

Idaho and neighboring states
Continental United States
Or a carefully selected set of several hundred airports

The underlying database can contain the global dataset even when only a subset is enabled.

Aircraft data

Start with approximately 8–12 supported aircraft, such as:

Cessna 152
Cessna 172
Piper PA-28 family
Diamond DA40
Cessna 182
Beechcraft Bonanza
Diamond DA62
Beechcraft Baron
Cessna 208 Caravan

The tracker can detect unsupported aircraft but reject them for paid jobs:

This aircraft was detected successfully, but it has not yet been approved for OneWorld passenger operations.

Map

Use:

MapLibre GL JS
+ replaceable vector-tile provider
+ airport records from OneWorld
+ route lines generated by OneWorld
Import modules
packages/
  data-import-airports/
    ourairports/
    faa-nasr/

  data-import-aircraft/
    msfs-config-scanner/
    aircraft-mapping/

  domain-airports/
  domain-aircraft/
  domain-map/

The importers should never be mixed directly into gameplay services.

Overall recommendation

Do not manually enter thousands of airports. Import them.

Do not rely on MSFS as the website’s global airport database. Use it as an installed-content validation source.

Do not attempt to support every aircraft immediately. Detect everything, but approve and balance a curated list.

Do not use an “MSFS map.” Use MapLibre and overlay OneWorld’s own persistent-world data.

That gives us broad coverage without allowing inconsistent external data to become the authoritative source for game rules.