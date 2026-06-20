import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { studentProfiles, facultyProfiles } from "./profiles";
import { users } from "./users";
import { proposals } from "./proposals";

/* ──────────────────── Collaboration Workspaces ──────────────────── */

export const workspaces = sqliteTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  proposalId: text("proposal_id").references(() => proposals.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "paused"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Workspace Members ──────────────────── */

export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["lead", "member", "observer"] })
    .notNull()
    .default("member"),
  joinedAt: integer("joined_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Workspace Supervisors (Co-Supervision) ──────────────────── */

export const workspaceSupervisors = sqliteTable("workspace_supervisors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["primary", "co_supervisor"] })
    .notNull()
    .default("co_supervisor"),
  addedAt: integer("added_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  addedBy: text("added_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

/* ──────────────────── Workspace Milestones ──────────────────── */

export const workspaceMilestones = sqliteTable("workspace_milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "blocked"],
  })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Workspace Files ──────────────────── */

export const workspaceFiles = sqliteTable("workspace_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  uploadedById: text("uploaded_by_id").notNull(), // can be student or faculty
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  sizeBytes: integer("size_bytes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Faculty Endorsements ──────────────────── */

export const facultyEndorsements = sqliteTable("faculty_endorsements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").references(() => workspaces.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  isVisible: integer("is_visible", { mode: "boolean" })
    .default(true)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  facultyProfile: one(facultyProfiles, {
    fields: [workspaces.facultyProfileId],
    references: [facultyProfiles.id],
  }),
  proposal: one(proposals, {
    fields: [workspaces.proposalId],
    references: [proposals.id],
  }),
  members: many(workspaceMembers),
  supervisors: many(workspaceSupervisors),
  milestones: many(workspaceMilestones),
  files: many(workspaceFiles),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    studentProfile: one(studentProfiles, {
      fields: [workspaceMembers.studentProfileId],
      references: [studentProfiles.id],
    }),
  })
);

export const workspaceMilestonesRelations = relations(
  workspaceMilestones,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMilestones.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const workspaceFilesRelations = relations(workspaceFiles, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceFiles.workspaceId],
    references: [workspaces.id],
  }),
}));

export const facultyEndorsementsRelations = relations(
  facultyEndorsements,
  ({ one }) => ({
    studentProfile: one(studentProfiles, {
      fields: [facultyEndorsements.studentProfileId],
      references: [studentProfiles.id],
    }),
    facultyProfile: one(facultyProfiles, {
      fields: [facultyEndorsements.facultyProfileId],
      references: [facultyProfiles.id],
    }),
    workspace: one(workspaces, {
      fields: [facultyEndorsements.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const workspaceSupervisorsRelations = relations(
  workspaceSupervisors,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceSupervisors.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceSupervisors.userId],
      references: [users.id],
    }),
  })
);
