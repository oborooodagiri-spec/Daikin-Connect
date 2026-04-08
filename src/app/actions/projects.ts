"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// 1. READ ALL PROJECTS BY CUSTOMER
export async function getProjectsByCustomer(customerId: string) {
  try {
    const where: any = {};
    if (customerId) {
      where.customer_id = parseInt(customerId);
    }

    const projects = await prisma.projects.findMany({
      where,
      include: {
        customers: { select: { name: true } },
        _count: {
          select: { units: true, schedules: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        customerName: p.customers?.name || "N/A",
        code: p.code || "N/A",
        status: p.status,
        enabled_forms: p.enabled_forms || "Audit,Preventive,Corrective",
        units_count: p._count.units,
        schedules_count: p._count.schedules
      }))
    };
  } catch (error) {
    console.error("Fetch projects error:", error);
    return { error: "Failed to fetch projects." };
  }
}

// 2. CREATE PROJECT
export async function createProject(customerId: string, data: { name: string; code?: string; enabled_forms?: string }) {
  try {
    await prisma.projects.create({
      data: {
        customer_id: parseInt(customerId),
        name: data.name,
        code: data.code,
        status: "active",
        enabled_forms: data.enabled_forms || "Audit,Preventive,Corrective"
      }
    });
    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    return { success: true };
  } catch (error) {
    console.error("Create project error:", error);
    return { error: "Failed to create project." };
  }
}

// 3. UPDATE PROJECT
export async function updateProject(customerId: string, projectId: string, data: { name: string; code?: string; enabled_forms?: string }) {
  try {
    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: {
        name: data.name,
        code: data.code,
        enabled_forms: data.enabled_forms
      }
    });
    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    return { success: true };
  } catch (error) {
    console.error("Update project error:", error);
    return { error: "Failed to update project." };
  }
}

// 4. SUSPEND/ACTIVATE PROJECT
export async function toggleProjectStatus(customerId: string, projectId: string, currentStatus: string) {
  // Session check removed for client-side usage

  try {
    const newStatus = currentStatus === "active" ? "archived" : "active";
    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: { status: newStatus as any }
    });
    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    return { success: true };
  } catch (error) {
    console.error("Toggle project status error:", error);
    return { error: "Failed to update project status." };
  }
}

// Helper: Get Customer Name
export async function getCustomerData(customerId: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };
  
  try {
    const cust = await prisma.customers.findUnique({
      where: { id: parseInt(customerId) }
    });
    return { success: true, data: cust };
  } catch (error) {
    return { error: "Failed to fetch customer data" };
  }
}
