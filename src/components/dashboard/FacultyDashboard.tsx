"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Users,
  FolderOpen,
  Briefcase,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SeededReviewBanner } from "./SeededReviewBanner";
import { RecommendationWidget } from "./RecommendationWidget";
import { ScoredMatch } from "@/lib/matching";

interface DashboardUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

interface FacultyDashboardProps {
  user: DashboardUser;
  profileCompleteness?: number;
  hasSeededProfile?: boolean;
  seededOpeningsCount?: number;
  openPositions?: number;
  recommendations?: ScoredMatch<any>[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const } },
};

export function FacultyDashboard({
  user,
  profileCompleteness = 0,
  hasSeededProfile = false,
  seededOpeningsCount = 0,
  openPositions = 0,
  recommendations = [],
}: FacultyDashboardProps) {
  const firstName = user.name?.split(" ")[0] || "Professor";
  // Don't force "Dr." prefix if the actual name doesn't have it
  const greeting = user.name?.toLowerCase().startsWith("dr")
    ? firstName
    : `Dr. ${firstName}`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <Sparkles size={20} className="text-amber-400" />
          <p className="text-label">Faculty Dashboard</p>
        </div>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome,{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            {greeting}
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Manage your research openings and connect with students
        </p>
      </motion.div>

      {/* Seeded Data Review Banner */}
      {hasSeededProfile && (
        <motion.div variants={itemVariants}>
          <SeededReviewBanner
            hasSeededProfile={hasSeededProfile}
            seededOpeningsCount={seededOpeningsCount}
          />
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: <ClipboardList size={18} />, label: "Pending Proposals", value: 0, color: "amber" as const },
          { icon: <Users size={18} />, label: "Shortlisted Students", value: 0, color: "teal" as const },
          { icon: <FolderOpen size={18} />, label: "Active Workspaces", value: 0, color: "sky" as const },
          { icon: <Briefcase size={18} />, label: "Open Positions", value: openPositions, color: "rose" as const },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card-glass p-5 border border-${stat.color}-500/15`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-4`}>
              <span className={`text-${stat.color}-400`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-noir-50 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              {stat.value}
            </p>
            <p className="text-sm text-noir-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Recommendations Widget */}
      {recommendations && recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <RecommendationWidget type="faculty" recommendations={recommendations} />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <ClipboardList size={18} />,
              label: "Review Proposals",
              description: "Check incoming research proposals from students",
              href: "/proposals",
            },
            {
              icon: <Users size={18} />,
              label: "Discover Students",
              description: "Search and filter students by skills, domain, and year",
              href: "/discover/students",
            },
            {
              icon: <Briefcase size={18} />,
              label: "Post Opening",
              description: "Create a new research opportunity listing",
              href: "/openings/new",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="card-glass p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/8 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/15 transition-colors">
                  <span className="text-amber-400">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-noir-100 group-hover:text-amber-400 transition-colors">
                      {action.label}
                    </h3>
                    <ArrowUpRight size={14} className="text-noir-500 group-hover:text-amber-400 transition-all" />
                  </div>
                  <p className="text-xs text-noir-400 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Profile Completeness */}
      <motion.div variants={itemVariants}>
        <h2 className="heading-3 text-noir-100 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Profile Completeness
        </h2>
        <div className="card-glass-static p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-noir-300">
              {profileCompleteness < 30
                ? "Your profile is just getting started"
                : profileCompleteness < 70
                ? "Your profile is taking shape"
                : profileCompleteness < 100
                ? "Almost there — add a few more details"
                : "Your profile is complete!"}
            </p>
            <span className="text-amber-400 font-bold text-lg">{profileCompleteness}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${profileCompleteness}%` }} />
          </div>
          {profileCompleteness < 100 && (
            <p className="text-xs text-noir-500 mt-3">
              <Link href="/portfolio" className="text-amber-400/70 hover:text-amber-400 transition-colors">
                Add your bio, research interests, and office hours
              </Link>{" "}
              to help students find you
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
