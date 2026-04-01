"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  const isAdmin = session.roles.some((r: string) => r.toLowerCase() === 'admin');
  return isAdmin;
}

export async function getAllUsers() {
  if (!await checkAdmin()) return { error: "Unauthorized" };

  try {
    const users = await prisma.users.findMany({
      include: {
        user_roles: {
          include: { roles: true }
        },
        _count: {
          select: { user_project_access: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    
    // Sort roles for each user to get primary role (e.g. Admin first)
    const formattedUsers = users.map((u: any) => ({
      ...u,
      roles: u.user_roles.map((ur: any) => ur.roles.role_name),
      primaryRole: u.user_roles[0]?.roles.role_name || "No Role",
      projectCount: u._count?.user_project_access || 0
    }));

    return { success: true, data: formattedUsers };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAllRoles() {
  if (!await checkAdmin()) return { error: "Unauthorized" };
  try {
    const roles = await prisma.roles.findMany();
    return { success: true, data: roles };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleUserStatus(userId: number, currentStatus: boolean) {
  if (!await checkAdmin()) return { error: "Unauthorized" };

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { 
        user_roles: { include: { roles: true } },
        _count: { select: { user_project_access: true } }
      }
    });

    if (!user) return { error: "User not found" };

    // Activation Guard: If turning ON for external role, check project count
    const roles = user.user_roles.map(ur => ur.roles.role_name.toLowerCase());
    const isInternal = roles.some(r => ["super_admin", "admin", "administrator", "internal", "engineer", "sales engineer", "management"].includes(r));
    
    if (!currentStatus && !isInternal && user._count.user_project_access === 0) {
      return { error: "EXTERNAL_USER_NO_PROJECT" };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { is_active: !currentStatus }
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAllAvailableProjects() {
  if (!await checkAdmin()) return { error: "Unauthorized" };
  try {
    const projects = await prisma.projects.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, code: true }
    });
    return { success: true, data: projects };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getUserProjectAccess(userId: number) {
  if (!await checkAdmin()) return { error: "Unauthorized" };
  try {
    const access = await prisma.user_project_access.findMany({
      where: { user_id: userId },
      select: { project_id: true }
    });
    return { success: true, data: access.map(a => a.project_id) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUserProjectAccess(userId: number, projectIds: string[]) {
  if (!await checkAdmin()) return { error: "Unauthorized" };

  try {
    // Transactional update: delete old, create new
    await prisma.$transaction([
      prisma.user_project_access.deleteMany({ where: { user_id: userId } }),
      prisma.user_project_access.createMany({
        data: projectIds.map(pid => ({
          user_id: userId,
          project_id: BigInt(pid)
        }))
      })
    ]);
    
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUserRole(userId: number, roleId: number) {
  if (!await checkAdmin()) return { error: "Unauthorized" };

  try {
    // Delete existing roles for simplicity in this project's current structure
    await prisma.user_roles.deleteMany({
      where: { user_id: userId }
    });

    // Add new role
    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: roleId
      }
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUser(userId: number) {
  if (!await checkAdmin()) return { error: "Unauthorized" };

  try {
    await prisma.users.delete({
      where: { id: userId }
    });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
