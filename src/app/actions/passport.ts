"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

import { calculateUnitHealth } from "@/lib/physics/enthalpy";

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

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Submit activity error:", error);
    return { error: "Failed to submit activity" };
  }
}

/**
 * Update unit info from passport (Edit mode)
 */
export async function updateUnitInfoFromPassport(token: string, data: any) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const unit = await prisma.units.findFirst({ where: { qr_code_token: token } });
    if (!unit) return { error: "Unit not found" };

    await prisma.units.update({
      where: { id: unit.id },
      data: {
        unit_type: data.unit_type,
        brand: data.brand,
        model: data.model,
        capacity: data.capacity
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Update failed" };
  }
}
