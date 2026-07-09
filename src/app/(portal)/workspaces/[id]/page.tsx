import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { workspaces, workspaceMembers, workspaceSupervisors, workspaceMilestones, workspaceFiles } from "@/db/schema/workspaces";
import { studentProfiles, facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
import { ChevronLeft, FolderOpen, CheckSquare, FileText, User as UserIcon, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const workspace = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.id, params.id)
  });
  return {
    title: `${workspace?.title || "Workspace"} — RAMP`,
  };
}

export default async function WorkspaceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.id, params.id)
  });

  if (!workspace) {
    return (
      <div className="card-glass-static p-12 text-center mt-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-red-400 mb-2 font-heading">Workspace Not Found</h1>
        <p className="text-noir-400 mb-6">The workspace you are looking for does not exist or you do not have access.</p>
        <Link href="/workspaces" className="btn btn-primary">Back to Workspaces</Link>
      </div>
    );
  }

  // Fetch Members
  const members = await db
    .select({
      role: workspaceMembers.role,
      user: users
    })
    .from(workspaceMembers)
    .innerJoin(studentProfiles, eq(workspaceMembers.studentProfileId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspace.id))
    .all();

  // Fetch Supervisors
  const supervisors = await db
    .select({
      role: workspaceSupervisors.role,
      user: users
    })
    .from(workspaceSupervisors)
    .innerJoin(users, eq(workspaceSupervisors.userId, users.id))
    .where(eq(workspaceSupervisors.workspaceId, workspace.id))
    .all();

  // Fetch Milestones
  const milestones = await db.query.workspaceMilestones.findMany({
    where: (m, { eq }) => eq(m.workspaceId, workspace.id),
    orderBy: (m, { desc }) => [desc(m.createdAt)]
  });

  // Fetch Files
  const files = await db.query.workspaceFiles.findMany({
    where: (f, { eq }) => eq(f.workspaceId, workspace.id),
    orderBy: (f, { desc }) => [desc(f.createdAt)]
  });

  const allTeam = [
    ...supervisors.map(s => ({ ...s, isSupervisor: true })),
    ...members.map(m => ({ ...m, isSupervisor: false }))
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/workspaces" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-red-400 transition-colors w-fit">
          <ChevronLeft size={16} /> Back to Workspaces
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-outline uppercase tracking-wider">{workspace.status}</span>
              <span className="text-sm text-noir-400 flex items-center gap-1.5">
                <Calendar size={14} /> Created {new Date(workspace.createdAt!).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-noir-50 font-heading tracking-tight mb-3">
              {workspace.title}
            </h1>
            <p className="text-noir-300 leading-relaxed max-w-3xl">
              {workspace.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Tasks and Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones */}
          <section className="card-glass p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-noir-50 font-heading flex items-center gap-2">
                <CheckSquare size={18} className="text-red-400" /> Milestones & Tasks
              </h2>
              <button className="btn btn-secondary text-xs px-3 py-1.5">+ Add Milestone</button>
            </div>
            
            {milestones.length === 0 ? (
              <div className="text-center py-8 border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-sm text-noir-400">No milestones created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map(m => (
                  <div key={m.id} className="p-4 rounded-xl border border-white/5 bg-noir-900/50 flex items-start gap-3">
                    <div className="mt-0.5">
                      {m.status === "completed" ? (
                        <CheckSquare size={16} className="text-red-400" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-noir-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${m.status === "completed" ? "text-noir-400 line-through" : "text-noir-100"}`}>
                        {m.title}
                      </p>
                      {m.dueDate && (
                        <p className="text-xs text-noir-400 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Files */}
          <section className="card-glass p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-noir-50 font-heading flex items-center gap-2">
                <FolderOpen size={18} className="text-red-400" /> Shared Files
              </h2>
              <button className="btn btn-secondary text-xs px-3 py-1.5">+ Upload File</button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8 border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-sm text-noir-400">No files uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map(f => (
                  <a href={f.fileUrl} target="_blank" rel="noreferrer" key={f.id} className="p-4 rounded-xl border border-white/5 bg-noir-900/50 flex items-center gap-3 hover:bg-white/5 transition-colors group">
                    <div className="p-2 rounded-lg bg-white/5 text-red-400 group-hover:bg-red-400/20 transition-colors">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-noir-100 truncate">{f.filename}</p>
                      <p className="text-xs text-noir-400">{new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Team Members */}
        <div className="space-y-6">
          <section className="card-glass p-6">
            <h2 className="text-lg font-bold text-noir-50 font-heading mb-6 flex items-center gap-2">
              <UserIcon size={18} className="text-red-400" /> Team Directory
            </h2>
            
            <div className="space-y-4">
              {allTeam.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-noir-800 relative flex-shrink-0">
                    {member.user.image ? (
                      <Image src={member.user.image} alt={member.user.name || "User"} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-noir-300">
                        {member.user.name?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-noir-50 truncate group-hover:text-red-400 transition-colors">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-noir-400 capitalize truncate">
                      {member.role.replace("_", " ")}
                    </p>
                  </div>
                  <Link href={`/messages/new?to=${member.user.id}`} className="p-2 rounded-lg text-noir-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Message">
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
