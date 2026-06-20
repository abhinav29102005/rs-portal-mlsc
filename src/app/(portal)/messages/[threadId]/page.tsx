export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { messages, messageThreads, threadParticipants } from "@/db/schema/messaging";
import { users } from "@/db/schema/users";
import { eq, and, not, asc } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ChatInput } from "@/components/messages/ChatInput";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const metadata = { title: "Chat — TIET Research Portal" };

export default async function ThreadPage(props: { params: Promise<{ threadId: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const myUserId = session.user.id;

  // 1. Verify user is part of thread
  const [membership] = await db
    .select()
    .from(threadParticipants)
    .where(
      and(
        eq(threadParticipants.threadId, params.threadId),
        eq(threadParticipants.userId, myUserId)
      )
    )
    .limit(1)
    .all();

  if (!membership) {
    notFound();
  }

  // 2. Mark as read
  await db.update(threadParticipants)
    .set({ lastReadAt: new Date() })
    .where(eq(threadParticipants.id, membership.id));

  // 3. Fetch other participant
  const [otherParticipant] = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      role: users.role,
    })
    .from(threadParticipants)
    .innerJoin(users, eq(threadParticipants.userId, users.id))
    .where(
      and(
        eq(threadParticipants.threadId, params.threadId),
        not(eq(threadParticipants.userId, myUserId))
      )
    )
    .limit(1)
    .all();

  // 4. Fetch Messages
  const threadMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, params.threadId))
    .orderBy(asc(messages.createdAt))
    .all();

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
              src={otherParticipant?.image || ""}
              fallbackText={otherParticipant?.name?.[0] || "?"}
              alt={otherParticipant?.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-noir-50">{otherParticipant?.name || "Unknown User"}</h2>
            <p className="text-xs text-noir-400 capitalize">{otherParticipant?.role?.replace("_", " ") || "User"}</p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="card-glass flex-1 overflow-y-auto p-6 space-y-6 mb-4 flex flex-col">
        {threadMessages.length === 0 ? (
          <div className="m-auto text-center text-noir-400 italic">No messages yet.</div>
        ) : (
          threadMessages.map(msg => {
            const isMe = msg.senderId === myUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    isMe 
                      ? "bg-amber-500/10 text-amber-50 border border-amber-500/20 rounded-br-sm" 
                      : "bg-noir-800/80 text-noir-50 border border-white/5 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-2 block ${isMe ? "text-amber-500/60 text-right" : "text-noir-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="card-glass p-4 flex-shrink-0">
        <ChatInput threadId={params.threadId} />
      </div>
    </div>
  );
}
