import { auth } from "@/lib/auth";
import Link from "next/link";
import { GraduationCap, Briefcase, Calendar, Search, Users, ShieldCheck, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // If logged in, go directly to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-heading">T</span>
            </div>
            <span className="text-lg font-bold text-gray-900 font-heading">
              Thapar Research Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
              Log in
            </Link>
            <Link href="/login" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center space-y-8 mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-semibold tracking-wide uppercase">
            <SparkleIcon />
            Centralized Mentorship System
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight font-heading leading-tight">
            Connect. Collaborate. <br />
            <span className="text-red-600">Accelerate Research.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The official platform for Thapar Institute of Engineering and Technology. 
            Streamlining faculty-student research collaboration, mentorship tracking, and opportunity discovery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="btn btn-primary btn-lg w-full sm:w-auto">
              Join the Portal
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg w-full sm:w-auto bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300">
              Explore Features
            </Link>
          </div>
        </section>

        {/* Problems Solved Section */}
        <section id="features" className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">Why we built this</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Eliminating administrative overhead and bridging the gap between ambitious students and visionary faculty.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden group hover:border-red-200 transition-colors">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                No more scattered emails or missed opportunities. Students can browse all open faculty projects and filter by domain in one centralized location.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden group hover:border-red-200 transition-colors">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Faculty can publish their interactive weekly timetables and office hours, allowing students to instantly know when they are available for mentorship.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden group hover:border-red-200 transition-colors">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admin Elimination</h3>
              <p className="text-gray-600 leading-relaxed">
                Automated shortlisting, built-in messaging, and proposal tracking completely remove the administrative burden of managing research teams.
              </p>
            </div>
          </div>
        </section>

        {/* Perks Section */}
        <section className="max-w-7xl mx-auto mb-32 bg-gray-900 rounded-3xl p-12 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-6">
                Tailored exactly for your academic journey.
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Whether you are a student looking to publish your first paper, or a professor managing a lab of 20 researchers, the portal scales to your needs.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">For Students</h4>
                    <p className="text-gray-400 text-sm">Build a persistent research portfolio, track your CGPA and skills, and directly apply to exclusive faculty projects.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">For Faculty</h4>
                    <p className="text-gray-400 text-sm">Discover top talent by filtering students by specific tech stacks, batch years, and domains. Manage all applicants in one kanban view.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.15)] transform translate-x-4">
                  <div className="w-12 h-12 bg-red-900/50 text-red-500 rounded-full flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="h-4 w-40 bg-red-900/50 rounded mb-2" />
                    <div className="h-3 w-28 bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                    <Search size={20} />
                  </div>
                  <div>
                    <div className="h-4 w-28 bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Thapar Institute of Engineering and Technology.</p>
        <p className="text-sm mt-2">Built for the research community.</p>
      </footer>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
    </svg>
  );
}
