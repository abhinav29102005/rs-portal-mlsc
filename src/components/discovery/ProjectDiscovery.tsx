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
  domain: string | null;
  skills: string[] | null;
};

export function ProjectDiscovery({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const PROJECT_TYPES = ["Capstone Project", "Thapar Project", "Research Opportunity"];
  const [selectedSkill, setSelectedSkill] = useState("");

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
        !(p.description && p.description.toLowerCase().includes(q)) &&
        !(p.facultyName && p.facultyName.toLowerCase().includes(q))
      ) {
        return false;
      }
    }

    if (selectedDept) {
      const dept = p.department || "Other / Interdisciplinary";
      if (dept !== selectedDept) return false;
    }

    if (selectedProjectType) {
      if (p.engagementType !== selectedProjectType) return false;
    }

    if (selectedSkill) {
      if (!p.skills) return false;
      if (!p.skills.includes(selectedSkill)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">


      <div className="flex flex-col gap-6 mt-6">
        {/* Permanent Top Filter Bar (Thinner) */}
        <div className="card-glass-static p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-noir !pl-9 py-1.5 text-sm"
              />
            </div>

            {/* Department Dropdown */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="Other / Interdisciplinary">Other / Interdisciplinary</option>
            </select>

            {/* Project Type Dropdown */}
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Types</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            
            {/* Skills Dropdown */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            {/* Clear Button */}
            <div className="flex justify-end lg:justify-start">
              {(searchQuery || selectedDept || selectedProjectType || selectedSkill) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedProjectType("");
                    setSelectedSkill("");
                    setSearchQuery("");
                  }}
                  className="btn btn-ghost py-1 px-3 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 min-w-0"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-noir-400 font-medium">
              {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="card-glass-static p-12 text-center border border-white/5">
              <Search size={32} className="text-noir-500 mx-auto mb-3" />
              <p className="text-noir-300 font-medium">No projects match your filters</p>
              <p className="text-xs text-noir-500 mt-1">Try adjusting your search criteria or clearing filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="card-glass p-6 group hover:border-red-500/30 transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <Link href={`/openings/${project.id}`}>
                          <h2 className="text-xl font-bold text-noir-50 group-hover:text-red-400 transition-colors">
                            {project.title}
                          </h2>
                        </Link>
                        {project.facultyName && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-noir-300">
                            <span className="font-medium">{project.facultyName}</span>
                            <span className="text-noir-500">•</span>
                            <span>{project.department}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="badge badge-neutral bg-red-500/10 text-red-400 border-red-500/20">
                          {project.engagementType || "Project"}
                        </span>
                        {project.seatsAvailable ? (
                          <span className="badge badge-neutral">
                            {project.seatsAvailable} Seat{project.seatsAvailable > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-sm text-noir-300 line-clamp-2 mt-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-noir-400">
                      {project.duration && (
                        <div className="flex items-center gap-1.5 bg-noir-800/50 px-2 py-1 rounded">
                          <Calendar size={14} className="text-noir-500" />
                          {project.duration}
                        </div>
                      )}
                      {(project.stipendType && project.stipendType !== "None") && (
                        <div className="flex items-center gap-1.5 bg-noir-800/50 px-2 py-1 rounded">
                          <Briefcase size={14} className="text-noir-500" />
                          {project.stipendType} {project.stipendAmount ? `• ${project.stipendAmount}` : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-auto md:border-l md:border-white/5 md:pl-6 pt-4 md:pt-0 flex flex-col gap-3 shrink-0">
                    <Link
                      href={`/openings/${project.id}`}
                      className="btn btn-primary w-full text-sm py-2 px-6 shadow-red-500/20 shadow-lg"
                    >
                      View Details <ExternalLink size={14} className="ml-1 opacity-70" />
                    </Link>
                    
                    {project.skills && project.skills.length > 0 && (
                      <div className="mt-2 hidden md:block">
                        <p className="text-[10px] uppercase tracking-wider text-noir-500 font-bold mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {project.skills.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-noir-800 text-noir-300 border border-white/5">
                              {s}
                            </span>
                          ))}
                          {project.skills.length > 3 && (
                            <span className="text-[11px] px-2 py-0.5 text-noir-500">+{project.skills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
