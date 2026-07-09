"use client";

import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { DEPARTMENTS } from "@/db/seed/taxonomy";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type FacultyData = {
  id: string;
  name: string;
  designation: string;
  department: string;
  researchTags: string[];
  mentoringStyle: string[];
  minimumCgpa: number | null;
  openings: number;
  isAccepting: boolean;
  image: string | null;
};

import Link from "next/link";

import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

function FacultyCard({ faculty }: { faculty: FacultyData }) {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[1][0]; // First letter of last name, or adjust as needed
    }
    return name[0];
  };

  return (
    <Link href={`/discover/faculty/${faculty.id}`}>
      <motion.div variants={itemVariants} className="card-glass p-8 flex gap-6 hover:border-red-500/50 hover:bg-white/[0.02] cursor-pointer">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ring-2 ring-red-500/10 overflow-hidden relative">
          <ImageWithFallback 
            src={faculty.image || ""} 
            fallbackText={getInitials(faculty.name)} 
            alt={faculty.name} 
            fill 
            className="object-cover" 
            sizes="56px" 
            unoptimized 
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-noir-50 hover:text-red-400 transition-colors">
                {faculty.name}
              </h3>
              <p className="text-xs text-noir-400 mt-0.5">
                {faculty.designation} · {faculty.department}
              </p>
            </div>

            {/* Status pill */}
            <span
              className={`status-pill flex-shrink-0 ${
                faculty.isAccepting ? "status-open" : "status-closed"
              }`}
            >
              {faculty.isAccepting ? "Open" : "Not accepting"}
            </span>
          </div>

          {/* Research tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {faculty.researchTags.map((tag) => (
              <span key={tag} className="badge badge-red">
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-5 mt-5 text-sm text-noir-400">
            {faculty.openings > 0 && (
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-red-500" />
                <span className="text-red-400 font-medium">
                  {faculty.openings} opening{faculty.openings > 1 ? "s" : ""}
                </span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function FacultyDiscovery({ initialFaculty }: { initialFaculty: FacultyData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const allSkills = React.useMemo(() => {
    const skills = new Set<string>();
    initialFaculty.forEach(f => {
      if (f.mentoringStyle) f.mentoringStyle.forEach(s => skills.add(s));
    });
    return Array.from(skills).sort();
  }, [initialFaculty]);

  const allDomains = React.useMemo(() => {
    const domains = new Set<string>();
    initialFaculty.forEach(f => {
      if (f.researchTags) f.researchTags.forEach(d => domains.add(d));
    });
    return Array.from(domains).sort();
  }, [initialFaculty]);

  const filteredFaculty = initialFaculty.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !f.name.toLowerCase().includes(q) &&
        !f.researchTags.some((t) => t.toLowerCase().includes(q)) &&
        !f.department.toLowerCase().includes(q) &&
        !(f.mentoringStyle && f.mentoringStyle.some(s => s.toLowerCase().includes(q)))
      )
        return false;
    }
    if (selectedDepts.length > 0 && f.department && !selectedDepts.includes(f.department)) return false;
    if (acceptingOnly && !f.isAccepting) return false;
    if (selectedSkills.length > 0 && (!f.mentoringStyle || !selectedSkills.some(s => f.mentoringStyle!.includes(s)))) return false;
    if (selectedDomains.length > 0 && (!f.researchTags || !selectedDomains.some(d => f.researchTags!.includes(d)))) return false;
    
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <GraduationCap size={20} className="text-red-400" />
          <p className="text-label">Faculty Discovery</p>
        </div>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Find Your{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Research Mentor
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Browse faculty profiles, filter by research domain, and connect for collaboration
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
          <input
            type="text"
            placeholder="Search by name, research area, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-noir !pl-10 py-2.5"
            id="faculty-search"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary flex items-center gap-2 ${
            showFilters ? "border-red-500/30 text-red-400" : ""
          }`}
          id="toggle-filters"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        {showFilters && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 flex-shrink-0 space-y-5"
          >
            <div className="card-glass-static p-5 space-y-6">              {/* Department Filter */}
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

              {/* Project Domain Filter */}
              {allDomains.length > 0 && (
                <div>
                  <label className="text-label block mb-3">Project Domain</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {allDomains.map((d) => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDomains.includes(d)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDomains([...selectedDomains, d]);
                            else setSelectedDomains(selectedDomains.filter(domain => domain !== d));
                          }}
                          className="w-4 h-4 rounded border-gray-300 bg-white text-red-600 focus:ring-red-500 focus:ring-offset-white"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentoring Style / Skills Filter */}
              {allSkills.length > 0 && (
                <div>
                  <label className="text-label block mb-3">Mentoring Style / Skills</label>
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

              {/* Accepting Students Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-noir-200 group-hover:text-red-400 transition-colors">Currently accepting</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={acceptingOnly}
                      onChange={(e) => setAcceptingOnly(e.target.checked)}
                      className="sr-only"
                      id="accepting-filter"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        acceptingOnly ? "bg-red-500" : "bg-noir-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                          acceptingOnly ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </div>
                </label>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedDepts.length > 0 || selectedSkills.length > 0 || selectedDomains.length > 0 || acceptingOnly) && (
                <button
                  onClick={() => {
                    setSelectedDepts([]);
                    setSelectedSkills([]);
                    setSelectedDomains([]);
                    setAcceptingOnly(false);
                    setSearchQuery("");
                  }}
                className="btn btn-ghost btn-sm w-full text-noir-400"
              >
                Clear all filters
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
          className="flex-1 space-y-10 min-w-0"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-noir-400 font-medium">
              {filteredFaculty.length} facult{filteredFaculty.length === 1 ? "y" : "y members"} found
            </p>
          </div>

          {filteredFaculty.length > 0 ? (
            filteredFaculty.map((faculty) => (
              <FacultyCard key={faculty.id} faculty={faculty} />
            ))
          ) : (
            <div className="card-glass-static p-12 text-center">
              <Search size={32} className="text-noir-500 mx-auto mb-3" />
              <p className="text-noir-400">No faculty match your filters</p>
              <p className="text-xs text-noir-500 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
