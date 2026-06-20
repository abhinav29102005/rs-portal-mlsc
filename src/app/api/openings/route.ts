import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { openings } from "@/db/schema/openings";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc, and, or } from "drizzle-orm";

/* ──────────────────── GET /api/openings ──────────────────── */

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const department = searchParams.get("department");
  const mine = searchParams.get("mine") === "true";

  try {
    let results;

    if (mine && session.user.role === "faculty") {
      // Faculty viewing their own openings
      const profile = await db
        .select()
        .from(facultyProfiles)
        .where(eq(facultyProfiles.userId, session.user.id))
        .get();

      if (!profile) {
        return NextResponse.json({ openings: [] });
      }

      results = await db
        .select({
          opening: openings,
          facultyName: users.name,
          facultyEmail: users.email,
        })
        .from(openings)
        .leftJoin(
          facultyProfiles,
          eq(openings.facultyProfileId, facultyProfiles.id)
        )
        .leftJoin(users, eq(facultyProfiles.userId, users.id))
        .where(eq(openings.facultyProfileId, profile.id))
        .orderBy(desc(openings.createdAt))
        .all();
    } else {
      // Public/student view — only open postings
      const conditions = [eq(openings.status, "open")];
      if (department) {
        conditions.push(eq(openings.department, department));
      }

      results = await db
        .select({
          opening: openings,
          facultyName: users.name,
          facultyEmail: users.email,
        })
        .from(openings)
        .leftJoin(
          facultyProfiles,
          eq(openings.facultyProfileId, facultyProfiles.id)
        )
        .leftJoin(users, eq(facultyProfiles.userId, users.id))
        .where(and(...conditions))
        .orderBy(desc(openings.createdAt))
        .all();
    }

    return NextResponse.json({
      openings: results.map((r) => ({
        ...r.opening,
        faculty: {
          name: r.facultyName,
          email: r.facultyEmail,
        },
      })),
    });
  } catch (error) {
    console.error("GET /api/openings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch openings" },
      { status: 500 }
    );
  }
}

/* ──────────────────── POST /api/openings ──────────────────── */

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Get faculty profile
    const profile = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id))
      .get();

    if (!profile) {
      return NextResponse.json(
        { error: "Faculty profile not found" },
        { status: 404 }
      );
    }

    const newOpening = await db
      .insert(openings)
      .values({
        facultyProfileId: profile.id,
        title: body.title,
        description: body.description,
        department: body.department || profile.department,
        source: "self_submitted",
        status: body.status || "draft",
        coMentors: body.coMentors || [],
        coMentorUserIds: body.coMentorUserIds || [],
        seatsAvailable: body.seatsAvailable || 1,
        engagementType: body.engagementType,
        stipendType: body.stipendType,
        stipendAmount: body.stipendAmount,
        duration: body.duration,
        applicationDeadline: body.applicationDeadline
          ? new Date(body.applicationDeadline)
          : null,
        applicationInstructions: body.applicationInstructions,
        prerequisites: body.prerequisites || [],
        compensation: body.compensation || "unpaid",
        expectedHoursPerWeek: body.expectedHoursPerWeek,
        positionsAvailable: body.seatsAvailable || 1,
      })
      .returning()
      .get();

    return NextResponse.json({ opening: newOpening }, { status: 201 });
  } catch (error) {
    console.error("POST /api/openings error:", error);
    return NextResponse.json(
      { error: "Failed to create opening" },
      { status: 500 }
    );
  }
}
