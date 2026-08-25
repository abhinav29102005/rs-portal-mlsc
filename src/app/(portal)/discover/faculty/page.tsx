import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema/alumni";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { openings, openingDomains } from "@/db/schema/openings";
import { researchDomains } from "@/db/schema/taxonomy";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { MentorDirectory } from "@/components/mentors/MentorDirectory";

export const metadata = { title: "Discover Faculty — Research, Academic & Mentorship Portal" };

export default async function DiscoverFacultyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch Alumni Mentors
  const alumni = await db
    .select({
      id: alumniProfiles.id,
      userId: users.id,
      name: users.name,
      image: users.image,
      department: alumniProfiles.degreeProgram, // Treat degree program as department for grouping
      designation: alumniProfiles.currentRole,
      company: alumniProfiles.currentCompany,
      type: sql<string>`'alumni'`,
      mentorshipDomains: alumniProfiles.mentorshipDomains,
      linkedinUrl: alumniProfiles.linkedinUrl,
      bio: alumniProfiles.bio,
      graduationYear: alumniProfiles.graduationYear,
      officeHours: sql<string | null>`null`,
      projectOpenings: sql<number>`0`,
      capstoneOpenings: sql<number>`0`,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(alumniProfiles.willingToMentor, true))
    .orderBy(desc(alumniProfiles.createdAt))
    .all();

  // Fetch Faculty Mentors Base
  const facultyRaw = await db
    .select({
      id: facultyProfiles.id,
      userId: users.id,
      name: users.name,
      image: users.image,
      department: facultyProfiles.department,
      designation: facultyProfiles.designation,
      company: sql<string | null>`null`,
      linkedinUrl: sql<string | null>`null`,
      graduationYear: sql<number | null>`null`,
      type: sql<string>`'faculty'`,
      bio: facultyProfiles.bio,
      officeHours: facultyProfiles.officeHours,
    })
    .from(facultyProfiles)
    .innerJoin(users, eq(facultyProfiles.userId, users.id))
    .orderBy(desc(facultyProfiles.createdAt))
    .all();

  // Process Faculty Domains and Openings
  const faculty = [];
  if (facultyRaw.length > 0) {
    const profileIds = facultyRaw.map((f) => f.id);
    let allOpenings: any[] = [];
    let allDomains: any[] = [];

    if (profileIds.length > 0) {
      allOpenings = await db
        .select({
          id: openings.id,
          facultyProfileId: openings.facultyProfileId,
          status: openings.status,
          engagementType: openings.engagementType,
        })
        .from(openings)
        .where(inArray(openings.facultyProfileId, profileIds))
        .all();

      const openingIds = allOpenings.map((o) => o.id);
      if (openingIds.length > 0) {
        allDomains = await db
          .select({
            openingId: openingDomains.openingId,
            name: researchDomains.name,
          })
          .from(openingDomains)
          .innerJoin(researchDomains, eq(openingDomains.researchDomainId, researchDomains.id))
          .where(inArray(openingDomains.openingId, openingIds))
          .all();
      }
    }

    for (const f of facultyRaw) {
      let researchTags: string[] = [];
      const facultyOpenings = allOpenings.filter((o) => o.facultyProfileId === f.id);
      const openPositions = facultyOpenings.filter((o) => o.status === "open");
      const activeOpeningsCount = openPositions.length;
      const capstoneOpeningsCount = openPositions.filter((o) => o.engagementType === "Capstone Project").length;
      const engagementTypes = Array.from(new Set(openPositions.map((o) => o.engagementType).filter(Boolean)));

      const facultyOpeningIds = facultyOpenings.map((o) => o.id);
      const domains = allDomains.filter((d) => facultyOpeningIds.includes(d.openingId));
      researchTags = Array.from(new Set(domains.map((d) => d.name)));

      faculty.push({
        ...f,
        mentorshipDomains: researchTags,
        projectOpenings: activeOpeningsCount,
        capstoneOpenings: capstoneOpeningsCount,
        engagementTypes,
      });
    }
  }

  const allMentors = [...alumni, ...faculty].filter(m => m.name);

  return <MentorDirectory initialMentors={allMentors} />;
}
