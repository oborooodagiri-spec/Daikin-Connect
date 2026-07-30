import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import LiveDataClient from "./LiveDataClient";

export const dynamic = "force-dynamic";

export default async function LiveDataPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const isAdmin = session?.roles?.some((r: string) => 
    ["admin", "super admin", "administrator"].some(keyword => r.toLowerCase().includes(keyword))
  );

  const isManagement = session?.roles?.some((r: string) => r.toLowerCase().includes("management"));
  const canClickWidgets = isAdmin || isManagement;
  return <LiveDataClient isAdmin={isAdmin} canClickWidgets={canClickWidgets} sessionName={session.name} />;
}
