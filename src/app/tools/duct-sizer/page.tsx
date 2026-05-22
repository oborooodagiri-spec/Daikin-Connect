import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import DuctSizerClient from "./DuctSizerClient";

export const metadata = {
  title: "Duct Sizer | HVAC Tools",
  description: "Calculate duct dimensions for round and rectangular ducts based on air flow and velocity.",
};

export default async function DuctSizerPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <DuctSizerClient />;
}
