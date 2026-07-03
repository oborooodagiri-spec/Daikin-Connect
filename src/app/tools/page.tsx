import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "HVAC Tools | DSSI Connect",
  description: "Engineering tools suite for HVAC professionals — unit converters, psychrometric calculators, and more.",
};

export default async function ToolsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ToolsClient />;
}
