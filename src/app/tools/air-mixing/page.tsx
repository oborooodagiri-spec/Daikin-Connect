import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import AirMixingClient from "./AirMixingClient";

export const metadata = {
  title: "Air Mixing Calculator | HVAC Tools",
  description: "Calculate mixed air conditions when combining two air streams in HVAC systems.",
};

export default async function AirMixingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <AirMixingClient />;
}
