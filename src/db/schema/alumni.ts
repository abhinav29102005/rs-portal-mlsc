import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/* ──────────────────── Alumni Mentor Profiles ──────────────────── */

export const alumniProfiles = sqliteTable("alumni_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentCompany: text("current_company"),
  currentRole: text("current_role"),
  graduationYear: integer("graduation_year"),
  degreeProgram: text("degree_program"),
  willingToMentor: integer("willing_to_mentor", { mode: "boolean" })
    .default(true)
    .notNull(),
  mentorshipDomains: text("mentorship_domains", { mode: "json" })
    .$type<string[]>()
    .default([]),
  linkedinUrl: text("linkedin_url"),
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const alumniProfilesRelations = relations(
  alumniProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [alumniProfiles.userId],
      references: [users.id],
    }),
  })
);
