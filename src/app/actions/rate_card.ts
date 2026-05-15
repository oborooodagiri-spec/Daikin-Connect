"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/actions/auth";

export async function getShoppingList() {
  try {
    const session = await getSession();
    const isAdmin = session?.roles?.some((role: string) => 
      ["admin", "super", "administrator"].some(keyword => role.toLowerCase().includes(keyword))
    );

    const list = await (prisma as any).shopping_list.findMany({
      orderBy: { created_at: "desc" },
    });

    // If Admin, return all. If not, filter by visibility and allowed_users.
    if (isAdmin) {
      return { success: true, data: list };
    }

    const filteredList = list.filter((item: any) => {
      // Public means everyone can see
      if (item.visibility === "Public") return true;
      
      // If internal, check if user is in allowed_users
      if (item.allowed_users) {
        const allowedIds = item.allowed_users.split(",");
        return allowedIds.includes(session?.id?.toString());
      }
      
      // Default: only admins see internal items with no specific users
      return false;
    });

    return { success: true, data: filteredList };
  } catch (error: any) {
    console.error("Error fetching shopping list:", error);
    return { success: false, error: error.message };
  }
}

export async function createShoppingItem(data: any) {
  try {
    const item = await (prisma as any).shopping_list.create({
      data: {
        category: data.category,
        work_type: data.work_type,
        item_name: data.item_name,
        capacity_unit: data.capacity_unit,
        capacity_range: data.capacity_range,
        price: data.price,
        description: data.description,
        visibility: data.visibility || "Internal",
        allowed_users: data.allowed_users || null,
        vendor_name: data.vendor_name || "Daikin Certified Partner",
      },
    });
    revalidatePath("/admin/database/rate-card");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error creating shopping item:", error);
    return { success: false, error: error.message };
  }
}

export async function updateShoppingItem(id: string, data: any) {
  try {
    const item = await (prisma as any).shopping_list.update({
      where: { id: BigInt(id) },
      data: {
        category: data.category,
        work_type: data.work_type,
        item_name: data.item_name,
        capacity_unit: data.capacity_unit,
        capacity_range: data.capacity_range,
        price: data.price,
        description: data.description,
        visibility: data.visibility,
        allowed_users: data.allowed_users,
        vendor_name: data.vendor_name,
      },
    });
    revalidatePath("/admin/database/rate-card");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error updating shopping item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteShoppingItem(id: string) {
  try {
    await (prisma as any).shopping_list.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/database/rate-card");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting shopping item:", error);
    return { success: false, error: error.message };
  }
}
