import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { studentProfiles } from "./profiles";
import { users } from "./users";

/* ──────────────────── Student Projects ──────────────────── */

export const studentProjects = sqliteTable("student_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  oneLineDescription: text("one_line_description"),
  fullDescription: text("full_description"),
  role: text("role", { enum: ["solo", "team_lead", "team_member"] })
    .notNull()
    .default("solo"),
  projectType: text("project_type", {
    enum: ["academic", "personal", "research", "hackathon", "open_source"],
  })
    .notNull()
    .default("personal"),
  startDate: integer("start_date", { mode: "timestamp_ms" }),
  endDate: integer("end_date", { mode: "timestamp_ms" }),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  reportUrl: text("report_url"),
  visibility: text("visibility", { enum: ["public", "faculty_only"] })
    .notNull()
    .default("public"),
  domainTags: text("domain_tags", { mode: "json" })
    .$type<string[]>()
    .default([]),
  techStackTags: text("tech_stack_tags", { mode: "json" })
    .$type<string[]>()
    .default([]),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Student Papers ──────────────────── */

export const studentPapers = sqliteTable("student_papers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  venueName: text("venue_name"),
  year: integer("year"),
  coAuthors: text("co_authors"),
  abstract: text("abstract"),
  doiUrl: text("doi_url"),
  status: text("status", {
    enum: ["published", "under_review", "preprint"],
  })
    .notNull()
    .default("published"),
  /* ── Phase 2: Co-authorship badge support ── */
  workspaceId: text("workspace_id"),
  coAuthorshipConfirmedBy: text("co_authorship_confirmed_by"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Student Experiences ──────────────────── */

export const studentExperiences = sqliteTable("student_experiences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  orgName: text("org_name").notNull(),
  roleTitle: text("role_title").notNull(),
  expType: text("exp_type", { enum: ["internship", "ra", "ta", "other"] })
    .notNull()
    .default("internship"),
  startDate: integer("start_date", { mode: "timestamp_ms" }),
  endDate: integer("end_date", { mode: "timestamp_ms" }),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Student Achievements ──────────────────── */

export const studentAchievements = sqliteTable("student_achievements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category"),
  year: integer("year"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const studentProjectsRelations = relations(
  studentProjects,
  ({ one }) => ({
    studentProfile: one(studentProfiles, {
      fields: [studentProjects.studentProfileId],
      references: [studentProfiles.id],
    }),
  })
);

export const studentPapersRelations = relations(studentPapers, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [studentPapers.studentProfileId],
    references: [studentProfiles.id],
  }),
}));

export const studentExperiencesRelations = relations(
  studentExperiences,
  ({ one }) => ({
    studentProfile: one(studentProfiles, {
      fields: [studentExperiences.studentProfileId],
      references: [studentProfiles.id],
    }),
  })
);

export const studentAchievementsRelations = relations(
  studentAchievements,
  ({ one }) => ({
    studentProfile: one(studentProfiles, {
      fields: [studentAchievements.studentProfileId],
      references: [studentProfiles.id],
    }),
  })
);
