"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { facultyProfiles } from "@/db/schema/profiles";
import { facultyShortlists, shortlistCandidates } from "@/db/schema/proposals";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleShortlistCandidate(studentProfileId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    throw new Error("Unauthorized");
  }

  // Find faculty profile
  const faculty = await db.query.facultyProfiles.findFirst({
    where: (p, { eq }) => eq(p.userId, session.user.id)
  });

  if (!faculty) {
    throw new Error("Faculty profile not found");
  }

  // Find or create shortlist
  let shortlist = await db.query.facultyShortlists.findFirst({
    where: (s, { eq }) => eq(s.facultyProfileId, faculty.id)
  });

  if (!shortlist) {
    const [newShortlist] = await db.insert(facultyShortlists).values({
      facultyProfileId: faculty.id,
      name: "My Shortlist"
    }).returning();
    shortlist = newShortlist;
  }

  // Check if candidate is already shortlisted
  const existingCandidate = await db.query.shortlistCandidates.findFirst({
    where: (c, { eq, and }) => and(
      eq(c.shortlistId, shortlist!.id),
      eq(c.studentProfileId, studentProfileId)
    )
  });

  if (existingCandidate) {
    // Remove candidate
    await db.delete(shortlistCandidates)
      .where(eq(shortlistCandidates.id, existingCandidate.id));
  } else {
    // Add candidate
    await db.insert(shortlistCandidates).values({
      shortlistId: shortlist.id,
      studentProfileId,
      status: "bookmarked"
    });
  }

  revalidatePath("/discover/students");
  revalidatePath("/shortlists");
}
