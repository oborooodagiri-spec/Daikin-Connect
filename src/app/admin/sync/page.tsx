import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import SyncCenterClient from "./SyncCenterClient";

export const metadata = {
  title: "Sync Center | Daikin Connect Admin",
  description: "Advanced data synchronization and reconciliation engine.",
};

export default async function SyncCenterPage() {
  const session = await getSession();

  // Strict Admin Role Check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/home");
  }

  return <SyncCenterClient />;
}
