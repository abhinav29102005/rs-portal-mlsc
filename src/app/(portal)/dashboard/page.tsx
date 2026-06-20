import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { facultyProfiles, studentProfiles } from "@/db/schema/profiles";
import { openings, openingDomains } from "@/db/schema/openings";
import { users } from "@/db/schema/users";
import { eq, and, inArray, sql } from "drizzle-orm";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { PendingApproval } from "@/components/dashboard/PendingApproval";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { verifyAdmin } from "@/app/actions/admin";
import {
  recommendOpeningsForStudent,
  recommendStudentsForFaculty,
} from "@/lib/matching";

export const metadata = {
  title: "Dashboard — TIET Research Portal",
};

/** Compute profile completeness percentage from filled fields */
function computeProfileCompleteness(profile: any): number {
  if (!profile) return 0;
  const fields = [
    profile.department,
    profile.bio,
    profile.designation,
    profile.labName,
    profile.scholarId,
    profile.githubUsername,
    profile.phone,
  ];
  const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

async function DashboardContent({ session }: { session: any }) {
  const { role, status } = session.user;

  // Faculty pending approval
  if (role === "faculty" && status === "pending_approval") {
    return <PendingApproval user={session.user} />;
  }

  // Faculty dashboard — fetch profile data
  if (role === "faculty") {
    const profile = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id))
      .get();

    const profileCompleteness = computeProfileCompleteness(profile);
    const hasSeededProfile =
      profile?.seededFrom === "elc_2026_call" && profile?.needsReview;

    let seededOpeningsCount = 0;
    let openPositions = 0;

    if (profile) {
      const seededOpenings = await db
        .select()
        .from(openings)
        .where(
          and(
            eq(openings.facultyProfileId, profile.id),
            eq(openings.source, "elc_2026_call")
          )
        )
        .all();
      seededOpeningsCount = seededOpenings.length;

      const openOnes = await db
        .select()
        .from(openings)
        .where(
          and(
            eq(openings.facultyProfileId, profile.id),
            eq(openings.status, "open")
          )
        )
        .all();
      openPositions = openOnes.length;
    }

    // Recommendation Engine: Students for Faculty
    const allActiveStudents = await db
      .select({
        userId: users.id,
        name: users.name,
        department: studentProfiles.department,
      })
      .from(users)
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(eq(users.role, "student"))
      .all();

    const validStudents = allActiveStudents.filter((s) => s.name);
    const recommendedStudents = await recommendStudentsForFaculty(
      session.user.id,
      validStudents as any
    );

    return (
      <FacultyDashboard
        user={session.user}
        profileCompleteness={profileCompleteness}
        hasSeededProfile={!!hasSeededProfile}
        seededOpeningsCount={seededOpeningsCount}
        openPositions={openPositions}
        recommendations={recommendedStudents}
      />
    );
  }

  switch (role) {
    case "student":
      // Recommendation Engine: Openings for Student
      const activeOpenings = await db
        .select()
        .from(openings)
        .where(eq(openings.status, "open"))
        .all();

      const openingIds = activeOpenings.map((o) => o.id);

      let openingDomainsData: any[] = [];
      if (openingIds.length > 0) {
        openingDomainsData = await db
          .select()
          .from(openingDomains)
          .where(inArray(openingDomains.openingId, openingIds))
          .all();
      }

      const formattedOpenings = activeOpenings.map((o) => ({
        id: o.id,
        title: o.title,
        department: o.department,
        prerequisites: (o.prerequisites as string[]) || [],
        domains: openingDomainsData
          .filter((d) => d.openingId === o.id)
          .map((d) => d.researchDomainId),
      }));

      const recommendedOpenings = await recommendOpeningsForStudent(
        session.user.id,
        formattedOpenings
      );

      return (
        <StudentDashboard
          user={session.user}
          recommendations={recommendedOpenings}
        />
      );
    case "admin":
      const [
        { count: studentCount },
        { count: facultyCount },
        { count: pendingCount },
        { count: activeProjectsCount }
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "student")).get() as Promise<{ count: number }>,
        db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "faculty")).get() as Promise<{ count: number }>,
        db.select({ count: sql`count(*)` }).from(users).where(and(eq(users.role, "faculty"), eq(users.status, "pending_approval"))).get() as Promise<{ count: number }>,
        db.select({ count: sql`count(*)` }).from(openings).where(eq(openings.status, "open")).get() as Promise<{ count: number }>,
      ]);

      const pendingFaculty = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(eq(users.role, "faculty"), eq(users.status, "pending_approval")))
        .all();

      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        })
        .from(users)
        .all();

      return (
        <AdminDashboard 
          user={session.user} 
          stats={{
            students: studentCount,
            faculty: facultyCount,
            pending: pendingCount,
            activeProjects: activeProjectsCount
          }}
          pendingFaculty={pendingFaculty}
          allUsers={allUsers}
        />
      );
    default:
      redirect("/login");
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <DashboardContent session={session} />
    </>
  );
}
