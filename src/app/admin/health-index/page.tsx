import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import HealthIndexClient from "./HealthIndexClient";

export const metadata = {
  title: "Health Index Dashboard | Daikin Connect",
  description: "Real-time unit health monitoring and proactive diagnostics for VES Tier 2.",
};

export default async function HealthIndexPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.roles.some((r: string) => 
    ["admin", "super", "administrator", "management"].some(keyword => 
      r.toLowerCase().includes(keyword)
    )
  );

  if (!isAdmin) {
    redirect("/home");
  }

  return (
    <main className="bg-[#f8faff] min-h-screen">
      <HealthIndexClient />
    </main>
  );
}
