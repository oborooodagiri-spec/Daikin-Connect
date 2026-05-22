import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ElectricalClient from "./ElectricalClient";

export const metadata = {
  title: "Electrical Calculator | HVAC Tools",
  description: "Electrical power, current, and cable sizing calculators for HVAC engineering.",
};

export default async function ElectricalPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ElectricalClient />;
}
