export const runtime = "edge";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = { title: "Settings — TIET Research Portal" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label mb-1">Preferences</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Account{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            Settings
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Manage your account preferences, appearance, and notifications.
        </p>
      </div>

      <SettingsClient user={{
        name: session.user.name || "Unknown User",
        email: session.user.email || "No Email",
        role: session.user.role || "student",
      }} />
    </div>
  );
}
