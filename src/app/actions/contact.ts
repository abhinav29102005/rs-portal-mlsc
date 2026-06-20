"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mailer";

export async function sendContactEmail(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const recipientId = formData.get("recipientId") as string;
  const message = formData.get("message") as string;
  const subject = formData.get("subject") as string || "New Message from TIET Mentor Portal";

  if (!recipientId || !message) {
    throw new Error("Missing required fields");
  }

  // Fetch recipient
  const recipient = await db.select().from(users).where(eq(users.id, recipientId)).get();
  
  if (!recipient || !recipient.email) {
    throw new Error("Recipient not found or lacks email");
  }

  // Construct email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a;">New Message via TIET Mentor Portal</h2>
      <p style="color: #475569;">You have received a new message from <strong>${session.user.name}</strong> (${session.user.email}):</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #fbbf24; border-radius: 4px; margin: 20px 0; color: #1e293b; white-space: pre-wrap;">
        ${message}
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        Reply directly to this email to respond to the student, or log in to the portal to view their full profile.
      </p>
    </div>
  `;

  await sendEmail({
    to: recipient.email,
    subject: subject,
    html: htmlContent,
  });

  return { success: true };
}
