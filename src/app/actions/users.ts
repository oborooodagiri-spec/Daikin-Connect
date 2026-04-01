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
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Sort roles for each user to get primary role (e.g. Admin first)
    const formattedUsers = users.map(u => ({
      ...u,
      roles: u.user_roles.map(ur => ur.roles.role_name),
      primaryRole: u.user_roles[0]?.roles.role_name || "No Role"
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
