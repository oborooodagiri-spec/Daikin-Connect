
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import PIVESScannerClient from "./PIVESScannerClient";

export const metadata = {
  title: "PIVES Scanner | DSSI Connect",
  description: "Plaza Indonesia VES Scanner",
};

export default async function PIVESScannerPage() {
  const session = await getSession();

  if (!session || !session.pives_scanner_enabled) {
    redirect("/tools");
  }

  return <PIVESScannerClient />;
}

