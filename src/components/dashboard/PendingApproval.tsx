"use client";

import { motion } from "framer-motion";
import { Clock, Mail, ShieldCheck } from "lucide-react";

interface PendingUser {
  name?: string | null;
  email?: string | null;
}

export function PendingApproval({ user }: { user: PendingUser }) {
  return (
    <div className="max-w-lg mx-auto mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glass p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <Clock size={28} className="text-amber-400" />
        </div>

        <h1
          className="heading-2 text-noir-50 mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Pending Approval
        </h1>

        <p className="text-noir-300 mb-6 leading-relaxed">
          Your faculty account is being verified against the TIET directory. This
          typically takes 24–48 hours. You&apos;ll receive an email once approved.
        </p>

        <div className="card-glass-static p-4 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-noir-400 flex-shrink-0" />
            <p className="text-sm text-noir-300">
              Registered as{" "}
              <span className="text-amber-400 font-medium">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-noir-400 flex-shrink-0" />
            <p className="text-sm text-noir-300">
              Admin verification in progress
            </p>
          </div>
        </div>

        <p className="text-xs text-noir-500 mt-6">
          Contact the IT admin if this takes longer than expected.
        </p>
      </motion.div>
    </div>
  );
}
