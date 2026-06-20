import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Workspaces — TIET Research Portal" };

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label mb-1">Collaboration</p>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Your{" "}
          <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
            Workspaces
          </span>
        </h1>
      </div>
      <div className="card-glass-static p-12 text-center">
        <p className="text-noir-400">Workspaces will appear once a proposal is accepted</p>
      </div>
    </div>
  );
}
