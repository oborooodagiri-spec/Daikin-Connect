"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";

/**
 * Fetch current user's security profile and recent audit logs
 */
export async function getMySecurityProfile() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        two_factor_enabled: true,
        company_name: true,
        is_active: true,
        roles: true,
        user_roles: {
          include: {
            roles: true
          }
        },
        audit_logs: {
          take: 10,
          orderBy: { created_at: "desc" }
        }
      }
    });

    if (!user) return { error: "User not found" };

    return { 
      success: true, 
      data: serializePrisma(user) 
    };
  } catch (error) {
    console.error("Security Profile Fetch Error:", error);
    return { error: "Failed to fetch security data" };
  }
}

/**
 * Global Audit Log Fetcher (Platform-wide)
 * Restricted to Internal Admin Personnel
 */
export async function getGlobalAuditLogs(startDate?: string, endDate?: string) {
  const session = await getSession();
  
  if (!session || !session.userId) return { error: "Session Expired" };
  
  // Security Layer: Verify Administrative Role
  const rolesArr = session?.roles || [];
  const roleStrStr = String((session as any)?.role || "").toLowerCase();
  const hasAdminRole = rolesArr.some((r: any) => {
    const val = typeof r === 'string' ? r : (r?.role_name || JSON.stringify(r));
    return val.toLowerCase().includes("admin") || val.toLowerCase().includes("super");
  });

  const isAuthorized = hasAdminRole || roleStrStr.includes("admin") || roleStrStr.includes("super");

  if (!isAuthorized) {
    return { error: "Access Denied: Administrative Clearance Required" };
  }

  try {
    const where: any = {};
    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const logs = await prisma.audit_logs.findMany({
      where,
      take: 200, 
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: { 
            name: true, 
            email: true,
            roles: { select: { role_name: true } }
          }
        }
      }
    });

    return {
      success: true,
      logs: logs.map((l: any) => ({
        id: l.id.toString(),
        userId: l.user_id,
        userName: l.users?.name || "System Operation",
        userEmail: l.users?.email || "internal@system.id",
        userRole: l.users?.roles?.role_name || "Internal System",
        action: l.action,
        details: l.details || getFriendlyAction(l.action),
        ip_address: l.ip_address,
        user_agent: l.user_agent,
        created_at: l.created_at.toISOString()
      }))
    };
  } catch (error) {
    console.error("Critical Security Audit Fetch Error:", error);
    return { error: "Database Connection Interrupted" };
  }
}

/**
 * Fetch a user's activity timeline around a specific timestamp (Session Analysis)
 */
export async function getSessionTimeline(userId: number, anchorDate: string) {
  const session = await getSession();
  if (!session) return { error: "Denied" };

  try {
    const center = new Date(anchorDate);
    // Fetch logs 12 hours before and after the anchor to capture the full session
    const startRange = new Date(center.getTime() - 12 * 60 * 60 * 1000);
    const endRange = new Date(center.getTime() + 12 * 60 * 60 * 1000);

    const logs = await prisma.audit_logs.findMany({
      where: {
        user_id: userId,
        created_at: { gte: startRange, lte: endRange }
      },
      orderBy: { created_at: 'asc' }
    });

    return {
      success: true,
      logs: logs.map((l: any) => ({
        id: l.id.toString(),
        action: l.action,
        message: getFriendlyAction(l.action, l.details),
        time: l.created_at.toISOString()
      }))
    };
  } catch (err) {
    return { error: "Failed to reconstruct session" };
  }
}

function getFriendlyAction(action: string, details?: string) {
  const maps: Record<string, string> = {
    'LOGIN_SUCCESS_WEB': 'Logged in to Web Dashboard',
    'LOGIN_FAILED_WEB': 'Login failed (Wrong password)',
    '2FA_CHALLENGE_WEB': 'Security verification requested',
    '2FA_SUCCESS_WEB': 'Security verification successful',
    '2FA_FAILED_WEB': 'Security verification failed',
    'LOGOUT_WEB': 'Logged out from session',
    'REPORT_SUBMIT': 'Submitted technical report',
    'REPORT_UPDATE': 'Updated technical report data',
    'REPORT_DOWNLOAD': 'Downloaded report (PDF)',
    'SCHEDULE_CREATE': 'Created a new work schedule',
    'SCHEDULE_UPDATE': 'Updated schedule details',
    'SCHEDULE_DELETE': 'Deleted a work schedule',
    'DIGITAL_SIGN_ENGINEER': 'Signed digitally by engineer',
    'DIGITAL_SIGN_CUSTOMER': 'Digitally approved by customer'
  };

  return details || maps[action] || action.replace(/_/g, ' ');
}

/**
 * Client-Side Activity Logger
 * Enables recording of events triggered via UI (e.g., Downloads)
 */
export async function logUserActivity(action: string, details?: string) {
  const session = await getSession();
  if (!session || !session.userId) return { error: "Unauthorized" };

  try {
    const { recordAuditLog } = await import("@/lib/security");
    await recordAuditLog({
      userId: parseInt(session.userId),
      action,
      details
    });
    return { success: true };
  } catch (err) {
    return { error: "Failed to log activity" };
  }
}
