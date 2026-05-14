"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShoppingList() {
  try {
    const list = await (prisma as any).shopping_list.findMany({
      orderBy: { created_at: "desc" },
    });
    return { success: true, data: list };
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
      },
    });
    revalidatePath("/admin/database/shopping-list");
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
      },
    });
    revalidatePath("/admin/database/shopping-list");
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
    revalidatePath("/admin/database/shopping-list");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting shopping item:", error);
    return { success: false, error: error.message };
  }
}
