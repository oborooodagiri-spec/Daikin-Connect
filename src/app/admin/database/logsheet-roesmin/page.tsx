import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import LogsheetRoesminClient from "./LogsheetRoesminClient";

export const metadata = {
  title: "Logsheet Lanud Roesmin Nurjadin | Daikin Connect",
  description: "Daily Logsheet monitoring HVAC — Lanud Roesmin Nurjadin (Rafale Simulator)",
};

export default async function LogsheetRoesminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return <LogsheetRoesminClient />;
}
