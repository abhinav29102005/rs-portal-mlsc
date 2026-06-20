"use client";

import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "student" | "faculty" | "admin" | "alumni_mentor";
  };
  notificationCount?: number;
}

import { ThemeToggle } from "@/components/ThemeToggle";
export function Topbar({ user, notificationCount = 0 }: TopbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roleBadge = {
    student: { label: "Student", class: "badge-teal" },
    faculty: { label: "Faculty", class: "badge-amber" },
    admin: { label: "Admin", class: "badge-rose" },
    alumni_mentor: { label: "Alumni Mentor", class: "badge-sky" },
  }[user.role];

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 z-30 flex items-center justify-between px-6 bg-noir-950/80 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400"
        />
        <input
          type="text"
          placeholder="Search faculty, students, domains..."
          className="input-noir !pl-10 py-2 text-sm"
          id="global-search"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon relative"
          id="notification-bell"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-noir-950 flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all"
            id="user-menu-button"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-noir-700 ring-2 ring-amber-500/20">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-400">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-noir-100 leading-tight">
                {user.name || "User"}
              </p>
              <p className="text-[11px] text-noir-400">{user.email}</p>
            </div>
            <ChevronDown size={14} className="text-noir-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 card-glass-static p-2 animate-fade-in">
              <div className="px-3 py-2 mb-1">
                <span className={`badge ${roleBadge.class}`}>
                  {roleBadge.label}
                </span>
              </div>
              <div className="h-px bg-white/[0.06] my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                id="sign-out-button"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
