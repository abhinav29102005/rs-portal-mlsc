export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { openings } from "@/db/schema/openings";
import { facultyProfiles } from "@/db/schema/profiles";
import { proposals } from "@/db/schema/proposals";
import { users } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

/* ──────────────────── GET /api/openings/[id] ──────────────────── */

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db
      .select({
        opening: openings,
        facultyName: users.name,
        facultyEmail: users.email,
        facultyImage: users.image,
        facultyDepartment: facultyProfiles.department,
        facultyPhone: facultyProfiles.phone,
      })
      .from(openings)
      .leftJoin(
        facultyProfiles,
        eq(openings.facultyProfileId, facultyProfiles.id)
      )
      .leftJoin(users, eq(facultyProfiles.userId, users.id))
      .where(eq(openings.id, id))
      .get();

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...result.opening,
      faculty: {
        name: result.facultyName,
        email: result.facultyEmail,
        image: result.facultyImage,
        department: result.facultyDepartment,
        phone: result.facultyPhone,
      },
    });
  } catch (error) {
    console.error("GET /api/openings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch opening" },
      { status: 500 }
    );
  }
}

/* ──────────────────── PUT /api/openings/[id] ──────────────────── */

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify ownership
    const existing = await db
      .select()
      .from(openings)
      .where(eq(openings.id, id))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const profile = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id))
      .get();

    if (!profile || existing.facultyProfileId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await db
      .update(openings)
      .set({
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        department: body.department ?? existing.department,
        status: body.status ?? existing.status,
        coMentors: body.coMentors ?? existing.coMentors,
        coMentorUserIds: body.coMentorUserIds ?? existing.coMentorUserIds,
        seatsAvailable: body.seatsAvailable ?? existing.seatsAvailable,
        engagementType: body.engagementType ?? existing.engagementType,
        stipendType: body.stipendType ?? existing.stipendType,
        stipendAmount: body.stipendAmount ?? existing.stipendAmount,
        duration: body.duration ?? existing.duration,
        applicationDeadline: body.applicationDeadline
          ? new Date(body.applicationDeadline)
          : existing.applicationDeadline,
        applicationInstructions:
          body.applicationInstructions ?? existing.applicationInstructions,
        prerequisites: body.prerequisites ?? existing.prerequisites,
        compensation: body.compensation ?? existing.compensation,
        expectedHoursPerWeek:
          body.expectedHoursPerWeek ?? existing.expectedHoursPerWeek,
        needsReview: false, // Editing clears review flag
        updatedAt: new Date(),
      })
      .where(eq(openings.id, id))
      .returning()
      .get();

    return NextResponse.json({ opening: updated });
  } catch (error) {
    console.error("PUT /api/openings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update opening" },
      { status: 500 }
    );
  }
}

/* ──────────────────── DELETE /api/openings/[id] ──────────────────── */

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await db
      .select()
      .from(openings)
      .where(eq(openings.id, id))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership
    const profile = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id))
      .get();

    if (!profile || existing.facultyProfileId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Draft → hard delete. Open/Closed with proposals → soft-delete (archive)
    if (existing.status === "draft") {
      await db.delete(openings).where(eq(openings.id, id));
      return NextResponse.json({ deleted: true });
    }

    // Check for linked proposals before archiving
    const linkedProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.openingId, id))
      .all();

    if (linkedProposals.length > 0) {
      // Soft-delete: archive to preserve referential integrity
      await db
        .update(openings)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(openings.id, id));
      return NextResponse.json({ archived: true });
    }

    // No proposals → safe to hard delete
    await db.delete(openings).where(eq(openings.id, id));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/openings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete opening" },
      { status: 500 }
    );
  }
}
