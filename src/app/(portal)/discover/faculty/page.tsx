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
      hIndex: facultyProfiles.hIndex,
    })
    .from(users)
    .innerJoin(facultyProfiles, eq(users.id, facultyProfiles.userId))
    .where(and(eq(users.role, "faculty"), eq(users.status, "active")))
    .all();

  const formattedFaculty = [];

  for (const f of facultyDataRaw) {
    let researchTags: string[] = [];
    let activeOpeningsCount = 0;
    
    if (f.profileId) {
      // Find all openings for this faculty
      const facultyOpenings = await db
        .select({
          id: openings.id,
          status: openings.status,
        })
        .from(openings)
        .where(eq(openings.facultyProfileId, f.profileId))
        .all();
      
      const openPositions = facultyOpenings.filter(o => o.status === "open");
      activeOpeningsCount = openPositions.length;

      const openingIds = facultyOpenings.map(o => o.id);

      // Collect all research domains from these openings to use as tags
      if (openingIds.length > 0) {
         const domains = await db
           .select({
             name: researchDomains.name,
           })
           .from(openingDomains)
           .innerJoin(researchDomains, eq(openingDomains.researchDomainId, researchDomains.id))
           .where(inArray(openingDomains.openingId, openingIds))
           .all();
           
         // Get unique domain names
         researchTags = Array.from(new Set(domains.map(d => d.name)));
      }
    }

    formattedFaculty.push({
      id: f.id,
      name: f.name || "Unknown Faculty",
      designation: f.designation || "Faculty",
      department: f.department || "Unknown Department",
      researchTags,
      hIndex: f.hIndex || 0,
      openings: activeOpeningsCount,
      isAccepting: activeOpeningsCount > 0,
      image: f.image || null,
    });
  }

  return <FacultyDiscovery initialFaculty={formattedFaculty} />;
}
