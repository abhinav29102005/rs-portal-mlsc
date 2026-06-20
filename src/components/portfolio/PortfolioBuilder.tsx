"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Link as LinkIcon, BookOpen, Save, Loader2, CheckCircle } from "lucide-react";
import { updateStudentProfile } from "@/app/actions/profiles";
import { DEPARTMENTS } from "@/db/seed/taxonomy";

export function PortfolioBuilder({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    rollNumber: initialData.rollNumber || "",
    program: initialData.program || "BE",
    department: initialData.department || "",
    currentYear: initialData.currentYear || 1,
    cgpa: initialData.cgpa || "",
    bio: initialData.bio || "",
    githubUrl: initialData.githubUrl || "",
    linkedinUrl: initialData.linkedinUrl || "",
    websiteUrl: initialData.websiteUrl || "",
    openToResearch: initialData.openToResearch ?? true,
    visibility: initialData.visibility || "public",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateStudentProfile({
          ...formData,
          currentYear: Number(formData.currentYear),
          cgpa: formData.cgpa ? Number(formData.cgpa) : null,
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-10">
      
      {/* Basic Info */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-amber-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Basic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-label block mb-2">Roll Number</label>
            <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="input-noir" placeholder="e.g. 102103000" />
          </div>
          <div>
            <label className="text-label block mb-2">Program</label>
            <select name="program" value={formData.program} onChange={handleChange} className="input-noir">
              <option className="bg-noir-900" value="BE">BE / B.Tech</option>
              <option className="bg-noir-900" value="ME">ME / M.Tech</option>
              <option className="bg-noir-900" value="PhD">PhD</option>
              <option className="bg-noir-900" value="MSc">MSc</option>
            </select>
          </div>
          <div>
            <label className="text-label block mb-2">Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className="input-noir">
              <option className="bg-noir-900" value="">Select Department</option>
              {DEPARTMENTS.map(d => <option className="bg-noir-900" key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label block mb-2">Current Year</label>
            <select name="currentYear" value={formData.currentYear} onChange={handleChange} className="input-noir">
              {[1, 2, 3, 4, 5].map(y => <option className="bg-noir-900" key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label block mb-2">CGPA</label>
            <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="input-noir" placeholder="e.g. 9.5" />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="text-label block mb-2">Bio / Objective</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            className="input-noir min-h-[100px]" 
            placeholder="A brief overview of your research interests and academic goals..." 
          />
        </div>
      </motion.div>

      {/* Links */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <LinkIcon className="text-amber-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Links & Socials</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-label block mb-2">GitHub URL</label>
            <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="input-noir" placeholder="https://github.com/yourusername" />
          </div>
          <div>
            <label className="text-label block mb-2">LinkedIn URL</label>
            <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="input-noir" placeholder="https://linkedin.com/in/yourusername" />
          </div>
          <div className="md:col-span-2">
            <label className="text-label block mb-2">Personal Website</label>
            <input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="input-noir" placeholder="https://yourportfolio.com" />
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="text-amber-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Preferences</h2>
        </div>
        
        <div className="space-y-6">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center mt-1">
              <input type="checkbox" name="openToResearch" checked={formData.openToResearch} onChange={handleChange} className="sr-only" />
              <div className={`w-12 h-6 rounded-full transition-colors ${formData.openToResearch ? "bg-amber-500" : "bg-noir-600 group-hover:bg-noir-500"}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mt-1 ${formData.openToResearch ? "translate-x-7 ml-0.5" : "translate-x-1"}`} />
              </div>
            </div>
            <div>
              <p className="font-medium text-noir-50">Open to Research Opportunities</p>
              <p className="text-sm text-noir-400 mt-0.5">Faculty can discover your profile when looking for students to join their labs.</p>
            </div>
          </label>
          
          <div>
            <label className="text-label block mb-2">Profile Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className="input-noir max-w-xs">
              <option className="bg-noir-900" value="public">Public (Visible to all students & faculty)</option>
              <option className="bg-noir-900" value="faculty_only">Faculty Only (Hidden from students)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 sticky bottom-6 z-20 p-4 bg-noir-950/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
        {isSaved && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle size={16} /> Saved Successfully
          </motion.span>
        )}
        <button type="submit" disabled={isPending} className="btn btn-primary shadow-amber-500/20">
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Portfolio
        </button>
      </div>
      
    </form>
  );
}
