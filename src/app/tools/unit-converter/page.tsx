import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import UnitConverterClient from "./UnitConverterClient";

export const metadata = {
  title: "Unit Converter | HVAC Tools",
  description: "Convert HVAC units in real-time: air flow, velocity, pressure, cooling capacity, pipe sizing, and temperature.",
};

export default async function UnitConverterPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <UnitConverterClient />;
}
