import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "student" | "faculty" | "admin" | "alumni_mentor";
      status: "active" | "pending_approval" | "suspended";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "student" | "faculty" | "admin" | "alumni_mentor";
    status?: "active" | "pending_approval" | "suspended";
  }
}
