import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema/alumni";
import { facultyProfiles } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq, desc, sql } from "drizzle-orm";
import { Users, Building2, GraduationCap, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Mentors — TIET Research Portal" };

export default async function MentorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch Alumni Mentors
  const alumni = await db
    .select({
      id: alumniProfiles.id,
      userId: users.id,
      name: users.name,
      image: users.image,
      department: alumniProfiles.degreeProgram, // Treat degree program as department for grouping
      designation: alumniProfiles.currentRole,
      company: alumniProfiles.currentCompany,
      type: sql<string>`'alumni'`,
      mentorshipDomains: alumniProfiles.mentorshipDomains,
      linkedinUrl: alumniProfiles.linkedinUrl,
      bio: alumniProfiles.bio,
      graduationYear: alumniProfiles.graduationYear,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(alumniProfiles.willingToMentor, true))
    .orderBy(desc(alumniProfiles.createdAt))
    .all();

  // Fetch Faculty Mentors
  const faculty = await db
    .select({
      id: facultyProfiles.id,
      userId: users.id,
      name: users.name,
      image: users.image,
      department: facultyProfiles.department,
      designation: facultyProfiles.designation,
      company: sql<string | null>`null`,
      linkedinUrl: sql<string | null>`null`,
      graduationYear: sql<number | null>`null`,
      type: sql<string>`'faculty'`,
      mentorshipDomains: facultyProfiles.mentoringStyle,
      bio: facultyProfiles.bio,
    })
    .from(facultyProfiles)
    .innerJoin(users, eq(facultyProfiles.userId, users.id))
    // we assume all faculty are potential mentors for this directory
    .orderBy(desc(facultyProfiles.createdAt))
    .all();

  // Combine and group by department
  const allMentors = [...alumni, ...faculty].filter(m => m.name);

  const groupedByDept = allMentors.reduce((acc, mentor) => {
    const dept = mentor.department || "Other / Interdisciplinary";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(mentor);
    return acc;
  }, {} as Record<string, typeof allMentors>);

  // Sort departments alphabetically
  const sortedDepts = Object.keys(groupedByDept).sort();

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-1">Network</p>
          <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
            Mentorship{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              Directory
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Connect with TIET faculty and alumni working in industry and academia. 
            Browse by department to seek guidance on career paths and research opportunities.
          </p>
        </div>
      </div>

      {sortedDepts.length === 0 ? (
        <div className="card-glass-static p-12 text-center">
          <Users size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300 text-lg font-medium">The mentor network is growing</p>
          <p className="text-noir-500 text-sm mt-2">
            No mentors have joined the platform yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDepts.map(dept => {
            // Further group by designation (Sub-department visual grouping)
            const mentorsInDept = groupedByDept[dept];
            const groupedByDesig = mentorsInDept.reduce((acc, mentor) => {
              const desig = mentor.designation || "Mentors";
              if (!acc[desig]) acc[desig] = [];
              acc[desig].push(mentor);
              return acc;
            }, {} as Record<string, typeof mentorsInDept>);

            // Sort designations so Professors are at the top, then Associate, Assistant, then Alumni
            const sortedDesigs = Object.keys(groupedByDesig).sort((a, b) => {
              if (a.includes("Professor") && !b.includes("Professor")) return -1;
              if (!a.includes("Professor") && b.includes("Professor")) return 1;
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
                      <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">{desig}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedByDesig[desig].map(mentor => (
                          <div key={mentor.id} className="card-glass p-6 flex flex-col hover:border-teal-500/30 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-noir-800 ring-2 ring-teal-500/10 relative flex-shrink-0">
                                  {mentor.image ? (
                                    <Image src={mentor.image} alt={mentor.name || "Mentor"} fill className="object-cover" unoptimized />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-teal-400 font-heading">
                                      {mentor.name?.[0] || "?"}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-noir-50 hover:text-teal-400 transition-colors">
                                    {mentor.type === "faculty" ? (
                                      <Link href={`/discover/faculty/${mentor.userId}`}>{mentor.name}</Link>
                                    ) : (
                                      mentor.name
                                    )}
                                  </h3>
                                  <p className="text-xs text-noir-400 font-medium capitalize">
                                    {mentor.type} Mentor
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2 mt-4 text-sm">
                                {mentor.company && (
                                  <div className="flex items-start gap-2 text-noir-300">
                                    <Building2 size={16} className="text-noir-500 mt-0.5 flex-shrink-0" />
                                    <span>
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
                                    <span key={domain} className="badge badge-teal">
                                      {domain}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-6 flex items-center gap-2">
                              <Link href={`/messages/new?to=${mentor.userId}`} className="btn btn-primary flex-1 py-2 text-xs">
                                <Mail size={14} /> Message
                              </Link>
                              {mentor.linkedinUrl && (
                                <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary py-2 px-3 group" title="LinkedIn Profile">
                                  <ArrowUpRight size={14} className="group-hover:text-teal-400" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
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
  );
}
