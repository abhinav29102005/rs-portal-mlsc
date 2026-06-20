export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { verifyAdmin } from "@/app/actions/admin";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.status === "suspended") {
    redirect("/suspended");
  }

  const isSuperAdmin = await verifyAdmin();

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }}
      isSuperAdmin={isSuperAdmin}
    >
      {children}
    </AppShell>
  );
}
