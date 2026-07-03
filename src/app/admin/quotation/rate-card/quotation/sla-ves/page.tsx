import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import SlaVesClient from "./SlaVesClient";

export const metadata = {
  title: "SLA Document Generator | DSSI Connect",
  description: "Generate Service Level Agreement based on quotation.",
};

export default async function SlaVesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <SlaVesClient />;
}
