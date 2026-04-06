"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

/**
 * Fetch meeting management data for a specific schedule.
 * Only accessible to Admins/Internal users.
 */
export async function getScheduleManagementData(scheduleId: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    const id = BigInt(scheduleId);
    
    const [attendance, mom] = await Promise.all([
      (prisma as any).schedule_attendance.findMany({
        where: { schedule_id: id },
        orderBy: { created_at: "asc" }
      }),
      (prisma as any).schedule_mom.findUnique({
        where: { schedule_id: id }
      })
    ]);

    return serializePrisma({
      success: true,
      data: {
        attendance: attendance || [],
        mom: mom || null
      }
    });
  } catch (error) {
    console.error("Fetch schedule management data error:", error);
    return { error: "Failed to fetch meeting data" };
  }
}

/**
 * Update or Add participants to the attendance list.
 */
export async function updateAttendance(scheduleId: string, participants: any[]) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    const id = BigInt(scheduleId);

    // Simplistic approach: Delete and Re-insert for the demo/mvp 
    // or we could do upserts if we have specific participant IDs
    await (prisma as any).schedule_attendance.deleteMany({
      where: { schedule_id: id }
    });

    if (participants.length > 0) {
      await (prisma as any).schedule_attendance.createMany({
        data: participants.map(p => ({
          schedule_id: id,
          name: p.name,
          role: p.role,
          is_present: p.is_present || false,
          signature: p.signature || null
        }))
      });
    }

    revalidatePath(`/dashboard/schedules`);
    return { success: true };
  } catch (error) {
    console.error("Update attendance error:", error);
    return { error: "Failed to update attendance" };
  }
}

/**
 * Update Minutes of Meeting (MoM) content.
 */
export async function updateMoM(scheduleId: string, content: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    const id = BigInt(scheduleId);

    await (prisma as any).schedule_mom.upsert({
      where: { schedule_id: id },
      update: { content, updated_at: new Date() },
      create: { schedule_id: id, content }
    });

    // Revalidate the dashboard and schedules path
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Update MoM error:", error);
    return { error: "Failed to update MoM content" };
  }
}
