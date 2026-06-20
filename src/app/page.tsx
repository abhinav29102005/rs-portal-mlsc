import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ConstellationBackground } from "@/components/layout/ConstellationBackground";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
