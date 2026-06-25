"use server";

import { PrismaClient } from "../../generated/client_v3";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getBoqProjects(userId: number) {
  return await prisma.boq_projects.findMany({
    where: { created_by: userId },
    orderBy: { created_at: "desc" },
  });
}

export async function getBoqProjectDetails(boqId: string) {
  return await prisma.boq_projects.findUnique({
    where: { id: boqId },
    include: {
      items: {
        include: {
          pricelist: true,
        },
      },
    },
  });
}

export async function createBoqProject(data: {
  project_name: string;
  customer_name?: string;
  created_by: number;
}) {
  const boq = await prisma.boq_projects.create({
    data: {
      project_name: data.project_name,
      customer_name: data.customer_name,
      created_by: data.created_by,
    },
  });
  revalidatePath("/admin/quotation/boq-builder");
  return boq;
}

export async function deleteBoqProject(id: string) {
  await prisma.boq_projects.delete({ where: { id } });
  revalidatePath("/admin/quotation/boq-builder");
}

export async function addBoqItem(data: {
  boq_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
}) {
  const total_price = data.quantity * data.unit_price;
  
  const item = await prisma.boq_items.create({
    data: {
      boq_id: data.boq_id,
      item_id: data.item_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: total_price,
    },
  });
  revalidatePath(`/admin/quotation/boq-builder/${data.boq_id}`);
  return item;
}

export async function deleteBoqItem(id: string, boq_id: string) {
  await prisma.boq_items.delete({ where: { id } });
  revalidatePath(`/admin/quotation/boq-builder/${boq_id}`);
}

export async function updateBoqItemQuantity(id: string, boq_id: string, quantity: number, unit_price: number) {
  const total_price = quantity * unit_price;
  const item = await prisma.boq_items.update({
    where: { id },
    data: {
      quantity,
      total_price,
    },
  });
  revalidatePath(`/admin/quotation/boq-builder/${boq_id}`);
  return item;
}
