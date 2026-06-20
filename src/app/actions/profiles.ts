"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { studentProfiles, facultyProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStudentProfile(data: any) {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") {
    throw new Error("Unauthorized");
  }

  // Check if profile exists
  const existing = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.user.id)).get();

  if (existing) {
    await db.update(studentProfiles)
      .set({ ...data, updatedAt: new Date(), onboardingComplete: true })
      .where(eq(studentProfiles.userId, session.user.id));
  } else {
    await db.insert(studentProfiles).values({
      userId: session.user.id,
      ...data,
      onboardingComplete: true,
    });
  }

  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateFacultyProfile(data: any) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "faculty" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const existing = await db.select().from(facultyProfiles).where(eq(facultyProfiles.userId, session.user.id)).get();

  if (existing) {
    await db.update(facultyProfiles)
      .set({ ...data, isManuallyEdited: true, updatedAt: new Date(), onboardingComplete: true })
      .where(eq(facultyProfiles.userId, session.user.id));
  } else {
    await db.insert(facultyProfiles).values({
      userId: session.user.id,
      ...data,
      isManuallyEdited: true,
      onboardingComplete: true,
    });
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
