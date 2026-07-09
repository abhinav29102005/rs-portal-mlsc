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
  skills: string[] | null;
};

export function ProjectDiscovery({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    initialProjects.forEach(p => {
      if (p.skills) {
        p.skills.forEach(s => skills.add(s));
      }
    });
    if (skills.size === 0) {
      ["Python", "Machine Learning", "React", "Data Analysis", "C++"].forEach(s => skills.add(s));
    }
    return Array.from(skills).sort();
  }, [initialProjects]);

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
    if (selectedDepts.length > 0 && (!p.department || !selectedDepts.includes(p.department))) return false;
    if (selectedEngagement && p.engagementType !== selectedEngagement) return false;
    if (selectedSkills.length > 0 && (!p.skills || !selectedSkills.some(s => p.skills!.includes(s)))) return false;
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
              <label className="text-label block mb-3">Departments</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {DEPARTMENTS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedDepts.includes(d)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDepts([...selectedDepts, d]);
                        else setSelectedDepts(selectedDepts.filter(dept => dept !== d));
                      }}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-red-600 focus:ring-red-500 focus:ring-offset-white"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Engagement Type Filter */}
            <div>
              <label className="text-label block mb-2">Engagement</label>
              <select
                value={selectedEngagement}
                onChange={(e) => setSelectedEngagement(e.target.value)}
                className="input-noir text-sm bg-white text-gray-900 border-gray-300"
              >
                <option value="">All Types</option>
                <option value="in_person">In-person</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div>
                <label className="text-label block mb-3">Skills Used</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {allSkills.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(s)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSkills([...selectedSkills, s]);
                          else setSelectedSkills(selectedSkills.filter(skill => skill !== s));
                        }}
                        className="w-4 h-4 rounded border-gray-300 bg-white text-red-600 focus:ring-red-500 focus:ring-offset-white"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchQuery || selectedDepts.length > 0 || selectedEngagement || selectedSkills.length > 0) && (
              <button
                onClick={() => {
                  setSelectedDepts([]);
                  setSelectedSkills([]);
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
