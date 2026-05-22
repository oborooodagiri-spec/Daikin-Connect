import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import HeatLoadClient from "./HeatLoadClient";

export const metadata = {
  title: "Heat Load Estimator | HVAC Tools",
  description: "Quick room cooling load estimator for sensible, latent, and total heat loads.",
};

export default async function HeatLoadPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <HeatLoadClient />;
}
