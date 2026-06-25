"use server";

import { PrismaClient } from "../../generated/client_v3";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getPricelistItems(page = 1, pageSize = 50, search = "") {
  const skip = (page - 1) * pageSize;
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { category: { contains: search } },
        ],
      }
    : {};

  const items = await prisma.pricelist_items.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { category: "asc" },
  });

  const total = await prisma.pricelist_items.count({ where });

  return { items, total, totalPages: Math.ceil(total / pageSize) };
}

export async function addPricelistItem(data: {
  category: string;
  name: string;
  specification?: string;
  unit: string;
  price: number;
}) {
  const item = await prisma.pricelist_items.create({
    data: {
      category: data.category,
      name: data.name,
      specification: data.specification,
      unit: data.unit,
      price: data.price,
    },
  });
  revalidatePath("/admin/pricelist");
  return item;
}

export async function updatePricelistItem(id: string, data: {
  category?: string;
  name?: string;
  specification?: string;
  unit?: string;
  price?: number;
}) {
  const item = await prisma.pricelist_items.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/pricelist");
  return item;
}

export async function deletePricelistItem(id: string) {
  await prisma.pricelist_items.delete({ where: { id } });
  revalidatePath("/admin/pricelist");
}
