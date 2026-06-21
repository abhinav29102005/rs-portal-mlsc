import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema/users";
import { studentProfiles } from "@/db/schema/profiles";
import { alumniProfiles } from "@/db/schema/alumni";
import { eq } from "drizzle-orm";
import {
  isThaparEmail,
  isStudentEmail,
  parseStudentEmail,
  detectRole,
} from "@/lib/email-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // 7 days
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          // Note: hd (hosted domain) parameter in Google OAuth only accepts a single string.
          // Since we want both thapar.edu and alumni.thapar.edu, we must omit `hd` and rely
          // entirely on the `signIn` callback to filter the emails.
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase();
      if (!email || !isThaparEmail(email)) {
        return false; // Block non-thapar.edu emails
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      if (user?.id) {
        // First sign-in or manual update — fetch full user
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .get();

        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.userId = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "student" | "faculty" | "admin" | "alumni_mentor";
        session.user.status = token.status as
          | "active"
          | "pending_approval"
          | "suspended";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Called on first sign-up — detect role and set up profile
      const email = user.email?.toLowerCase();
      if (!email) return;

      const role = detectRole(email);
      if (!role) return;

      // Update user role
      // Alumni are pre-verified via their @alumni domain
      const status =
        role === "student" || role === "alumni_mentor"
          ? "active"
          : "pending_approval";
      await db
        .update(users)
        .set({ role, status })
        .where(eq(users.id, user.id!));

      // Auto-create student profile with parsed data
      if (role === "student") {
        const parsed = parseStudentEmail(email);
        if (parsed) {
          await db.insert(studentProfiles).values({
            userId: user.id!,
            rollNumber: parsed.rollNumber,
            batchYear: parsed.batchYear,
            program: parsed.program,
            department: parsed.department,
            currentYear: parsed.currentYear,
          });
        }
      }

      // Auto-create basic alumni profile
      if (role === "alumni_mentor") {
        await db.insert(alumniProfiles).values({
          userId: user.id!,
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
