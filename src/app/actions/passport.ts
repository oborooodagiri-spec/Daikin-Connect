"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";

/**
 * Public API for fetching unit details by QR token
 */
export async function getUnitByToken(token: string) {
  try {
    const unit = await (prisma.units as any).findUnique({
      where: { qr_code_token: token },
      include: {
        projects: { 
          select: { 
            name: true, 
            customer_id: true,
            customers: { select: { name: true } }
          } 
        }
      }
    } as any);

    if (!unit) return { error: "Unit not found or token invalid." };

    return { 
      success: true, 
      data: {
        ...unit,
        id: unit.id.toString(),
        project_name: unit.projects?.name || "-",
        customer_name: unit.projects?.customers?.name || "-"
      } 
    };
  } catch (error: any) {
    console.error("Fetch unit by token error:", error);
    return { error: "Failed to locate unit." };
  }
}

/**
 * Update Unit Information from Passport (Field Engineer)
 */
export async function updateUnitInfoFromPassport(token: string, data: { unit_type: string, brand: string, model: string, capacity: string }) {
  try {
    const unit = await prisma.units.findUnique({ where: { qr_code_token: token } });
    if (!unit) return { error: "Unit not found" };

    await (prisma.units as any).update({
      where: { id: unit.id },
      data: {
        unit_type: data.unit_type,
        brand: data.brand,
        model: data.model,
        capacity: data.capacity
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update unit info error:", error);
    return { error: "Failed to update unit information" };
  }
}

/**
 * Generate a random token for a new unit
 */
export async function generateNewQrToken(unitId: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const crypto = require('crypto');
    const newToken = crypto.randomBytes(16).toString('hex');

    await prisma.units.update({
      where: { id: unitId },
      data: { qr_code_token: newToken }
    });

    return { success: true, token: newToken };
  } catch (error: any) {
    console.error("Generate token error:", error);
    return { error: "Failed to generate token." };
  }
}

/**
 * Quick action submission for an activity directly from the passport landing page
 */
export async function submitActivityFromPassport(token: string, data: { type: string, notes: string, reporterName: string }) {
  try {
    const unit = await prisma.units.findUnique({ where: { qr_code_token: token } });
    if (!unit) return { error: "Invalid Unit Data" };

    // Simply log this activity into the activities table
    await prisma.activities.create({
      data: {
        unit_id: unit.id,
        type: data.type,
        inspector_name: data.reporterName,
        engineer_note: data.notes,
        service_date: new Date(),
        status: "Completed" 
      }
    });

    // If corrective reported, change unit status to On_Progress (Waiting for customer verification)
    if (data.type === "Corrective") {
      await (prisma.units as any).update({
        where: { id: unit.id },
        data: { status: "On_Progress" } 
      } as any);
      
      revalidatePath("/dashboard");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Submit activity via passport error:", error);
    return { error: "Submission failed" };
  }
}
