import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { studentProfiles, facultyProfiles } from "./profiles";
import { openings } from "./openings";

/* ──────────────────── Proposals ──────────────────── */

export const proposals = sqliteTable("proposals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  openingId: text("opening_id").references(() => openings.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  methodology: text("methodology"),
  expectedOutcomes: text("expected_outcomes"),
  timeline: text("timeline"),
  resourceRequirements: text("resource_requirements"),
  pdfAttachmentUrl: text("pdf_attachment_url"),
  pitchVideoUrl: text("pitch_video_url"),
  status: text("status", {
    enum: [
      "draft",
      "submitted",
      "under_review",
      "revision_requested",
      "accepted",
      "rejected",
    ],
  })
    .notNull()
    .default("draft"),
  feedback: text("feedback"),
  submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
  lastActionAt: integer("last_action_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Shortlists ──────────────────── */

export const facultyShortlists = sqliteTable("faculty_shortlists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Shortlist Candidates (junction) ──────────────────── */

export const shortlistCandidates = sqliteTable("shortlist_candidates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  shortlistId: text("shortlist_id")
    .notNull()
    .references(() => facultyShortlists.id, { onDelete: "cascade" }),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  proposalId: text("proposal_id").references(() => proposals.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  status: text("status", {
    enum: ["bookmarked", "interviewing", "offered", "rejected"],
  })
    .notNull()
    .default("bookmarked"),
  addedAt: integer("added_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const proposalsRelations = relations(proposals, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [proposals.studentProfileId],
    references: [studentProfiles.id],
  }),
  facultyProfile: one(facultyProfiles, {
    fields: [proposals.facultyProfileId],
    references: [facultyProfiles.id],
  }),
  opening: one(openings, {
    fields: [proposals.openingId],
    references: [openings.id],
  }),
}));

export const facultyShortlistsRelations = relations(
  facultyShortlists,
  ({ one, many }) => ({
    facultyProfile: one(facultyProfiles, {
      fields: [facultyShortlists.facultyProfileId],
      references: [facultyProfiles.id],
    }),
    candidates: many(shortlistCandidates),
  })
);

export const shortlistCandidatesRelations = relations(
  shortlistCandidates,
  ({ one }) => ({
    shortlist: one(facultyShortlists, {
      fields: [shortlistCandidates.shortlistId],
      references: [facultyShortlists.id],
    }),
    studentProfile: one(studentProfiles, {
      fields: [shortlistCandidates.studentProfileId],
      references: [studentProfiles.id],
    }),
    proposal: one(proposals, {
      fields: [shortlistCandidates.proposalId],
      references: [proposals.id],
    }),
  })
);
