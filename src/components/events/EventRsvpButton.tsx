"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

interface EventRsvpButtonProps {
  eventId: string;
  hasRsvpd: boolean;
  isFull: boolean;
}

export function EventRsvpButton({ eventId, hasRsvpd, isFull }: EventRsvpButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rsvpd, setRsvpd] = useState(hasRsvpd);

  const toggleRsvp = async () => {
    setIsLoading(true);
    try {
      const method = rsvpd ? "DELETE" : "POST";
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method });

      if (!res.ok) {
        throw new Error("Failed to update RSVP");
      }

      setRsvpd(!rsvpd);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update RSVP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (rsvpd) {
    return (
      <button
        onClick={toggleRsvp}
        disabled={isLoading}
        className="btn btn-secondary w-full group relative overflow-hidden"
      >
        <span className="flex items-center gap-2 group-hover:opacity-0 transition-opacity">
          <Check size={16} className="text-teal-400" />
          RSVP Confirmed
        </span>
        <span className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500/10 text-rose-400">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          Cancel RSVP
        </span>
      </button>
    );
  }

  if (isFull) {
    return (
      <button disabled className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
        Event Full
      </button>
    );
  }

  return (
    <button
      onClick={toggleRsvp}
      disabled={isLoading}
      className="btn btn-primary w-full gap-2"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      RSVP Now
    </button>
  );
}
