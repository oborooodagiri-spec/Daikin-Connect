import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ChilledWaterClient from "./ChilledWaterClient";

export const metadata = {
  title: "Piping | HVAC Tools",
  description: "Calculate pipe sizing, water flow rates, and pressure drop for piping systems.",
};

export default async function ChilledWaterPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ChilledWaterClient />;
}
