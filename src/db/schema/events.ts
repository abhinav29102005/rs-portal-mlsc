import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/* ──────────────────── Events ──────────────────── */

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  hostUserId: text("host_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type", {
    enum: ["seminar", "workshop", "talk", "other"],
  })
    .notNull()
    .default("seminar"),
  startTime: integer("start_time", { mode: "timestamp_ms" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp_ms" }),
  location: text("location"),
  capacity: integer("capacity"),
  department: text("department"),
  status: text("status", { enum: ["draft", "published", "cancelled"] })
    .notNull()
    .default("draft"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ──────────────────── Event RSVPs ──────────────────── */

export const eventRsvps = sqliteTable("event_rsvps", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rsvpAt: integer("rsvp_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  attended: integer("attended", { mode: "boolean" })
    .default(false)
    .notNull(),
});

/* ──────────────────── Relations ──────────────────── */

export const eventsRelations = relations(events, ({ one, many }) => ({
  host: one(users, {
    fields: [events.hostUserId],
    references: [users.id],
  }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));
