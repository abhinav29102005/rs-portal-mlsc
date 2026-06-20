export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { openings } from "@/db/schema/openings";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  Calendar,
  Users,
  MapPin,
  Pencil,
  ExternalLink,
} from "lucide-react";

export const metadata = { title: "Openings — TIET Research Portal" };

async function getFacultyOpenings(userId: string) {
  const profile = await db
    .select()
    .from(facultyProfiles)
    .where(eq(facultyProfiles.userId, userId))
    .get();

  if (!profile) return [];

  return db
    .select({
      opening: openings,
      facultyName: users.name,
    })
    .from(openings)
    .leftJoin(facultyProfiles, eq(openings.facultyProfileId, facultyProfiles.id))
    .leftJoin(users, eq(facultyProfiles.userId, users.id))
    .where(eq(openings.facultyProfileId, profile.id))
    .orderBy(desc(openings.createdAt))
    .all();
}

async function getPublicOpenings() {
  return db
    .select({
      opening: openings,
      facultyName: users.name,
      facultyDepartment: facultyProfiles.department,
    })
    .from(openings)
    .leftJoin(facultyProfiles, eq(openings.facultyProfileId, facultyProfiles.id))
    .leftJoin(users, eq(facultyProfiles.userId, users.id))
    .where(eq(openings.status, "open"))
    .orderBy(desc(openings.createdAt))
    .all();
}

const STATUS_CLASSES: Record<string, string> = {
  draft: "status-pill status-draft",
  open: "status-pill status-open",
  closed: "status-pill status-closed",
  archived: "status-pill status-draft",
};

export default async function OpeningsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isFaculty = session.user.role === "faculty";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-1">Research Opportunities</p>
          <h1
            className="heading-1 text-noir-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Open{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
              Positions
            </span>
          </h1>
          <p className="text-noir-400 mt-2">
            {isFaculty
              ? "Manage your project listings and attract student researchers"
              : "Browse research opportunities posted by TIET faculty"}
          </p>
        </div>

        {isFaculty && (
          <Link href="/openings/new" className="btn btn-primary gap-2">
            <Plus size={16} />
            Post Project
          </Link>
        )}
      </div>

      {/* Content */}
      {isFaculty ? (
        <FacultyOpeningsList userId={session.user.id} />
      ) : (
        <StudentOpeningsList />
      )}
    </div>
  );
}

async function FacultyOpeningsList({ userId }: { userId: string }) {
  const results = await getFacultyOpenings(userId);

  if (results.length === 0) {
    return (
      <div className="card-glass-static p-12 text-center">
        <Briefcase size={40} className="text-noir-500 mx-auto mb-4" />
        <p className="text-noir-300 mb-2">You haven&apos;t posted any projects yet</p>
        <p className="text-noir-500 text-sm mb-6">
          Create your first listing to start receiving student proposals
        </p>
        <Link href="/openings/new" className="btn btn-primary gap-2">
          <Plus size={16} />
          Post Your First Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map(({ opening }) => (
        <div key={opening.id} className="card-glass p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3
                  className="heading-3 text-noir-50 truncate"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {opening.title}
                </h3>
                <span className={STATUS_CLASSES[opening.status] || "status-pill status-draft"}>
                  {opening.status}
                </span>
              </div>

              <p className="text-sm text-noir-400 line-clamp-2 mb-3">
                {opening.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-noir-500">
                {opening.department && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {opening.department}
                  </span>
                )}
                {opening.engagementType && (
                  <span className="badge badge-teal">{opening.engagementType}</span>
                )}
                {opening.seatsAvailable && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {opening.seatsAvailable} seat{opening.seatsAvailable > 1 ? "s" : ""}
                  </span>
                )}
                {opening.source === "elc_2026_call" && (
                  <span className="badge badge-sky">ELC 2026</span>
                )}
                {opening.needsReview && (
                  <span className="badge badge-amber">Needs Review</span>
                )}
              </div>
            </div>

            <Link
              href={`/openings/${opening.id}/edit`}
              className="btn btn-ghost btn-sm gap-1 flex-shrink-0"
            >
              <Pencil size={14} />
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

async function StudentOpeningsList() {
  const results = await getPublicOpenings();

  if (results.length === 0) {
    return (
      <div className="card-glass-static p-12 text-center">
        <Briefcase size={40} className="text-noir-500 mx-auto mb-4" />
        <p className="text-noir-300">No open positions at the moment</p>
        <p className="text-noir-500 text-sm mt-2">
          Check back later — faculty are actively posting new projects
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {results.map(({ opening, facultyName, facultyDepartment }) => (
        <Link href={`/openings/${opening.id}`} key={opening.id} className="card-glass p-5 space-y-3 group hover:border-amber-500/30 transition-colors block">
          <div className="flex justify-between items-start">
            <div>
              <h3
              className="heading-3 text-noir-50 line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {opening.title}
            </h3>
            <p className="text-sm text-amber-400">
              {facultyName || "Faculty Member"}
            </p>
            </div>
            <ExternalLink size={16} className="text-noir-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <p className="text-sm text-noir-400 line-clamp-3">
            {opening.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {opening.department && (
              <span className="badge badge-amber">{opening.department}</span>
            )}
            {opening.engagementType && (
              <span className="badge badge-teal">{opening.engagementType}</span>
            )}
            {opening.stipendType && (
              <span className="badge badge-sky">
                {opening.stipendType}
                {opening.stipendAmount && ` — ${opening.stipendAmount}`}
              </span>
            )}
            {opening.seatsAvailable && opening.seatsAvailable > 0 && (
              <span className="badge badge-neutral">
                {opening.seatsAvailable} seat{opening.seatsAvailable > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {opening.duration && (
            <p className="text-xs text-noir-500 flex items-center gap-1">
              <Calendar size={12} />
              {opening.duration}
            </p>
          )}

          {opening.coMentors && (opening.coMentors as any[]).length > 0 && (
            <p className="text-xs text-noir-500">
              Co-mentors:{" "}
              {(opening.coMentors as any[]).map((cm: any) => cm.name).join(", ")}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
