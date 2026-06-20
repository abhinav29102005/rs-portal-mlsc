export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";
import { PortfolioBuilder } from "@/components/portfolio/PortfolioBuilder";

export const metadata = { title: "My Portfolio — TIET Research Portal" };

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") redirect("/login");

  const profile = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, session.user.id)).get();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label mb-1">Portfolio Builder</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Your{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            Portfolio
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Build your research profile — add projects, skills, papers, and experiences
        </p>
      </div>

      <PortfolioBuilder initialData={profile || {}} />
    </div>
  );
}
