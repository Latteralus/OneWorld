CREATE TABLE "financial_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"account_type" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"cached_balance_cents" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"amount_cents" bigint NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"related_type" text,
	"related_id" uuid,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"balance_after_cents" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"company_name" text NOT NULL,
	"home_city_id" uuid,
	"home_airport_id" uuid,
	"current_location_type" text DEFAULT 'CITY_RESIDENCE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"country_code" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"employment_tier" text DEFAULT 'standard' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "city_airports" (
	"city_id" uuid NOT NULL,
	"airport_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"surface_distance_miles" double precision
);
--> statement-breakpoint
CREATE TABLE "player_locations" (
	"player_id" uuid PRIMARY KEY NOT NULL,
	"location_type" text NOT NULL,
	"city_id" uuid,
	"airport_id" uuid,
	"active_travel_id" uuid,
	"active_flight_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airport_activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airport_id" uuid NOT NULL,
	"flight_id" uuid,
	"event_type" text NOT NULL,
	"passenger_count" integer DEFAULT 0 NOT NULL,
	"points" integer NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airport_game_state" (
	"airport_id" uuid PRIMARY KEY NOT NULL,
	"activity_score" integer DEFAULT 0 NOT NULL,
	"activity_class" text DEFAULT 'quiet' NOT NULL,
	"base_passenger_target" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airport_passenger_pools" (
	"airport_id" uuid PRIMARY KEY NOT NULL,
	"waiting_count" integer DEFAULT 0 NOT NULL,
	"reserved_count" integer DEFAULT 0 NOT NULL,
	"in_flight_count" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ident" text NOT NULL,
	"icao" text,
	"local_code" text,
	"name" text NOT NULL,
	"municipality" text,
	"region_code" text,
	"country_code" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"elevation_ft" integer,
	"physical_tier" text NOT NULL,
	"source_status" text DEFAULT 'active' NOT NULL,
	"preview_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_statistics" (
	"origin_airport_id" uuid NOT NULL,
	"destination_airport_id" uuid NOT NULL,
	"completed_flights" integer DEFAULT 0 NOT NULL,
	"passengers_transported" integer DEFAULT 0 NOT NULL,
	"total_duration_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passenger_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"reservation_id" uuid,
	"origin_airport_id" uuid NOT NULL,
	"destination_airport_id" uuid NOT NULL,
	"aircraft_id" uuid,
	"passenger_count" integer NOT NULL,
	"distance_nm" double precision NOT NULL,
	"quoted_gross_revenue_cents" bigint NOT NULL,
	"quoted_costs_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "passenger_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"origin_airport_id" uuid NOT NULL,
	"destination_airport_id" uuid NOT NULL,
	"passenger_count" integer NOT NULL,
	"aircraft_id" uuid,
	"status" text DEFAULT 'RESERVED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"departed_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "aircraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration" text NOT NULL,
	"aircraft_type_id" uuid NOT NULL,
	"owner_type" text DEFAULT 'system' NOT NULL,
	"owner_id" uuid,
	"current_airport_id" uuid,
	"fuel_gallons" double precision DEFAULT 0 NOT NULL,
	"airframe_hours" double precision DEFAULT 0 NOT NULL,
	"condition" text DEFAULT 'good' NOT NULL,
	"rental_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aircraft_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"job_id" uuid,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aircraft_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icao_type" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model" text NOT NULL,
	"aircraft_class" text NOT NULL,
	"engine_category" text NOT NULL,
	"total_seats" integer NOT NULL,
	"usable_passenger_seats" integer NOT NULL,
	"empty_weight_lb" double precision NOT NULL,
	"max_takeoff_weight_lb" double precision NOT NULL,
	"usable_fuel_gallons" double precision NOT NULL,
	"planning_cruise_speed_kts" double precision NOT NULL,
	"planning_fuel_burn_gph" double precision NOT NULL,
	"planning_range_nm" double precision NOT NULL,
	"required_qualification" text NOT NULL,
	"rental_rate_model" text DEFAULT 'hourly_wet' NOT NULL,
	"preview_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulator_aircraft_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"simulator_title" text NOT NULL,
	"package_name" text,
	"simulator_version" text,
	"aircraft_type_id" uuid NOT NULL,
	"verification_status" text DEFAULT 'automatically_inferred' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"player_id" uuid NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"tracker_installation_id" uuid,
	"status" text DEFAULT 'IDLE_RAMP' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"departed_at" timestamp with time zone,
	"landed_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"validated_at" timestamp with time zone,
	"invalid_reason" text
);
--> statement-breakpoint
CREATE TABLE "flight_summaries" (
	"flight_session_id" uuid PRIMARY KEY NOT NULL,
	"distance_nm" double precision,
	"duration_minutes" double precision,
	"fuel_start_gallons" double precision,
	"fuel_end_gallons" double precision,
	"fuel_used_gallons" double precision,
	"landing_rate_fpm" double precision,
	"origin_proximity_nm" double precision,
	"destination_proximity_nm" double precision,
	"max_sim_rate" double precision,
	"teleport_flag" boolean DEFAULT false NOT NULL,
	"slew_flag" boolean DEFAULT false NOT NULL,
	"awarded_hours_minutes" integer DEFAULT 0 NOT NULL,
	"gross_revenue_cents" bigint NOT NULL,
	"total_costs_cents" bigint NOT NULL,
	"net_company_income_cents" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_session_id" uuid NOT NULL,
	"sequence_start" integer NOT NULL,
	"sequence_end" integer NOT NULL,
	"hash" text NOT NULL,
	"payload_storage_ref" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_hour_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"flight_session_id" uuid NOT NULL,
	"category" text NOT NULL,
	"minutes" integer NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_hour_totals" (
	"player_id" uuid NOT NULL,
	"category" text NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_qualifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"qualification_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_enrollment_id" uuid,
	"source_check_flight_id" uuid
);
--> statement-breakpoint
CREATE TABLE "qualification_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"prerequisite_config" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tuition_cents" bigint NOT NULL,
	"duration_hours" integer DEFAULT 0 NOT NULL,
	"requires_check_flight" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"qualification_id" uuid NOT NULL,
	"status" text DEFAULT 'ENROLLED' NOT NULL,
	"funding_account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completes_at" timestamp with time zone NOT NULL,
	"check_flight_id" uuid,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ground_travel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"vehicle_id" uuid,
	"origin_type" text NOT NULL,
	"origin_city_id" uuid,
	"origin_airport_id" uuid,
	"destination_type" text NOT NULL,
	"destination_city_id" uuid,
	"destination_airport_id" uuid,
	"distance_miles" double precision NOT NULL,
	"cost_cents" bigint NOT NULL,
	"fuel_gallons_used" double precision,
	"status" text DEFAULT 'PREPARING' NOT NULL,
	"departed_at" timestamp with time zone,
	"arrives_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "player_residences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"residence_type_id" uuid NOT NULL,
	"city_id" uuid NOT NULL,
	"tenancy_status" text DEFAULT 'ACTIVE' NOT NULL,
	"next_rent_due_at" timestamp with time zone NOT NULL,
	"grace_deadline_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "player_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"vehicle_type_id" uuid NOT NULL,
	"current_city_id" uuid,
	"mileage" double precision DEFAULT 0 NOT NULL,
	"fuel_gallons" double precision DEFAULT 0 NOT NULL,
	"condition" text DEFAULT 'good' NOT NULL,
	"estimated_value_cents" bigint NOT NULL,
	"next_maintenance_due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "residence_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"quality" text NOT NULL,
	"weekly_rent_cents" bigint NOT NULL,
	"parking_capacity" integer DEFAULT 0 NOT NULL,
	"status_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"year_range" text,
	"value_cents" bigint NOT NULL,
	"speed_mph" double precision NOT NULL,
	"fuel_efficiency_mpg" double precision NOT NULL,
	"tank_capacity_gallons" double precision NOT NULL,
	"expected_lifespan_miles" integer NOT NULL,
	"weekly_maintenance_cents" bigint NOT NULL,
	"quality" text NOT NULL,
	"reliability" text NOT NULL,
	"status_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"posting_id" uuid NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decision_at" timestamp with time zone,
	"determined_result" text
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"wage_cents" bigint NOT NULL,
	"openings" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"base_daily_wage_cents" bigint NOT NULL,
	"availability_weight" double precision DEFAULT 1 NOT NULL,
	"acceptance_chance" double precision DEFAULT 0.9 NOT NULL,
	"career_stage_min" integer DEFAULT 0 NOT NULL,
	"career_stage_max" integer
);
--> statement-breakpoint
CREATE TABLE "player_employment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"posting_id" uuid,
	"template_id" uuid,
	"city_id" uuid NOT NULL,
	"title" text NOT NULL,
	"daily_wage_cents" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"next_pay_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"before_summary" jsonb,
	"after_summary" jsonb,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"related_type" text,
	"related_id" uuid,
	"read_state" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_financial_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_airports" ADD CONSTRAINT "city_airports_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_airports" ADD CONSTRAINT "city_airports_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_locations" ADD CONSTRAINT "player_locations_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_locations" ADD CONSTRAINT "player_locations_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airport_activity_events" ADD CONSTRAINT "airport_activity_events_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airport_game_state" ADD CONSTRAINT "airport_game_state_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airport_passenger_pools" ADD CONSTRAINT "airport_passenger_pools_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_statistics" ADD CONSTRAINT "route_statistics_origin_airport_id_airports_id_fk" FOREIGN KEY ("origin_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_statistics" ADD CONSTRAINT "route_statistics_destination_airport_id_airports_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_jobs" ADD CONSTRAINT "passenger_jobs_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_jobs" ADD CONSTRAINT "passenger_jobs_reservation_id_passenger_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."passenger_reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_jobs" ADD CONSTRAINT "passenger_jobs_origin_airport_id_airports_id_fk" FOREIGN KEY ("origin_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_jobs" ADD CONSTRAINT "passenger_jobs_destination_airport_id_airports_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_jobs" ADD CONSTRAINT "passenger_jobs_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_reservations" ADD CONSTRAINT "passenger_reservations_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_reservations" ADD CONSTRAINT "passenger_reservations_origin_airport_id_airports_id_fk" FOREIGN KEY ("origin_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_reservations" ADD CONSTRAINT "passenger_reservations_destination_airport_id_airports_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passenger_reservations" ADD CONSTRAINT "passenger_reservations_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_aircraft_type_id_aircraft_types_id_fk" FOREIGN KEY ("aircraft_type_id") REFERENCES "public"."aircraft_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aircraft_reservations" ADD CONSTRAINT "aircraft_reservations_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulator_aircraft_mappings" ADD CONSTRAINT "simulator_aircraft_mappings_aircraft_type_id_aircraft_types_id_fk" FOREIGN KEY ("aircraft_type_id") REFERENCES "public"."aircraft_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_sessions" ADD CONSTRAINT "flight_sessions_job_id_passenger_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."passenger_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_sessions" ADD CONSTRAINT "flight_sessions_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_sessions" ADD CONSTRAINT "flight_sessions_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_summaries" ADD CONSTRAINT "flight_summaries_flight_session_id_flight_sessions_id_fk" FOREIGN KEY ("flight_session_id") REFERENCES "public"."flight_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_batches" ADD CONSTRAINT "telemetry_batches_flight_session_id_flight_sessions_id_fk" FOREIGN KEY ("flight_session_id") REFERENCES "public"."flight_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_hour_entries" ADD CONSTRAINT "flight_hour_entries_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_hour_entries" ADD CONSTRAINT "flight_hour_entries_flight_session_id_flight_sessions_id_fk" FOREIGN KEY ("flight_session_id") REFERENCES "public"."flight_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_hour_totals" ADD CONSTRAINT "pilot_hour_totals_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_qualifications" ADD CONSTRAINT "player_qualifications_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_qualifications" ADD CONSTRAINT "player_qualifications_qualification_id_qualification_definitions_id_fk" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualification_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_qualifications" ADD CONSTRAINT "player_qualifications_source_check_flight_id_flight_sessions_id_fk" FOREIGN KEY ("source_check_flight_id") REFERENCES "public"."flight_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_qualification_id_qualification_definitions_id_fk" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualification_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_check_flight_id_flight_sessions_id_fk" FOREIGN KEY ("check_flight_id") REFERENCES "public"."flight_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_vehicle_id_player_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."player_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_origin_city_id_cities_id_fk" FOREIGN KEY ("origin_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_origin_airport_id_airports_id_fk" FOREIGN KEY ("origin_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_destination_city_id_cities_id_fk" FOREIGN KEY ("destination_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_travel" ADD CONSTRAINT "ground_travel_destination_airport_id_airports_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_residences" ADD CONSTRAINT "player_residences_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_residences" ADD CONSTRAINT "player_residences_residence_type_id_residence_types_id_fk" FOREIGN KEY ("residence_type_id") REFERENCES "public"."residence_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_residences" ADD CONSTRAINT "player_residences_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_vehicles" ADD CONSTRAINT "player_vehicles_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_vehicles" ADD CONSTRAINT "player_vehicles_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_vehicles" ADD CONSTRAINT "player_vehicles_current_city_id_cities_id_fk" FOREIGN KEY ("current_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_posting_id_job_postings_id_fk" FOREIGN KEY ("posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_template_id_job_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."job_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_employment" ADD CONSTRAINT "player_employment_player_id_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_employment" ADD CONSTRAINT "player_employment_posting_id_job_postings_id_fk" FOREIGN KEY ("posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_employment" ADD CONSTRAINT "player_employment_template_id_job_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."job_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_employment" ADD CONSTRAINT "player_employment_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_idx" ON "ledger_entries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_idx" ON "profiles" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "city_airports_city_airport_idx" ON "city_airports" USING btree ("city_id","airport_id");--> statement-breakpoint
CREATE UNIQUE INDEX "airport_activity_events_idempotency_key_idx" ON "airport_activity_events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "airports_ident_idx" ON "airports" USING btree ("ident");--> statement-breakpoint
CREATE INDEX "airports_icao_idx" ON "airports" USING btree ("icao");--> statement-breakpoint
CREATE INDEX "airports_country_region_idx" ON "airports" USING btree ("country_code","region_code");--> statement-breakpoint
CREATE INDEX "airports_preview_enabled_idx" ON "airports" USING btree ("preview_enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "route_statistics_origin_destination_idx" ON "route_statistics" USING btree ("origin_airport_id","destination_airport_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aircraft_registration_idx" ON "aircraft" USING btree ("registration");--> statement-breakpoint
CREATE UNIQUE INDEX "domain_events_idempotency_key_idx" ON "domain_events" USING btree ("idempotency_key");