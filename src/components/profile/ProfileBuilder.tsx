"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User, Library, Link as LinkIcon, Settings, Save, Loader2, CheckCircle, FolderGit2, BookOpen, Plus, X, Clock } from "lucide-react";
import { updateFacultyProfile } from "@/app/actions/profiles";
import { DEPARTMENTS, DESIGNATIONS, MENTORSHIP_STYLES } from "@/db/seed/taxonomy";
import { TimetableGrid } from "@/components/ui/TimetableGrid";

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
    projects: initialData.projects || [],
    publications: initialData.publications || [],
  });

  const [mentoringStyle, setMentoringStyle] = useState<string[]>(parseJsonStr(initialData.mentoringStyle, []));
  const [officeHours, setOfficeHours] = useState<any[]>(parseJsonStr(initialData.officeHours, []));

  const addProject = () => {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: "", description: "", url: "" }] }));
    setIsSaved(false);
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...formData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setFormData(prev => ({ ...prev, projects: newProjects }));
    setIsSaved(false);
  };

  const removeProject = (index: number) => {
    const newProjects = [...formData.projects];
    newProjects.splice(index, 1);
    setFormData(prev => ({ ...prev, projects: newProjects }));
    setIsSaved(false);
  };

  const addPublication = () => {
    setFormData(prev => ({ ...prev, publications: [...prev.publications, { title: "", journal: "", year: "", url: "" }] }));
    setIsSaved(false);
  };

  const updatePublication = (index: number, field: string, value: string) => {
    const newPubs = [...formData.publications];
    newPubs[index] = { ...newPubs[index], [field]: value };
    setFormData(prev => ({ ...prev, publications: newPubs }));
    setIsSaved(false);
  };

  const removePublication = (index: number) => {
    const newPubs = [...formData.publications];
    newPubs.splice(index, 1);
    setFormData(prev => ({ ...prev, publications: newPubs }));
    setIsSaved(false);
  };

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
          officeHours: JSON.stringify(officeHours),
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
          <User className="text-red-400" size={24} />
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
          <Library className="text-red-400" size={24} />
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

      {/* Publications */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-red-400" size={24} />
            <h2 className="text-xl font-bold text-noir-50 font-heading">Key Publications</h2>
          </div>
          <button type="button" onClick={addPublication} className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Plus size={16} /> Add Publication
          </button>
        </div>
        
        <div className="space-y-6">
          {formData.publications.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
              <BookOpen size={32} className="mx-auto text-noir-500 mb-2" />
              <p className="text-noir-300">Highlight your most impactful papers.</p>
              <button type="button" onClick={addPublication} className="text-red-400 hover:text-red-300 text-sm mt-2 font-medium">Add first publication</button>
            </div>
          ) : (
            formData.publications.map((pub: any, index: number) => (
              <div key={index} className="relative p-5 bg-black/20 border border-white/5 rounded-xl space-y-4 group">
                <button 
                  type="button" 
                  onClick={() => removePublication(index)}
                  className="absolute top-4 right-4 text-noir-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={18} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-label block mb-2">Paper Title</label>
                    <input value={pub.title} onChange={(e) => updatePublication(index, 'title', e.target.value)} className="input-noir" placeholder="e.g. A novel approach to..." />
                  </div>
                  <div>
                    <label className="text-label block mb-2">Journal / Conference</label>
                    <input value={pub.journal} onChange={(e) => updatePublication(index, 'journal', e.target.value)} className="input-noir" placeholder="e.g. IEEE Transactions" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-label block mb-2">Year</label>
                      <input value={pub.year} onChange={(e) => updatePublication(index, 'year', e.target.value)} className="input-noir" placeholder="2024" />
                    </div>
                    <div>
                      <label className="text-label block mb-2">Link (DOI)</label>
                      <input value={pub.url} onChange={(e) => updatePublication(index, 'url', e.target.value)} className="input-noir" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.18 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderGit2 className="text-red-400" size={24} />
            <h2 className="text-xl font-bold text-noir-50 font-heading">Research Projects</h2>
          </div>
          <button type="button" onClick={addProject} className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <Plus size={16} /> Add Project
          </button>
        </div>
        
        <div className="space-y-6">
          {formData.projects.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
              <FolderGit2 size={32} className="mx-auto text-noir-500 mb-2" />
              <p className="text-noir-300">Showcase your ongoing or completed grants/projects.</p>
              <button type="button" onClick={addProject} className="text-red-400 hover:text-red-300 text-sm mt-2 font-medium">Add first project</button>
            </div>
          ) : (
            formData.projects.map((project: any, index: number) => (
              <div key={index} className="relative p-5 bg-black/20 border border-white/5 rounded-xl space-y-4 group">
                <button 
                  type="button" 
                  onClick={() => removeProject(index)}
                  className="absolute top-4 right-4 text-noir-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={18} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2">Project Title</label>
                    <input value={project.title} onChange={(e) => updateProject(index, 'title', e.target.value)} className="input-noir" placeholder="Title..." />
                  </div>
                  <div>
                    <label className="text-label block mb-2">Link (Optional)</label>
                    <input value={project.url} onChange={(e) => updateProject(index, 'url', e.target.value)} className="input-noir" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-label block mb-2">Description</label>
                    <textarea value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} className="input-noir min-h-[80px]" placeholder="Briefly describe the research..." />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-red-400" size={24} />
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
                    ? "bg-red-500/20 border-red-500/50 text-red-400" 
                    : "bg-noir-800 border-noir-700 text-noir-300 hover:bg-noir-700 hover:text-noir-100"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Office Hours / Timetable */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.25 }} className="card-glass p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-red-400" size={24} />
          <h2 className="text-xl font-bold text-noir-50 font-heading">Availability Timetable</h2>
        </div>
        <p className="text-sm text-noir-400 mb-6">Set your weekly availability. This will be visible to students in the Mentor Directory.</p>
        
        <TimetableGrid 
          officeHours={officeHours} 
          onChange={(newHours) => {
            setOfficeHours(newHours);
            setIsSaved(false);
          }} 
          editMode={true} 
        />
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 sticky bottom-6 z-20 p-4 bg-noir-950/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
        {isSaved && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-400 text-sm font-medium">
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
