"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

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
        }
      }
    });

    if (!unit) return { error: "Unit not found" };

    return {
      success: true,
      data: {
        id: unit.id,
        tag_number: unit.tag_number,
        model: unit.model,
        serial_number: unit.serial_number,
        area: unit.area,
        status: unit.status,
        unit_type: unit.unit_type,
        brand: unit.brand,
        capacity: unit.capacity,
        building_floor: unit.building_floor,
        room_tenant: unit.room_tenant,
        projectName: unit.projects?.name,
        customerName: unit.projects?.customers?.name
      }
    };
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
