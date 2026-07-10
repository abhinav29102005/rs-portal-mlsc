import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema/alumni";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { openings, openingDomains } from "@/db/schema/openings";
import { researchDomains } from "@/db/schema/taxonomy";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { Users, Building2, GraduationCap, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MentorDirectory } from "@/components/mentors/MentorDirectory";

export const metadata = { title: "Mentors — RAMP" };

export default async function MentorsPage() {
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

  // Process Faculty Domains
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
      const facultyOpeningIds = facultyOpenings.map((o) => o.id);
      const domains = allDomains.filter((d) => facultyOpeningIds.includes(d.openingId));
      researchTags = Array.from(new Set(domains.map((d) => d.name)));

      faculty.push({
        ...f,
        mentorshipDomains: researchTags,
      });
    }
  }

  const allMentors = [...alumni, ...faculty].filter(m => m.name);

  return <MentorDirectory initialMentors={allMentors} />;
}
