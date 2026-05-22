import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import RefrigerantPTClient from "./RefrigerantPTClient";

export const metadata = {
  title: "Refrigerant P-T | HVAC Tools",
  description: "Pressure-Temperature lookup table for R-32, R-410A, R-134a, and R-22 refrigerants.",
};

export default async function RefrigerantPTPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <RefrigerantPTClient />;
}
