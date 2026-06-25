"use server";

import { PrismaClient } from "../../generated/client_v3";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getBoqProjects() {
  const data = await prisma.boq_projects.findMany({
    orderBy: { created_at: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export async function getBoqProjectDetails(boqId: string) {
  const data = await prisma.boq_projects.findUnique({
    where: { id: boqId },
    include: {
      categories: {
        orderBy: { order_index: "asc" },
        include: {
          items: {
            orderBy: { id: "asc" },
            include: {
              pricelist: true,
            },
          },
        },
      },
    },
  });
  return data ? JSON.parse(JSON.stringify(data)) : null;
}

export async function createBoqProject(data: {
  project_name: string;
  customer_name?: string;
}) {
  const user = await prisma.users.findFirst();
  const userId = user ? user.id : 1;

  const boq = await prisma.boq_projects.create({
    data: {
      project_name: data.project_name,
      customer_name: data.customer_name,
      created_by: userId,
    },
  });
  revalidatePath("/admin/quotation/boq-builder");
  return JSON.parse(JSON.stringify(boq));
}

export async function updateBoqProjectMarkup(boqId: string, markup_material: number, markup_labour: number) {
  const boq = await prisma.boq_projects.update({
    where: { id: boqId },
    data: {
      markup_material,
      markup_labour,
    },
  });
  revalidatePath(`/admin/quotation/boq-builder/${boqId}`);
  return JSON.parse(JSON.stringify(boq));
}

export async function deleteBoqProject(id: string) {
  await prisma.boq_projects.delete({ where: { id } });
  revalidatePath("/admin/quotation/boq-builder");
}

// -- Category Actions --

export async function addBoqCategory(boqId: string, name: string) {
  const count = await prisma.boq_categories.count({ where: { boq_id: boqId } });
  const cat = await prisma.boq_categories.create({
    data: {
      boq_id: boqId,
      name,
      order_index: count,
    },
  });
  revalidatePath(`/admin/quotation/boq-builder/${boqId}`);
  return JSON.parse(JSON.stringify(cat));
}

export async function deleteBoqCategory(id: string, boqId: string) {
  await prisma.boq_categories.delete({ where: { id } });
  revalidatePath(`/admin/quotation/boq-builder/${boqId}`);
}

// -- Item Actions --

export async function addBoqItem(data: {
  boq_id: string;
  category_id: string;
  item_id?: string;
  manual_name?: string;
  specification?: string;
  unit?: string;
  quantity: number;
  material_price: number;
  labour_price: number;
}) {
  const item = await prisma.boq_items.create({
    data: {
      boq_id: data.boq_id,
      category_id: data.category_id,
      item_id: data.item_id,
      manual_name: data.manual_name,
      specification: data.specification,
      unit: data.unit,
      quantity: data.quantity,
      material_price: data.material_price,
      labour_price: data.labour_price,
    },
  });
  revalidatePath(`/admin/quotation/boq-builder/${data.boq_id}`);
  return JSON.parse(JSON.stringify(item));
}

export async function updateBoqItem(
  id: string,
  boq_id: string,
  updates: {
    quantity?: number;
    material_price?: number;
    labour_price?: number;
  }
) {
  const item = await prisma.boq_items.update({
    where: { id },
    data: updates,
  });
  revalidatePath(`/admin/quotation/boq-builder/${boq_id}`);
  return JSON.parse(JSON.stringify(item));
}

export async function deleteBoqItem(id: string, boq_id: string) {
  await prisma.boq_items.delete({ where: { id } });
  revalidatePath(`/admin/quotation/boq-builder/${boq_id}`);
}
