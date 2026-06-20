"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { CoMentorField, type CoMentorData } from "./CoMentorField";

/* ──────────────── Types ──────────────── */

interface OpeningFormData {
  // Step 1 — Project Basics
  title: string;
  department: string;
  description: string;
  // Step 2 — Mentorship Details
  coMentors: CoMentorData[];
  engagementType: string;
  stipendType: string;
  stipendAmount: string;
  seatsAvailable: number;
  // Step 3 — Logistics
  duration: string;
  applicationDeadline: string;
  applicationInstructions: string;
  status: "draft" | "open";
}

interface OpeningFormProps {
  mode: "create" | "edit";
  initialData?: Partial<OpeningFormData> & { id?: string };
  userDepartment?: string;
  hasActiveProposals?: boolean;
}

const STEPS = ["Project Basics", "Mentorship Details", "Logistics & Review"];

const ENGAGEMENT_TYPES = [
  "RA",
  "Thesis",
  "Project Collaboration",
  "Co-authorship",
  "Internship",
  "ELC Activity",
];

const STIPEND_TYPES = ["Paid", "Academic Credit", "Unpaid"];

const DEPARTMENTS = [
  "Biotechnology",
  "Civil Engineering",
  "Chemical Engineering",
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Instrumentation Engineering",
  "Experiential Learning Centre",
  "Mechanical Engineering",
  "Interdisciplinary",
  "School of Mathematics",
  "School of Physics & Materials Science",
  "School of Chemistry & Biochemistry",
  "School of Humanities & Social Sciences",
  "School of Advanced AI & Data Science",
  "School of Energy & Environment",
  "School of Management",
];

const defaultFormData: OpeningFormData = {
  title: "",
  department: "",
  description: "",
  coMentors: [],
  engagementType: "",
  stipendType: "",
  stipendAmount: "",
  seatsAvailable: 1,
  duration: "",
  applicationDeadline: "",
  applicationInstructions: "",
  status: "draft",
};

/* ──────────────── Component ──────────────── */

export function OpeningForm({
  mode,
  initialData,
  userDepartment,
  hasActiveProposals = false,
}: OpeningFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState<OpeningFormData>(() => ({
    ...defaultFormData,
    department: userDepartment || "",
    ...initialData,
  }));

  const updateField = useCallback(
    <K extends keyof OpeningFormData>(field: K, value: OpeningFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /* ── Validation ── */
  const validateStep = (s: number): string | null => {
    switch (s) {
      case 0:
        if (!form.title.trim()) return "Project title is required";
        if (form.title.length > 200) return "Title must be under 200 characters";
        if (!form.department) return "Department is required";
        if (!form.description.trim()) return "Project description is required";
        return null;
      case 1:
        if (!form.engagementType) return "Engagement type is required";
        return null;
      case 2:
        return null; // All step 3 fields are optional
      default:
        return null;
    }
  };

  const canAdvance = validateStep(step) === null;

  /* ── Navigation ── */
  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  /* ── Submit ── */
  const handleSubmit = async (publishStatus: "draft" | "open") => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        department: form.department,
        coMentors: form.coMentors.filter((cm) => cm.name.trim()),
        engagementType: form.engagementType || undefined,
        stipendType: form.stipendType || undefined,
        stipendAmount: form.stipendAmount || undefined,
        seatsAvailable: form.seatsAvailable,
        duration: form.duration || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        applicationInstructions: form.applicationInstructions || undefined,
        status: publishStatus,
      };

      const url =
        mode === "edit" && initialData?.id
          ? `/api/openings/${initialData.id}`
          : "/api/openings";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/openings");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-label mb-1">
          {mode === "create" ? "New Project Listing" : "Edit Project"}
        </p>
        <h1
          className="heading-1 text-noir-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {mode === "create" ? (
            <>
              Post a{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                Project
              </span>
            </>
          ) : (
            <>
              Edit{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                Posting
              </span>
            </>
          )}
        </h1>
      </div>

      {/* Active proposals warning */}
      {mode === "edit" && hasActiveProposals && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            Students have already applied to this posting. Changing requirements
            won&apos;t notify them automatically.
          </p>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300"
        >
          {error}
        </motion.div>
      )}

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="card-glass-static p-6 space-y-5">
              <div>
                <label className="text-label mb-2 block">
                  Project Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  className="input-noir"
                  placeholder="e.g., AI-Driven Smart ICU Companion System"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
                <p className="text-xs text-noir-500 mt-1">
                  {form.title.length}/200 characters
                </p>
              </div>

              <div>
                <label className="text-label mb-2 block">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  className="input-noir"
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-label mb-2 block">
                  Project Description / Abstract{" "}
                  <span className="text-rose-400">*</span>
                </label>
                <textarea
                  className="input-noir min-h-[160px] resize-y"
                  placeholder="Describe the project, its goals, methodology, and expected outcomes. Recommended: 150–500 words."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
                <p className="text-xs text-noir-500 mt-1">
                  {form.description.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="card-glass-static p-6 space-y-5">
              <CoMentorField
                coMentors={form.coMentors}
                onChange={(cms) => updateField("coMentors", cms)}
              />

              <div className="divider" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-label mb-2 block">
                    Engagement Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    className="input-noir"
                    value={form.engagementType}
                    onChange={(e) =>
                      updateField("engagementType", e.target.value)
                    }
                  >
                    <option value="">Select type...</option>
                    {ENGAGEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-label mb-2 block">
                    Seats Available
                  </label>
                  <input
                    type="number"
                    className="input-noir"
                    min={1}
                    max={50}
                    value={form.seatsAvailable}
                    onChange={(e) =>
                      updateField("seatsAvailable", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-label mb-2 block">
                    Stipend / Credit
                  </label>
                  <select
                    className="input-noir"
                    value={form.stipendType}
                    onChange={(e) => updateField("stipendType", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {STIPEND_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {form.stipendType === "Paid" && (
                  <div>
                    <label className="text-label mb-2 block">Amount</label>
                    <input
                      type="text"
                      className="input-noir"
                      placeholder="e.g., ₹10,000/month"
                      value={form.stipendAmount}
                      onChange={(e) =>
                        updateField("stipendAmount", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="card-glass-static p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-label mb-2 block">Duration</label>
                    <input
                      type="text"
                      className="input-noir"
                      placeholder="e.g., 8 weeks, 1 semester, ongoing"
                      value={form.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-label mb-2 block">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="input-noir"
                      value={form.applicationDeadline}
                      onChange={(e) =>
                        updateField("applicationDeadline", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-label mb-2 block">
                    Application Instructions
                  </label>
                  <textarea
                    className="input-noir min-h-[80px] resize-y"
                    placeholder='e.g., "Email a 1-page SOP to..." or "Apply through the portal"'
                    value={form.applicationInstructions}
                    onChange={(e) =>
                      updateField("applicationInstructions", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <button
                  type="button"
                  className="btn btn-ghost gap-2 mb-3"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye size={16} />
                  {showPreview ? "Hide Preview" : "Preview Posting"}
                </button>

                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="card-glass-static p-6 space-y-4 overflow-hidden"
                    >
                      <h3
                        className="heading-2 text-noir-50"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {form.title || "Untitled Project"}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {form.department && (
                          <span className="badge badge-amber">
                            {form.department}
                          </span>
                        )}
                        {form.engagementType && (
                          <span className="badge badge-teal">
                            {form.engagementType}
                          </span>
                        )}
                        {form.stipendType && (
                          <span className="badge badge-sky">
                            {form.stipendType}
                            {form.stipendAmount && ` — ${form.stipendAmount}`}
                          </span>
                        )}
                        {form.seatsAvailable > 0 && (
                          <span className="badge badge-neutral">
                            {form.seatsAvailable} seat
                            {form.seatsAvailable > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <p className="text-noir-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {form.description || "No description provided."}
                      </p>

                      {form.coMentors.length > 0 && (
                        <div>
                          <p className="text-label mb-2">Co-Mentors</p>
                          <div className="space-y-1">
                            {form.coMentors
                              .filter((cm) => cm.name.trim())
                              .map((cm, i) => (
                                <p key={i} className="text-sm text-noir-300">
                                  {cm.name}
                                  {cm.email && (
                                    <span className="text-noir-500">
                                      {" "}
                                      — {cm.email}
                                    </span>
                                  )}
                                </p>
                              ))}
                          </div>
                        </div>
                      )}

                      {form.duration && (
                        <p className="text-sm text-noir-400">
                          <strong className="text-noir-300">Duration:</strong>{" "}
                          {form.duration}
                        </p>
                      )}

                      {form.applicationInstructions && (
                        <div>
                          <p className="text-label mb-1">
                            Application Instructions
                          </p>
                          <p className="text-sm text-noir-300">
                            {form.applicationInstructions}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          className="btn btn-ghost gap-2"
          onClick={step === 0 ? () => router.back() : prevStep}
        >
          <ArrowLeft size={16} />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {/* Save as Draft — available at any step */}
          <button
            type="button"
            className="btn btn-secondary gap-2"
            disabled={isSubmitting || !form.title.trim()}
            onClick={() => handleSubmit("draft")}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={nextStep}
              disabled={!canAdvance}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary gap-2"
              disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
              onClick={() => handleSubmit("open")}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {mode === "create" ? "Publish" : "Update & Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
