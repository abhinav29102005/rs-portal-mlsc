"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Search,
  FileText,
  FolderOpen,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  Briefcase,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Array<"student" | "faculty" | "admin" | "alumni_mentor">;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["student", "faculty", "admin", "alumni_mentor"],
  },
  {
    label: "My Portfolio",
    href: "/portfolio",
    icon: <User size={18} />,
    roles: ["student"],
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: <User size={18} />,
    roles: ["faculty", "alumni_mentor"],
  },
  {
    label: "Discover Faculty",
    href: "/discover/faculty",
    icon: <Search size={18} />,
    roles: ["student"],
  },
  {
    label: "Mentor Directory",
    href: "/mentors",
    icon: <GraduationCap size={18} />,
    roles: ["student"],
  },
  {
    label: "Discover Students",
    href: "/discover/students",
    icon: <Users size={18} />,
    roles: ["faculty", "alumni_mentor"],
  },
  {
    label: "Events & Seminars",
    href: "/events",
    icon: <Bell size={18} />,
    roles: ["student", "faculty", "admin", "alumni_mentor"],
  },
  {
    label: "Proposals",
    href: "/proposals",
    icon: <FileText size={18} />,
    roles: ["student", "faculty"],
  },
  {
    label: "Openings",
    href: "/openings",
    icon: <Briefcase size={18} />,
    roles: ["student", "faculty"],
  },
  {
    label: "Shortlists",
    href: "/shortlists",
    icon: <BookOpen size={18} />,
    roles: ["faculty"],
  },
  {
    label: "Workspaces",
    href: "/workspaces",
    icon: <FolderOpen size={18} />,
    roles: ["student", "faculty"],
  },
  {
    label: "Messages",
    href: "/messages",
    icon: <MessageSquare size={18} />,
    roles: ["student", "faculty", "alumni_mentor"],
  },
];

interface SidebarProps {
  role: "student" | "faculty" | "admin" | "alumni_mentor";
  isSuperAdmin?: boolean;
}

import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";

import Image from "next/image";

export function Sidebar({ role, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="bg-sidebar-gradient fixed left-0 top-0 h-screen w-[260px] z-40 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 shadow-lg shadow-amber-500/20">
          <Image
            src="/thapar-logo.png"
            alt="Thapar University Logo"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        <div>
          <h1
            className="text-sm font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            TIET Research
          </h1>
          <p className="text-[10px] text-noir-400 tracking-widest uppercase">
            Mentor Portal
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${
                  isActive
                    ? "text-amber-400 bg-amber-500/8"
                    : "text-noir-300 hover:text-noir-100 hover:bg-white/[0.03]"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={`transition-colors ${
                  isActive ? "text-amber-400" : "text-noir-400 group-hover:text-noir-200"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.04] space-y-2">
        {isSuperAdmin && (
          <RoleSwitcher currentRole={role} />
        )}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-noir-400 hover:text-noir-200 hover:bg-white/[0.03] transition-all"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
