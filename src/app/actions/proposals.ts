"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals } from "@/db/schema/proposals";
import { studentProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitProposal(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }

  // Get student profile ID
  const student = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.user.id)).get();
  if (!student) {
    throw new Error("Student profile not found. Please complete your portfolio first.");
  }

  const facultyProfileId = formData.get("facultyProfileId") as string;
  const openingId = formData.get("openingId") as string | null;
  const title = formData.get("title") as string;
  const abstract = formData.get("abstract") as string;
  const methodology = formData.get("methodology") as string;

  if (!facultyProfileId || !title || !abstract) {
    throw new Error("Missing required fields");
  }

  await db.insert(proposals).values({
    studentProfileId: student.id,
    facultyProfileId,
    openingId: openingId || undefined,
    title,
    abstract,
    methodology,
    status: "submitted",
    submittedAt: new Date(),
  });

  revalidatePath("/proposals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProposalStatus(proposalId: string, status: "under_review" | "revision_requested" | "accepted" | "rejected", feedback?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    throw new Error("Unauthorized");
  }

  // In a real app, verify that the proposal belongs to this faculty member's profile
  
  await db.update(proposals)
    .set({
      status,
      feedback: feedback || undefined,
      lastActionAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposalId));

  revalidatePath("/proposals");
  return { success: true };
}
