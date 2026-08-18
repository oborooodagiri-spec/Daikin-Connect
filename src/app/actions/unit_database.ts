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
      orderBy: [
        { sort_order: "asc" },
        { name: "asc" }
      ],
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
        image_url: c.image_url || "",
        parent_id: c.parent_id,
        sort_order: c.sort_order,
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
  image_url?: string;
  parent_id?: number | null;
  sort_order?: number;
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
        image_url: data.image_url || null,
        parent_id: data.parent_id || null,
        sort_order: data.sort_order || 0,
      },
    });

    revalidatePath("/admin/unit-database");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `Tipe unit "${data.name}" sudah ada di level ini.` };
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
    image_url?: string;
    parent_id?: number | null;
    sort_order?: number;
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
    if (data.image_url !== undefined) updateData.image_url = data.image_url || null;
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

    await (prisma.unit_type_categories as any).update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/unit-database");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `Tipe unit "${data.name}" sudah ada di level ini.` };
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

    // Check if it has children
    const childCount = await (prisma.unit_type_categories as any).count({
      where: { parent_id: id },
    });

    if (childCount > 0) {
      return {
        error: `Tidak dapat menghapus. Kategori ini memiliki ${childCount} sub-kategori. Hapus sub-kategori terlebih dahulu.`,
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
    { name: "Air Cooled Chiller", description: "Chiller dengan pendinginan udara", icon_color: "#0073ea", sort_order: 1 },
    { name: "Air Side", description: "AHU, FCU, dan perangkat sisi udara", icon_color: "#00c875", sort_order: 2 },
    { name: "Water Cooled Chiller", description: "Chiller dengan pendinginan air", icon_color: "#579bfc", sort_order: 3 },
    { name: "DX", description: "Direct Expansion - VRV, Split, dll", icon_color: "#fdab3d", sort_order: 4 },
    { name: "Filter", description: "Filter udara dan komponen filtrasi", icon_color: "#a25ddc", sort_order: 5 },
  ];

  try {
    let created = 0;
    for (const d of defaults) {
      const exists = await (prisma.unit_type_categories as any).findFirst({
        where: { name: d.name, parent_id: null },
      });
      if (!exists) {
        await (prisma.unit_type_categories as any).create({ data: d });
        created++;
      }
    }
    return { success: true, message: `${created} kategori utama berhasil ditambahkan.` };
  } catch (error: any) {
    console.error("seedDefaultUnitTypes error:", error);
    return { error: error.message || "Gagal seed data." };
  }
}
