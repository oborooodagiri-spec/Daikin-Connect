import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getKnowledgeResources } from "@/app/actions/knowledge";
import KnowledgeClient from "./KnowledgeClient";

export const metadata = {
  title: "Knowledge Hub | Daikin Connect",
  description: "Master Blueprint, Juklak, and Juknis for Value Engineering Services.",
};

export default async function KnowledgePage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  // Restrict to Admin only for now
  if (!session.isAdmin) {
    redirect("/home");
  }

  const resources = await getKnowledgeResources();

  return (
    <KnowledgeClient 
      resources={resources} 
      isAdmin={session.isAdmin} 
    />
  );
}
