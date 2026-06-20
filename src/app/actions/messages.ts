"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messages, messageThreads, threadParticipants } from "@/db/schema/messaging";
import { users } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mailer";

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const content = formData.get("content") as string;
  let threadId = formData.get("threadId") as string | null;
  const toUserId = formData.get("toUserId") as string | null; // Used for new threads

  if (!content) throw new Error("Message content is required");

  let recipientId = toUserId;

  // 1. If starting a new thread
  if (!threadId) {
    if (!toUserId) throw new Error("Recipient is required for new threads");

    // Check if a direct thread already exists between these two users
    // This is a simplified check. A proper check would query threadParticipants for exact match.
    // For now, we just create a new direct thread.
    const [newThread] = await db.insert(messageThreads).values({
      contextType: "direct",
    }).returning({ id: messageThreads.id });

    threadId = newThread.id;

    // Add participants
    await db.insert(threadParticipants).values([
      { threadId, userId: session.user.id },
      { threadId, userId: toUserId },
    ]);
  } else {
    // If replying to existing thread, find the other participant to notify them
    const participants = await db
      .select({ userId: threadParticipants.userId })
      .from(threadParticipants)
      .where(eq(threadParticipants.threadId, threadId))
      .all();

    const otherParticipant = participants.find(p => p.userId !== session.user.id);
    if (otherParticipant) recipientId = otherParticipant.userId;
  }

  // 2. Insert Message
  await db.insert(messages).values({
    threadId: threadId,
    senderId: session.user.id,
    content: content,
  });

  // 3. Send Email Notification
  if (recipientId) {
    const recipientQuery = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, recipientId))
      .get();

    if (recipientQuery?.email) {
      // Don't await sendEmail so it doesn't block the UI response
      sendEmail({
        to: recipientQuery.email,
        subject: `New Message from ${session.user.name} on TIET Portal`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">New Message</h2>
            <p style="color: #555; font-size: 16px;">You have received a new message from <strong>${session.user.name}</strong>:</p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #333; font-style: italic;">"${content}"</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/messages/${threadId}" style="display: inline-block; background-color: #f59e0b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reply on Portal
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">
              This is an automated notification from the TIET Research & Mentor Portal.
            </p>
          </div>
        `,
      }).catch(console.error); // Catch errors silently
    }
  }

  // 4. Revalidate UI
  revalidatePath("/messages");
  revalidatePath(`/messages/${threadId}`);
  
  return { success: true, threadId };
}
