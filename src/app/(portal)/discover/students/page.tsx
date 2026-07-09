import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { facultyShortlists, shortlistCandidates } from "@/db/schema/proposals";
import { eq, desc, inArray, and } from "drizzle-orm";
import { Users, GraduationCap, ExternalLink, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toggleShortlistCandidate } from "@/app/actions/shortlists";
import { StudentDiscovery } from "@/components/discovery/StudentDiscovery";

export const metadata = { title: "Discover Students — TIET Research Portal" };

export default async function DiscoverStudentsPage() {
  const session = await auth();
  if (!session?.user || !["faculty", "admin"].includes(session.user.role)) {
    redirect("/login");
  }

  // 1. Fetch Students who are open to research from NestJS
  let studentsData: any[] = [];
  try {
    const res = await fetch('http://localhost:3001/students/discover', {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      studentsData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch students from backend:", error);
  }

  // 2. Fetch the faculty's shortlist to show which students are already saved
  let savedStudentIds: string[] = [];
  if (session.user.role === "faculty") {
    const facultyUser = await db.query.facultyProfiles.findFirst({
      where: (p, { eq }) => eq(p.userId, session.user.id)
    });

    if (facultyUser) {
      const shortlist = await db.query.facultyShortlists.findFirst({
        where: (s, { eq }) => eq(s.facultyProfileId, facultyUser.id)
      });
      
      if (shortlist) {
        const candidates = await db
          .select({ studentId: shortlistCandidates.studentProfileId })
          .from(shortlistCandidates)
          .where(eq(shortlistCandidates.shortlistId, shortlist.id))
          .all();
        savedStudentIds = candidates.map(c => c.studentId as string);
      }
    }
  }

  const initialStudents = studentsData.map(s => ({
    ...s,
    isSaved: savedStudentIds.includes(s.id)
  }));

  return (
    <StudentDiscovery initialStudents={initialStudents} />
  );
}
