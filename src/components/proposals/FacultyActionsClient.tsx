"use client";

import { useState } from "react";
import { FileText, Mail } from "lucide-react";
import Link from "next/link";
import { ProposalModal } from "@/components/proposals/ProposalModal";

export function FacultyActionsClient({ facultyProfileId, facultyName, userId }: { facultyProfileId: string; facultyName: string; userId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 mt-4 sm:mt-2">
        <Link 
          href={`/messages/new?to=${userId}`} 
          className="btn btn-secondary w-full sm:w-auto"
        >
          <Mail size={18} />
          Message
        </Link>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <FileText size={18} />
          Submit Proposal
        </button>
      </div>

      <ProposalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        facultyProfileId={facultyProfileId} 
        facultyName={facultyName} 
      />
    </>
  );
}
