"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function mergeUnitsAction(sourceId: number, targetId: number) {
  if (sourceId === targetId) throw new Error("Source and target units must be different.");

  console.log(`[MERGE] Initiating merge: Unit ${sourceId} -> ${targetId}`);

  const tablesWithUnitId = [
    'activities',
    'audit_tickets',
    'audits',
    'complaints',
    'corrective',
    'daily_ops_logs',
    'schedules',
    'service_activities',
    'service_logs',
    'tickets',
    'unit_comments',
    'unit_edit_requests',
    'user_unit_access'
  ];

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify units exist
      const sourceUnit = await tx.units.findUnique({ where: { id: sourceId } });
      const targetUnit = await tx.units.findUnique({ where: { id: targetId } });

      if (!sourceUnit || !targetUnit) {
        throw new Error("One or both units do not exist.");
      }

      // 2. Move all related records
      for (const table of tablesWithUnitId) {
        if (table === 'user_unit_access') {
           // Special handling for many-to-many to avoid unique constraint violations
           const existingAccess = await tx.user_unit_access.findMany({ where: { unit_id: targetId } });
           const targetUserIds = existingAccess.map(a => a.user_id);
           await tx.user_unit_access.deleteMany({
             where: { unit_id: sourceId, user_id: { in: targetUserIds } }
           });
        }
        
        // Use any because prisma client types for updateMany are complex across multiple tables
        await (tx as any)[table].updateMany({
          where: { unit_id: sourceId },
          data: { unit_id: targetId }
        });
      }

      // 3. Delete source unit
      await tx.units.delete({ where: { id: sourceId } });

      // 4. Log the action
      await tx.audit_logs.create({
        data: {
          action: 'MERGE_UNIT',
          target_type: 'unit',
          target_id: String(targetId),
          details: `Merged duplicate unit ${sourceId} (Tag: ${sourceUnit.tag_number}) into ${targetId} (Tag: ${targetUnit.tag_number})`
        }
      });

      return { success: true, message: `Successfully merged Unit ${sourceId} into ${targetId}` };
    });

    revalidatePath("/dashboard");
    return result;
  } catch (error: any) {
    console.error("[MERGE_ERROR]", error);
    return { success: false, error: error.message || "An unknown error occurred during merge." };
  }
}
