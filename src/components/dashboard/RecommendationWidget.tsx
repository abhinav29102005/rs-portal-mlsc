"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { ScoredMatch } from "@/lib/matching";

interface RecommendationWidgetProps {
  type: "student" | "faculty";
  recommendations: ScoredMatch<any>[];
}

export function RecommendationWidget({
  type,
  recommendations,
}: RecommendationWidgetProps) {
  if (recommendations.length === 0) return null;

  const isStudent = type === "student";

  return (
    <div className="card-glass p-6 border-amber-500/20 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Sparkles size={20} className="text-amber-400" />
        </div>
        <div>
          <h2
            className="heading-3 text-noir-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Recommended for You
          </h2>
          <p className="text-sm text-amber-400/80">
            Based on your {isStudent ? "skills and interests" : "research domains"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {recommendations.slice(0, 3).map((match, idx) => (
          <div
            key={idx}
            className="card-glass-static p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-noir-100 line-clamp-2">
                  {isStudent ? match.item.title : match.item.name}
                </h3>
                {isStudent ? (
                  <Briefcase size={16} className="text-amber-400 flex-shrink-0" />
                ) : (
                  <User size={16} className="text-amber-400 flex-shrink-0" />
                )}
              </div>
              
              {isStudent && match.item.department && (
                <span className="badge badge-amber text-[10px] mb-3">
                  {match.item.department}
                </span>
              )}

              {!isStudent && match.item.department && (
                <span className="badge badge-teal text-[10px] mb-3">
                  {match.item.department}
                </span>
              )}

              <div className="space-y-1 mb-4">
                {match.matchReasons.slice(0, 2).map((reason, i) => (
                  <p key={i} className="text-xs text-noir-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                    {reason}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.05]">
              <Link
                href={
                  isStudent
                    ? `/openings/${match.item.id}` // Assuming there's a details page or they go to openings
                    : `/discover/students?q=${encodeURIComponent(match.item.name)}`
                }
                className="flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 transition-colors group"
              >
                View Details
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
