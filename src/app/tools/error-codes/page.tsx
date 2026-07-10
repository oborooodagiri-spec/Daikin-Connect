import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import ErrorCodesClient from "./ErrorCodesClient";

export const metadata = {
  title: "Error Code Diagnosis | DSSI Connect",
  description: "Daikin Self-Diagnosis Tool — instantly find error codes, causes, and solutions for all Daikin HVAC systems.",
};

export default async function ErrorCodesPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <ErrorCodesClient />;
}
