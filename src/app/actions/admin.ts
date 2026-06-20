"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveFaculty(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(users)
    .set({ status: "active" })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard");
}

export async function rejectFaculty(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(users)
    .set({ status: "suspended" })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard");
}

export async function suspendUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ status: "suspended" }).where(eq(users.id, userId));
  revalidatePath("/dashboard");
}

export async function activateUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ status: "active" }).where(eq(users.id, userId));
  revalidatePath("/dashboard");
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/dashboard");
}

export async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  const dbUser = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).get();
  return dbUser?.role === "admin";
}
