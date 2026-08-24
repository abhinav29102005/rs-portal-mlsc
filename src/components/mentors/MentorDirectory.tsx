"use client";

import { useState, useMemo } from "react";
import { Users, Building2, GraduationCap, ArrowUpRight, Mail, Calendar, X, Clock, Search, Filter, SlidersHorizontal } from "lucide-react";
import { DEPARTMENTS } from "@/db/seed/taxonomy";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TimetableGrid, OfficeHour } from "@/components/ui/TimetableGrid";

export type MentorData = {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  department: string | null;
  designation: string | null;
  company: string | null;
  type: string;
  mentorshipDomains: any;
  linkedinUrl: string | null;
  bio: string | null;
  graduationYear: number | null;
  officeHours: any;
  projectOpenings?: number;
  capstoneOpenings?: number;
  engagementTypes?: string[];
};

const PROJECT_TYPES = [
  "Capstone Project",
  "Thapar Project",
  "Research Opportunity"
];

export function MentorDirectory({ initialMentors }: { initialMentors: MentorData[] }) {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);

  const allDomains = useMemo(() => {
    const domains = new Set<string>();
    initialMentors.forEach(m => {
      if (m.mentorshipDomains && Array.isArray(m.mentorshipDomains)) {
        m.mentorshipDomains.forEach(d => domains.add(d));
      }
    });
    return Array.from(domains).sort();
  }, [initialMentors]);

  const parseOfficeHours = (raw: any): OfficeHour[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const isAvailableNow = (hours: OfficeHour[]) => {
    if (hours.length === 0) return false;
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return hours.some(h => {
      if (h.day !== currentDay) return false;
      const [startH, startM] = h.startTime.split(":");
      const startMinutes = Number(startH) * 60 + Number(startM);
      const [endH, endM] = h.endTime.split(":");
      const endMinutes = Number(endH) * 60 + Number(endM);
      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  };

  const filteredMentors = initialMentors.filter(mentor => {
    if (showAvailableOnly) {
      if (mentor.type !== "faculty") return false;
      const hours = parseOfficeHours(mentor.officeHours);
      if (!isAvailableNow(hours)) return false;
    }

    if (acceptingOnly) {
      if (mentor.type !== "faculty") return false;
      if (!mentor.projectOpenings || mentor.projectOpenings === 0) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !(mentor.name && mentor.name.toLowerCase().includes(q)) &&
        !(mentor.company && mentor.company.toLowerCase().includes(q)) &&
        !(mentor.bio && mentor.bio.toLowerCase().includes(q))
      ) {
        return false;
      }
    }

    if (selectedDept) {
      const dept = mentor.department || "Other / Interdisciplinary";
      if (dept !== selectedDept) return false;
    }
    
    if (selectedDomain) {
      if (!mentor.mentorshipDomains || !Array.isArray(mentor.mentorshipDomains)) return false;
      if (!mentor.mentorshipDomains.includes(selectedDomain)) return false;
    }

    if (selectedProjectType) {
      if (mentor.type !== "faculty") return false;
      if (!mentor.engagementTypes) return false;
      if (!mentor.engagementTypes.includes(selectedProjectType)) return false;
    }

    return true;
  });

  const groupedByDept = filteredMentors.reduce((acc, mentor) => {
    const dept = mentor.department || "Other / Interdisciplinary";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(mentor);
    return acc;
  }, {} as Record<string, MentorData[]>);

  const sortedDepts = Object.keys(groupedByDept).sort();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-label mb-1">Network</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Discover <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Faculty</span>
        </h1>
        <p className="text-noir-400 mt-2 max-w-2xl">
          Connect with TIET faculty and alumni working in industry and academia. Browse by department, research domain, and open projects.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Permanent Top Filter Bar (Thinner) */}
        <div className="card-glass-static p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
              <input
                type="text"
                placeholder="Search name, bio..."
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

            {/* Domain Dropdown */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Domains</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
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
            
            {/* Toggles & Clear */}
            <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
              <label className="flex items-center gap-2 cursor-pointer group" title="Only show faculty accepting students">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-4 rounded-full transition-colors ${acceptingOnly ? "bg-red-500" : "bg-noir-600"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${acceptingOnly ? "translate-x-4 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <span className="text-xs font-medium text-noir-200 group-hover:text-red-400 transition-colors whitespace-nowrap hidden lg:block xl:hidden">Accepting</span>
                <span className="text-xs font-medium text-noir-200 group-hover:text-red-400 transition-colors whitespace-nowrap lg:hidden xl:block">Accepting students</span>
              </label>

              {(searchQuery || selectedDept || selectedDomain || selectedProjectType || acceptingOnly) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedDomain("");
                    setSelectedProjectType("");
                    setAcceptingOnly(false);
                    setSearchQuery("");
                  }}
                  className="btn btn-ghost py-1 px-2 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-noir-400 font-medium">
              {filteredMentors.length} profile{filteredMentors.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredMentors.length === 0 ? (
            <div className="card-glass-static p-12 text-center border border-white/5">
              <Search size={32} className="text-noir-500 mx-auto mb-3" />
              <p className="text-noir-300 font-medium">No profiles match your filters</p>
              <p className="text-xs text-noir-500 mt-1">Try adjusting your search criteria or clearing filters.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDepts.map(dept => {
                const mentorsInDept = groupedByDept[dept];
                const groupedByDesig = mentorsInDept.reduce((acc, mentor) => {
                  const desig = mentor.designation || mentor.type || "Other";
                  if (!acc[desig]) acc[desig] = [];
                  acc[desig].push(mentor);
                  return acc;
                }, {} as Record<string, MentorData[]>);

                const sortedDesigs = Object.keys(groupedByDesig).sort((a, b) => {
                  if (a === "Professor") return -1;
                  if (b === "Professor") return 1;
                  if (a === "Associate Professor") return -1;
                  if (b === "Associate Professor") return 1;
                  if (a === "Assistant Professor") return -1;
                  if (b === "Assistant Professor") return 1;
                  return a.localeCompare(b);
                });

                return (
                  <section key={dept} className="space-y-6">
                    <div className="border-b border-white/10 pb-2">
                      <h2 className="text-2xl font-bold text-noir-50 font-heading tracking-tight">{dept}</h2>
                    </div>

                    <div className="space-y-8">
                      {sortedDesigs.map(desig => (
                        <div key={desig} className="space-y-4">
                          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">{desig}</h3>
                          
                          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {groupedByDesig[desig].map(mentor => {
                              const hours = parseOfficeHours(mentor.officeHours);
                              const isAvailable = isAvailableNow(hours);

                              return (
                                <div key={mentor.id} className="card-glass p-6 flex flex-col h-full min-w-0 break-words hover:border-red-500/30 transition-colors relative">
                                  {isAvailable && (
                                    <span className="absolute -top-2 -left-2 flex h-4 w-4 z-10">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                                    </span>
                                  )}
                                  {mentor.type === "faculty" && mentor.capstoneOpenings !== undefined && (
                                    <span className="absolute top-4 right-4 bg-red-500/10 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-full text-red-400">
                                      Capstone Openings: {mentor.capstoneOpenings}/4
                                    </span>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-noir-800 ring-2 ring-red-500/10 relative flex-shrink-0">
                                        {mentor.image ? (
                                          <Image src={mentor.image} alt={mentor.name || "Mentor"} fill className="object-cover" unoptimized />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-red-400 font-heading">
                                            {mentor.name?.[0] || "?"}
                                          </div>
                                        )}
                                      </div>
                                      <div className="pr-12">
                                        <h3 className="text-lg font-bold text-noir-50 hover:text-red-400 transition-colors truncate">
                                          {mentor.type === "faculty" ? (
                                            <Link href={`/discover/faculty/${mentor.userId}`}>{mentor.name}</Link>
                                          ) : (
                                            mentor.name
                                          )}
                                        </h3>
                                        <p className="text-xs text-noir-400 font-medium capitalize truncate">
                                          {mentor.type} Mentor
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-2 mt-4 text-sm">
                                      {mentor.company && (
                                        <div className="flex items-start gap-2 text-noir-300">
                                          <Building2 size={16} className="text-noir-500 mt-0.5 flex-shrink-0" />
                                          <span className="truncate">
                                            At <span className="text-noir-100 font-medium">{mentor.company}</span>
                                          </span>
                                        </div>
                                      )}

                                      {mentor.graduationYear && (
                                        <div className="flex items-center gap-2 text-noir-400">
                                          <GraduationCap size={16} className="text-noir-500 flex-shrink-0" />
                                          <span>Class of {mentor.graduationYear}</span>
                                        </div>
                                      )}
                                    </div>

                                    {mentor.bio && (
                                      <p className="text-xs text-noir-400 mt-4 line-clamp-2 leading-relaxed">
                                        "{mentor.bio}"
                                      </p>
                                    )}

                                    {mentor.mentorshipDomains && (mentor.mentorshipDomains as string[]).length > 0 && (
                                      <div className="mt-4 flex flex-wrap gap-1.5">
                                        {(mentor.mentorshipDomains as string[]).slice(0, 3).map((domain: string) => (
                                          <span key={domain} className="badge badge-red">
                                            {domain}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-gray-100/10">
                                    {mentor.type === "faculty" && (
                                      <div className="text-xs font-semibold text-noir-300 mb-1">
                                        Project Openings: {mentor.projectOpenings || 0}
                                      </div>
                                    )}
                                    {mentor.type === "faculty" && hours.length > 0 && (
                                      <button onClick={() => setSelectedMentor(mentor)} className="w-full btn btn-ghost bg-noir-800 border border-white/5 py-2 text-xs text-noir-200 hover:text-red-400 flex items-center justify-center gap-2">
                                        <Calendar size={14} /> View Timetable
                                      </button>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Link href={`/messages/new?to=${mentor.userId}`} className="btn btn-primary flex-1 py-2 text-xs">
                                        <Mail size={14} /> Message
                                      </Link>
                                      {mentor.linkedinUrl && (
                                        <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary py-2 px-3 group" title="LinkedIn Profile">
                                          <ArrowUpRight size={14} className="group-hover:text-red-400" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Timetable Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMentor(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-noir-950 border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-noir-50">{selectedMentor.name}'s Timetable</h2>
                  <p className="text-sm text-noir-400">Weekly availability for mentorship and office hours.</p>
                </div>
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="p-2 text-noir-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <TimetableGrid officeHours={parseOfficeHours(selectedMentor.officeHours)} editMode={false} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
