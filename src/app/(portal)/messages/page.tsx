import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { messageThreads, threadParticipants, messages } from "@/db/schema/messaging";
import { users } from "@/db/schema/users";
import { eq, desc, inArray, and, not } from "drizzle-orm";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const metadata = { title: "Messages — TIET Research Portal" };

export default async function MessagesInboxPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const myUserId = session.user.id;

  // 1. Find all threads I'm a participant in
  const myParticipants = await db
    .select({ threadId: threadParticipants.threadId })
    .from(threadParticipants)
    .where(eq(threadParticipants.userId, myUserId))
    .all();

  const threadIds = myParticipants.map(p => p.threadId);

  let threadsWithDetails: any[] = [];

  if (threadIds.length > 0) {
    // 2. Fetch the threads, their latest message, and the OTHER participant
    const threads = await db
      .select()
      .from(messageThreads)
      .where(inArray(messageThreads.id, threadIds))
      .orderBy(desc(messageThreads.updatedAt))
      .all();

    for (const thread of threads) {
      // Get the other participant
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
            eq(threadParticipants.threadId, thread.id),
            not(eq(threadParticipants.userId, myUserId))
          )
        )
        .limit(1)
        .all();

      // Get latest message
      const [latestMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.threadId, thread.id))
        .orderBy(desc(messages.createdAt))
        .limit(1)
        .all();

      threadsWithDetails.push({
        thread,
        otherParticipant: otherParticipant || null,
        latestMessage: latestMessage || null,
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-noir-50 font-heading">Messages</h1>
          <p className="text-noir-400 mt-1">Communicate with faculty and mentors.</p>
        </div>
      </div>

      {threadsWithDetails.length === 0 ? (
        <div className="card-glass-static p-12 text-center">
          <MessageSquare size={40} className="text-noir-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-noir-200 mb-2 font-heading">No Messages Yet</h3>
          <p className="text-noir-400 max-w-sm mx-auto mb-6">
            You don't have any active conversations. Browse the Mentor Directory or Faculty Discovery to start networking!
          </p>
          <Link href="/mentors" className="btn btn-primary">
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threadsWithDetails.map(({ thread, otherParticipant, latestMessage }) => (
            <Link 
              key={thread.id} 
              href={`/messages/${thread.id}`}
              className="card-glass p-5 flex items-center gap-5 hover:border-red-500/50 hover:bg-white/[0.02] transition-colors group block"
            >
              <div className="w-12 h-12 rounded-xl flex-shrink-0 ring-2 ring-white/5 overflow-hidden relative bg-noir-800 flex items-center justify-center">
                <ImageWithFallback 
                  src={otherParticipant?.image || ""}
                  fallbackText={otherParticipant?.name?.[0] || "?"}
                  alt={otherParticipant?.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-noir-50 text-sm group-hover:text-red-400 transition-colors truncate">
                    {otherParticipant?.name || "Unknown User"}
                  </h3>
                  {latestMessage && (
                    <span className="text-xs text-noir-500 whitespace-nowrap">
                      {new Date(latestMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {latestMessage ? (
                  <p className="text-sm text-noir-300 truncate">
                    {latestMessage.senderId === myUserId ? <span className="text-noir-500 mr-1">You:</span> : null}
                    {latestMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-noir-500 italic">No messages yet</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
