import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getKnowledgeResources } from "@/app/actions/knowledge";

import KnowledgeClient from "./KnowledgeClient";

export const metadata = {
  title: "Knowledge Hub | DSSI Connect",
  description: "Master Blueprint, Juklak, and Juknis for Value Engineering Services.",
};

export default async function KnowledgePage() {
  const session = await getSession() as any;
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.roles?.some((role: string) => 
    ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
  );

  const resources = await getKnowledgeResources();

  return (
    <KnowledgeClient 
      isInternal={session.isInternal} 
      isAdmin={isAdmin} 
      initialVideos={resources}
    />
  );
}
