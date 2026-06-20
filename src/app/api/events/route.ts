export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema/events";
import { users } from "@/db/schema/users";
import { facultyProfiles } from "@/db/schema/profiles";
import { eq, desc, and, gte } from "drizzle-orm";

/* ──────────────────── GET /api/events ──────────────────── */

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || "published";
  const status = statusParam as "draft" | "published" | "cancelled";
  const upcomingOnly = searchParams.get("upcoming") !== "false";

  try {
    const conditions = [eq(events.status, status)];

    if (upcomingOnly) {
      // Start time must be in the future (or very recent past)
      // Using an arbitrary 24h buffer so today's events still show up
      const bufferDate = new Date();
      bufferDate.setHours(bufferDate.getHours() - 24);
      conditions.push(gte(events.startTime, bufferDate));
    }

    const results = await db
      .select({
        event: events,
        hostName: users.name,
        hostDepartment: facultyProfiles.department,
        rsvpCount: db.$count(eventRsvps, eq(eventRsvps.eventId, events.id)),
      })
      .from(events)
      .leftJoin(users, eq(events.hostUserId, users.id))
      .leftJoin(facultyProfiles, eq(users.id, facultyProfiles.userId))
      .where(and(...conditions))
      .orderBy(events.startTime) // Ascending so next event is first
      .all();

    // If user is student, we might want to attach their RSVP status
    // For now, we'll return the array
    return NextResponse.json({
      events: results.map((r) => ({
        ...r.event,
        host: {
          name: r.hostName,
          department: r.hostDepartment,
        },
        rsvpCount: r.rsvpCount,
      })),
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/* ──────────────────── POST /api/events ──────────────────── */

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "faculty" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const newEvent = await db
      .insert(events)
      .values({
        title: body.title,
        description: body.description,
        hostUserId: session.user.id,
        eventType: body.eventType || "seminar",
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        location: body.location,
        capacity: body.capacity || null,
        department: body.department,
        status: body.status || "published",
      })
      .returning()
      .get();

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
