"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// FILTER PRODUCTS (CATALOG)
// ============================================

export async function getFilterProducts() {
  const products = await prisma.filter_products.findMany({
    orderBy: { created_at: "desc" },
  });
  return products.map((p: any) => ({
    ...p,
    buy_price: Number(p.buy_price),
  }));
}

export async function createFilterProduct(data: {
  filter_type: string;
  efficiency: string;
  dimensions: string;
  frame_material?: string;
  vendor_name?: string;
  vendor_phone?: string;
  buy_price?: number;
  notes?: string;
}) {
  await prisma.filter_products.create({
    data: {
      filter_type: data.filter_type,
      efficiency: data.efficiency,
      dimensions: data.dimensions,
      frame_material: data.frame_material || null,
      vendor_name: data.vendor_name || null,
      vendor_phone: data.vendor_phone || null,
      buy_price: data.buy_price || 0,
      notes: data.notes || null,
    },
  });
  revalidatePath("/admin/quotation/filter-quotation");
}

export async function updateFilterProduct(
  id: string,
  data: Partial<{
    filter_type: string;
    efficiency: string;
    dimensions: string;
    frame_material: string;
    vendor_name: string;
    vendor_phone: string;
    buy_price: number;
    notes: string;
  }>
) {
  const updateData: any = {};
  if (data.filter_type !== undefined) updateData.filter_type = data.filter_type;
  if (data.efficiency !== undefined) updateData.efficiency = data.efficiency;
  if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;
  if (data.frame_material !== undefined) updateData.frame_material = data.frame_material;
  if (data.vendor_name !== undefined) updateData.vendor_name = data.vendor_name;
  if (data.vendor_phone !== undefined) updateData.vendor_phone = data.vendor_phone;
  if (data.buy_price !== undefined) updateData.buy_price = data.buy_price;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await prisma.filter_products.update({ where: { id }, data: updateData });
  revalidatePath("/admin/quotation/filter-quotation");
}

export async function deleteFilterProduct(id: string) {
  await prisma.filter_products.delete({ where: { id } });
  revalidatePath("/admin/quotation/filter-quotation");
}

// ============================================
// FILTER QUOTATIONS
// ============================================

export async function getFilterQuotations() {
  const quotations = await prisma.filter_quotations.findMany({
    orderBy: { created_at: "desc" },
  });
  return quotations.map((q: any) => ({
    ...q,
    margin_pct: Number(q.margin_pct),
    subtotal: Number(q.subtotal),
    ppn: Number(q.ppn),
    shipping_cost: Number(q.shipping_cost),
    grand_total: Number(q.grand_total),
    items: typeof q.items === "string" ? JSON.parse(q.items) : q.items,
  }));
}

export async function generateQuoNumber() {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");
  const prefix = `FQ-${dateStr}-`;

  const existing = await prisma.filter_quotations.findMany({
    where: { quo_number: { startsWith: prefix } },
    orderBy: { quo_number: "desc" },
    take: 1,
  });

  let seq = 1;
  if (existing.length > 0) {
    const lastNum = existing[0].quo_number.split("-").pop();
    seq = parseInt(lastNum || "0", 10) + 1;
  }

  return `${prefix}${seq.toString().padStart(3, "0")}`;
}

export async function saveFilterQuotation(data: {
  id?: string;
  quo_number: string;
  customer_name: string;
  project_name?: string;
  items: any[];
  margin_pct: number;
  subtotal: number;
  ppn: number;
  shipping_cost: number;
  grand_total: number;
  delivery_terms: string;
  lead_time_days: number;
  valid_days: number;
  notes?: string;
  status?: string;
}) {
  const payload: any = {
    quo_number: data.quo_number,
    customer_name: data.customer_name,
    project_name: data.project_name || null,
    items: JSON.stringify(data.items),
    margin_pct: data.margin_pct,
    subtotal: data.subtotal,
    ppn: data.ppn,
    shipping_cost: data.shipping_cost,
    grand_total: data.grand_total,
    delivery_terms: data.delivery_terms,
    lead_time_days: data.lead_time_days,
    valid_days: data.valid_days,
    notes: data.notes || null,
    status: data.status || "Draft",
  };

  if (data.id) {
    await prisma.filter_quotations.update({
      where: { id: data.id },
      data: payload,
    });
  } else {
    await prisma.filter_quotations.create({ data: payload });
  }
  revalidatePath("/admin/quotation/filter-quotation");
}

export async function deleteFilterQuotation(id: string) {
  await prisma.filter_quotations.delete({ where: { id } });
  revalidatePath("/admin/quotation/filter-quotation");
}
