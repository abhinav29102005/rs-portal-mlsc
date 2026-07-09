import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OpeningForm } from "@/components/openings/OpeningForm";
import { db } from "@/db";
import { facultyProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";

export const metadata = { title: "Post New Project — RAMP" };

export default async function NewOpeningPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "faculty") {
    redirect("/dashboard");
  }

  // Get faculty department for pre-fill
  const profile = await db
    .select()
    .from(facultyProfiles)
    .where(eq(facultyProfiles.userId, session.user.id))
    .get();

  return (
    <OpeningForm
      mode="create"
      userDepartment={profile?.department || ""}
    />
  );
}
