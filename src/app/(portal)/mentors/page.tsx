import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema/alumni";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc, sql } from "drizzle-orm";
import { Users, Building2, GraduationCap, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MentorDirectory } from "@/components/mentors/MentorDirectory";

export const metadata = { title: "Mentors — TIET Research Portal" };

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

  // Fetch Faculty Mentors
  const faculty = await db
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
      mentorshipDomains: facultyProfiles.mentoringStyle,
      bio: facultyProfiles.bio,
      officeHours: facultyProfiles.officeHours,
    })
    .from(facultyProfiles)
    .innerJoin(users, eq(facultyProfiles.userId, users.id))
    // we assume all faculty are potential mentors for this directory
    .orderBy(desc(facultyProfiles.createdAt))
    .all();

  const allMentors = [...alumni, ...faculty].filter(m => m.name);

  return <MentorDirectory initialMentors={allMentors} />;
}
