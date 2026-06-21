import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/* ──────────────────── Student Profiles ──────────────────── */

export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  rollNumber: text("roll_number"),
  batchYear: integer("batch_year"),
  program: text("program"),
  department: text("department"),
  currentYear: integer("current_year"),
  cgpa: real("cgpa"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  bio: text("bio"),
  openToResearch: integer("open_to_research", { mode: "boolean" })
    .default(false)
    .notNull(),
  preferredEngagement: text("preferred_engagement", { mode: "json" })
    .$type<string[]>()
    .default([]),
  technicalStack: text("technical_stack", { mode: "json" })
    .$type<string[]>()
    .default([]),
  projects: text("projects", { mode: "json" })
    .$type<Array<{ title: string; description: string; url: string }>>()
    .default([]),
  visibility: text("visibility", { enum: ["public", "faculty_only"] })
    .notNull()
    .default("public"),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Profiles ──────────────────── */

export const facultyProfiles = sqliteTable("faculty_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  designation: text("designation"),
  department: text("department"),
  bio: text("bio"),
  labName: text("lab_name"),
  labWebsiteUrl: text("lab_website_url"),
  scholarId: text("scholar_id"),
  orcidId: text("orcid_id"),
  githubUsername: text("github_username"),
  hIndex: integer("h_index"),
  i10Index: integer("i10_index"),
  totalCitations: integer("total_citations"),
  contactPreference: text("contact_preference", {
    enum: ["portal_dm", "email", "office_hours_only"],
  })
    .notNull()
    .default("portal_dm"),
  mentoringStyle: text("mentoring_style", { mode: "json" })
    .$type<string[]>()
    .default([]),
  officeHours: text("office_hours", { mode: "json" })
    .$type<
      Array<{
        day: string;
        startTime: string;
        endTime: string;
        mode: "in_person" | "online";
        location: string;
      }>
    >()
    .default([]),
  preferredStudentBatches: text("preferred_student_batches", { mode: "json" })
    .$type<string[]>()
    .default([]),
  preferredStudentDepts: text("preferred_student_depts", { mode: "json" })
    .$type<string[]>()
    .default([]),
  minimumCgpa: real("minimum_cgpa"),
  phone: text("phone"),
  hasDoctorate: integer("has_doctorate", { mode: "boolean" })
    .default(true)
    .notNull(),
  seededFrom: text("seeded_from"),
  needsReview: integer("needs_review", { mode: "boolean" })
    .default(false)
    .notNull(),
  isManuallyEdited: integer("is_manually_edited", { mode: "boolean" })
    .default(false)
    .notNull(),
  projects: text("projects", { mode: "json" })
    .$type<Array<{ title: string; description: string; url: string }>>()
    .default([]),
  publications: text("publications", { mode: "json" })
    .$type<Array<{ title: string; journal: string; url: string; year: string }>>()
    .default([]),
  lastSeededAt: integer("last_seeded_at", { mode: "timestamp_ms" }),
  profileCompleteness: integer("profile_completeness").default(0).notNull(),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Publications ──────────────────── */

export const facultyPublications = sqliteTable("faculty_publications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  journal: text("journal"),
  year: integer("year"),
  citationCount: integer("citation_count").default(0),
  url: text("url"),
  authors: text("authors"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Current Projects ──────────────────── */

export const facultyCurrentProjects = sqliteTable("faculty_current_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  fundingSource: text("funding_source"),
  status: text("status", {
    enum: ["active", "completed", "seeking_students"],
  })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Awards ──────────────────── */

export const facultyAwards = sqliteTable("faculty_awards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  year: integer("year"),
  description: text("description"),
});

/* ──────────────────── Faculty Collaborations ──────────────────── */

export const facultyCollaborations = sqliteTable("faculty_collaborations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  institutionName: text("institution_name").notNull(),
  nature: text("nature"),
  description: text("description"),
});

/* ──────────────────── Relations ──────────────────── */

export const studentProfilesRelations = relations(
  studentProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfiles.userId],
      references: [users.id],
    }),
  })
);

export const facultyProfilesRelations = relations(
  facultyProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [facultyProfiles.userId],
      references: [users.id],
    }),
    publications: many(facultyPublications),
    currentProjects: many(facultyCurrentProjects),
    awards: many(facultyAwards),
    collaborations: many(facultyCollaborations),
  })
);

export const facultyPublicationsRelations = relations(
  facultyPublications,
  ({ one }) => ({
    facultyProfile: one(facultyProfiles, {
      fields: [facultyPublications.facultyProfileId],
      references: [facultyProfiles.id],
    }),
  })
);

export const facultyCurrentProjectsRelations = relations(
  facultyCurrentProjects,
  ({ one }) => ({
    facultyProfile: one(facultyProfiles, {
      fields: [facultyCurrentProjects.facultyProfileId],
      references: [facultyProfiles.id],
    }),
  })
);

export const facultyAwardsRelations = relations(facultyAwards, ({ one }) => ({
  facultyProfile: one(facultyProfiles, {
    fields: [facultyAwards.facultyProfileId],
    references: [facultyProfiles.id],
  }),
}));

export const facultyCollaborationsRelations = relations(
  facultyCollaborations,
  ({ one }) => ({
    facultyProfile: one(facultyProfiles, {
      fields: [facultyCollaborations.facultyProfileId],
      references: [facultyProfiles.id],
    }),
  })
);
