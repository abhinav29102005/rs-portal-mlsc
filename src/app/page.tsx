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
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/thapar-logo.png" alt="Thapar Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900 font-heading">
              RAMP
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">About Us</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Features</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Contact</a>
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

        {/* About Us Section */}
        <section id="about" className="max-w-4xl mx-auto mb-32 text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-heading mb-6">About Us</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            The Research and Mentor Platform (RAMP) was developed to streamline the academic and research ecosystem at Thapar Institute of Engineering and Technology. Our mission is to bridge the gap between ambitious students seeking hands-on research experience and visionary faculty members who are pioneering new technologies.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            By eliminating administrative overhead, providing unified discovery, and enabling seamless communication, RAMP accelerates research outcomes and fosters a collaborative academic community.
          </p>
        </section>

        {/* Contact Section */}
        <section id="contact" className="max-w-4xl mx-auto mb-20">
          <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">Get in Touch</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Have questions about the portal, want to report an issue, or need administrative access? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:support@thapar.edu" className="btn btn-primary btn-lg">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 text-center text-gray-500">
        <p className="font-medium text-gray-900 mb-4">RAMP — Research and Mentor Platform</p>
        <p>© {new Date().getFullYear()} Thapar Institute of Engineering and Technology.</p>
        <div className="mt-8 flex justify-center items-center gap-2 text-sm">
          <span>Powered by</span>
          {/* MLSC Logo */}
          <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-100">
            <img src="/mlsc-logo.png" alt="MLSC Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-gray-800 tracking-wide">MLSC</span>
        </div>
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
