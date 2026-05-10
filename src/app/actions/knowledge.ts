"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Seed specific VES knowledge resource
 */
export async function seedVesKnowledgeResource() {
  const session = await getSession();
  const isAdmin = session?.roles?.some((r: string) => ["Admin", "Super Admin"].includes(r));
  
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const resources = [
      {
        id: crypto.randomUUID(),
        title: "Strategic Operational Roadmap - VES Project Lifecycle",
        category: "Strategy",
        type: "APP",
        href: "/admin/ves-flow",
        tags: "VES, Strategy, Roadmap, Operational",
        visibility: "Internal",
        size: "Interactive",
      },
      {
        id: crypto.randomUUID(),
        title: "Smart Service Contract & Asset Management Presentation",
        category: "Marketing",
        type: "APP",
        href: "/service-presentation",
        tags: "Smart Service, Presentation, Asset Management",
        visibility: "Internal",
        size: "Interactive",
      }
    ];

    for (const res of resources) {
      // Check if title already exists to avoid duplicates
      const existing = await (prisma.knowledge_resources as any).findFirst({
        where: { title: res.title }
      });

      if (!existing) {
        await (prisma as any).knowledge_resources.create({
          data: {
            ...res,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        console.log(`[SEED] Created resource: ${res.title}`);
      }
    }

    revalidatePath("/admin/database");
    return { success: true };
  } catch (error) {
    console.error("Seed VES resources error:", error);
    return { error: "Failed to seed VES resources" };
  }
}
