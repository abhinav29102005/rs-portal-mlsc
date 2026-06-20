"use client";

import { Plus, Trash2, CheckCircle } from "lucide-react";

export interface CoMentorData {
  name: string;
  email: string;
  phone: string;
}

interface CoMentorFieldProps {
  coMentors: CoMentorData[];
  onChange: (coMentors: CoMentorData[]) => void;
  matchedEmails?: Set<string>;
}

export function CoMentorField({
  coMentors,
  onChange,
  matchedEmails = new Set(),
}: CoMentorFieldProps) {
  const addCoMentor = () => {
    onChange([...coMentors, { name: "", email: "", phone: "" }]);
  };

  const removeCoMentor = (index: number) => {
    onChange(coMentors.filter((_, i) => i !== index));
  };

  const updateCoMentor = (
    index: number,
    field: keyof CoMentorData,
    value: string
  ) => {
    const updated = [...coMentors];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-label">Co-Mentor(s)</label>
        <button
          type="button"
          onClick={addCoMentor}
          className="btn btn-ghost btn-sm gap-1"
        >
          <Plus size={14} />
          Add Co-Mentor
        </button>
      </div>

      {coMentors.length === 0 && (
        <p className="text-xs text-noir-500 italic">
          No co-mentors added. Click &quot;Add Co-Mentor&quot; to add one.
        </p>
      )}

      {coMentors.map((cm, i) => (
        <div
          key={i}
          className="card-glass-static p-4 space-y-3 relative group"
        >
          <button
            type="button"
            onClick={() => removeCoMentor(i)}
            className="absolute top-3 right-3 btn btn-ghost btn-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove co-mentor"
          >
            <Trash2 size={14} className="text-rose-400" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-noir-400 mb-1 block">Name</label>
              <input
                type="text"
                className="input-noir"
                placeholder="Dr. Jane Doe"
                value={cm.name}
                onChange={(e) => updateCoMentor(i, "name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-noir-400 mb-1 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="input-noir pr-8"
                  placeholder="jane.doe@thapar.edu"
                  value={cm.email}
                  onChange={(e) => updateCoMentor(i, "email", e.target.value)}
                />
                {cm.email && matchedEmails.has(cm.email.toLowerCase()) && (
                  <span title="Matched to existing faculty profile" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <CheckCircle
                      size={16}
                      className="text-teal-400"
                    />
                  </span>
                )}
              </div>
              {cm.email && matchedEmails.has(cm.email.toLowerCase()) && (
                <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
                  <CheckCircle size={10} />
                  Matched to existing profile
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-noir-400 mb-1 block">Phone</label>
              <input
                type="tel"
                className="input-noir"
                placeholder="+91 XXXXX XXXXX"
                value={cm.phone}
                onChange={(e) => updateCoMentor(i, "phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
