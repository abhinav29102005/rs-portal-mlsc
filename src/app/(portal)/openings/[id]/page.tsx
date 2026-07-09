import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { openings, openingDomains } from "@/db/schema/openings";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { researchDomains } from "@/db/schema/taxonomy";
import { eq, inArray } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  Banknote,
  Send,
  Mail,
  Building,
} from "lucide-react";

export const metadata = { title: "Project Details — TIET Research Portal" };

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch opening details
  const openingResult = await db
    .select({
      opening: openings,
      facultyProfile: facultyProfiles,
      hostName: users.name,
      hostEmail: users.email,
      hostImage: users.image,
    })
    .from(openings)
    .innerJoin(facultyProfiles, eq(openings.facultyProfileId, facultyProfiles.id))
    .innerJoin(users, eq(facultyProfiles.userId, users.id))
    .where(eq(openings.id, id))
    .get();

  if (!openingResult) redirect("/openings");

  const { opening, facultyProfile, hostName, hostEmail, hostImage } = openingResult;

  // Fetch domains
  const oDomains = await db
    .select({ name: researchDomains.name })
    .from(openingDomains)
    .innerJoin(researchDomains, eq(openingDomains.researchDomainId, researchDomains.id))
    .where(eq(openingDomains.openingId, id))
    .all();

  const domainNames = oDomains.map((d) => d.name);
  const prerequisites = (opening.prerequisites as string[]) || [];
  const coMentors = (opening.coMentors as Array<{ name: string; email: string | null; phone: string | null }>) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/openings"
        className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-red-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Openings
      </Link>

      <div className="card-glass p-8 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex gap-2 flex-wrap">
            <span className="badge badge-red">{opening.engagementType || "Research Project"}</span>
            <span className={`badge ${opening.status === "open" ? "badge-red" : "badge-red"}`}>
              {opening.status.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-noir-400">
            Posted {new Date(opening.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1
          className="heading-1 text-noir-50 mb-6 relative z-10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {opening.title}
        </h1>

        {/* Project Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <Clock size={18} className="text-red-400 mb-2" />
            <p className="text-xs text-noir-400 mb-1">Duration</p>
            <p className="text-sm font-medium text-noir-100">
              {opening.duration || "TBA"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <Banknote size={18} className="text-red-400 mb-2" />
            <p className="text-xs text-noir-400 mb-1">Stipend</p>
            <p className="text-sm font-medium text-noir-100">
              {opening.stipendType === "Paid" ? opening.stipendAmount : opening.stipendType || "Unpaid"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <Users size={18} className="text-red-400 mb-2" />
            <p className="text-xs text-noir-400 mb-1">Seats Available</p>
            <p className="text-sm font-medium text-noir-100">
              {opening.seatsAvailable || 1}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <Calendar size={18} className="text-red-400 mb-2" />
            <p className="text-xs text-noir-400 mb-1">Deadline</p>
            <p className="text-sm font-medium text-noir-100">
              {opening.applicationDeadline
                ? new Date(opening.applicationDeadline).toLocaleDateString()
                : "Rolling"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Project Description
              </h2>
              <div className="prose prose-invert prose-amber max-w-none text-noir-300 text-sm leading-relaxed whitespace-pre-wrap">
                {opening.description}
              </div>
            </section>

            {(prerequisites.length > 0 || domainNames.length > 0) && (
              <section>
                <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Requirements & Domains
                </h2>
                {domainNames.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-noir-400 uppercase tracking-wider mb-2">Research Domains</p>
                    <div className="flex flex-wrap gap-2">
                      {domainNames.map((d) => (
                        <span key={d} className="badge badge-red">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {prerequisites.length > 0 && (
                  <div>
                    <p className="text-xs text-noir-400 uppercase tracking-wider mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {prerequisites.map((p) => (
                        <span key={p} className="badge bg-white/5 border-white/10 text-noir-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {opening.applicationInstructions && (
              <section>
                <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  How to Apply
                </h2>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-200/80 leading-relaxed whitespace-pre-wrap">
                  {opening.applicationInstructions}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card-glass-static p-5">
              <h3 className="text-sm font-semibold text-noir-100 mb-4 uppercase tracking-wider">
                Primary Mentor
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-noir-800 flex items-center justify-center border border-noir-700 overflow-hidden">
                  {hostImage ? (
                    <img src={hostImage!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-noir-400 font-medium text-lg">
                      {hostName?.charAt(0) || "F"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-noir-100">{hostName}</p>
                  <p className="text-xs text-noir-400">{facultyProfile.designation || "Faculty Member"}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-xs text-noir-300">
                <div className="flex items-start gap-2">
                  <Building size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{facultyProfile.department || opening.department || "Thapar Institute"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-red-400 flex-shrink-0" />
                  <a href={`mailto:${hostEmail}`} className="hover:text-red-400 transition-colors">
                    {hostEmail}
                  </a>
                </div>
              </div>
            </div>

            {coMentors.length > 0 && (
              <div className="card-glass-static p-5">
                <h3 className="text-sm font-semibold text-noir-100 mb-4 uppercase tracking-wider">
                  Co-Mentors
                </h3>
                <div className="space-y-4">
                  {coMentors.map((cm, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Users size={14} className="text-noir-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-noir-200">{cm.name}</p>
                        {cm.email && <p className="text-xs text-noir-400">{cm.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {session.user.role === "student" && opening.status === "open" && (
              <Link
                href={`/proposals/new?openingId=${opening.id}`}
                className="btn btn-primary w-full gap-2 py-3"
              >
                <Send size={16} />
                Submit Proposal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
