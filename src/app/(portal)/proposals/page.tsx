import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { proposals } from "@/db/schema/proposals";
import { studentProfiles, facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { updateProposalStatus } from "@/app/actions/proposals";

export const metadata = { title: "Proposals — TIET Research Portal" };

function getStatusColor(status: string) {
  switch (status) {
    case "accepted": return "text-red-400 bg-red-400/10 border-red-500/20";
    case "rejected": return "text-red-400 bg-red-400/10 border-red-500/20";
    case "under_review": return "text-red-400 bg-red-400/10 border-red-500/20";
    case "revision_requested": return "text-red-400 bg-red-400/10 border-red-500/20";
    default: return "text-noir-300 bg-noir-800 border-white/10";
  }
}

export default async function ProposalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;

  let proposalsData: any[] = [];

  if (role === "student") {
    const student = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).get();
    if (student) {
      proposalsData = await db
        .select({
          proposal: proposals,
          facultyUser: users,
        })
        .from(proposals)
        .innerJoin(facultyProfiles, eq(proposals.facultyProfileId, facultyProfiles.id))
        .innerJoin(users, eq(facultyProfiles.userId, users.id))
        .where(eq(proposals.studentProfileId, student.id))
        .orderBy(desc(proposals.createdAt))
        .all();
    }
  } else if (role === "faculty") {
    const faculty = await db.select().from(facultyProfiles).where(eq(facultyProfiles.userId, userId)).get();
    if (faculty) {
      proposalsData = await db
        .select({
          proposal: proposals,
          studentUser: users,
        })
        .from(proposals)
        .innerJoin(studentProfiles, eq(proposals.studentProfileId, studentProfiles.id))
        .innerJoin(users, eq(studentProfiles.userId, users.id))
        .where(eq(proposals.facultyProfileId, faculty.id))
        .orderBy(desc(proposals.createdAt))
        .all();
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-label mb-1">Management</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Research{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Proposals
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          {role === "student" ? "Track the status of your research proposals sent to faculty." : "Review and manage incoming research proposals from students."}
        </p>
      </div>

      {proposalsData.length === 0 ? (
        <div className="card-glass-static p-12 text-center mt-8">
          <FileText size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300 text-lg font-medium">No proposals found</p>
          <p className="text-noir-500 text-sm mt-2">
            {role === "student" ? "You haven't submitted any research proposals yet. Browse faculty profiles to get started." : "You have no pending research proposals from students."}
          </p>
          {role === "student" && (
            <Link href="/discover/faculty" className="btn btn-primary mt-6 mx-auto inline-flex">
              Discover Faculty
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {proposalsData.map((data: any) => {
            const p = data.proposal;
            const otherParty = role === "student" ? data.facultyUser : data.studentUser;

            return (
              <div key={p.id} className="card-glass p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(p.status)}`}>
                        {p.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-noir-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-noir-50 font-heading mb-1">{p.title}</h3>
                    <p className="text-sm text-noir-300 mb-4 line-clamp-2">{p.abstract}</p>

                    <div className="flex items-center gap-3 bg-noir-900/50 p-3 rounded-xl border border-white/5 inline-flex">
                      <div className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center text-red-400 font-bold overflow-hidden relative">
                        {otherParty?.image ? (
                          <img src={otherParty.image} alt={otherParty.name} className="object-cover w-full h-full" />
                        ) : (
                          otherParty?.name?.[0] || "?"
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="text-noir-400">{role === "student" ? "Sent to" : "Submitted by"}</p>
                        <p className="font-medium text-noir-100">{otherParty?.name || "Unknown User"}</p>
                      </div>
                    </div>
                  </div>

                  {role === "faculty" && p.status === "submitted" && (
                    <div className="flex flex-col gap-2 min-w-[140px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 justify-center">
                      <form action={async () => { "use server"; await updateProposalStatus(p.id, "accepted"); }}>
                        <button type="submit" className="btn btn-primary w-full text-xs py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                          <CheckCircle size={14} /> Accept
                        </button>
                      </form>
                      <form action={async () => { "use server"; await updateProposalStatus(p.id, "rejected"); }}>
                        <button type="submit" className="btn btn-secondary w-full text-xs py-2 text-red-400 hover:text-red-300 hover:border-red-500/30">
                          <XCircle size={14} /> Reject
                        </button>
                      </form>
                      <form action={async () => { "use server"; await updateProposalStatus(p.id, "under_review"); }}>
                        <button type="submit" className="btn btn-ghost w-full text-xs py-2 text-noir-300">
                          Mark Under Review
                        </button>
                      </form>
                    </div>
                  )}

                  {role === "faculty" && p.status !== "submitted" && (
                    <div className="flex items-center justify-center min-w-[140px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                       <Link href={`/messages/new?to=${otherParty.id}`} className="btn btn-secondary w-full text-xs">
                         <MessageSquare size={14} /> Message
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
