import { getSession } from "@/app/actions/auth";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import LiveDataClient from "./LiveDataClient";

export const dynamic = "force-dynamic";

export default async function LiveDataPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const profile = await getProfile();

  const isAdmin = session?.roles?.some((r: string) => 
    ["admin", "super admin", "administrator", "management", "director"].some(keyword => r.toLowerCase().includes(keyword))
  );

  const canClickWidgets = true;
  return <LiveDataClient isAdmin={isAdmin} canClickWidgets={canClickWidgets} sessionName={session.name} sessionId={parseInt(session.userId)} avatarUrl={profile?.avatarUrl || null} />;
}
