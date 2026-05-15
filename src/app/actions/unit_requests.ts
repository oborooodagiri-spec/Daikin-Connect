"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { createNotification } from "./notifications";

/**
 * Get all pending edit requests (For Admins/Engineers)
 */
export async function getPendingUnitRequests() {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized" };

  try {
    const requests = await (prisma as any).unit_edit_requests.findMany({
      where: { status: "Pending" },
      include: {
        units: {
          select: { 
            tag_number: true, 
            model: true, 
            brand: true, 
            unit_type: true,
            capacity: true,
            location: true,
            area: true,
            building_floor: true,
            room_tenant: true,
            yoi: true,
            serial_number: true,
            status: true,
            code: true
          }
        },
        users: {
          select: { name: true, company_name: true }
        }
      },
      orderBy: { requested_at: "desc" }
    });

    return serializePrisma({ success: true, data: requests });
  } catch (error) {
    return { error: "Failed to fetch requests" };
  }
}

/**
 * Approve a unit edit request
 */
export async function approveUnitRequest(requestId: number, adminNote?: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized" };

  try {
    const request = await (prisma as any).unit_edit_requests.findUnique({
      where: { id: requestId }
    });

    if (!request || request.status !== "Pending") return { error: "Request not found or already processed" };

    const details = JSON.parse(request.details_json);

    // 1. Update the actual unit
    // Ensure data types are correct (yoi must be Int, etc.)
    await prisma.units.update({
      where: { id: request.unit_id },
      data: {
        tag_number: details.tag_number || undefined,
        unit_type: details.unit_type || undefined,
        brand: details.brand || undefined,
        model: details.model || undefined,
        capacity: details.capacity || undefined,
        location: details.location || undefined,
        area: details.area || undefined,
        building_floor: details.building_floor || undefined,
        room_tenant: details.room_tenant || undefined,
        yoi: details.yoi ? parseInt(details.yoi.toString()) : undefined,
        serial_number: details.serial_number || undefined,
        status: (details.status && ["Normal", "Warning", "Critical", "Problem", "Pending", "On_Progress"].includes(details.status)) 
                ? details.status 
                : undefined,
        code: details.code || undefined
      }
    });

    // 2. Mark request as Approved
    await (prisma as any).unit_edit_requests.update({
      where: { id: requestId },
      data: {
        status: "Approved",
        processed_by: parseInt(session.userId),
        processed_at: new Date(),
        admin_note: adminNote
      }
    });

    await createNotification({
      userIds: [request.requested_by],
      title: "Edit Request Approved",
      message: `Your requested changes for unit ${request.unit_id} have been approved and applied.`,
      type: "success",
      link: `/passport/${request.unit_id}`
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Approval error:", error);
    return { error: "Approval failed" };
  }
}

/**
 * Reject a unit edit request
 */
export async function rejectUnitRequest(requestId: number, adminNote: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized" };

  try {
    await (prisma as any).unit_edit_requests.update({
      where: { id: requestId },
      data: {
        status: "Rejected",
        processed_by: parseInt(session.userId),
        processed_at: new Date(),
        admin_note: adminNote
      }
    });

    const request = await (prisma as any).unit_edit_requests.findUnique({ where: { id: requestId } });
    if (request) {
      await createNotification({
        userIds: [request.requested_by],
        title: "Edit Request Rejected",
        message: `Your requested changes for unit ${request.unit_id} were rejected. Note: ${adminNote}`,
        type: "error"
      });
    }

    return { success: true };
  } catch (error) {
    return { error: "Rejection failed" };
  }
}
