"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { submitProposal } from "@/app/actions/proposals";

export function ProposalModal({ facultyProfileId, facultyName, isOpen, onClose }: { facultyProfileId: string; facultyName: string; isOpen: boolean; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("facultyProfileId", facultyProfileId);

    startTransition(async () => {
      try {
        await submitProposal(formData);
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to submit proposal");
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
          className="relative w-full max-w-2xl bg-noir-950 p-6 md:p-8 shadow-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-noir-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-noir-50 font-heading mb-2">Submit Proposal</h2>
          <p className="text-sm text-noir-400 mb-6">Propose a research idea to <span className="font-medium text-red-400">{facultyName}</span>.</p>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="btn btn-ghost text-noir-300">Cancel</button>
              <button type="submit" disabled={isPending} className="btn btn-primary shadow-amber-500/20">
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                Submit Proposal
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
