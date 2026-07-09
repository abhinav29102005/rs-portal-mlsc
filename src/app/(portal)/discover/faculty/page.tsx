import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FacultyDiscovery } from "@/components/discovery/FacultyDiscovery";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { facultyProfiles } from "@/db/schema/profiles";
import { openings, openingDomains } from "@/db/schema/openings";
import { researchDomains } from "@/db/schema/taxonomy";
import { eq, and, inArray } from "drizzle-orm";

export const metadata = {
  title: "Discover Faculty — TIET Research Portal",
  description: "Browse and filter TIET faculty profiles by research domain, department, and availability.",
};

export default async function DiscoverFacultyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all active faculty users with their profiles
  const facultyDataRaw = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      profileId: facultyProfiles.id,
      designation: facultyProfiles.designation,
      department: facultyProfiles.department,
      mentoringStyle: facultyProfiles.mentoringStyle,
      minimumCgpa: facultyProfiles.minimumCgpa,
    })
    .from(users)
    .innerJoin(facultyProfiles, eq(users.id, facultyProfiles.userId))
    .where(and(eq(users.role, "faculty"), eq(users.status, "active")))
    .all();

  const formattedFaculty = [];

  if (facultyDataRaw.length > 0) {
    const profileIds = facultyDataRaw.map((f) => f.profileId).filter(Boolean) as string[];

    let allOpenings: any[] = [];
    let allDomains: any[] = [];

    if (profileIds.length > 0) {
      allOpenings = await db
        .select({
          id: openings.id,
          status: openings.status,
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

    for (const f of facultyDataRaw) {
      let researchTags: string[] = [];
      let activeOpeningsCount = 0;

      if (f.profileId) {
        const facultyOpenings = allOpenings.filter((o) => o.facultyProfileId === f.profileId);
        const openPositions = facultyOpenings.filter((o) => o.status === "open");
        activeOpeningsCount = openPositions.length;

        const facultyOpeningIds = facultyOpenings.map((o) => o.id);
        const domains = allDomains.filter((d) => facultyOpeningIds.includes(d.openingId));
        researchTags = Array.from(new Set(domains.map((d) => d.name)));
      }

      formattedFaculty.push({
        id: f.id,
        name: f.name || "Unknown Faculty",
        designation: f.designation || "Faculty",
        department: f.department || "Unknown Department",
        researchTags,
        mentoringStyle: f.mentoringStyle || [],
        minimumCgpa: f.minimumCgpa,
        openings: activeOpeningsCount,
        isAccepting: activeOpeningsCount > 0,
        image: f.image || null,
      });
    }
  }

  return <FacultyDiscovery initialFaculty={formattedFaculty} />;
}
