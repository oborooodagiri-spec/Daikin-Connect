import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import PsychrometricClient from "./PsychrometricClient";

export const metadata = {
  title: "Psychrometric Calculator | HVAC Tools",
  description: "Calculate psychrometric properties of moist air with interactive chart visualization.",
};

export default async function PsychrometricPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <PsychrometricClient />;
}
