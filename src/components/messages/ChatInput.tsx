"use client";

import { useState, useRef } from "react";
import { sendMessage } from "@/app/actions/messages";
import { Send, Loader2, AlertCircle } from "lucide-react";

export function ChatInput({ threadId, toUserId }: { threadId?: string; toUserId?: string }) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get("content") as string;
    if (!content.trim()) return;

    setIsPending(true);
    setErrorMsg("");
    try {
      if (threadId) formData.append("threadId", threadId);
      if (toUserId) formData.append("toUserId", toUserId);
      
      await sendMessage(formData);
      formRef.current?.reset();
    } catch (error) {
      setErrorMsg("Failed to send message. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          <AlertCircle size={14} />
          {errorMsg}
        </div>
      )}
      <form ref={formRef} action={handleSubmit} className="flex gap-3">
        <input
          type="text"
          name="content"
          placeholder="Type a message..."
          className="input-noir flex-1"
          disabled={isPending}
          autoComplete="off"
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary btn-icon w-11 flex items-center justify-center flex-shrink-0"
          disabled={isPending}
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
        </button>
      </form>
    </div>
  );
}
