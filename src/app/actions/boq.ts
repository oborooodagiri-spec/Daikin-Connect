"use server";

import { PrismaClient } from "../../generated/client_v3";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/actions/auth";

const prisma = new PrismaClient();

export async function getShareableUsers() {
  const session = await getSession();
  if (!session) return [];
  const users = await prisma.users.findMany({
    where: { is_active: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });
  return users;
}

export async function getBoqProjects() {
  const session = await getSession();
  if (!session) return [];
  const userId = parseInt(session.userId, 10);
  const isManagement = session.roles.some((r: string) => 
    ["admin", "super", "management", "administrator"].includes(r.toLowerCase())
  );

  const data = await prisma.boq_projects.findMany({
    orderBy: { created_at: "desc" },
  });

  if (isManagement) {
    return JSON.parse(JSON.stringify(data));
  }

  // Filter for personal and shared
  const filtered = data.filter(d => {
    if (d.created_by === userId) return true;
    if (d.allowed_users) {
      const allowed = d.allowed_users.split(",").map(id => id.trim());
      if (allowed.includes(userId.toString())) return true;
    }
    return false;
  });

  return JSON.parse(JSON.stringify(filtered));
}

export async function getBoqProjectDetails(boqId: string) {
  const session = await getSession();
  if (!session) return null;
  const userId = parseInt(session.userId, 10);
  const isManagement = session.roles.some((r: string) => 
    ["admin", "super", "management", "administrator"].includes(r.toLowerCase())
  );

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

  if (!data) return null;

  if (!isManagement && data.created_by !== userId) {
    let hasAccess = false;
    if (data.allowed_users) {
      const allowed = data.allowed_users.split(",").map(id => id.trim());
      if (allowed.includes(userId.toString())) hasAccess = true;
    }
    if (!hasAccess) return null; // Unauthorized
  }

  return JSON.parse(JSON.stringify(data));
}

export async function createBoqProject(data: {
  project_name: string;
  customer_name?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const userId = parseInt(session.userId, 10);

  const defaultCategories = [
    { name: "I. PRELIMINARY", order_index: 0 },
    { name: "II. SUPPLY MAIN EQUIPMENT", order_index: 1 },
    { name: "III. SCOPE OF WORK INSTALLATION", order_index: 2 },
    { name: "III.A. Installation Pipe Chiller Water Supply", order_index: 3 },
    { name: "III.B. Installation Pipe Condenser Water Supply", order_index: 4 },
    { name: "III.C. Accesories Chiller", order_index: 5 },
    { name: "III.D. Accesories Primary Chilled Water Pump", order_index: 6 },
    { name: "III.E. Accesories Secondary Chilled Water Pump", order_index: 7 },
    { name: "III.F. Accesories Condenser Water Pump", order_index: 8 },
    { name: "III.G. Accesories Cooling Tower", order_index: 9 },
    { name: "IV. INSTALLATION ELECTRICAL", order_index: 10 },
    { name: "V. LIFTING AND CIVIL INSTALLATION", order_index: 11 },
  ];

  const boq = await prisma.boq_projects.create({
    data: {
      project_name: data.project_name,
      customer_name: data.customer_name,
      created_by: userId,
      categories: {
        create: defaultCategories
      }
    },
  });
  revalidatePath("/admin/quotation/boq-builder");
  return JSON.parse(JSON.stringify(boq));
}

export async function updateBoqProjectSettings(boqId: string, folder_color: string, allowed_users: string) {
  const boq = await prisma.boq_projects.update({
    where: { id: boqId },
    data: {
      folder_color,
      allowed_users,
    },
  });
  revalidatePath("/admin/quotation/boq-builder/projects");
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
