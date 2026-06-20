import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema/alumni";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
import { Users, Building2, GraduationCap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Alumni Network — TIET Research Portal" };

export default async function AlumniDiscoveryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all alumni who are willing to mentor
  const mentors = await db
    .select({
      profile: alumniProfiles,
      name: users.name,
      email: users.email,
    })
    .from(alumniProfiles)
    .leftJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(alumniProfiles.willingToMentor, true))
    .orderBy(desc(alumniProfiles.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-1">Network</p>
          <h1
            className="heading-1 text-noir-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Alumni{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              Mentors
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Connect with TIET alumni working in industry and academia. Seek
            guidance on career paths, research opportunities, and industry
            trends.
          </p>
        </div>
      </div>

      {mentors.length === 0 ? (
        <div className="card-glass-static p-12 text-center">
          <Users size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300">The alumni network is growing</p>
          <p className="text-noir-500 text-sm mt-2">
            No mentors have joined the platform yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map(({ profile, name, email }) => (
            <div key={profile.id} className="card-glass p-5 flex flex-col">
              <div className="flex-1">
                <h3
                  className="heading-3 text-noir-50 mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {name || "Alumnus"}
                </h3>

                <div className="space-y-2 mt-3 text-sm">
                  {profile.currentRole && profile.currentCompany && (
                    <div className="flex items-start gap-2 text-noir-300">
                      <Building2 size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>
                        {profile.currentRole} at{" "}
                        <span className="text-noir-100 font-medium">
                          {profile.currentCompany}
                        </span>
                      </span>
                    </div>
                  )}

                  {profile.graduationYear && (
                    <div className="flex items-center gap-2 text-noir-400">
                      <GraduationCap size={16} className="text-noir-500" />
                      <span>
                        Class of {profile.graduationYear}{" "}
                        {profile.degreeProgram && `(${profile.degreeProgram})`}
                      </span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-xs text-noir-400 mt-4 line-clamp-3">
                    {profile.bio}
                  </p>
                )}

                {profile.mentorshipDomains && (profile.mentorshipDomains as string[]).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {(profile.mentorshipDomains as string[]).slice(0, 3).map((domain: string) => (
                      <span key={domain} className="badge badge-neutral text-[10px] py-1">
                        {domain}
                      </span>
                    ))}
                    {(profile.mentorshipDomains as string[]).length > 3 && (
                      <span className="text-xs text-noir-500 ml-1">
                        +{(profile.mentorshipDomains as string[]).length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.05]">
                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-sm text-teal-400 hover:text-teal-300 transition-colors group"
                  >
                    Connect on LinkedIn
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ) : (
                  <span className="text-sm text-noir-500 italic">
                    Contact via portal coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
