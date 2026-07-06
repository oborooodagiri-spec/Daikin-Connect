"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Get notifications for current user.
 * - Project Mode (projectId provided): Only shows notifications for that specific project.
 * - Global Mode (no projectId): Shows all notifications, but ONLY from projects
 *   the user has explicit access to (via user_project_access). This prevents
 *   cross-project data leaks for multi-tenant security.
 */
export async function getMyNotifications(projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const cleanProjectId = (projectId && projectId !== "empty" && projectId !== "undefined") ? projectId : undefined;
  const userId = parseInt(session.userId);

  try {
    const whereClause: any = { user_id: userId };

    if (cleanProjectId) {
      // PROJECT MODE: strict isolation — only this project's notifications
      whereClause.OR = [
        { project_id: BigInt(cleanProjectId) },
        { project_id: null }
      ];
    } else {
      // GLOBAL MODE: get user's accessible project IDs for security filtering
      const accessibleProjects = await (prisma as any).user_project_access.findMany({
        where: { user_id: userId },
        select: { project_id: true }
      });
      const accessibleIds = accessibleProjects.map((a: any) => a.project_id);

      if (accessibleIds.length > 0) {
        whereClause.OR = [
          { project_id: { in: accessibleIds } },
          { project_id: null }
        ];
      } else {
        // User has no project access — only show project-less notifications
        whereClause.project_id = null;
      }
    }

    const notifications = await (prisma as any).notifications.findMany({
      where: whereClause,
      include: {
        projects: { select: { id: true, name: true } }
      },
      orderBy: { created_at: "desc" },
      take: 50
    });

    let filtered = notifications;
    if (cleanProjectId) {
      filtered = notifications.filter((n: any) => {
        if (n.project_id !== null && n.project_id !== undefined) return true;
        if (n.link) {
          const match = n.link.match(/\/w\/(\d+)/);
          if (match) return match[1] === cleanProjectId;
        }
        return false;
      });
    }

    // Serialize BigInt for client transport
    const serialized = filtered.slice(0, 30).map((n: any) => ({
      ...n,
      id: Number(n.id),
      user_id: Number(n.user_id),
      project_id: n.project_id ? n.project_id.toString() : null,
      project_name: n.projects?.name || null,
      projects: undefined
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { error: "Failed to fetch notifications" };
  }
}

/**
 * Get unread count only — lightweight endpoint for badge polling
 */
export async function getUnreadCount(projectId?: string) {
  const session = await getSession();
  if (!session) return { count: 0 };

  const cleanProjectId = (projectId && projectId !== "empty" && projectId !== "undefined") ? projectId : undefined;
  const userId = parseInt(session.userId);

  try {
    const whereClause: any = { user_id: userId, is_read: false };

    if (cleanProjectId) {
      whereClause.project_id = BigInt(cleanProjectId);
    } else {
      const accessibleProjects = await (prisma as any).user_project_access.findMany({
        where: { user_id: userId },
        select: { project_id: true }
      });
      const accessibleIds = accessibleProjects.map((a: any) => a.project_id);
      if (accessibleIds.length > 0) {
        whereClause.OR = [
          { project_id: { in: accessibleIds } },
          { project_id: null }
        ];
        delete whereClause.project_id;
      }
    }

    const count = await (prisma as any).notifications.count({ where: whereClause });
    return { count };
  } catch (error) {
    return { count: 0 };
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(id: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await (prisma as any).notifications.update({
      where: { id, user_id: parseInt(session.userId) },
      data: { is_read: true }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as read" };
  }
}

/**
 * Mark ALL notifications as read for current user
 */
export async function markAllAsRead(projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const cleanProjectId = (projectId && projectId !== "empty" && projectId !== "undefined") ? projectId : undefined;

  try {
    const whereClause: any = {
      user_id: parseInt(session.userId),
      is_read: false
    };

    if (cleanProjectId) {
      whereClause.project_id = BigInt(cleanProjectId);
    }

    await (prisma as any).notifications.updateMany({
      where: whereClause,
      data: { is_read: true }
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to mark all as read" };
  }
}

/**
 * Clear (delete) all READ notifications for current user
 */
export async function clearAllNotifications(projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const cleanProjectId = (projectId && projectId !== "empty" && projectId !== "undefined") ? projectId : undefined;

  try {
    const whereClause: any = {
      user_id: parseInt(session.userId),
      is_read: true
    };

    if (cleanProjectId) {
      whereClause.project_id = BigInt(cleanProjectId);
    }

    await (prisma as any).notifications.deleteMany({ where: whereClause });
    return { success: true };
  } catch (error) {
    return { error: "Failed to clear notifications" };
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
