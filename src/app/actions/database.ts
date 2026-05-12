"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * FETCH RESOURCES
 * Implements complex visibility logic:
 * 1. Internal staff see everything (General + All Project specific resources).
 * 2. External users see:
 *    a. General resources with "Public" visibility.
 *    b. Project-specific resources ONLY if they have access to that project.
 */
export async function getResources() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const isInternal = session.isInternal;
    const userId = parseInt(session.userId);

    let resources: any[];

    if (isInternal) {
      // Internal staff see all
      resources = await prisma.$queryRawUnsafe(`
        SELECT kr.*, p.name as project_name 
        FROM knowledge_resources kr
        LEFT JOIN projects p ON kr.project_id = p.id
        ORDER BY kr.created_at DESC
      `);
    } else {
      // External users
      const projectAccess = await prisma.user_project_access.findMany({
        where: { user_id: userId },
        select: { project_id: true }
      });
      const accessibleProjectIds = projectAccess.map(pa => pa.project_id);
      
      // Handle the case where accessibleProjectIds is empty
      const projectIdsStr = accessibleProjectIds.length > 0 ? accessibleProjectIds.join(",") : "0";

      resources = await prisma.$queryRawUnsafe(`
        SELECT kr.*, p.name as project_name 
        FROM knowledge_resources kr
        LEFT JOIN projects p ON kr.project_id = p.id
        WHERE (kr.allowed_users IS NOT NULL AND FIND_IN_SET(?, kr.allowed_users))
           OR (kr.allowed_users IS NULL AND (kr.visibility = 'Public' OR kr.project_id IN (${projectIdsStr})))
        ORDER BY kr.created_at DESC
      `, userId.toString());
    }

    // Map project_name to expected structure for UI
    const mappedResources = resources.map(res => ({
      ...res,
      projects: res.project_name ? { name: res.project_name } : null
    }));

    return serializePrisma({ success: true, data: mappedResources });
  } catch (error) {
    console.error("Fetch resources error:", error);
    return { error: "Failed to fetch database resources" };
  }
}

/**
 * CREATE RESOURCE (Admin Only)
 */
export async function createResource(formData: {
  title: string;
  category: string;
  type: string;
  file_url?: string;
  href?: string;
  thumbnail?: string;
  size?: string;
  tags?: string;
  visibility: string;
  allowed_users?: string | null;
  project_id?: string | null;
}) {
  const session = await getSession();
  const isAdmin = session?.roles?.some((r: string) => ["Admin", "Super Admin"].includes(r));
  
  if (!isAdmin) return { error: "Unauthorized: Admin access required" };

  try {
    const id = crypto.randomUUID();
    const projectIdVal = formData.project_id ? BigInt(formData.project_id) : null;

    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_resources (id, title, category, type, file_url, href, thumbnail, size, tags, visibility, allowed_users, project_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, 
      id, formData.title, formData.category, formData.type, formData.file_url, 
      formData.href, formData.thumbnail, formData.size, formData.tags, 
      formData.visibility, formData.allowed_users, projectIdVal
    );

    revalidatePath("/admin/database");
    return { success: true };
  } catch (error) {
    console.error("Create resource error:", error);
    return { error: "Failed to create resource" };
  }
}

/**
 * UPDATE RESOURCE (Admin Only)
 */
export async function updateResource(id: string, formData: {
  title: string;
  category: string;
  type: string;
  file_url?: string;
  href?: string;
  thumbnail?: string;
  size?: string;
  tags?: string;
  visibility: string;
  allowed_users?: string | null;
  project_id?: string | null;
}) {
  const session = await getSession();
  const isAdmin = session?.roles?.some((r: string) => ["Admin", "Super Admin"].includes(r));
  
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const projectIdVal = formData.project_id ? BigInt(formData.project_id) : null;

    await prisma.$executeRawUnsafe(`
      UPDATE knowledge_resources 
      SET title = ?, category = ?, type = ?, file_url = ?, href = ?, 
          thumbnail = ?, size = ?, tags = ?, visibility = ?, allowed_users = ?, project_id = ?, 
          updated_at = NOW()
      WHERE id = ?
    `, 
      formData.title, formData.category, formData.type, formData.file_url, 
      formData.href, formData.thumbnail, formData.size, formData.tags, 
      formData.visibility, formData.allowed_users, projectIdVal, id
    );

    revalidatePath("/admin/database");
    return { success: true };
  } catch (error) {
    console.error("Update resource error:", error);
    return { error: "Failed to update resource" };
  }
}

/**
 * DELETE RESOURCE (Admin Only)
 */
export async function deleteResource(id: string) {
  const session = await getSession();
  const isAdmin = session?.roles?.some((r: string) => ["Admin", "Super Admin"].includes(r));
  
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    await prisma.$executeRawUnsafe(`DELETE FROM knowledge_resources WHERE id = ?`, id);
    revalidatePath("/admin/database");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete resource" };
  }
}
