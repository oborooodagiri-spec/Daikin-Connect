"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { recordAuditLog } from "@/lib/security";
import { revalidatePath } from "next/cache";

/**
 * Get full profile data for the current logged-in user
 */
export async function getProfile() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(session.userId) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company_name: true,
      avatar_url: true,
      bio: true,
      is_active: true,
      two_factor_enabled: true,
      attendance_enabled: true,
      user_roles: {
        include: { roles: true }
      },
      user_project_access: {
        include: {
          projects: {
            include: {
              customers: { select: { name: true } },
              _count: { select: { units: true } }
            }
          }
        }
      }
    }
  });

  if (!user) return null;

  const roles = user.user_roles.map(ur => ur.roles.role_name);
  const isAdmin = roles.some(r => 
    ["admin", "super", "administrator"].some(k => r.toLowerCase().includes(k))
  );
  const isInternal = isAdmin || roles.some(r => 
    ["internal", "engineer", "sales", "management", "technician"].some(k => r.toLowerCase().includes(k))
  );

  // For admin, get ALL projects
  let projects;
  if (isAdmin) {
    const allProjects = await prisma.projects.findMany({
      where: { status: "active" },
      include: {
        customers: { select: { name: true } },
        _count: { select: { units: true } }
      },
      orderBy: { created_at: "desc" }
    });
    projects = allProjects.map(p => ({
      id: p.id.toString(),
      name: p.name,
      code: p.code,
      customer: p.customers?.name || "N/A",
      unitCount: p._count.units,
      status: p.status
    }));
  } else {
    projects = user.user_project_access
      .filter(a => a.projects)
      .map(a => ({
        id: a.projects.id.toString(),
        name: a.projects.name,
        code: a.projects.code,
        customer: a.projects.customers?.name || "N/A",
        unitCount: a.projects._count.units,
        status: a.projects.status
      }));
  }

  return serializePrisma({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    roles,
    isAdmin,
    isInternal,
    twoFactorEnabled: user.two_factor_enabled,
    attendanceEnabled: user.attendance_enabled,
    projects
  });
}

/**
 * Update profile (name, phone only — email requires admin)
 */
export async function updateProfile(data: { name?: string; phone?: string; bio?: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await prisma.users.update({
      where: { id: parseInt(session.userId) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.bio !== undefined && { bio: data.bio }),
      }
    });

    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "PROFILE_UPDATED",
      details: `Updated: ${Object.keys(data).filter(k => (data as any)[k] !== undefined).join(", ")}`
    });

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}

/**
 * Save avatar URL after upload
 */
export async function saveAvatarUrl(url: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await prisma.users.update({
      where: { id: parseInt(session.userId) },
      data: { avatar_url: url }
    });

    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "AVATAR_UPDATED",
      details: "Profile photo updated"
    });

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    return { error: "Failed to save avatar" };
  }
}

/**
 * Get recent user activity from audit_logs — with clickable navigation links
 */
export async function getRecentActivity(limit = 5) {
  const session = await getSession();
  if (!session) return [];

  const logs = await prisma.audit_logs.findMany({
    where: { user_id: parseInt(session.userId) },
    orderBy: { created_at: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      target_type: true,
      target_id: true,
      details: true,
      created_at: true,
    }
  });

  return serializePrisma(logs.map(log => ({
    id: log.id.toString(),
    action: log.action,
    targetType: log.target_type,
    targetId: log.target_id,
    details: log.details,
    createdAt: log.created_at,
    // Generate navigation link based on action type
    link: getActivityLink(log.action, log.target_type, log.target_id),
    // Human-readable description
    description: getActivityDescription(log.action, log.details),
    // Icon type for the UI
    icon: getActivityIcon(log.action),
  })));
}

function getActivityLink(action: string, targetType?: string | null, targetId?: string | null): string | null {
  if (!targetId) return null;
  
  const a = action.toUpperCase();
  
  if (a.includes("AUDIT") || a.includes("PREVENTIVE") || a.includes("CORRECTIVE")) {
    return targetId ? `/w/${targetId}/dashboard/operations` : null;
  }
  if (a.includes("SCHEDULE")) {
    return targetId ? `/w/${targetId}/dashboard/schedules` : null;
  }
  if (a.includes("UNIT")) {
    return targetId ? `/w/${targetId}/dashboard` : null;
  }
  if (a.includes("LOGIN") || a.includes("2FA") || a.includes("PROFILE")) {
    return "/home";
  }
  
  return null;
}

function getActivityDescription(action: string, details?: string | null): string {
  const a = action.toUpperCase();
  
  if (a === "LOGIN_SUCCESS_WEB" || a === "LOGIN_SUCCESS") return "Login berhasil";
  if (a === "LOGIN_FAILED") return "Percobaan login gagal";
  if (a === "2FA_CHALLENGE" || a === "2FA_CHALLENGE_WEB") return "Verifikasi 2FA dikirim";
  if (a === "2FA_SUCCESS" || a === "2FA_SUCCESS_WEB") return "Verifikasi 2FA berhasil";
  if (a === "PROFILE_UPDATED") return "Profil diperbarui";
  if (a === "AVATAR_UPDATED") return "Foto profil diperbarui";
  if (a.includes("REPORT_GENERATED")) return "Laporan dibuat";
  if (a.includes("AUDIT")) return "Aktivitas audit";
  if (a.includes("SCHEDULE")) return "Jadwal diperbarui";
  if (a.includes("UPLOAD")) return "File diunggah";
  if (a.includes("DOWNLOAD")) return "File diunduh";
  
  return details || action.replace(/_/g, " ").toLowerCase();
}

function getActivityIcon(action: string): string {
  const a = action.toUpperCase();
  
  if (a.includes("LOGIN")) return "login";
  if (a.includes("2FA")) return "shield";
  if (a.includes("PROFILE") || a.includes("AVATAR")) return "user";
  if (a.includes("REPORT") || a.includes("AUDIT")) return "file";
  if (a.includes("SCHEDULE")) return "calendar";
  if (a.includes("UPLOAD")) return "upload";
  if (a.includes("DOWNLOAD")) return "download";
  
  return "activity";
}
