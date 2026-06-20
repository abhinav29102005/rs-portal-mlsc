"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SeededReviewBannerProps {
  hasSeededProfile: boolean;
  seededOpeningsCount: number;
}

export function SeededReviewBanner({
  hasSeededProfile,
  seededOpeningsCount,
}: SeededReviewBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!hasSeededProfile || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative p-4 rounded-xl bg-sky-500/8 border border-sky-500/20"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 btn btn-ghost p-1"
        aria-label="Dismiss banner"
      >
        <X size={14} className="text-noir-500" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={16} className="text-sky-400" />
        </div>
        <div>
          <h4
            className="text-sm font-semibold text-noir-100 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your data was pre-loaded from the Summer 2026 call
          </h4>
          <p className="text-xs text-noir-400 mb-3">
            We&apos;ve imported your profile and{" "}
            {seededOpeningsCount > 0 ? (
              <>
                <strong className="text-sky-300">
                  {seededOpeningsCount} project
                  {seededOpeningsCount > 1 ? "s" : ""}
                </strong>{" "}
              </>
            ) : (
              "projects "
            )}
            from the ELC faculty project call. Please review and verify your
            details.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/portfolio"
              className="btn btn-sm btn-secondary gap-1"
            >
              Review Profile
              <ArrowRight size={12} />
            </Link>
            {seededOpeningsCount > 0 && (
              <Link
                href="/openings"
                className="btn btn-sm btn-ghost gap-1 text-sky-400"
              >
                Review Projects
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
