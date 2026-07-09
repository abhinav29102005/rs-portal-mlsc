"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    eventType: "seminar",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    department: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <h1
          className="heading-1 text-noir-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Create{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Event
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Schedule a seminar, workshop, or talk for students to attend.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-start gap-3"
        >
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="card-glass-static p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-label mb-2 block">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              className="input-noir"
              placeholder="e.g., Intro to Federated Learning"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label mb-2 block">Event Type</label>
              <select
                className="input-noir"
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              >
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="talk">Talk</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-label mb-2 block">Department</label>
              <input
                type="text"
                className="input-noir"
                placeholder="e.g., CSED"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label mb-2 block">
                Start Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="input-noir"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-label mb-2 block">End Time</label>
              <input
                type="datetime-local"
                className="input-noir"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label mb-2 block">Location</label>
              <input
                type="text"
                className="input-noir"
                placeholder="e.g., LP-104 or Zoom Link"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-label mb-2 block">Capacity (Optional)</label>
              <input
                type="number"
                min="1"
                className="input-noir"
                placeholder="e.g., 50"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-label mb-2 block">Description</label>
            <textarea
              className="input-noir min-h-[120px] resize-y"
              placeholder="What will be covered? Who should attend?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary gap-2 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}
