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

  // Fetch faculty data from the new NestJS backend
  let formattedFaculty = [];
  try {
    const res = await fetch('http://localhost:3001/faculty/discover', {
      next: { revalidate: 60 } // cache for 60 seconds
    });
    
    if (res.ok) {
      formattedFaculty = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch faculty from backend:", error);
  }

  return <FacultyDiscovery initialFaculty={formattedFaculty} />;
}
