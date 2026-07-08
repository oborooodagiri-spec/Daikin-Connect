import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

import KnowledgeClient from "./KnowledgeClient";

export const metadata = {
  title: "Knowledge Hub | DSSI Connect",
  description: "Master Blueprint, Juklak, and Juknis for Value Engineering Services.",
};

export default async function KnowledgePage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <KnowledgeClient isInternal={session.isInternal} />
  );
}
