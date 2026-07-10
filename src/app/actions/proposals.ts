"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals } from "@/db/schema/proposals";
import { studentProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { workspaces, workspaceMembers, workspaceSupervisors } from "@/db/schema/workspaces";

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
  const timeline = formData.get("timeline") as string;

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
    timeline,
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

  const proposal = await db.query.proposals.findFirst({
    where: (p, { eq }) => eq(p.id, proposalId),
    with: {
      facultyProfile: true
    }
  });

  if (!proposal) throw new Error("Proposal not found");

  await db.update(proposals)
    .set({
      status,
      feedback: feedback || undefined,
      lastActionAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposalId));

  if (status === "accepted") {
    const existingWorkspace = await db.query.workspaces.findFirst({
      where: (w, { eq }) => eq(w.proposalId, proposalId)
    });

    if (!existingWorkspace) {
      const [newWorkspace] = await db.insert(workspaces).values({
        facultyProfileId: proposal.facultyProfileId,
        proposalId: proposal.id,
        title: proposal.title,
        description: proposal.abstract,
        status: "active"
      }).returning();

      await db.insert(workspaceMembers).values({
        workspaceId: newWorkspace.id,
        studentProfileId: proposal.studentProfileId,
        role: "lead",
      });

      await db.insert(workspaceSupervisors).values({
        workspaceId: newWorkspace.id,
        userId: proposal.facultyProfile.userId,
        role: "primary",
      });
    }
  }

  revalidatePath("/proposals");
  revalidatePath("/workspaces");
  return { success: true };
}
