"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

// GET ALL CATEGORIES
export async function getUnitTypeCategories() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const categories = await (prisma.unit_type_categories as any).findMany({
      orderBy: { name: "asc" },
    });

    // Count units per type
    const unitCounts = await (prisma.units as any).groupBy({
      by: ["unit_type"],
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    unitCounts.forEach((uc: any) => {
      if (uc.unit_type) {
        countMap[uc.unit_type.toUpperCase()] = uc._count.id;
      }
    });

    return serializePrisma({
      success: true,
      data: categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        icon_color: c.icon_color || "#0073ea",
        catalog_url: c.catalog_url || "",
        created_at: c.created_at?.toISOString() || "",
        unit_count: countMap[c.name.toUpperCase()] || 0,
      })),
    });
  } catch (error: any) {
    console.error("getUnitTypeCategories error:", error);
    return { error: error.message || "Failed to fetch categories." };
  }
}

// CREATE CATEGORY
export async function createUnitTypeCategory(data: {
  name: string;
  description?: string;
  icon_color?: string;
  catalog_url?: string;
}) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized — Admin only" };

  if (!data.name || data.name.trim().length === 0) {
    return { error: "Nama tipe unit wajib diisi." };
  }

  try {
    await (prisma.unit_type_categories as any).create({
      data: {
        name: data.name.trim(),
        description: data.description || null,
        icon_color: data.icon_color || "#0073ea",
        catalog_url: data.catalog_url || null,
      },
    });

    revalidatePath("/admin/unit-database");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `Tipe unit "${data.name}" sudah ada.` };
    }
    console.error("createUnitTypeCategory error:", error);
    return { error: error.message || "Gagal membuat kategori." };
  }
}

// UPDATE CATEGORY
export async function updateUnitTypeCategory(
  id: number,
  data: {
    name?: string;
    description?: string;
    icon_color?: string;
    catalog_url?: string;
  }
) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized — Admin only" };

  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.icon_color !== undefined) updateData.icon_color = data.icon_color;
    if (data.catalog_url !== undefined) updateData.catalog_url = data.catalog_url || null;

    await (prisma.unit_type_categories as any).update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/unit-database");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `Tipe unit "${data.name}" sudah ada.` };
    }
    console.error("updateUnitTypeCategory error:", error);
    return { error: error.message || "Gagal mengupdate kategori." };
  }
}

// DELETE CATEGORY
export async function deleteUnitTypeCategory(id: number) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized — Admin only" };

  try {
    // Check if any units are using this type
    const category = await (prisma.unit_type_categories as any).findUnique({
      where: { id },
    });

    if (!category) return { error: "Kategori tidak ditemukan." };

    const unitCount = await (prisma.units as any).count({
      where: { unit_type: category.name },
    });

    if (unitCount > 0) {
      return {
        error: `Tidak dapat menghapus. Masih ada ${unitCount} unit yang menggunakan tipe "${category.name}". Ubah tipe unit tersebut terlebih dahulu.`,
      };
    }

    await (prisma.unit_type_categories as any).delete({
      where: { id },
    });

    revalidatePath("/admin/unit-database");
    return { success: true };
  } catch (error: any) {
    console.error("deleteUnitTypeCategory error:", error);
    return { error: error.message || "Gagal menghapus kategori." };
  }
}

// SEED DEFAULT CATEGORIES (run once)
export async function seedDefaultUnitTypes() {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized" };

  const defaults = [
    { name: "Chiller", description: "Water Cooled / Air Cooled Chiller", icon_color: "#0073ea" },
    { name: "AHU", description: "Air Handling Unit", icon_color: "#00c875" },
    { name: "FCU", description: "Fan Coil Unit", icon_color: "#579bfc" },
    { name: "Split Duct", description: "AC Split Duct", icon_color: "#fdab3d" },
    { name: "VRV", description: "Variable Refrigerant Volume", icon_color: "#a25ddc" },
    { name: "VRF", description: "Variable Refrigerant Flow", icon_color: "#ff5ac4" },
    { name: "Package", description: "Packaged Air Conditioner", icon_color: "#037f4c" },
    { name: "AC Split", description: "AC Split Wall Mounted", icon_color: "#66ccff" },
    { name: "AC Standing", description: "AC Floor Standing", icon_color: "#ff642e" },
  ];

  try {
    let created = 0;
    for (const d of defaults) {
      const exists = await (prisma.unit_type_categories as any).findUnique({
        where: { name: d.name },
      });
      if (!exists) {
        await (prisma.unit_type_categories as any).create({ data: d });
        created++;
      }
    }
    return { success: true, message: `${created} kategori default berhasil ditambahkan.` };
  } catch (error: any) {
    console.error("seedDefaultUnitTypes error:", error);
    return { error: error.message || "Gagal seed data." };
  }
}
