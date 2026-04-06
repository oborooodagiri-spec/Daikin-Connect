"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

/**
 * Submit a new complaint from the Passport (QR) page.
 * This can be done by anyone scanning the QR (End-User).
 */
export async function submitComplaint(token: string, data: { 
  customerName: string; 
  description: string; 
  photoUrl?: string; 
}) {
  try {
    const unit = await (prisma.units as any).findUnique({ 
      where: { qr_code_token: token } 
    } as any);
    
    if (!unit) return { error: "Unit not found" };

    // 1. Create the complaint record
    await (prisma.complaints as any).create({
      data: {
        unit_id: unit.id,
        customer_name: data.customerName,
        description: data.description,
        photo_url: data.photoUrl,
        status: "Pending"
      }
    });

    // 2. Automatically set unit status to 'Problem'
    await (prisma.units as any).update({
      where: { id: unit.id },
      data: { status: "Problem" }
    } as any);

    revalidatePath(`/passport/${token}`);
    revalidatePath("/dashboard", "layout");
    
    return serializePrisma({ success: true });
  } catch (error: any) {
    console.error("Submit complaint error:", error);
    return { error: "Failed to submit complaint" };
  }
}

/**
 * Confirm resolution of a problem by the Customer.
 * Changes status from 'On_Progress' back to 'Normal'.
 */
export async function resolveComplaint(unitId: number) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  // Strict Role Check: Only Customer can resolve
  const isCustomer = session.roles.some(r => r.toLowerCase() === "customer");
  if (!isCustomer && !session.isInternal) { // Internal can also resolve for fallback, but main flow is Customer
     return { error: "Only customers can verify resolution" };
  }

  try {
    // 1. Update unit status back to Normal
    await (prisma.units as any).update({
      where: { id: unitId },
      data: { status: "Normal" }
    } as any);

    // 2. Update all pending/on_progress complaints for this unit to Resolved
    await (prisma.complaints as any).updateMany({
      where: { 
        unit_id: unitId,
        status: { in: ["Pending", "On_Progress"] }
      },
      data: { status: "Resolved" }
    });

    revalidatePath("/dashboard");
    return serializePrisma({ success: true });
  } catch (error: any) {
    console.error("Resolve complaint error:", error);
    return { error: "Failed to resolve complaint" };
  }
}

/**
 * Helper to get user's assigned projects (for redirection)
 */
export async function getUserAssignedProjects() {
  const session = await getSession();
  if (!session) return [];

  const access = await prisma.user_project_access.findMany({
    where: { user_id: parseInt(session.userId) },
    include: { projects: true }
  });

  return serializePrisma(access.map(a => a.projects).filter(Boolean));
}

/**
 * Get recent complaints for a specific project or global
 */
export async function getProjectComplaints(projectId?: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Not authenticated" };

    const where: any = {};
    if (projectId) {
      where.units = { project_ref_id: BigInt(projectId) };
    } else if (!session.isInternal) {
      // If not internal and no projectId, only show from assigned projects
      const assigned = await prisma.user_project_access.findMany({
        where: { user_id: parseInt(session.userId) },
        select: { project_id: true }
      });
      where.units = { project_ref_id: { in: assigned.map(a => a.project_id) } };
    }

    const complaints = await (prisma.complaints as any).findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        units: {
          select: { tag_number: true, model: true, area: true, room_tenant: true }
        }
      }
    });

    return serializePrisma({
      success: true,
      data: complaints.map((c: any) => ({
        id: c.id,
        customer_name: c.customer_name,
        description: c.description,
        created_at: c.created_at,
        photo_url: c.photo_url,
        status: c.status,
        unit_tag: c.units?.tag_number || "N/A",
        unit_model: c.units?.model || "N/A",
        unit_area: c.units?.area || "N/A",
        unit_room: c.units?.room_tenant || ""
      }))
    });
  } catch (error) {
    console.error("Get project complaints error:", error);
    return { error: "Failed to fetch complaints" };
  }
}
