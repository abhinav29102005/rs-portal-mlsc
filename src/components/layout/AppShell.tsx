"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ConstellationBackground } from "./ConstellationBackground";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "student" | "faculty" | "admin" | "alumni_mentor";
  };
  notificationCount?: number;
  isSuperAdmin?: boolean;
}

export function AppShell({ children, user, notificationCount, isSuperAdmin }: AppShellProps) {
  return (
    <div className="min-h-screen bg-noir-950">
      <ConstellationBackground />
      <Sidebar role={user.role} isSuperAdmin={isSuperAdmin} />
      <Topbar user={user} notificationCount={notificationCount} />
      <main className="ml-[260px] pt-16 min-h-screen relative z-10">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
