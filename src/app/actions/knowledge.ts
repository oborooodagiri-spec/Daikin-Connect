"use server";

import prisma from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getKnowledgeResources(projectId?: string | null) {
  try {
    const session = await getSession();
    if (!session) return [];

    // Fetch resources. If projectId is provided, fetch specifically for that project + general (null)
    // Otherwise fetch all general resources
    const resources = await prisma.knowledge_resources.findMany({
      where: projectId 
        ? { OR: [{ project_id: BigInt(projectId) }, { project_id: null }] }
        : { project_id: null },
      orderBy: { created_at: 'desc' }
    });

    return resources.map(r => ({
      ...r,
      project_id: r.project_id?.toString() || null,
      id: r.id.toString()
    }));
  } catch (error) {
    console.error("Error fetching knowledge resources:", error);
    return [];
  }
}

export async function createKnowledgeResource(data: {
  title: string;
  category: string;
  type: string;
  file_url?: string;
  href?: string;
  thumbnail?: string;
  tags?: string;
  visibility?: string;
  projectId?: string;
  content?: string; 
}) {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) throw new Error("Unauthorized");

    const resource = await prisma.knowledge_resources.create({
      data: {
        title: data.title,
        category: data.category,
        type: data.type,
        file_url: data.file_url,
        href: data.href,
        thumbnail: data.thumbnail,
        tags: data.tags,
        content: data.content,
        visibility: data.visibility || "Internal",
        project_id: data.projectId ? BigInt(data.projectId) : null,
      }
    });

    revalidatePath("/home/knowledge");
    return { success: true, id: resource.id.toString() };
  } catch (error) {
    console.error("Error creating knowledge resource:", error);
    return { success: false, error: "Gagal menyimpan resource" };
  }
}
