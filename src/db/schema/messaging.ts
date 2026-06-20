import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { workspaces } from "./workspaces";

/* ──────────────────── Message Threads ──────────────────── */

export const messageThreads = sqliteTable("message_threads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  contextType: text("context_type", {
    enum: ["direct", "proposal", "workspace", "inquiry"],
  }).notNull(),
  contextId: text("context_id"), // Polymorphic ID (e.g., workspace.id, proposal.id)
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Thread Participants ──────────────────── */

export const threadParticipants = sqliteTable("thread_participants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  threadId: text("thread_id")
    .notNull()
    .references(() => messageThreads.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastReadAt: integer("last_read_at", { mode: "timestamp_ms" }),
});

/* ──────────────────── Messages ──────────────────── */

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  threadId: text("thread_id")
    .notNull()
    .references(() => messageThreads.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isSystemMessage: integer("is_system_message", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Notifications ──────────────────── */

export const notifications = sqliteTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "proposal_received",
      "proposal_update",
      "workspace_invite",
      "milestone_update",
      "new_message",
      "system_alert",
      "event_rsvp",
      "event_reminder",
      "co_authorship_request",
      "co_supervisor_added",
      "seeded_review",
    ],
  }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  actionUrl: text("action_url"),
  isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const messageThreadsRelations = relations(
  messageThreads,
  ({ many }) => ({
    participants: many(threadParticipants),
    messages: many(messages),
  })
);

export const threadParticipantsRelations = relations(
  threadParticipants,
  ({ one }) => ({
    thread: one(messageThreads, {
      fields: [threadParticipants.threadId],
      references: [messageThreads.id],
    }),
    user: one(users, {
      fields: [threadParticipants.userId],
      references: [users.id],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [messages.threadId],
    references: [messageThreads.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
