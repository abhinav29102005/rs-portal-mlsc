import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { studentProfiles, facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { facultyShortlists, shortlistCandidates } from "@/db/schema/proposals";
import { eq, desc } from "drizzle-orm";
import { Bookmark, MessageSquare, XCircle, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toggleShortlistCandidate } from "@/app/actions/shortlists";

export const metadata = { title: "Shortlists — RAMP" };

export default async function ShortlistsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "faculty") {
    redirect("/login");
  }

  // Find faculty profile
  const faculty = await db.query.facultyProfiles.findFirst({
    where: (p, { eq }) => eq(p.userId, session.user.id)
  });

  if (!faculty) {
    return (
      <div className="card-glass-static p-12 text-center max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold text-red-400 mb-2 font-heading">Profile Incomplete</h1>
        <p className="text-noir-400 mb-6">Please complete your faculty profile before accessing shortlists.</p>
        <Link href="/profile" className="btn btn-primary">Go to Profile</Link>
      </div>
    );
  }

  // Fetch the faculty's shortlist
  const shortlist = await db.query.facultyShortlists.findFirst({
    where: (s, { eq }) => eq(s.facultyProfileId, faculty.id)
  });

  let candidates: any[] = [];

  if (shortlist) {
    candidates = await db
      .select({
        candidateId: shortlistCandidates.id,
        status: shortlistCandidates.status,
        addedAt: shortlistCandidates.addedAt,
        student: {
          id: studentProfiles.id,
          userId: users.id,
          name: users.name,
          image: users.image,
          department: studentProfiles.department,
          program: studentProfiles.program,
          cgpa: studentProfiles.cgpa,
          linkedinUrl: studentProfiles.linkedinUrl,
        }
      })
      .from(shortlistCandidates)
      .innerJoin(studentProfiles, eq(shortlistCandidates.studentProfileId, studentProfiles.id))
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(eq(shortlistCandidates.shortlistId, shortlist.id))
      .orderBy(desc(shortlistCandidates.addedAt))
      .all();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-label mb-1">Recruitment</p>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Saved{" "}
            <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              Candidates
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Manage your shortlisted students. Reach out to them to discuss research opportunities or remove them if they are no longer a fit.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/discover/students" className="btn btn-primary">
            <Users size={16} /> Discover More Students
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="card-glass-static p-12 text-center mt-8">
          <Bookmark size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300 text-lg font-medium">Your shortlist is empty</p>
          <p className="text-noir-500 text-sm mt-2">
            You haven't saved any students yet. Browse the student directory to find candidates for your lab.
          </p>
          <Link href="/discover/students" className="btn btn-secondary mt-6 mx-auto inline-flex">
            Browse Students
          </Link>
        </div>
      ) : (
        <div className="bg-noir-900 border border-white/10 rounded-2xl overflow-hidden mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-noir-400 uppercase tracking-wider">Candidate</th>
                <th className="p-4 text-xs font-semibold text-noir-400 uppercase tracking-wider hidden sm:table-cell">Program</th>
                <th className="p-4 text-xs font-semibold text-noir-400 uppercase tracking-wider hidden md:table-cell">CGPA</th>
                <th className="p-4 text-xs font-semibold text-noir-400 uppercase tracking-wider hidden lg:table-cell">Added On</th>
                <th className="p-4 text-xs font-semibold text-noir-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidates.map((c) => (
                <tr key={c.candidateId} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-noir-800 ring-2 ring-white/5 relative flex-shrink-0">
                        {c.student.image ? (
                          <Image src={c.student.image} alt={c.student.name || "Student"} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-red-400 font-heading">
                            {c.student.name?.[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-noir-50 group-hover:text-red-400 transition-colors">
                          {c.student.name}
                        </div>
                        <div className="text-xs text-noir-400 mt-0.5 max-w-[200px] truncate">
                          {c.student.department || "Undeclared"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="badge badge-outline">{c.student.program || "N/A"}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell font-medium text-noir-300">
                    {c.student.cgpa ? c.student.cgpa.toFixed(2) : "N/A"}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm text-noir-400">
                    {new Date(c.addedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/messages/new?to=${c.student.userId}`} className="btn btn-secondary px-3 py-1.5 text-xs">
                        <MessageSquare size={14} /> <span className="hidden xl:inline">Message</span>
                      </Link>
                      {c.student.linkedinUrl && (
                        <a href={c.student.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-ghost px-2 py-1.5 text-noir-400 hover:text-[#0a66c2]" title="LinkedIn Profile">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <form action={async () => { "use server"; await toggleShortlistCandidate(c.student.id); }}>
                        <button type="submit" className="btn btn-ghost px-2 py-1.5 text-noir-400 hover:text-red-400 hover:bg-red-500/10" title="Remove">
                          <XCircle size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
