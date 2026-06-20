import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OpeningForm } from "@/components/openings/OpeningForm";
import { db } from "@/db";
import { openings } from "@/db/schema/openings";
import { facultyProfiles } from "@/db/schema/profiles";
import { proposals } from "@/db/schema/proposals";
import { eq } from "drizzle-orm";

export const metadata = { title: "Edit Project — TIET Research Portal" };

export default async function EditOpeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "faculty") redirect("/dashboard");

  // Fetch opening
  const opening = await db
    .select()
    .from(openings)
    .where(eq(openings.id, id))
    .get();

  if (!opening) redirect("/openings");

  // Verify ownership
  const profile = await db
    .select()
    .from(facultyProfiles)
    .where(eq(facultyProfiles.userId, session.user.id))
    .get();

  if (!profile || opening.facultyProfileId !== profile.id) {
    redirect("/openings");
  }

  // Check for active proposals
  const activeProposals = await db
    .select()
    .from(proposals)
    .where(eq(proposals.openingId, id))
    .all();

  const coMentors = (opening.coMentors || []).map((cm) => ({
    name: cm.name || "",
    email: cm.email || "",
    phone: cm.phone || "",
  }));

  return (
    <OpeningForm
      mode="edit"
      userDepartment={profile.department || ""}
      hasActiveProposals={activeProposals.length > 0}
      initialData={{
        id: opening.id,
        title: opening.title,
        department: opening.department || "",
        description: opening.description,
        coMentors,
        engagementType: opening.engagementType || "",
        stipendType: opening.stipendType || "",
        stipendAmount: opening.stipendAmount || "",
        seatsAvailable: opening.seatsAvailable || 1,
        duration: opening.duration || "",
        applicationDeadline: opening.applicationDeadline
          ? new Date(opening.applicationDeadline).toISOString().split("T")[0]
          : "",
        applicationInstructions: opening.applicationInstructions || "",
        status: opening.status === "open" ? "open" : "draft",
      }}
    />
  );
}
