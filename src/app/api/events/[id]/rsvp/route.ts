export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema/events";
import { notifications } from "@/db/schema/messaging";
import { eq, and } from "drizzle-orm";

/* ──────────────────── POST /api/events/[id]/rsvp ──────────────────── */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await db.select().from(events).where(eq(events.id, id)).get();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Event is not open for RSVPs" },
        { status: 400 }
      );
    }

    // Check capacity if set
    if (event.capacity) {
      const [{ count }] = await db
        .select({ count: db.$count(eventRsvps, eq(eventRsvps.eventId, id)) })
        .from(eventRsvps);

      if (count >= event.capacity) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 });
      }
    }

    // Check if already RSVP'd
    const existingRsvp = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, id),
          eq(eventRsvps.userId, session.user.id)
        )
      )
      .get();

    if (existingRsvp) {
      return NextResponse.json({ message: "Already RSVP'd" }, { status: 200 });
    }

    // Create RSVP
    const newRsvp = await db
      .insert(eventRsvps)
      .values({
        eventId: id,
        userId: session.user.id,
      })
      .returning()
      .get();

    // Optionally notify host if not the host themselves
    if (event.hostUserId !== session.user.id) {
      await db.insert(notifications).values({
        userId: event.hostUserId,
        type: "event_rsvp",
        title: "New RSVP",
        body: `${session.user.name || "A user"} RSVP'd to ${event.title}`,
        actionUrl: `/events/${event.id}`,
      });
    }

    return NextResponse.json({ rsvp: newRsvp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events/[id]/rsvp error:", error);
    return NextResponse.json(
      { error: "Failed to RSVP" },
      { status: 500 }
    );
  }
}

/* ──────────────────── DELETE /api/events/[id]/rsvp ──────────────────── */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .delete(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, id),
          eq(eventRsvps.userId, session.user.id)
        )
      );

    return NextResponse.json({ message: "RSVP cancelled" });
  } catch (error) {
    console.error("DELETE /api/events/[id]/rsvp error:", error);
    return NextResponse.json(
      { error: "Failed to cancel RSVP" },
      { status: 500 }
    );
  }
}
