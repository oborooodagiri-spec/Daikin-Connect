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

  // Sanitize input to handle stringified "undefined" or "empty" from client context
  const cleanProjectId = (projectId && projectId !== "empty" && projectId !== "undefined") ? projectId : undefined;

  try {
    console.log(`[getMyNotifications] user_id=${session.userId} | projectId=${projectId} | cleanProjectId=${cleanProjectId} | type=${typeof projectId}`);

    // Build query filter: always filter by user, optionally filter by project at DB level
    const whereClause: any = { user_id: parseInt(session.userId) };

    if (cleanProjectId) {
      // Primary filter: only fetch notifications that belong to this project
      // This includes notifications with matching project_id OR no project_id (to be filtered further)
      whereClause.OR = [
        { project_id: BigInt(cleanProjectId) },
        { project_id: null }
      ];
    }

    const notifications = await (prisma as any).notifications.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: 100
    });

    let filtered = notifications;
    if (cleanProjectId) {
      // Secondary filter: for notifications without project_id, check link pattern
      filtered = notifications.filter((n: any) => {
        // 1. If project_id is set in database, it was already filtered by the query above
        if (n.project_id !== null && n.project_id !== undefined) {
          return true; // Already matched by DB query
        }

        // 2. Fallback: Parse project from link URL pattern
        if (n.link) {
          const match = n.link.match(/\/w\/(\d+)/);
          if (match) {
            return match[1] === cleanProjectId;
          }
        }

        // 3. Notification has no project context — do NOT show in project views
        //    (prevents cross-project leaking)
        return false;
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
      // Broadened pattern to match with or without trailing slash
      const match = link.match(/\/w\/(\d+)/);
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
