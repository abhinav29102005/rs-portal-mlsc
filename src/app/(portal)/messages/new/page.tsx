export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { threadParticipants } from "@/db/schema/messaging";
import { eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { ChatInput } from "@/components/messages/ChatInput";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const metadata = { title: "New Message — TIET Research Portal" };

export default async function NewMessagePage(props: { searchParams: Promise<{ to?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const myUserId = session.user.id;

  const toUserId = searchParams.to;

  if (!toUserId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center card-glass-static p-12">
        <MessageSquare size={48} className="text-noir-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-noir-50 mb-2 font-heading">New Message</h1>
        <p className="text-noir-400 mb-6">Please select a mentor or faculty member from the directory to start a conversation.</p>
        <Link href="/mentors" className="btn btn-primary">Browse Directory</Link>
      </div>
    );
  }

  // Check if thread already exists between these two users
  // We look for a threadId that has EXACTLY these two users as participants.
  const existingThreadQuery = (await db.all(sql`
    SELECT t1.thread_id
    FROM thread_participants t1
    INNER JOIN thread_participants t2 ON t1.thread_id = t2.thread_id
    WHERE t1.user_id = ${myUserId} AND t2.user_id = ${toUserId}
    LIMIT 1
  `)) as { thread_id: string }[];

  if (existingThreadQuery.length > 0 && existingThreadQuery[0].thread_id) {
    redirect(`/messages/${existingThreadQuery[0].thread_id}`);
  }

  // Otherwise, fetch the recipient to show the compose UI
  const [recipient] = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, toUserId))
    .limit(1)
    .all();

  if (!recipient) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center card-glass-static p-12">
        <h1 className="text-2xl font-bold text-rose-400 mb-2 font-heading">User Not Found</h1>
        <p className="text-noir-400 mb-6">The person you are trying to message does not exist.</p>
        <Link href="/mentors" className="btn btn-secondary">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="card-glass p-4 mb-4 flex items-center gap-4 flex-shrink-0">
        <Link href="/messages" className="btn btn-ghost btn-icon text-noir-400">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/5 bg-noir-800 relative">
            <ImageWithFallback 
              src={recipient.image || ""}
              fallbackText={recipient.name?.[0] || "?"}
              alt={recipient.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-noir-50">New Message to {recipient.name}</h2>
            <p className="text-xs text-noir-400 capitalize">{recipient.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Empty Messages Window */}
      <div className="card-glass flex-1 overflow-y-auto p-6 flex flex-col mb-4">
        <div className="m-auto text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 bg-noir-800 ring-4 ring-white/5 relative overflow-hidden flex items-center justify-center">
             <ImageWithFallback 
              src={recipient.image || ""}
              fallbackText={recipient.name?.[0] || "?"}
              alt={recipient.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-bold text-noir-50 font-heading mb-2">Start a conversation</h3>
          <p className="text-noir-400 text-sm max-w-sm">
            Send a direct message to {recipient.name} to discuss research opportunities, mentorship, or projects.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="card-glass p-4 flex-shrink-0">
        <ChatInput toUserId={recipient.id} />
      </div>
    </div>
  );
}
