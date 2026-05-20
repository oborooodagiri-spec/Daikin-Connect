"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get notifications for current user
 */
export async function getMyNotifications(projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const notifications = await (prisma as any).notifications.findMany({
      where: { user_id: parseInt(session.userId) },
      orderBy: { created_at: "desc" },
      take: 100
    });

    let filtered = notifications;
    if (projectId) {
      filtered = notifications.filter((n: any) => {
        // 1. Check database column project_id
        if (n.project_id !== null && n.project_id !== undefined) {
          return n.project_id.toString() === projectId;
        }

        // 2. Fallback: Parse from link
        if (n.link) {
          const match = n.link.match(/\/w\/(\d+)\//);
          if (match) {
            const linkProjectId = match[1];
            return linkProjectId === projectId;
          }
        }

        // 3. Keep global notifications (no project context in link nor database)
        return true;
      });
    }

    // Limit output to top 20 after filtering
    return { success: true, data: filtered.slice(0, 20) };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
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
  link,
  projectId
}: {
  userIds: number[],
  title: string,
  message: string,
  type?: "info" | "success" | "warning" | "error" | "alert",
  link?: string,
  projectId?: number | bigint | string
}) {
  try {
    let inferredProjectId: bigint | null = null;
    if (projectId !== undefined && projectId !== null) {
      inferredProjectId = BigInt(projectId.toString());
    } else if (link) {
      const match = link.match(/\/w\/(\d+)\//);
      if (match) {
        inferredProjectId = BigInt(match[1]);
      }
    }

    const data = userIds.map(uid => ({
      user_id: uid,
      title,
      message,
      type,
      link,
      project_id: inferredProjectId
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
export async function notifyInternalStaff(
  title: string, 
  message: string, 
  type: any = "info", 
  link?: string,
  projectId?: number | bigint | string
) {
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
            await createNotification({ userIds: ids, title, message, type, link, projectId });
        }
    } catch (err) {
        console.error("Internal staff notification failed:", err);
    }
}
