"use server";

import { PrismaClient } from "@/generated/client_v3";
import { getSession } from "./auth";

const prisma = new PrismaClient();

// =======================
// WORK ORDERS
// =======================

export async function createWorkOrder(data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Generate WO Number if not provided
    const wo_number = data.wo_number || `WO/DASI/VES/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const wo = await prisma.work_orders.upsert({
      where: { wo_number },
      update: {
        customer_name: data.customer_name,
        pic_name: data.pic_name,
        company_address: data.company_address,
        project_id: data.project_id ? BigInt(data.project_id) : null,
        status: data.status || "Draft"
      },
      create: {
        wo_number,
        customer_name: data.customer_name,
        pic_name: data.pic_name,
        company_address: data.company_address,
        project_id: data.project_id ? BigInt(data.project_id) : null,
        status: data.status || "Draft",
        created_by: session.id
      }
    });

    return { success: true, data: wo };
  } catch (error: any) {
    console.error("Create WO Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkOrders(projectId?: number | string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const whereClause: any = {};
    if (projectId) {
      whereClause.project_id = BigInt(projectId);
    }

    const wos = await prisma.work_orders.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        projects: true,
        quotations: {
          include: {
            sla: true
          }
        }
      }
    });

    return { success: true, data: wos };
  } catch (error: any) {
    console.error("Get WOs Error:", error);
    return { success: false, error: error.message };
  }
}

// =======================
// QUOTATIONS
// =======================

export async function createQuotation(data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Must link to a WO
    if (!data.work_order_id) throw new Error("Work Order ID is required");

    const quo_number = data.quo_number || `QUO/DASI/VES/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const existingQuo = await prisma.quotations.findUnique({
      where: { quo_number }
    });

    let quo;
    if (existingQuo) {
      // Clear existing items
      await prisma.quotation_items.deleteMany({
        where: { quotation_id: existingQuo.id }
      });
      // Update
      quo = await prisma.quotations.update({
        where: { id: existingQuo.id },
        data: {
          total_amount: data.total_amount,
          discount: data.discount,
          tax: data.tax,
          grand_total: data.grand_total,
          status: data.status || "Draft",
          items: {
            create: data.items.map((item: any) => ({
              item_name: item.item_name,
              category: item.category,
              qty: item.qty,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
          }
        },
        include: { items: true }
      });
    } else {
      quo = await prisma.quotations.create({
        data: {
          quo_number,
          work_order_id: data.work_order_id,
          total_amount: data.total_amount,
          discount: data.discount,
          tax: data.tax,
          grand_total: data.grand_total,
          status: data.status || "Draft",
          created_by: session.id,
          items: {
            create: data.items.map((item: any) => ({
              item_name: item.item_name,
              category: item.category,
              qty: item.qty,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
          }
        },
        include: { items: true }
      });
    }

    // Update WO status
    await prisma.work_orders.update({
      where: { id: data.work_order_id },
      data: { status: "Quoted" }
    });

    return { success: true, data: quo };
  } catch (error: any) {
    console.error("Create Quotation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuotations(projectId?: number | string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const whereClause: any = {};
    if (projectId) {
      whereClause.work_orders = { project_id: BigInt(projectId) };
    }

    const quotations = await prisma.quotations.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        work_orders: {
          include: {
            projects: true
          }
        },
        items: true,
        sla: true
      }
    });

    return { success: true, data: quotations };
  } catch (error: any) {
    console.error("Get Quotations Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuotationById(id: number) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const quo = await prisma.quotations.findUnique({
      where: { id },
      include: {
        work_orders: true,
        items: true,
        sla: true
      }
    });

    if (!quo) throw new Error("Quotation not found");

    return { success: true, data: quo };
  } catch (error: any) {
    console.error("Get Quotation Error:", error);
    return { success: false, error: error.message };
  }
}

// =======================
// SLAs
// =======================

export async function createOrUpdateSLA(data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    if (!data.quotation_id) throw new Error("Quotation ID is required");

    const existingSLA = await prisma.slas.findUnique({
      where: { quotation_id: data.quotation_id }
    });

    let sla;
    if (existingSLA) {
      sla = await prisma.slas.update({
        where: { id: existingSLA.id },
        data: {
          contract_duration: data.contract_duration,
          service_frequency: data.service_frequency,
          custom_kpis: JSON.stringify(data.custom_kpis),
          custom_terms: JSON.stringify(data.custom_terms),
          custom_sow: JSON.stringify(data.custom_sow),
          status: data.status || "Active"
        }
      });
    } else {
      sla = await prisma.slas.create({
        data: {
          quotation_id: data.quotation_id,
          contract_duration: data.contract_duration,
          service_frequency: data.service_frequency,
          custom_kpis: JSON.stringify(data.custom_kpis),
          custom_terms: JSON.stringify(data.custom_terms),
          custom_sow: JSON.stringify(data.custom_sow),
          status: data.status || "Draft",
          created_by: session.id
        }
      });
    }

    return { success: true, data: sla };
  } catch (error: any) {
    console.error("Create/Update SLA Error:", error);
    return { success: false, error: error.message };
  }
}
