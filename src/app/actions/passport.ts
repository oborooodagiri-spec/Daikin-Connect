"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

import { calculateUnitHealth } from "@/lib/physics/enthalpy";
import { notifyInternalStaff } from "./notifications";

/**
 * Public API for fetching unit details by QR token
 */
export async function getUnitByToken(token: string) {
  try {
    const unit = await prisma.units.findFirst({
      where: { qr_code_token: token },
      include: {
        projects: {
          include: {
            customers: {
              select: { name: true }
            }
          }
        },
        service_activities: {
          orderBy: { service_date: 'desc' },
          take: 5 // Get some recent ones to find valid data
        }
      }
    });

    if (!unit) return { error: "Unit not found" };

    // Find latest activity with valid enthalpy data
    const latestTechnical = unit.service_activities.find(a => 
      a.entering_db && a.entering_rh && a.leaving_db && a.leaving_rh && (a.design_airflow || unit.capacity)
    );

    let healthMetrics = null;
    if (latestTechnical) {
      healthMetrics = calculateUnitHealth(
        latestTechnical.entering_db || 0,
        latestTechnical.entering_rh || 0,
        latestTechnical.leaving_db || 0,
        latestTechnical.leaving_rh || 0,
        latestTechnical.design_airflow || 0,
        unit.capacity || "0"
      );
    }

    return serializePrisma({
      success: true,
      data: {
        ...unit, 
        projectName: unit.projects?.name,
        customerNameProject: unit.projects?.customers?.name,
        enabledForms: unit.projects?.enabled_forms || "Audit,Preventive,Corrective",
        healthMetrics: healthMetrics
      }
    });
  } catch (error) {
    console.error("Prisma error:", error);
    return { error: "Database error" };
  }
}

/**
 * Service actions for Passport
 */
export async function updateUnitStatusFromPassport(unitId: number, status: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.units.update({
      where: { id: unitId },
      data: { status: status as any }
    });
    
    await notifyInternalStaff(
      "Unit Status Update",
      `${session.name} updated status of unit ${unitId} to ${status} via Passport`,
      "info",
      `/dashboard/units/${unitId}`
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Update failed" };
  }
}

/**
 * Submit activity from public passport landing
 */
export async function submitActivityFromPassport(token: string, data: any) {
  try {
    const unit = await prisma.units.findFirst({ where: { qr_code_token: token } });
    if (!unit) return { error: "Unit not found" };

    await prisma.activities.create({
      data: {
        unit_id: unit.id,
        service_date: new Date(),
        type: data.type,
        engineer_note: data.notes,
        inspector_name: data.reporterName,
        status: "Submitted"
      }
    });

    // Update unit status if it's a complaint or maintenance report
    if (data.type === "Corrective" || data.type === "Problem") {
      await prisma.units.update({
        where: { id: unit.id },
        data: { status: "Problem" }
      });
    }

    await notifyInternalStaff(
      "New Activity Submitted",
      `${data.reporterName} submitted a ${data.type} report for unit ${unit.tag_number}`,
      data.type === "Problem" ? "error" : "success",
      `/w/${unit.project_ref_id}/dashboard/units/${unit.id}`
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Submit activity error:", error);
    return { error: "Failed to submit activity" };
  }
}

/**
 * Update unit info from passport (Edit mode - REQUIRES VALIDATION)
 */
import { notifyInternalForUnitEdit } from "@/lib/push";

export async function updateUnitInfoFromPassport(token: string, data: any) {
  const session = await getSession();

  try {
    const unit = await prisma.units.findFirst({ where: { qr_code_token: token } });
    if (!unit) return { error: "Unit not found" };

    // Instead of direct update, create a request
    // We use (prisma as any) here because the local Prisma client might not have synced the new model yet
    await (prisma as any).unit_edit_requests.create({
      data: {
        unit_id: unit.id,
        requested_by: session ? parseInt(session.userId) : null,
        reporter_name: session ? session.name : (data.reporter_name || "Public User"),
        details_json: JSON.stringify({
          unit_type: data.unit_type,
          brand: data.brand,
          model: data.model,
          capacity: data.capacity,
          location: data.location,
          area: data.area,
          building_floor: data.building_floor,
          room_tenant: data.room_tenant,
          yoi: data.yoi,
          serial_number: data.serial_number,
          code: data.code,
          reporter_contact: data.reporter_contact || "N/A"
        }),
        status: "Pending"
      }
    });

    // Notify Admin & Engineer (Real-time)
    const requesterName = session ? session.name : (data.reporter_name || "Public User");
    await notifyInternalStaff(
      "Pending Unit Edit",
      `${requesterName} requested changes for unit ${unit.tag_number}`,
      "alert",
      `/w/${unit.project_ref_id}/dashboard/unit-requests`
    );

    // Notify Admin & Engineer (Push)
    await notifyInternalForUnitEdit(unit.id, requesterName);

    revalidatePath("/dashboard");
    return { success: true, message: "Request submitted for validation" };
  } catch (error: any) {
    console.error("Update request failed:", error);
    return { error: "Update request failed: " + error.message };
  }
}
