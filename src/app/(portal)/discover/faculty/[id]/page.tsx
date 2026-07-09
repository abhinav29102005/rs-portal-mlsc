import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { facultyProfiles, facultyCurrentProjects } from "@/db/schema/profiles";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { Briefcase, BookOpen, GraduationCap, MapPin, Award, Building2, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FacultyActionsClient } from "@/components/proposals/FacultyActionsClient";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { TimetableGrid } from "@/components/ui/TimetableGrid";

export default async function FacultyProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch faculty profile with user data
  const facultyQuery = await db
    .select({
      profile: facultyProfiles,
      user: users,
    })
    .from(facultyProfiles)
    .innerJoin(users, eq(facultyProfiles.userId, users.id))
    .where(eq(facultyProfiles.userId, params.id))
    .get();

  if (!facultyQuery) {
    notFound();
  }

  const { profile, user } = facultyQuery;

  // Fetch active projects / openings
  const activeProjects = await db
    .select()
    .from(facultyCurrentProjects)
    .where(eq(facultyCurrentProjects.facultyProfileId, profile.id))
    .all();

  // Parse arrays safely
  const mentoringStyle = profile.mentoringStyle as string[] || [];
  
  let officeHours = [];
  if (profile.officeHours) {
    try {
      officeHours = typeof profile.officeHours === 'string' ? JSON.parse(profile.officeHours) : profile.officeHours;
    } catch {
      officeHours = [];
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <Link href="/discover/faculty" className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-red-400 transition-colors">
        <ChevronLeft size={16} /> Back to Faculty Directory
      </Link>

      {/* Hero Section */}
      <div className="card-glass overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-noir-900 via-amber-900/20 to-noir-900 absolute top-0 left-0 w-full" />
        
        <div className="p-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left mt-16">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-noir-800 ring-4 ring-noir-950 shadow-xl flex-shrink-0 relative">
            <ImageWithFallback 
              src={user.image || ""} 
              fallbackText={user.name?.[0] || "?"} 
              alt={user.name || "Faculty"} 
              fill 
              className="object-cover" 
              unoptimized 
            />
          </div>

          {/* Info */}
          <div className="flex-1 mt-2">
            <h1 className="text-3xl font-bold text-noir-50 font-heading tracking-tight mb-1">
              {user.name}
            </h1>
            <p className="text-lg text-red-400 font-medium mb-3">
              {profile.designation} · {profile.department}
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-noir-300">
              {profile.labName && (
                <span className="flex items-center gap-1.5"><Building2 size={16} className="text-noir-500" /> {profile.labName}</span>
              )}
              {profile.hIndex !== null && (
                <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-noir-500" /> h-index: {profile.hIndex}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <FacultyActionsClient facultyProfileId={profile.id} facultyName={user.name || "Faculty"} userId={user.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content (Left, 2/3) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Bio */}
          {profile.bio && (
            <section className="card-glass p-6 sm:p-8">
              <h2 className="text-xl font-bold text-noir-50 font-heading mb-4 flex items-center gap-2">
                <GraduationCap className="text-red-400" size={20} /> About
              </h2>
              <p className="text-noir-200 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </section>
          )}

          {/* Active Projects */}
          <section className="card-glass p-6 sm:p-8">
            <h2 className="text-xl font-bold text-noir-50 font-heading mb-4 flex items-center gap-2">
              <Sparkles className="text-red-400" size={20} /> Research Projects
            </h2>
            
            {activeProjects.length > 0 ? (
              <div className="space-y-4">
                {activeProjects.map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl bg-noir-900/50 border border-white/5 hover:border-red-500/20 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-noir-50">{proj.title}</h3>
                      <span className="badge badge-red text-[10px] whitespace-nowrap px-2 py-0.5 uppercase tracking-wider">{proj.status.replace('_', ' ')}</span>
                    </div>
                    {proj.description && (
                      <p className="text-sm text-noir-300 line-clamp-3">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-noir-900/50 rounded-xl border border-white/5 border-dashed">
                <Briefcase className="text-noir-600 mx-auto mb-2" size={24} />
                <p className="text-noir-400 text-sm">No active projects listed currently.</p>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar (Right, 1/3) */}
        <div className="space-y-8">
          
          {/* Mentoring Profile */}
          <section className="card-glass p-6">
            <h2 className="text-lg font-bold text-noir-50 font-heading mb-4">Mentoring Profile</h2>
            
            <div className="space-y-5">
              {mentoringStyle.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-noir-400 uppercase tracking-wider mb-2">Mentoring Style</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mentoringStyle.map(style => (
                      <span key={style} className="badge badge-neutral bg-noir-800 border-none text-xs">{style}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile.minimumCgpa && (
                <div>
                  <p className="text-xs font-semibold text-noir-400 uppercase tracking-wider mb-1">Requirements</p>
                  <p className="text-sm text-noir-200 flex items-center gap-2">
                    <Award size={14} className="text-red-400" /> Minimum CGPA: <span className="font-medium">{profile.minimumCgpa}</span>
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-noir-400 uppercase tracking-wider mb-1">Contact Preference</p>
                <p className="text-sm text-noir-200 capitalize">
                  {profile.contactPreference.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </section>

          {/* External Links */}
          {(profile.labWebsiteUrl || profile.scholarId || profile.githubUsername) && (
            <section className="card-glass p-6">
              <h2 className="text-lg font-bold text-noir-50 font-heading mb-4">External Links</h2>
              <div className="space-y-3">
                {profile.labWebsiteUrl && (
                  <a href={profile.labWebsiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors">
                    <Building2 size={16} /> Lab Website
                  </a>
                )}
                {profile.scholarId && (
                  <a href={`https://scholar.google.com/citations?user=${profile.scholarId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors">
                    <BookOpen size={16} /> Google Scholar
                  </a>
                )}
                {profile.githubUsername && (
                  <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-noir-200 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Timetable */}
          {officeHours.length > 0 && (
            <section className="card-glass p-6 sm:p-8 md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-bold text-noir-50 font-heading mb-4 flex items-center gap-2">
                <Sparkles className="text-red-400" size={20} /> Availability & Office Hours
              </h2>
              <TimetableGrid officeHours={officeHours} editMode={false} />
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
