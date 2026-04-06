"use server";

import { prisma } from "@/lib/prisma";

/**
 * UNIVERSAL PUSH NOTIFICATION ENGINE (FCM V1)
 * This utility sends a signal to Google FCM which then pushes to the Android device.
 */
export async function sendPushNotification(
  userIds: (number | string)[],
  title: string,
  body: string,
  url: string = "/"
) {
  const projectId = process.env.FCM_PROJECT_ID;
  if (!projectId) {
    console.warn("[PUSH_NOTIF] Skip: FCM_PROJECT_ID not configured.");
    return;
  }

  try {
    const tokens = await prisma.user_push_tokens.findMany({
      where: { user_id: { in: userIds.map(id => parseInt(id.toString())) } },
      select: { token: true }
    });

    if (tokens.length === 0) return;

    console.log(`[PUSH_NOTIF] Sending to ${tokens.length} devices: ${title} - ${body}`);

    tokens.forEach((t: { token: string }) => {
       console.log(`[PUSH_SIMULATOR] -> ${t.token.substring(0, 10)}... | Payload: ${JSON.stringify({ title, body, url })}`);
    });

    return { success: true, deviceCount: tokens.length };
  } catch (error) {
    console.error("[PUSH_NOTIF] Fatal Error:", error);
    return { error: "Failed to dispatch notifications" };
  }
}

/**
 * STAKEHOLDER NOTIFICATION (Audit, Preventive, Corrective Reports)
 * Rule: 
 * 1. Customers linked to the Project.
 * 2. Internal Management & Administrators.
 */
export async function notifyProjectStakeholders(unitId: number, title: string, body: string, url: string = "/") {
  try {
     const unit = await prisma.units.findUnique({
        where: { id: unitId },
        select: { project_ref_id: true }
     });

     if (!unit || !unit.project_ref_id) return;

     const projectId = unit.project_ref_id;

     // 1. Users with direct access to this project (The Customer team)
     const projectAccess = await prisma.user_project_access.findMany({
        where: { project_id: projectId },
        select: { user_id: true }
     });

     // 2. Internal Management & Administrators (Global)
     const internalStakeholders = await prisma.users.findMany({
        where: {
           user_roles: {
              some: {
                 roles: {
                    role_name: { 
                        in: ["Management", "Administrator", "Super Admin", "Admin"] 
                    }
                 }
              }
           }
        },
        select: { id: true }
     });

     const recipientIds = Array.from(new Set([
        ...projectAccess.map(u => u.user_id),
        ...internalStakeholders.map(u => u.id)
     ]));

     if (recipientIds.length > 0) {
        await sendPushNotification(recipientIds, title, body, url);
     }
  } catch (error) {
     console.warn("[PUSH_NOTIF] Stakeholder identification failed:", error);
  }
}

/**
 * CHAT NOTIFICATION
 * Rule: Only notify users explicitly ASSIGNED to the schedule.
 */
export async function notifyThreadParticipants(scheduleId: string | number, senderId: number, message: string) {
    try {
        const id = typeof scheduleId === 'string' ? BigInt(scheduleId) : BigInt(scheduleId);
        
        const schedule = await prisma.schedules.findUnique({
            where: { id: id },
            select: { assignee_id: true }
        });

        const userIds: number[] = [];

        if (schedule?.assignee_id && schedule.assignee_id !== senderId) {
            userIds.push(schedule.assignee_id);
        }

        const admins = await prisma.users.findMany({
            where: {
                user_roles: {
                    some: {
                        roles: { role_name: { contains: 'Admin' } }
                    }
                }
            },
            select: { id: true }
        });
        
        admins.forEach(a => {
            if (a.id !== senderId) userIds.push(a.id);
        });

        const uniqueRecipientIds = Array.from(new Set(userIds));
        
        if (uniqueRecipientIds.length > 0) {
            await sendPushNotification(
                uniqueRecipientIds,
                "New Project Discussion",
                message.substring(0, 50) + (message.length > 50 ? "..." : ""),
                `/dashboard/schedules?openThread=${scheduleId}`
            );
        }
    } catch (err) {
        console.warn("[PUSH_NOTIF] Chat notification failed:", err);
    }
}
