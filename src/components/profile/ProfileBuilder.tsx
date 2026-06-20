"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User, Library, Link as LinkIcon, Settings, Save, Loader2, CheckCircle } from "lucide-react";
import { updateFacultyProfile } from "@/app/actions/profiles";
import { DEPARTMENTS, DESIGNATIONS, MENTORSHIP_STYLES } from "@/db/seed/taxonomy";

export function ProfileBuilder({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  
  // Parse JSON strings to arrays if necessary
  const parseJsonStr = (val: any, fallback: any[]) => {
    if (!val) return fallback;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const [formData, setFormData] = useState({
    designation: initialData.designation || "Assistant Professor",
    department: initialData.department || "",
    phone: initialData.phone || "",
    bio: initialData.bio || "",
    labName: initialData.labName || "",
    labWebsiteUrl: initialData.labWebsiteUrl || "",
    scholarId: initialData.scholarId || "",
    orcidId: initialData.orcidId || "",
    githubUsername: initialData.githubUsername || "",
    contactPreference: initialData.contactPreference || "portal_dm",
    minimumCgpa: initialData.minimumCgpa || "",
  });

  const [mentoringStyle, setMentoringStyle] = useState<string[]>(parseJsonStr(initialData.mentoringStyle, []));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const toggleMentoringStyle = (style: string) => {
    setMentoringStyle(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateFacultyProfile({
          ...formData,
          mentoringStyle: JSON.stringify(mentoringStyle),
          minimumCgpa: formData.minimumCgpa ? Number(formData.minimumCgpa) : null,
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
          <h2 className="text-xl font-bold text-noir-50 font-heading">Academic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-label block mb-2">Designation</label>
            <select name="designation" value={formData.designation} onChange={handleChange} className="input-noir">
              {DESIGNATIONS.map(d => <option className="bg-noir-900" key={d} value={d}>{d}</option>)}
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
            <label className="text-label block mb-2">Office Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="input-noir" placeholder="+91..." />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="text-label block mb-2">Bio / Research Focus</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            className="input-noir min-h-[100px]" 
            placeholder="A brief overview of your research..." 
          />
        </div>
      </motion.div>

      {/* Lab & External Links */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Library className="text-amber-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Lab & Links</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-label block mb-2">Research Lab Name (if any)</label>
            <input name="labName" value={formData.labName} onChange={handleChange} className="input-noir" placeholder="e.g. AI Research Lab" />
          </div>
          <div>
            <label className="text-label block mb-2">Lab Website URL</label>
            <input name="labWebsiteUrl" value={formData.labWebsiteUrl} onChange={handleChange} className="input-noir" placeholder="https://" />
          </div>
          <div>
            <label className="text-label block mb-2">Google Scholar ID</label>
            <input name="scholarId" value={formData.scholarId} onChange={handleChange} className="input-noir" placeholder="e.g. yZ2... " />
          </div>
          <div>
            <label className="text-label block mb-2">ORCID ID</label>
            <input name="orcidId" value={formData.orcidId} onChange={handleChange} className="input-noir" placeholder="0000-0000-0000-0000" />
          </div>
          <div>
            <label className="text-label block mb-2">GitHub Username</label>
            <input name="githubUsername" value={formData.githubUsername} onChange={handleChange} className="input-noir" placeholder="username" />
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-amber-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Mentorship Preferences</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-label block mb-2">Contact Preference</label>
            <select name="contactPreference" value={formData.contactPreference} onChange={handleChange} className="input-noir">
              <option className="bg-noir-900" value="portal_dm">Portal Messages (Recommended)</option>
              <option className="bg-noir-900" value="email">Direct Email</option>
              <option className="bg-noir-900" value="office_hours_only">Office Hours Only</option>
            </select>
          </div>
          <div>
            <label className="text-label block mb-2">Minimum CGPA Requirement</label>
            <input type="number" step="0.01" name="minimumCgpa" value={formData.minimumCgpa} onChange={handleChange} className="input-noir" placeholder="Leave empty if no strict requirement" />
          </div>
        </div>

        <div>
          <label className="text-label block mb-3">Mentoring Style (Select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {MENTORSHIP_STYLES.map(style => (
              <button
                type="button"
                key={style}
                onClick={() => toggleMentoringStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  mentoringStyle.includes(style) 
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                    : "bg-noir-800 border-noir-700 text-noir-300 hover:bg-noir-700 hover:text-noir-100"
                }`}
              >
                {style}
              </button>
            ))}
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
          Save Profile
        </button>
      </div>
      
    </form>
  );
}
