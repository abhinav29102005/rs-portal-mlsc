"use client";

import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  Eye,
  Search,
  Briefcase,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { RecommendationWidget } from "./RecommendationWidget";
import { ScoredMatch } from "@/lib/matching";

interface DashboardUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const } },
};

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: "amber" | "teal" | "sky" | "rose";
}) {
  const colors = {
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/15",
    },
    teal: {
      bg: "bg-teal-500/10",
      text: "text-teal-400",
      border: "border-teal-500/15",
    },
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      border: "border-sky-500/15",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/15",
    },
  }[color];

  return (
    <div className={`card-glass p-5 border ${colors.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
        >
          <span className={colors.text}>{icon}</span>
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-noir-50 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </p>
      <p className="text-sm text-noir-400">{label}</p>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  description,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="card-glass p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/8 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/15 transition-colors">
          <span className="text-amber-400">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-noir-100 group-hover:text-amber-400 transition-colors">
              {label}
            </h3>
            <ArrowUpRight
              size={14}
              className="text-noir-500 group-hover:text-amber-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <p className="text-xs text-noir-400 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export function StudentDashboard({ 
  user,
  recommendations = [],
}: { 
  user: DashboardUser;
  recommendations?: ScoredMatch<any>[];
}) {
  const firstName = user.name?.split(" ")[0] || "there";

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
          <p className="text-label">Student Dashboard</p>
        </div>
        <h1
          className="heading-1 text-noir-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Here&apos;s an overview of your research journey
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={<FileText size={18} />}
          label="Active Proposals"
          value={0}
          color="amber"
        />
        <StatCard
          icon={<FolderOpen size={18} />}
          label="Workspaces"
          value={0}
          color="teal"
        />
        <StatCard
          icon={<Eye size={18} />}
          label="Profile Views"
          value={0}
          trend="+0%"
          color="sky"
        />
        <StatCard
          icon={<Briefcase size={18} />}
          label="Applications"
          value={0}
          color="rose"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2
          className="heading-3 text-noir-100 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={<Search size={18} />}
            label="Discover Faculty"
            description="Browse faculty profiles, filter by domain, and find your research mentor"
            href="/discover/faculty"
          />
          <QuickAction
            icon={<FileText size={18} />}
            label="Build Portfolio"
            description="Add projects, skills, papers, and experiences to your profile"
            href="/portfolio"
          />
          <QuickAction
            icon={<Briefcase size={18} />}
            label="Browse Openings"
            description="View active research opportunities posted by faculty"
            href="/openings"
          />
        </div>
      </motion.div>

      {/* Recommendations Widget */}
      {recommendations && recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <RecommendationWidget type="student" recommendations={recommendations} />
        </motion.div>
      )}

      {/* Recent Activity Placeholder */}
      <motion.div variants={itemVariants}>
        <h2
          className="heading-3 text-noir-100 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Recent Activity
        </h2>
        <div className="card-glass-static p-8 text-center">
          <BookOpen size={32} className="text-noir-500 mx-auto mb-3" />
          <p className="text-noir-400 text-sm">
            No activity yet. Start by exploring faculty profiles or building
            your portfolio.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
