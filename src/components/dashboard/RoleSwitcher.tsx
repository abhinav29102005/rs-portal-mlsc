"use client";

import { useSession, SessionProvider } from "next-auth/react";
import { useState } from "react";
import { Loader2, ArrowRightLeft } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: string;
}

function RoleSwitcherInner({ currentRole }: RoleSwitcherProps) {
  const { update } = useSession();
  const [isPending, setIsPending] = useState(false);

  const handleSwitch = async (role: string) => {
    if (role === currentRole) return;
    
    setIsPending(true);
    // Update the JWT cookie with the new role
    await update({ role });
    // Force a hard reload so all server components refetch with the new role
    window.location.href = "/dashboard";
  };

  return (
    <div className="px-3 py-2 mt-2 bg-red-500/10 rounded-lg border border-red-500/20">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-500 uppercase tracking-wider">
        <ArrowRightLeft size={12} />
        Admin Immersive Mode
      </div>
      <p className="text-[10px] text-red-500/70 mb-3 leading-tight">
        Temporarily view the portal as a different user role.
      </p>
      
      <div className="space-y-1">
        {["student", "faculty", "admin"].map((role) => (
          <button
            key={role}
            onClick={() => handleSwitch(role)}
            disabled={isPending || role === currentRole}
            className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between ${
              role === currentRole 
                ? "bg-red-500 text-noir-950" 
                : "text-red-400 hover:bg-red-500/10"
            }`}
          >
            <span className="capitalize">{role}</span>
            {isPending && role !== currentRole && <Loader2 size={12} className="animate-spin" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  return (
    <SessionProvider>
      <RoleSwitcherInner currentRole={currentRole} />
    </SessionProvider>
  );
}
