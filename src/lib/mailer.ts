import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends an email using Nodemailer.
 * If SMTP credentials are not set in the environment, it uses Ethereal Email
 * to generate a mock inbox and prints the preview URL to the console.
 */
export async function sendEmail(options: SendEmailOptions) {
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Use real SMTP credentials if provided
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email for testing
    console.warn("⚠️ No SMTP credentials found. Using Ethereal Email for testing.");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const info = await transporter.sendMail({
    from: `"TIET Mentor Portal" <${process.env.SMTP_USER || "noreply@thapar.edu"}>`,
    to: options.to,
    subject: options.subject,
    text: options.text || options.html?.replace(/<[^>]+>/g, ""),
    html: options.html,
  });

  if (!process.env.SMTP_HOST) {
    console.log("✉️  Message sent successfully (Mock): %s", info.messageId);
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("✉️  Message sent: %s", info.messageId);
  }

  return info;
}
