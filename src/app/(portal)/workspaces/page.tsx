export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { workspaces, workspaceMembers, workspaceSupervisors } from "@/db/schema/workspaces";
import { facultyProfiles, studentProfiles } from "@/db/schema/profiles";
import { eq, desc } from "drizzle-orm";
import { FolderOpen, ArrowUpRight, Users, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Workspaces — TIET Research Portal" };

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;
  let activeWorkspaces: any[] = [];

  if (role === "student") {
    const student = await db.query.studentProfiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId)
    });

    if (student) {
      activeWorkspaces = await db
        .select({ workspace: workspaces })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(eq(workspaceMembers.studentProfileId, student.id))
        .orderBy(desc(workspaces.createdAt))
        .all();
    }
  } else if (role === "faculty") {
    activeWorkspaces = await db
      .select({ workspace: workspaces })
      .from(workspaceSupervisors)
      .innerJoin(workspaces, eq(workspaceSupervisors.workspaceId, workspaces.id))
      .where(eq(workspaceSupervisors.userId, userId))
      .orderBy(desc(workspaces.createdAt))
      .all();
  }

  // Remove duplicates just in case (e.g. if a faculty is both a supervisor and creator)
  const uniqueWorkspaces = Array.from(new Map(activeWorkspaces.map(w => [w.workspace.id, w.workspace])).values());

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-label mb-1">Collaboration</p>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Project{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              Workspaces
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Manage your active research projects, collaborate with team members, and track milestones.
          </p>
        </div>
      </div>

      {uniqueWorkspaces.length === 0 ? (
        <div className="card-glass-static p-12 text-center mt-8">
          <FolderOpen size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300 text-lg font-medium">No active workspaces</p>
          <p className="text-noir-500 text-sm mt-2 max-w-md mx-auto">
            Workspaces are automatically generated when a research proposal is accepted. 
            {role === "student" ? " Browse faculty profiles to submit a new proposal." : " Review your pending proposals to get started."}
          </p>
          {role === "student" ? (
            <Link href="/discover/faculty" className="btn btn-primary mt-6 inline-flex mx-auto">
              Discover Faculty
            </Link>
          ) : (
            <Link href="/proposals" className="btn btn-primary mt-6 inline-flex mx-auto">
              Review Proposals
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {uniqueWorkspaces.map((w: any) => (
            <div key={w.id} className="card-glass p-6 flex flex-col group hover:border-teal-500/30 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link href={`/workspaces/${w.id}`} className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 hover:bg-teal-500/20">
                   <ArrowUpRight size={16} />
                 </Link>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded uppercase tracking-wider text-[10px] font-bold text-noir-300">
                    {w.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-noir-50 font-heading mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">
                  <Link href={`/workspaces/${w.id}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {w.title}
                  </Link>
                </h3>
                
                <p className="text-sm text-noir-400 line-clamp-3 mb-6 leading-relaxed">
                  {w.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-noir-400">
                 <div className="flex items-center gap-1.5">
                   <Clock size={14} />
                   Started {new Date(w.createdAt).toLocaleDateString()}
                 </div>
                 <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                   <Users size={14} />
                   View Team
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
