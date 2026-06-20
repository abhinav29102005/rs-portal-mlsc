"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, GraduationCap, FolderOpen, BarChart3, CheckCircle, XCircle, Search, MoreVertical, Ban, Trash2, Database, Power } from "lucide-react";
import Image from "next/image";
import { approveFaculty, rejectFaculty, suspendUser, activateUser, deleteUser } from "@/app/actions/admin";
import { useTransition, useState } from "react";
interface DashboardUser {
  name?: string | null;
  role: string;
}

interface PendingFaculty {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
}

interface PlatformUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
}

interface AdminDashboardProps {
  user: DashboardUser;
  stats: {
    students: number;
    faculty: number;
    pending: number;
    activeProjects: number;
  };
  pendingFaculty: PendingFaculty[];
  allUsers?: PlatformUser[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const } },
};

export function AdminDashboard({ user, stats, pendingFaculty, allUsers = [] }: AdminDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "system">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveFaculty(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectFaculty(id);
    });
  };

  const handleSuspend = (id: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;
    startTransition(async () => {
      await suspendUser(id);
    });
  };

  const handleActivate = (id: string) => {
    startTransition(async () => {
      await activateUser(id);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteUser(id);
    });
  };

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck size={20} className="text-rose-400" />
            <p className="text-label">Admin Dashboard</p>
          </div>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Platform{" "}
            <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-noir-900 p-1 rounded-xl ring-1 ring-white/5">
          {[
            { id: "overview", label: "Overview" },
            { id: "users", label: "User Management" },
            { id: "system", label: "System Controls" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-noir-800 text-amber-400 shadow-sm ring-1 ring-white/5" 
                  : "text-noir-400 hover:text-noir-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <GraduationCap size={18} />, label: "Students", value: stats.students.toString(), color: "teal" },
                { icon: <Users size={18} />, label: "Faculty", value: stats.faculty.toString(), color: "amber" },
                { icon: <ShieldCheck size={18} />, label: "Pending Approvals", value: stats.pending.toString(), color: "rose" },
                { icon: <FolderOpen size={18} />, label: "Active Projects", value: stats.activeProjects.toString(), color: "sky" },
              ].map((stat) => (
                <div key={stat.label} className="card-glass p-5">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-4`}>
                    <span className={`text-${stat.color}-400`}>{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-noir-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Pending Faculty Approvals */}
            <motion.div variants={itemVariants}>
              <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Pending Faculty Approvals
              </h2>
              {pendingFaculty.length > 0 ? (
                <div className="space-y-3">
                  {pendingFaculty.map((faculty) => (
                    <div key={faculty.id} className="card-glass p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-noir-800 ring-2 ring-amber-500/20">
                          {faculty.image ? (
                            <Image src={faculty.image} alt={faculty.name || "Avatar"} width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-amber-400">
                              {faculty.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-noir-50">{faculty.name}</h3>
                          <p className="text-xs text-noir-400">{faculty.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button 
                          onClick={() => handleReject(faculty.id)}
                          disabled={isPending}
                          className="btn btn-ghost btn-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <XCircle size={16} className="mr-1.5" />
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(faculty.id)}
                          disabled={isPending}
                          className="btn btn-secondary btn-sm border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                          <CheckCircle size={16} className="mr-1.5" />
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-glass-static p-8 text-center">
                  <ShieldCheck size={32} className="text-noir-500 mx-auto mb-3" />
                  <p className="text-noir-400 text-sm">No pending approvals at this time</p>
                </div>
              )}
            </motion.div>
          </>
        )}

        {activeTab === "users" && (
          <motion.div variants={itemVariants} className="card-glass overflow-hidden">
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-noir-900/50">
              <h2 className="heading-3 text-noir-100" style={{ fontFamily: "var(--font-heading)" }}>
                User Management
              </h2>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-noir !pl-9 py-1.5 text-sm"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-noir-400 uppercase bg-noir-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-noir-400">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-noir-800 overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                              {u.image ? (
                                <Image src={u.image} alt={u.name || "User"} width={32} height={32} unoptimized className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-400">
                                  {u.name?.[0]?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-noir-50">{u.name || "Unknown"}</div>
                              <div className="text-xs text-noir-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            u.role === 'admin' ? 'badge-rose' : 
                            u.role === 'faculty' ? 'badge-amber' : 'badge-teal'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`status-pill ${
                            u.status === 'active' ? 'status-open' : 
                            u.status === 'suspended' ? 'status-closed' : 'status-pending'
                          }`}>
                            {u.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-noir-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status === "suspended" ? (
                              <button onClick={() => handleActivate(u.id)} disabled={isPending} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Activate User">
                                <CheckCircle size={16} />
                              </button>
                            ) : (
                              <button onClick={() => handleSuspend(u.id)} disabled={isPending} className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors" title="Suspend User">
                                <Ban size={16} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(u.id)} disabled={isPending} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "system" && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass p-6 border-amber-500/20">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-noir-50 font-heading mb-2">Faculty Scraper Pipeline</h3>
              <p className="text-sm text-noir-400 mb-6">
                Trigger the automated scraper to pull the latest faculty data from Thapar's engineering department websites. This will update existing profiles and create new ones.
              </p>
              <button disabled className="btn btn-primary w-full opacity-50 cursor-not-allowed">
                <Power size={18} />
                Run Pipeline (Locked)
              </button>
            </div>

            <div className="card-glass p-6 border-rose-500/20">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-noir-50 font-heading mb-2">System Seed Utilities</h3>
              <p className="text-sm text-noir-400 mb-6">
                Manually trigger database seeding scripts for platform taxonomy (research domains, departments) and dummy proposals.
              </p>
              <button disabled className="btn btn-destructive w-full opacity-50 cursor-not-allowed">
                <Database size={18} />
                Run Seed (Locked)
              </button>
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
