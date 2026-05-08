import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ScheduleClient from "./ScheduleClient";

export const metadata = {
  title: "Operational Daily Schedule | Daikin Connect",
  description: "Advanced interactive scheduling tool for operations and maintenance teams.",
};

export default async function OperationalSchedulePage() {
  const session = await getSession();

  // Admin access check
  const isAdmin = session?.roles?.some((role: string) => 
    ["admin", "super", "administrator", "management"].some(keyword => role.toLowerCase().includes(keyword))
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <ScheduleClient />;
}
