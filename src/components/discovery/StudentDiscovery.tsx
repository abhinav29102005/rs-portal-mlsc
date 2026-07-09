"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Users, GraduationCap, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { DEPARTMENTS } from "@/db/seed/taxonomy";
import Image from "next/image";
import Link from "next/link";
import { toggleShortlistCandidate } from "@/app/actions/shortlists";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export type StudentData = {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  department: string | null;
  program: string | null;
  batchYear: number | null;
  cgpa: number | null;
  bio: string | null;
  preferredEngagement: string[] | null;
  domains: string[] | null;
  technicalStack: string[] | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isSaved: boolean;
};

export function StudentDiscovery({ initialStudents }: { initialStudents: StudentData[] }) {
  const [students, setStudents] = useState<StudentData[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedBatchYears, setSelectedBatchYears] = useState<number[]>([]);
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    initialStudents.forEach((s) => {
      if (s.technicalStack) {
        s.technicalStack.forEach((skill) => skills.add(skill));
      }
    });
    return Array.from(skills).sort();
  }, [initialStudents]);

  const allBatchYears = useMemo(() => {
    const years = new Set<number>();
    initialStudents.forEach((s) => {
      if (s.batchYear) {
        years.add(s.batchYear);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [initialStudents]);

  const allDomains = useMemo(() => {
    const domainsSet = new Set<string>();
    initialStudents.forEach((s) => {
      if (s.domains) {
        s.domains.forEach(d => domainsSet.add(d));
      }
    });
    return Array.from(domainsSet).sort();
  }, [initialStudents]);

  const filteredStudents = students.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !s.name?.toLowerCase().includes(q) &&
        !s.department?.toLowerCase().includes(q) &&
        !s.technicalStack?.some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }
    if (selectedDepts.length > 0 && (!s.department || !selectedDepts.includes(s.department))) return false;
    if (selectedBatchYears.length > 0 && (!s.batchYear || !selectedBatchYears.includes(s.batchYear))) return false;
    if (minCgpa > 0 && (s.cgpa || 0) < minCgpa) return false;
    if (selectedSkills.length > 0 && (!s.technicalStack || !selectedSkills.some(skill => s.technicalStack!.includes(skill)))) return false;
    if (selectedDomains.length > 0 && (!s.domains || !selectedDomains.some(d => s.domains!.includes(d)))) return false;
    return true;
  });

  const handleToggleShortlist = async (studentId: string) => {
    // Optimistic UI update
    setStudents(current =>
      current.map(s => s.id === studentId ? { ...s, isSaved: !s.isSaved } : s)
    );
    await toggleShortlistCandidate(studentId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users size={20} className="text-red-400" />
            <p className="text-label">Recruitment</p>
          </div>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Discover{" "}
            <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              Students
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Browse through student profiles who are actively seeking research opportunities. 
            Filter by CGPA, skills, and batch year.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/shortlists" className="btn btn-secondary bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
            <BookmarkCheck size={16} /> View Shortlist
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
          <input
            type="text"
            placeholder="Search by name, department, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-noir !pl-10 py-2.5"
            id="student-search"
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
            <div className="card-glass-static p-5 space-y-6">
              {/* Department Filter (Multi-select via checkboxes) */}
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
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Domains Filter */}
              {allDomains.length > 0 && (
                <div>
                  <label className="text-label block mb-3">Research Domains</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {allDomains.map((domain) => (
                      <label key={domain} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDomains.includes(domain)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDomains([...selectedDomains, domain]);
                            else setSelectedDomains(selectedDomains.filter(d => d !== domain));
                          }}
                          className="w-4 h-4 rounded border-gray-300 bg-white text-red-600 focus:ring-red-500 focus:ring-offset-white"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">{domain}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Filter */}
              {allSkills.length > 0 && (
                <div>
                  <label className="text-label block mb-3">Skills & Tech Stack</label>
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

              {/* Batch Year Filter */}
              {allBatchYears.length > 0 && (
                <div>
                  <label className="text-label block mb-3">Batch Years</label>
                  <div className="flex flex-wrap gap-2">
                    {allBatchYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          if (selectedBatchYears.includes(y)) {
                            setSelectedBatchYears(selectedBatchYears.filter(year => year !== y));
                          } else {
                            setSelectedBatchYears([...selectedBatchYears, y]);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedBatchYears.includes(y)
                            ? "bg-red-500/20 border-red-500 text-red-400"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CGPA Filter */}
              <div>
                <label className="text-label block mb-2">Min CGPA ({minCgpa.toFixed(1)})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  id="cgpa-filter"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedDepts([]);
                  setSelectedSkills([]);
                  setSelectedDomains([]);
                  setSelectedBatchYears([]);
                  setMinCgpa(0);
                  setSearchQuery("");
                }}
                className="btn btn-ghost btn-sm w-full text-noir-400 hover:text-white"
              >
                Clear all filters
              </button>
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
              {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredStudents.map((student) => (
                <motion.div variants={itemVariants} key={student.id} className="card-glass p-6 flex flex-col hover:border-red-500/30 transition-colors group relative">
                  {/* Shortlist Action Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => handleToggleShortlist(student.id)}
                      className={`p-2 rounded-xl transition-all ${
                        student.isSaved 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-400' 
                          : 'bg-white/5 text-noir-400 hover:bg-white/10 hover:text-noir-200'
                      }`}
                      title={student.isSaved ? "Remove from Shortlist" : "Add to Shortlist"}
                    >
                      {student.isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-noir-800 ring-2 ring-red-500/10 relative flex-shrink-0">
                        {student.image ? (
                          <Image src={student.image} alt={student.name || "Student"} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-red-400 font-heading">
                            {student.name?.[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div className="pr-10">
                        <h3 className="text-lg font-bold text-noir-50">{student.name}</h3>
                        <p className="text-xs text-noir-400 font-medium">
                          {student.program} {student.batchYear ? `'${String(student.batchYear).slice(2)}` : ''} • {student.department}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-noir-900/50 border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-noir-400 uppercase tracking-widest mb-1">CGPA</p>
                          <p className="font-medium text-noir-100">{student.cgpa ? student.cgpa.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="bg-noir-900/50 border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-noir-400 uppercase tracking-widest mb-1">Interests</p>
                          <p className="font-medium text-noir-100 truncate">
                            {student.preferredEngagement && student.preferredEngagement.length > 0 ? student.preferredEngagement[0] : "General"}
                          </p>
                        </div>
                    </div>
                    
                    {student.technicalStack && student.technicalStack.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {student.technicalStack.slice(0, 4).map(skill => (
                          <span key={skill} className="badge badge-outline">{skill}</span>
                        ))}
                        {student.technicalStack.length > 4 && (
                          <span className="badge badge-outline">+{student.technicalStack.length - 4}</span>
                        )}
                      </div>
                    )}

                    {student.bio && (
                      <p className="text-xs text-noir-400 mt-2 line-clamp-2 leading-relaxed">
                        "{student.bio}"
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                    <Link href={`/messages/new?to=${student.userId}`} className="btn btn-secondary flex-1 py-2 text-xs">
                      Message Student
                    </Link>
                    {student.githubUrl && (
                      <a href={student.githubUrl} target="_blank" rel="noreferrer" className="btn btn-ghost bg-white/5 py-2 px-3 text-noir-300 hover:text-white" title="GitHub">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {student.linkedinUrl && (
                      <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-ghost bg-white/5 py-2 px-3 text-noir-300 hover:text-[#0a66c2]" title="LinkedIn">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-glass-static p-12 text-center">
              <Users size={40} className="text-noir-500 mx-auto mb-4" />
              <p className="text-noir-300 text-lg font-medium">No students found</p>
              <p className="text-noir-500 text-sm mt-2">
                Try adjusting your filters to find more candidates.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
