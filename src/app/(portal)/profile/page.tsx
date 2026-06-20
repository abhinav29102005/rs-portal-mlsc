import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { facultyProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";
import { ProfileBuilder } from "@/components/profile/ProfileBuilder";

export const metadata = { title: "My Profile — TIET Research Portal" };

export default async function FacultyProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") redirect("/login");

  const profile = await db.select().from(facultyProfiles).where(eq(facultyProfiles.userId, session.user.id)).get();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label mb-1">Profile Builder</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Your{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            Faculty Profile
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Manage your research profile, lab details, and student mentorship preferences.
        </p>
      </div>

      <ProfileBuilder initialData={profile || {}} />
    </div>
  );
}
