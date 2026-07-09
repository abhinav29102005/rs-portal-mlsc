"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, BookOpen, Users, ArrowRight } from "lucide-react";
import { ConstellationBackground } from "@/components/layout/ConstellationBackground";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-noir-950 flex items-center justify-center relative overflow-hidden">
      <ConstellationBackground />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-500/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Hero Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 badge badge-red mb-6">
            <Sparkles size={12} />
            Thapar Institute of Engineering & Technology
          </div>

          <h1
            className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-noir-50">Research &</span>
            <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-red-500 bg-clip-text text-transparent">
              Mentor Portal
            </span>
          </h1>

          <p className="text-noir-300 text-lg leading-relaxed max-w-lg mb-10">
            Connect with faculty for research, mentorship, and collaborative
            projects. Build your portfolio. Discover opportunities. Pitch your
            ideas.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              { icon: <GraduationCap size={14} />, label: "Student Portfolios" },
              { icon: <BookOpen size={14} />, label: "Faculty Profiles" },
              { icon: <Users size={14} />, label: "Research Collaboration" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-noir-200 text-sm"
              >
                <span className="text-red-400">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="card-glass p-8 glow-amber-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Sparkles size={24} className="text-noir-950" />
              </div>
              <h2
                className="heading-3 text-noir-50 mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Welcome Back
              </h2>
              <p className="text-sm text-noir-400">
                Sign in with your TIET email
              </p>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="btn btn-primary w-full btn-lg group"
              id="google-sign-in"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-noir-500">
                Only <span className="text-red-400/70 font-medium">@thapar.edu</span> accounts are accepted
              </p>
            </div>

            {/* Access info */}
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-label mb-3">How it works</p>
              <div className="space-y-2.5">
                {[
                  "Students are auto-verified on sign-in",
                  "Faculty accounts require admin approval",
                  "Build your profile and start connecting",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-noir-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
