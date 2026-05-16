"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

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

    return serializePrisma({
      success: true,
      data: projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        customerId: p.customers?.id?.toString() || "",
        customerName: p.customers?.name || "Unknown",
        status: p.status,
        enabled_forms: p.enabled_forms || "Audit,Preventive,Corrective",
        enabled_unit_types: p.enabled_unit_types || "Chiller",
        monitoring_focus: p.monitoring_focus || "UNIT",
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
        radius_meters: p.radius_meters
      }))
    });
  } catch (error) {
    console.error("Fetch all projects config error:", error);
    return { error: "Failed to fetch projects configuration." };
  }
}

/**
 * Updates the configurations for a specific project.
 */
export async function updateProjectSettings(
  projectId: string, 
  data: { 
    enabled_forms?: string; 
    enabled_unit_types?: string; 
    monitoring_focus?: string;
    latitude?: number | null;
    longitude?: number | null;
    radius_meters?: number | null;
  }
) {
  const session = await getSession();
  if (!session || !session.isInternal) {
    return { error: "Unauthorized access" };
  }

  try {
    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: {
        ...(data.enabled_forms !== undefined && { enabled_forms: data.enabled_forms }),
        ...(data.enabled_unit_types !== undefined && { enabled_unit_types: data.enabled_unit_types }),
        ...(data.monitoring_focus !== undefined && { monitoring_focus: data.monitoring_focus }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.radius_meters !== undefined && { radius_meters: data.radius_meters }),
      }
    });

    // Revalidate centralized admin settings
    revalidatePath("/admin/settings");
    revalidatePath("/home");
    
    return { success: true };
  } catch (error) {
    console.error("Update project settings error:", error);
    return { error: "Failed to update project settings." };
  }
}

/**
 * Updates the GPS coordinates for a specific project site.
 */
export async function updateProjectLocation(projectId: string, lat: number, long: number) {
    const session = await getSession();
    if (!session || !session.isInternal) {
      return { error: "Unauthorized access" };
    }
  
    try {
      await prisma.projects.update({
        where: { id: BigInt(projectId) },
        data: { 
          latitude: lat,
          longitude: long
        }
      });
  
      revalidatePath("/admin/settings");
      return { success: true };
    } catch (error) {
      console.error("Update project location error:", error);
      return { error: "Failed to save project coordinates." };
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
  
      return serializePrisma({
        success: true,
        data: customers.map((c: any) => ({
          id: c.id.toString(),
          name: c.name
        }))
      });
    } catch (error) {
      return { error: "Failed to fetch customers list." };
    }
  }
