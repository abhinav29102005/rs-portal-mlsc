import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { facultyProfiles } from "./profiles";
import { researchDomains } from "./taxonomy";

/* ──────────────────── Openings ──────────────────── */

export const openings = sqliteTable("openings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department"),
  prerequisites: text("prerequisites", { mode: "json" })
    .$type<string[]>()
    .default([]),
  compensation: text("compensation", {
    enum: ["unpaid", "stipend", "course_credit"],
  })
    .notNull()
    .default("unpaid"),
  expectedHoursPerWeek: integer("expected_hours_per_week"),
  durationMonths: integer("duration_months"),
  positionsAvailable: integer("positions_available").default(1),
  status: text("status", { enum: ["draft", "open", "closed", "archived"] })
    .notNull()
    .default("draft"),
  applicationDeadline: integer("application_deadline", {
    mode: "timestamp_ms",
  }),

  /* ── Phase 2 Additions ── */
  source: text("source"), // 'elc_2026_call' | 'self_submitted'
  coMentors: text("co_mentors", { mode: "json" })
    .$type<Array<{ name: string; email: string | null; phone: string | null }>>()
    .default([]),
  coMentorUserIds: text("co_mentor_user_ids", { mode: "json" })
    .$type<string[]>()
    .default([]),
  needsReview: integer("needs_review", { mode: "boolean" })
    .default(false)
    .notNull(),
  seatsAvailable: integer("seats_available").default(1),
  engagementType: text("engagement_type", {
    enum: [
      "RA",
      "Thesis",
      "Project Collaboration",
      "Co-authorship",
      "Internship",
      "ELC Activity",
    ],
  }),
  stipendType: text("stipend_type", {
    enum: ["Paid", "Academic Credit", "Unpaid"],
  }),
  stipendAmount: text("stipend_amount"),
  duration: text("duration"),
  applicationInstructions: text("application_instructions"),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Opening Domains (junction) ──────────────────── */

export const openingDomains = sqliteTable("opening_domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  openingId: text("opening_id")
    .notNull()
    .references(() => openings.id, { onDelete: "cascade" }),
  researchDomainId: text("research_domain_id")
    .notNull()
    .references(() => researchDomains.id, { onDelete: "cascade" }),
});

/* ──────────────────── Relations ──────────────────── */

export const openingsRelations = relations(openings, ({ one, many }) => ({
  facultyProfile: one(facultyProfiles, {
    fields: [openings.facultyProfileId],
    references: [facultyProfiles.id],
  }),
  domains: many(openingDomains),
}));

export const openingDomainsRelations = relations(openingDomains, ({ one }) => ({
  opening: one(openings, {
    fields: [openingDomains.openingId],
    references: [openings.id],
  }),
  domain: one(researchDomains, {
    fields: [openingDomains.researchDomainId],
    references: [researchDomains.id],
  }),
}));
