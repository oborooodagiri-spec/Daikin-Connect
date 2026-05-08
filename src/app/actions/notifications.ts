"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get notifications for current user
 */
export async function getMyNotifications() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const notifications = await (prisma as any).notifications.findMany({
      where: { user_id: parseInt(session.userId) },
      orderBy: { created_at: "desc" },
      take: 20
    });

    return { success: true, data: notifications };
  } catch (error) {
    return { error: "Failed to fetch notifications" };
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: number) {
  try {
    await (prisma as any).notifications.update({
      where: { id },
      data: { is_read: true }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as read" };
  }
}

/**
 * Create a notification for a user or group of users
 */
export async function createNotification({
  userIds,
  title,
  message,
  type = "info",
  link
}: {
  userIds: number[],
  title: string,
  message: string,
  type?: "info" | "success" | "warning" | "error" | "alert",
  link?: string
}) {
  try {
    const data = userIds.map(uid => ({
      user_id: uid,
      title,
      message,
      type,
      link
    }));

    await (prisma as any).notifications.createMany({ data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { error: "Failed to create notification" };
  }
}

/**
 * Register a push token for the current user
 */
export async function registerPushToken(token: string, platform: string = "web") {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await (prisma as any).user_push_tokens.upsert({
            where: {
                user_id_token: {
                    user_id: parseInt(session.userId),
                    token: token
                }
            },
            create: {
                user_id: parseInt(session.userId),
                token: token,
                platform: platform
            },
            update: {
                platform: platform
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Token registration failed:", error);
        return { error: "Failed to register device" };
    }
}

/**
 * Utility to notify all internal staff (Admin/Engineer)
 */
export async function notifyInternalStaff(title: string, message: string, type: any = "info", link?: string) {
    try {
        const staff = await prisma.users.findMany({
            where: {
                user_roles: {
                    some: {
                        roles: {
                            role_name: { in: ["Admin", "Administrator", "Super Admin", "Engineer"] }
                        }
                    }
                }
            },
            select: { id: true }
        });

        const ids = staff.map(s => s.id);
        if (ids.length > 0) {
            await createNotification({ userIds: ids, title, message, type, link });
        }
    } catch (err) {
        console.error("Internal staff notification failed:", err);
    }
}
