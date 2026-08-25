import os

filepath = "src/components/proposals/ProposalModal.tsx"

new_content = """"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, BookOpen, Clock, Users } from "lucide-react";
import { submitProposal } from "@/app/actions/proposals";

type OutreachType = "research" | "academic_query" | "mentorship";

export function ProposalModal({ facultyProfileId, facultyName, isOpen, onClose }: { facultyProfileId: string; facultyName: string; isOpen: boolean; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [outreachType, setOutreachType] = useState<OutreachType>("research");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("facultyProfileId", facultyProfileId);
    formData.append("type", outreachType);

    startTransition(async () => {
      try {
        await submitProposal(formData);
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to submit request");
      }
    });
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-2xl bg-noir-950 p-6 md:p-8 shadow-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto outreach-modal"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-noir-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-noir-50 font-heading mb-2">Reach Out to Faculty</h2>
          <p className="text-sm text-noir-400 mb-6">Connect with <span className="font-medium text-red-400">{facultyName}</span> for research, queries, or mentorship.</p>

          <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-lg border border-white/5 outreach-type-selector">
            <button 
              type="button"
              onClick={() => setOutreachType("research")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${outreachType === "research" ? "bg-red-500/20 text-red-400" : "text-noir-400 hover:bg-white/5"}`}
            >
              <BookOpen size={16} /> Research
            </button>
            <button 
              type="button"
              onClick={() => setOutreachType("academic_query")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${outreachType === "academic_query" ? "bg-amber-500/20 text-amber-400" : "text-noir-400 hover:bg-white/5"}`}
            >
              <Clock size={16} /> Query
            </button>
            <button 
              type="button"
              onClick={() => setOutreachType("mentorship")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${outreachType === "mentorship" ? "bg-emerald-500/20 text-emerald-400" : "text-noir-400 hover:bg-white/5"}`}
            >
              <Users size={16} /> Mentorship
            </button>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {outreachType === "research" && (
              <>
                <div>
                  <label className="text-label block mb-2">Proposal Title</label>
                  <input name="title" required className="input-noir w-full" placeholder="e.g. Optimizing Federated Learning for Edge Devices" />
                </div>
                <div>
                  <label className="text-label block mb-2">Abstract / Summary</label>
                  <textarea name="abstract" required className="input-noir w-full min-h-[120px]" placeholder="Briefly describe the core problem, your proposed solution, and expected outcomes..." />
                </div>
                <div>
                  <label className="text-label block mb-2">Methodology (Optional)</label>
                  <textarea name="methodology" className="input-noir w-full min-h-[80px]" placeholder="Describe the steps, tools, or algorithms you plan to use." />
                </div>
                <div>
                  <label className="text-label block mb-2">Project Timeline (Optional)</label>
                  <textarea name="timeline" className="input-noir w-full min-h-[60px]" placeholder="Expected milestones, weekly goals, or duration..." />
                </div>
              </>
            )}

            {outreachType === "academic_query" && (
              <>
                <div>
                  <label className="text-label block mb-2">Subject / Query Topic</label>
                  <input name="title" required className="input-noir w-full" placeholder="e.g. Clarification on Distributed Systems Lecture 4" />
                </div>
                <div>
                  <label className="text-label block mb-2">Query Details</label>
                  <textarea name="abstract" required className="input-noir w-full min-h-[120px]" placeholder="Provide specific details about what you want to discuss..." />
                </div>
                <div>
                  <label className="text-label block mb-2">Preferred Time Slot</label>
                  <input name="preferredTimeSlot" className="input-noir w-full" placeholder="e.g. Monday 2-3 PM or Thursday morning" />
                  <input type="hidden" name="queryTopic" value="academic_query" />
                </div>
              </>
            )}

            {outreachType === "mentorship" && (
              <>
                <div>
                  <label className="text-label block mb-2">Mentorship Request Title</label>
                  <input name="title" required className="input-noir w-full" placeholder="e.g. Guidance on PhD Applications and Systems Research" />
                </div>
                <div>
                  <label className="text-label block mb-2">Background & Introduction</label>
                  <textarea name="abstract" required className="input-noir w-full min-h-[100px]" placeholder="Introduce yourself and your academic background..." />
                </div>
                <div>
                  <label className="text-label block mb-2">Mentorship Goals</label>
                  <textarea name="mentorshipGoals" required className="input-noir w-full min-h-[100px]" placeholder="What do you hope to achieve through this mentorship? (e.g. career advice, research guidance...)" />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="btn btn-ghost text-noir-300">Cancel</button>
              <button type="submit" disabled={isPending} className={`btn shadow-lg flex items-center gap-2 ${
                outreachType === "research" ? "btn-primary shadow-red-500/20" : 
                outreachType === "academic_query" ? "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20" : 
                "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
              }`}>
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                Submit Request
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
"""

with open(filepath, "w") as f:
    f.write(new_content)
