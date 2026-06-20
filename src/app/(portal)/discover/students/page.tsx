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

export const metadata = { title: "Discover Students — TIET Research Portal" };

export default async function DiscoverStudentsPage() {
  const session = await auth();
  if (!session?.user || !["faculty", "admin"].includes(session.user.role)) {
    redirect("/login");
  }

  // 1. Fetch Students who are open to research
  const studentsData = await db
    .select({
      id: studentProfiles.id,
      userId: users.id,
      name: users.name,
      image: users.image,
      department: studentProfiles.department,
      program: studentProfiles.program,
      batchYear: studentProfiles.batchYear,
      cgpa: studentProfiles.cgpa,
      bio: studentProfiles.bio,
      preferredEngagement: studentProfiles.preferredEngagement,
      githubUrl: studentProfiles.githubUrl,
      linkedinUrl: studentProfiles.linkedinUrl,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(
      and(
        eq(studentProfiles.openToResearch, true),
        inArray(studentProfiles.visibility, ["public", "faculty_only"])
      )
    )
    .orderBy(desc(studentProfiles.createdAt))
    .all();

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

  // Group by department
  const groupedByDept = studentsData.reduce((acc, student) => {
    const dept = student.department || "Undeclared";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(student);
    return acc;
  }, {} as Record<string, typeof studentsData>);

  const sortedDepts = Object.keys(groupedByDept).sort();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-label mb-1">Recruitment</p>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Discover{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              Students
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Browse through student profiles who are actively seeking research opportunities. 
            Add promising candidates to your shortlist for future projects.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/shortlists" className="btn btn-secondary bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border-teal-500/20">
            <BookmarkCheck size={16} /> View Shortlist
          </Link>
        </div>
      </div>

      {sortedDepts.length === 0 ? (
        <div className="card-glass-static p-12 text-center">
          <Users size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300 text-lg font-medium">No students found</p>
          <p className="text-noir-500 text-sm mt-2">
            There are currently no students actively looking for research opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDepts.map(dept => (
            <section key={dept} className="space-y-6">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-noir-50 font-heading tracking-tight">{dept}</h2>
                <span className="badge badge-outline">{groupedByDept[dept].length} students</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedByDept[dept].map(student => {
                  const isSaved = savedStudentIds.includes(student.id);

                  return (
                    <div key={student.id} className="card-glass p-6 flex flex-col hover:border-teal-500/30 transition-colors group relative">
                      {/* Shortlist Action Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <form action={async () => {
                           "use server";
                           await toggleShortlistCandidate(student.id);
                        }}>
                           <button 
                             type="submit" 
                             className={`p-2 rounded-xl transition-all ${
                               isSaved 
                                 ? 'bg-teal-500/20 text-teal-400 hover:bg-rose-500/20 hover:text-rose-400' 
                                 : 'bg-white/5 text-noir-400 hover:bg-white/10 hover:text-noir-200'
                             }`}
                             title={isSaved ? "Remove from Shortlist" : "Add to Shortlist"}
                           >
                             {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                           </button>
                        </form>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-noir-800 ring-2 ring-teal-500/10 relative flex-shrink-0">
                            {student.image ? (
                              <Image src={student.image} alt={student.name || "Student"} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-teal-400 font-heading">
                                {student.name?.[0] || "?"}
                              </div>
                            )}
                          </div>
                          <div className="pr-10">
                            <h3 className="text-lg font-bold text-noir-50">{student.name}</h3>
                            <p className="text-xs text-noir-400 font-medium">
                              {student.program} {student.batchYear ? `'${String(student.batchYear).slice(2)}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                           <div className="bg-noir-900/50 border border-white/5 p-3 rounded-xl">
                             <p className="text-[10px] text-noir-400 uppercase tracking-widest mb-1">CGPA</p>
                             <p className="font-medium text-noir-100">{student.cgpa ? student.cgpa.toFixed(2) : "N/A"}</p>
                           </div>
                           <div className="bg-noir-900/50 border border-white/5 p-3 rounded-xl">
                             <p className="text-[10px] text-noir-400 uppercase tracking-widest mb-1">Interests</p>
                             <p className="font-medium text-noir-100 truncate">
                               {student.preferredEngagement && student.preferredEngagement.length > 0 ? student.preferredEngagement[0] : "General"}
                             </p>
                           </div>
                        </div>

                        {student.bio && (
                          <p className="text-xs text-noir-400 mt-4 line-clamp-3 leading-relaxed">
                            "{student.bio}"
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                        <Link href={`/messages/new?to=${student.userId}`} className="btn btn-secondary flex-1 py-2 text-xs">
                          Message Student
                        </Link>
                        {student.githubUrl && (
                          <a href={student.githubUrl} target="_blank" rel="noreferrer" className="btn btn-ghost bg-white/5 py-2 px-3 text-noir-300 hover:text-white" title="GitHub">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {student.linkedinUrl && (
                          <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-ghost bg-white/5 py-2 px-3 text-noir-300 hover:text-[#0a66c2]" title="LinkedIn">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
