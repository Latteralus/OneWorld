import { doublePrecision, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { centsColumn, createdAtColumn, idColumn } from "./_helpers.js";
import { cities } from "./locations.js";
import { profiles } from "./identity.js";

export const jobTemplates = pgTable("job_templates", {
  id: idColumn(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  baseDailyWageCents: centsColumn("base_daily_wage_cents"),
  availabilityWeight: doublePrecision("availability_weight").notNull().default(1),
  acceptanceChance: doublePrecision("acceptance_chance").notNull().default(0.9),
  careerStageMin: integer("career_stage_min").notNull().default(0),
  careerStageMax: integer("career_stage_max"),
});

export const jobPostings = pgTable("job_postings", {
  id: idColumn(),
  cityId: uuid("city_id")
    .notNull()
    .references(() => cities.id),
  templateId: uuid("template_id")
    .notNull()
    .references(() => jobTemplates.id),
  wageCents: centsColumn("wage_cents"),
  openings: integer("openings").notNull().default(1),
  status: text("status").notNull().default("OPEN"),
  postedAt: createdAtColumn(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const jobApplications = pgTable("job_applications", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  postingId: uuid("posting_id")
    .notNull()
    .references(() => jobPostings.id),
  status: text("status").notNull().default("PENDING"),
  submittedAt: createdAtColumn(),
  decisionAt: timestamp("decision_at", { withTimezone: true }),
  determinedResult: text("determined_result"),
});

export const playerEmployment = pgTable("player_employment", {
  id: idColumn(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => profiles.id),
  postingId: uuid("posting_id").references(() => jobPostings.id),
  templateId: uuid("template_id").references(() => jobTemplates.id),
  cityId: uuid("city_id")
    .notNull()
    .references(() => cities.id),
  title: text("title").notNull(),
  dailyWageCents: centsColumn("daily_wage_cents"),
  hiredAt: createdAtColumn(),
  nextPayAt: timestamp("next_pay_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("ACTIVE"),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});
