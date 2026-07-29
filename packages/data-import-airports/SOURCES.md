# Airport data sources

Required by spec section 12.1 before any production import: document
source, update frequency, license, attribution, field mapping, and known
data-quality limitations for every adapter.

## OurAirports (`our_airports.adapter.ts`)

- **Source**: https://ourairports.com/data/ (public domain / CC0-equivalent
  per OurAirports' stated terms - verify current terms before production
  use).
- **Update frequency**: dataset is refreshed continuously; treat pulls as a
  point-in-time snapshot and re-import periodically (cadence TBD, see spec
  section 35 open decisions).
- **Attribution**: not legally required under OurAirports' terms, but
  crediting "OurAirports" in an about/data-sources page is good practice.
- **Field mapping**: see `adapters/our-airports.adapter.ts` -
  `type -> physicalTier`, `ident/icao_code/local_code -> identifiers`,
  `latitude_deg/longitude_deg -> latitude/longitude`.
- **Known limitations**:
  - No "international hub" tier - OneWorld assigns that tier via a
    separate size/scheduled-service heuristic, not this adapter.
  - Coordinate and elevation accuracy varies by airport; do not treat as
    survey-grade.
  - Community-maintained - expect occasional stale or duplicate entries.

## FAA aeronautical data (planned, U.S. enrichment)

Not yet implemented. Intended to enrich U.S. airports with authoritative
identifiers and scheduled-service data per spec section 12.1. Document
source URL, license, and update cadence here before building the adapter.
