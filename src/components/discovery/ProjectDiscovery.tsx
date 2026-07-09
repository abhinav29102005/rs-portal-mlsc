"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Briefcase, Calendar, ExternalLink, Users } from "lucide-react";
import React, { useState, useMemo } from "react";
import { DEPARTMENTS } from "@/db/seed/taxonomy";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export type ProjectData = {
  id: string;
  title: string;
  description: string;
  department: string | null;
  engagementType: string | null;
  stipendType: string | null;
  stipendAmount: string | null;
  seatsAvailable: number | null;
  duration: string | null;
  coMentors: any;
  facultyName: string | null;
  domain: string | null; // Using department or extracting a domain from description for now
};

export function ProjectDiscovery({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedEngagement, setSelectedEngagement] = useState("");

  const filteredProjects = initialProjects.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !(p.facultyName && p.facultyName.toLowerCase().includes(q))
      )
        return false;
    }
    if (selectedDept && p.department !== selectedDept) return false;
    if (selectedEngagement && p.engagementType !== selectedEngagement) return false;
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-6">
      {/* Filter Sidebar */}
      {showFilters && (
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-64 flex-shrink-0 space-y-5"
        >
          <div className="card-glass-static p-5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-noir-200 font-medium">
                <SlidersHorizontal size={18} className="text-red-400" />
                Filters
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="text-label block mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
                <input
                  type="text"
                  placeholder="Keywords, titles..."
                  className="input-noir pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="text-label block mb-2">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="input-noir text-sm"
              >
                <option value="" className="bg-noir-900 text-noir-50">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-noir-900 text-noir-50">{d}</option>
                ))}
              </select>
            </div>

            {/* Engagement Type Filter */}
            <div>
              <label className="text-label block mb-2">Engagement</label>
              <select
                value={selectedEngagement}
                onChange={(e) => setSelectedEngagement(e.target.value)}
                className="input-noir text-sm"
              >
                <option value="" className="bg-noir-900 text-noir-50">All Types</option>
                <option value="in_person" className="bg-noir-900 text-noir-50">In-person</option>
                <option value="remote" className="bg-noir-900 text-noir-50">Remote</option>
                <option value="hybrid" className="bg-noir-900 text-noir-50">Hybrid</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedDept || selectedEngagement) && (
              <button
                onClick={() => {
                  setSelectedDept("");
                  setSelectedEngagement("");
                  setSearchQuery("");
                }}
                className="w-full py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/20"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </motion.aside>
      )}

      {/* Results */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-6 min-w-0"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-noir-400 font-medium">
            {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} found
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden btn btn-secondary btn-sm flex items-center gap-2 ${
              showFilters ? "border-red-500/30 text-red-400" : ""
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((opening) => (
              <motion.div variants={itemVariants} key={opening.id}>
                <Link
                  href={`/openings/${opening.id}`}
                  className="card-glass p-5 space-y-3 group hover:border-red-500/30 transition-colors block h-full flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className="heading-3 text-noir-50 line-clamp-2 mb-1 group-hover:text-red-400 transition-colors"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {opening.title}
                      </h3>
                      <p className="text-sm text-red-400">{opening.facultyName || "Faculty Member"}</p>
                    </div>
                    <ExternalLink size={16} className="text-noir-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>

                  <p className="text-sm text-noir-400 line-clamp-3 flex-1">
                    {opening.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                    {opening.department && (
                      <span className="badge badge-red">{opening.department}</span>
                    )}
                    {opening.engagementType && (
                      <span className="badge badge-red">{opening.engagementType.replace("_", "-")}</span>
                    )}
                    {opening.stipendType && (
                      <span className="badge badge-red">
                        {opening.stipendType}
                        {opening.stipendAmount && ` — ${opening.stipendAmount}`}
                      </span>
                    )}
                    {opening.seatsAvailable && opening.seatsAvailable > 0 && (
                      <span className="badge badge-neutral">
                        {opening.seatsAvailable} seat{opening.seatsAvailable > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {opening.duration && (
                    <p className="text-xs text-noir-500 flex items-center gap-1 pt-2 border-t border-white/5 mt-2">
                      <Calendar size={12} />
                      {opening.duration}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card-glass-static p-12 text-center">
            <Briefcase size={40} className="text-noir-500 mx-auto mb-4" />
            <p className="text-noir-300">No open positions match your filters</p>
            <p className="text-noir-500 text-sm mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
