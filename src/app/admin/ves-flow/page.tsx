import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import VesFlowClient from "./VesFlowClient";

export const metadata = {
  title: "VES Project Lifecycle | Strategic Flow Showcase",
  description: "Administrative operational workflow for VES Projects - Private Management Access",
};

export default async function VesFlowPage() {
  const session = await getSession();

  // Admin Security Check
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.roles.some((r: string) => 
    ["admin", "super", "administrator", "management"].some(keyword => 
      r.toLowerCase().includes(keyword)
    )
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-[#020617] min-h-screen text-white overflow-hidden">
      <VesFlowClient />
    </main>
  );
}
