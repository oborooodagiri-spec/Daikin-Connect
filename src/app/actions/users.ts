"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { sendAccountApprovedEmail, sendAccountSuspendedEmail } from "@/lib/mail";

/**
 * Limit User Management functionality to purely Administrator roles.
 */
async function isAdmin() {
  const session = await getSession();
  if (!session || !session.roles) return false;

  const normalizedRoles = session.roles.map((r: string) => r.toLowerCase());
  return normalizedRoles.some((r: string) => ["super_admin", "admin", "administrator"].includes(r));
}

export async function getAllUsers() {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    const users = await prisma.users.findMany({
      include: {
        roles: true,
        user_roles: {
          include: { roles: true }
        }
      }
    });

    return {
      users: users.map(user => ({
        ...user,
        id: user.id.toString(),
        user_roles: user.user_roles.map(ur => ({
          role_id: ur.role_id?.toString() || "",
          role_name: ur.roles.role_name
        }))
      }))
    };
  } catch (error) {
    console.error("Fetch users error:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    const uId = parseInt(userId, 10);
    const user = await prisma.users.findUnique({
      where: { id: uId },
      include: { 
        user_roles: { 
          include: { roles: true } 
        } 
      }
    });

    if (!user) return { error: "User not found" };

    const roleNames = user.user_roles.map(ur => ur.roles.role_name.toLowerCase());
    const newStatus = !currentStatus;

    // PRE-ACTIVATION VALIDATION (Only when enabling account)
    if (newStatus === true) {
      // 1. Must have at least one role
      if (roleNames.length === 0) {
        return { error: "Assign a role before activating this profile. / Tentukan role sebelum mengaktifkan profil ini." };
      }

      // 2. Project requirement for specific roles
      const rolesRequiringProjects = ["engineer", "sales engineer", "vendor", "customer", "client"];
      const isProjectScoped = roleNames.some(r => rolesRequiringProjects.includes(r));

      if (isProjectScoped) {
        const assignedProjects = await prisma.user_project_access.count({
          where: { user_id: uId }
        });

        if (assignedProjects === 0) {
          return { error: "This role requires assigned projects before activation. / Role ini memerlukan penugasan proyek sebelum aktivasi." };
        }
      }
    }

    await prisma.users.update({
      where: { id: uId },
      data: { is_active: newStatus }
    });

    // Send Notification Email
    if (newStatus) {
      // Approved
      const roleName = user.user_roles[0]?.roles?.role_name || "Member";
      await sendAccountApprovedEmail(user.email, user.name, roleName);
    } else {
      // Suspended
      await sendAccountSuspendedEmail(user.email, user.name);
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "Failed to update user status" };
  }
}

export async function deleteUser(userId: string) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    await prisma.users.delete({
      where: { id: parseInt(userId, 10) }
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user" };
  }
}

export async function getAvailableRoles() {
  if (!(await isAdmin())) return [];
  try {
    const roles = await prisma.roles.findMany();
    
    // Deduplicate identical role names (case-insensitive)
    const uniqueRolesMap = new Map();
    for (const r of roles) {
      const key = r.role_name.toLowerCase();
      if (!uniqueRolesMap.has(key)) {
        uniqueRolesMap.set(key, {
          id: r.id.toString(),
          name: r.role_name
        });
      }
    }
    
    return Array.from(uniqueRolesMap.values());
  } catch (error) {
    return [];
  }
}

export async function assignUserRole(userId: string, roleId: string) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  try {
    const uId = parseInt(userId, 10);
    const rId = parseInt(roleId, 10);

    // Clear existing roles first
    await prisma.user_roles.deleteMany({
      where: { user_id: uId }
    });

    // Assign new role
    await prisma.user_roles.create({
      data: {
        user_id: uId,
        role_id: rId
      }
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Assign role error:", error);
    return { error: "Failed to assign role" };
  }
}

export async function getAvailableProjects() {
  if (!(await isAdmin())) return [];
  try {
    const projects = await prisma.projects.findMany({
      select: { id: true, name: true, code: true }
    });
    
    return projects.map(p => ({
      id: p.id.toString(),
      name: p.name,
      code: p.code || ""
    }));
  } catch (error) {
    console.error("Fetch projects error:", error);
    return [];
  }
}

export async function getUserAssignedProjects(userId: string) {
  if (!(await isAdmin())) return [];
  try {
    const links = await prisma.user_project_access.findMany({
      where: { user_id: parseInt(userId, 10) }
    });
    return links.map(l => l.project_id.toString());
  } catch (error) {
    console.error("Fetch assigned projects error:", error);
    return [];
  }
}

export async function assignUserProjects(userId: string, projectIds: string[]) {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  try {
    const uId = parseInt(userId, 10);
    
    // Transaction to replace assigned projects
    await prisma.$transaction(async (tx) => {
      // Clear all existing assigned projects first
      await tx.user_project_access.deleteMany({
        where: { user_id: uId }
      });
      
      // Add all currently selected projects
      if (projectIds.length > 0) {
        await tx.user_project_access.createMany({
          data: projectIds.map(pid => ({
            user_id: uId,
            project_id: BigInt(pid)
          }))
        });
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Assign projects error:", error);
    return { error: "Failed to assign projects." };
  }
}
