"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Fetches all projects with their current form configurations and customer names.
 * Restricted to internal users.
 */
export async function getAllProjectsConfig() {
  const session = await getSession();
  if (!session || !session.isInternal) {
    return { error: "Unauthorized access" };
  }

  try {
    const projects = await prisma.projects.findMany({
      include: {
        customers: {
          select: { name: true, id: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        customerId: p.customers?.id?.toString() || "",
        customerName: p.customers?.name || "Unknown",
        status: p.status,
        enabled_forms: p.enabled_forms || "Audit,Preventive,Corrective"
      }))
    };
  } catch (error) {
    console.error("Fetch all projects config error:", error);
    return { error: "Failed to fetch projects configuration." };
  }
}

/**
 * Updates the enabled forms for a specific project.
 */
export async function updateProjectCapabilities(projectId: string, forms: string) {
  const session = await getSession();
  if (!session || !session.isInternal) {
    return { error: "Unauthorized access" };
  }

  try {
    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: { enabled_forms: forms }
    });

    // Revalidate dashboard and settings
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    
    return { success: true };
  } catch (error) {
    console.error("Update project capabilities error:", error);
    return { error: "Failed to update project settings." };
  }
}

/**
 * Fetches all active customers for the filter dropdown.
 */
export async function getAllCustomersForFilter() {
    const session = await getSession();
    if (!session || !session.isInternal) {
      return { error: "Unauthorized access" };
    }
  
    try {
      const customers = await prisma.customers.findMany({
        where: { is_active: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      });
  
      return {
        success: true,
        data: customers.map((c: any) => ({
          id: c.id.toString(),
          name: c.name
        }))
      };
    } catch (error) {
      return { error: "Failed to fetch customers list." };
    }
  }
