"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore as noStore } from "next/cache";

// ============================================
// TYPES
// ============================================

interface DealFilters {
  status?: string;
  pic?: string;
  category?: string;
  sector?: string;
  region?: string;
  source?: string;
  search?: string;
}

interface OpsFilters {
  status?: string;
  customer?: string;
  search?: string;
}

interface DealData {
  client_name: string;
  area?: string | null;
  project_name: string;
  bill_material?: string | null;
  type?: string | null;
  region?: string | null;
  sales_planner?: string | null;
  pic?: string | null;
  category?: string | null;
  sector?: string | null;
  quotation?: string | number;
  status?: string;
  est_booking_month?: string | null;
  target_po_date?: string | null;
  booking_fc?: string | null;
  remarks?: string | null;
  source?: string;
  priority?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface OpsData {
  status?: string;
  customer: string;
  project_name: string;
  total_value?: string | number;
  values_by_month?: any;
  remark?: string | null;
}

// ============================================
// GET SALES ENGINEERS
// ============================================
export async function getSalesEngineers() {
  noStore();
  try {
    const users = await prisma.users.findMany({
      where: {
        is_active: true,
        user_roles: {
          some: {
            roles: {
              role_name: {
                contains: "sales engineer"
              }
            }
          }
        }
      },
      select: { name: true, id: true },
      orderBy: { name: 'asc' }
    });
    return serializePrisma({ success: true, data: users });
  } catch (error: any) {
    return { error: error.message };
  }
}

// ============================================
// 1. GET DEALS PIPELINE
// ============================================
export async function getDealsPipeline(filters?: DealFilters) {
  noStore();

  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const whereConditions: any[] = [];
    
    // Role-based filtering: strict RBAC
    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );

    if (!isAdminOrMgmt) {
      whereConditions.push({
        OR: [
          { pic_id: parseInt(session.userId, 10) },
          { pic: session.name }
        ]
      });
    }

    // Apply optional filters
    if (filters?.status) whereConditions.push({ status: filters.status });
    if (filters?.pic && isAdminOrMgmt) whereConditions.push({ pic: filters.pic });
    if (filters?.category) whereConditions.push({ category: filters.category });
    if (filters?.sector) whereConditions.push({ sector: filters.sector });
    if (filters?.region) whereConditions.push({ region: filters.region });
    if (filters?.source) whereConditions.push({ source: filters.source });

    if (filters?.search) {
      whereConditions.push({
        OR: [
          { client_name: { contains: filters.search } },
          { project_name: { contains: filters.search } },
          { bill_material: { contains: filters.search } },
          { remarks: { contains: filters.search } },
        ]
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const deals = await prisma.pipeline_deals.findMany({
      where,
      orderBy: { updated_at: "desc" },
    });

    return serializePrisma({ success: true, data: deals });
  } catch (error) {
    console.error("getDealsPipeline error:", error);
    return { error: "Failed to fetch pipeline deals." };
  }
}

// ============================================
// 2. CREATE DEAL
// ============================================
export async function createDeal(data: DealData) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Role-based RBAC
    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );

    if (!isAdminOrMgmt && data.pic && data.pic !== session.name) {
      return { error: "You can only create deals assigned to yourself." };
    }

    let assignedPicId = parseInt(session.userId, 10);
    if (isAdminOrMgmt && data.pic && data.pic !== session.name) {
       const userMatch = await prisma.users.findFirst({ where: { name: data.pic } });
       if (userMatch) assignedPicId = userMatch.id;
    }

    const deal = await prisma.pipeline_deals.create({
      data: {
        client_name: data.client_name,
        area: data.area || null,
        project_name: data.project_name,
        bill_material: data.bill_material || null,
        type: data.type || null,
        region: data.region || null,
        sales_planner: data.sales_planner || null,
        pic: data.pic || session.name,
        pic_id: assignedPicId,
        category: data.category || null,
        sector: data.sector || null,
        quotation: data.quotation ? BigInt(data.quotation) : BigInt(0),
        status: data.status || "E",
        est_booking_month: data.est_booking_month
          ? new Date(data.est_booking_month)
          : null,
        target_po_date: data.target_po_date
          ? new Date(data.target_po_date)
          : null,
        booking_fc: data.booking_fc || null,
        remarks: data.remarks || null,
        source: data.source || "EPL",
        priority: data.priority || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });

    // Create initial history record
    await prisma.pipeline_history.create({
      data: {
        deal_id: deal.id,
        changed_by_id: assignedPicId,
        field_changed: "new_deal",
        new_value: deal.status,
        remark: "Deal created",
      }
    });

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: deal });
  } catch (error) {
    console.error("createDeal error:", error);
    return { error: "Failed to create deal." };
  }
}

// ============================================
// 3. UPDATE DEAL
// ============================================
export async function updateDeal(id: number, data: Partial<DealData>) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Verify deal exists
    const existing = await prisma.pipeline_deals.findUnique({
      where: { id },
    });
    if (!existing) return { error: "Deal not found." };

    // Non-internal users can only update their own deals
    if (!session.isInternal && existing.pic !== session.name) {
      return { error: "You can only update your own deals." };
    }

    const updateData: any = {};

    if (data.client_name !== undefined) updateData.client_name = data.client_name;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.project_name !== undefined) updateData.project_name = data.project_name;
    if (data.bill_material !== undefined) updateData.bill_material = data.bill_material;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.region !== undefined) updateData.region = data.region;
    if (data.sales_planner !== undefined) updateData.sales_planner = data.sales_planner;
    if (data.pic !== undefined) updateData.pic = data.pic;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.quotation !== undefined) {
      updateData.quotation = BigInt(data.quotation);
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.est_booking_month !== undefined) {
      updateData.est_booking_month = data.est_booking_month
        ? new Date(data.est_booking_month)
        : null;
    }
    if (data.target_po_date !== undefined) {
      updateData.target_po_date = data.target_po_date ? new Date(data.target_po_date) : null;
    }
    if (data.booking_fc !== undefined) updateData.booking_fc = data.booking_fc;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;

    const deal = await prisma.pipeline_deals.update({
      where: { id },
      data: updateData,
    });

    // Log history for critical fields
    if (existing.status !== deal.status) {
      await prisma.pipeline_history.create({
        data: {
          deal_id: deal.id,
          changed_by_id: parseInt(session.userId, 10),
          field_changed: "status",
          old_value: existing.status,
          new_value: deal.status,
          remark: data.remarks || "Status updated"
        }
      });
    }

    if (existing.quotation !== deal.quotation) {
      await prisma.pipeline_history.create({
        data: {
          deal_id: deal.id,
          changed_by_id: parseInt(session.userId, 10),
          field_changed: "quotation",
          old_value: existing.quotation.toString(),
          new_value: deal.quotation.toString(),
          remark: "Budget revised"
        }
      });
    }

    if (
      existing.est_booking_month?.getTime() !== deal.est_booking_month?.getTime()
    ) {
      await prisma.pipeline_history.create({
        data: {
          deal_id: deal.id,
          changed_by_id: parseInt(session.userId, 10),
          field_changed: "est_booking_month",
          old_value: existing.est_booking_month?.toISOString(),
          new_value: deal.est_booking_month?.toISOString(),
          remark: "Estimated timeline revised"
        }
      });
    }

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: deal });
  } catch (error) {
    console.error("updateDeal error:", error);
    return { error: "Failed to update deal." };
  }
}

// ============================================
// 4. DELETE DEAL
// ============================================
export async function deleteDeal(id: number) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Verify deal exists
    const existing = await prisma.pipeline_deals.findUnique({
      where: { id },
    });
    if (!existing) return { error: "Deal not found." };

    // Non-internal users can only delete their own deals
    if (!session.isInternal && existing.pic !== session.name) {
      return { error: "You can only delete your own deals." };
    }

    await prisma.pipeline_deals.delete({
      where: { id },
    });

    revalidatePath("/dashboard/pipeline");
    return { success: true };
  } catch (error) {
    console.error("deleteDeal error:", error);
    return { error: "Failed to delete deal." };
  }
}

// ============================================
// 5. GET OPS PIPELINE
// ============================================
export async function getOpsPipeline(filters?: OpsFilters) {
  noStore();

  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const where: any = {};

    // Apply optional filters
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.customer) {
      where.customer = { contains: filters.customer };
    }
    if (filters?.search) {
      where.OR = [
        { customer: { contains: filters.search } },
        { project_name: { contains: filters.search } },
        { remark: { contains: filters.search } },
      ];
    }

    const records = await prisma.pipeline_ops.findMany({
      where,
      orderBy: { updated_at: "desc" },
    });

    return serializePrisma({ success: true, data: records });
  } catch (error) {
    console.error("getOpsPipeline error:", error);
    return { error: "Failed to fetch ops pipeline." };
  }
}

// ============================================
// 6. CREATE OPS RECORD
// ============================================
export async function createOpsRecord(data: OpsData) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (!session.isInternal) {
      return { error: "Only internal users can manage ops pipeline." };
    }

    const record = await prisma.pipeline_ops.create({
      data: {
        status: data.status || "E",
        customer: data.customer,
        project_name: data.project_name,
        total_value: data.total_value ? BigInt(data.total_value) : BigInt(0),
        values_by_month: data.values_by_month ?? undefined,
        remark: data.remark || null,
      },
    });

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: record });
  } catch (error) {
    console.error("createOpsRecord error:", error);
    return { error: "Failed to create ops record." };
  }
}

// ============================================
// 7. UPDATE OPS RECORD
// ============================================
export async function updateOpsRecord(id: number, data: Partial<OpsData>) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (!session.isInternal) {
      return { error: "Only internal users can manage ops pipeline." };
    }

    const existing = await prisma.pipeline_ops.findUnique({
      where: { id },
    });
    if (!existing) return { error: "Ops record not found." };

    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.customer !== undefined) updateData.customer = data.customer;
    if (data.project_name !== undefined) updateData.project_name = data.project_name;
    if (data.total_value !== undefined) {
      updateData.total_value = BigInt(data.total_value);
    }
    if (data.values_by_month !== undefined) updateData.values_by_month = data.values_by_month;
    if (data.remark !== undefined) updateData.remark = data.remark;

    const record = await prisma.pipeline_ops.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: record });
  } catch (error) {
    console.error("updateOpsRecord error:", error);
    return { error: "Failed to update ops record." };
  }
}

// ============================================
// 8. DELETE OPS RECORD
// ============================================
export async function deleteOpsRecord(id: number) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (!session.isInternal) {
      return { error: "Only internal users can manage ops pipeline." };
    }

    const existing = await prisma.pipeline_ops.findUnique({
      where: { id },
    });
    if (!existing) return { error: "Ops record not found." };

    await prisma.pipeline_ops.delete({
      where: { id },
    });

    revalidatePath("/dashboard/pipeline");
    return { success: true };
  } catch (error) {
    console.error("deleteOpsRecord error:", error);
    return { error: "Failed to delete ops record." };
  }
}

// ============================================
// 9. GET PIPELINE STATS (Aggregated)
// ============================================
export async function getPipelineStats() {
  noStore();

  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Base where clause: scope by PIC for non-internal users
    const baseWhere: any = {};
    if (!session.isInternal) {
      baseWhere.pic = session.name;
    }

    // Fetch all relevant deals in one query to compute aggregations in JS
    // This avoids MySQL limitations with groupBy + BigInt sum
    const deals = await prisma.pipeline_deals.findMany({
      where: baseWhere,
      select: {
        quotation: true,
        status: true,
        category: true,
        sector: true,
        pic: true,
        region: true,
        est_booking_month: true,
      },
    });

    // --- Count & Sum by status ---
    const statusMap: Record<string, { count: number; total: bigint }> = {};
    for (const d of deals) {
      const s = d.status || "E";
      if (!statusMap[s]) statusMap[s] = { count: 0, total: BigInt(0) };
      statusMap[s].count++;
      statusMap[s].total += d.quotation ?? BigInt(0);
    }

    const byStatus = Object.entries(statusMap).map(([status, v]) => ({
      status,
      count: v.count,
      total: v.total.toString(),
    }));

    // --- Total won (status A) ---
    const totalWon = (statusMap["A"]?.total ?? BigInt(0)).toString();
    const totalWonCount = statusMap["A"]?.count ?? 0;

    // --- Total pipeline value (all statuses) ---
    let totalPipelineValue = BigInt(0);
    for (const d of deals) {
      totalPipelineValue += d.quotation ?? BigInt(0);
    }

    // --- Sum by category ---
    const categoryMap: Record<string, bigint> = {};
    for (const d of deals) {
      const key = d.category || "Uncategorized";
      categoryMap[key] = (categoryMap[key] ?? BigInt(0)) + (d.quotation ?? BigInt(0));
    }
    const byCategory = Object.entries(categoryMap).map(([category, total]) => ({
      category,
      total: total.toString(),
    }));

    // --- Sum by sector ---
    const sectorMap: Record<string, bigint> = {};
    for (const d of deals) {
      const key = d.sector || "Unspecified";
      sectorMap[key] = (sectorMap[key] ?? BigInt(0)) + (d.quotation ?? BigInt(0));
    }
    const bySector = Object.entries(sectorMap).map(([sector, total]) => ({
      sector,
      total: total.toString(),
    }));

    // --- Sum by PIC (top performers) ---
    const picMap: Record<string, { total: bigint; count: number }> = {};
    for (const d of deals) {
      const key = d.pic || "Unassigned";
      if (!picMap[key]) picMap[key] = { total: BigInt(0), count: 0 };
      picMap[key].total += d.quotation ?? BigInt(0);
      picMap[key].count++;
    }
    const byPic = Object.entries(picMap)
      .map(([pic, v]) => ({
        pic,
        total: v.total.toString(),
        count: v.count,
      }))
      .sort((a, b) => {
        // Sort descending by total value
        const diff = BigInt(b.total) - BigInt(a.total);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });

    // --- Sum by region ---
    const regionMap: Record<string, bigint> = {};
    for (const d of deals) {
      const key = d.region || "Unspecified";
      regionMap[key] = (regionMap[key] ?? BigInt(0)) + (d.quotation ?? BigInt(0));
    }
    const byRegion = Object.entries(regionMap).map(([region, total]) => ({
      region,
      total: total.toString(),
    }));

    // --- Monthly forecast (group by est_booking_month) ---
    const monthMap: Record<string, { total: bigint; count: number }> = {};
    for (const d of deals) {
      if (d.est_booking_month) {
        const dt = new Date(d.est_booking_month);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap[key]) monthMap[key] = { total: BigInt(0), count: 0 };
        monthMap[key].total += d.quotation ?? BigInt(0);
        monthMap[key].count++;
      }
    }
    const monthlyForecast = Object.entries(monthMap)
      .map(([month, v]) => ({
        month,
        total: v.total.toString(),
        count: v.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return serializePrisma({
      success: true,
      data: {
        totalPipelineValue: totalPipelineValue.toString(),
        totalDeals: deals.length,
        totalWon,
        totalWonCount,
        byStatus,
        byCategory,
        bySector,
        byPic,
        byRegion,
        monthlyForecast,
      },
    });
  } catch (error) {
    console.error("getPipelineStats error:", error);
    return { error: "Failed to fetch pipeline stats." };
  }
}

// ============================================
// 10. GET PIPELINE SETTINGS
// ============================================
export async function getPipelineSettings() {
  noStore();

  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const settings = await prisma.pipeline_settings.findMany({
      orderBy: { key: "asc" },
    });

    return serializePrisma({ success: true, data: settings });
  } catch (error) {
    console.error("getPipelineSettings error:", error);
    return { error: "Failed to fetch pipeline settings." };
  }
}

// ============================================
// 11. UPDATE PIPELINE SETTING
// ============================================
export async function updatePipelineSetting(
  key: string,
  value: any,
  description?: string
) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (!session.isInternal) {
      return { error: "Only internal users can update pipeline settings." };
    }

    const setting = await prisma.pipeline_settings.upsert({
      where: { key },
      update: {
        value,
        ...(description !== undefined ? { description } : {}),
      },
      create: {
        key,
        value,
        description: description || null,
      },
    });

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: setting });
  } catch (error) {
    console.error("updatePipelineSetting error:", error);
    return { error: "Failed to update pipeline setting." };
  }
}

// ============================================
// GET PIPELINE LEADERBOARD (Global)
// ============================================
export async function getPipelineLeaderboard() {
  noStore();
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // We only expose aggregated numbers (quotation, status, pic) for leaderboard, NOT project details.
    const deals = await prisma.pipeline_deals.findMany({
      select: { pic: true, status: true, quotation: true }
    });

    return serializePrisma({ success: true, data: deals });
  } catch (error) {
    console.error("getPipelineLeaderboard error:", error);
    return { error: "Failed to fetch leaderboard." };
  }
}

// ============================================
// GET DEAL HISTORY
// ============================================
export async function getDealHistory(dealId: number) {
  try {
    const history = await prisma.pipeline_history.findMany({
      where: { deal_id: dealId },
      include: { user: { select: { name: true } } },
      orderBy: { created_at: 'desc' }
    });
    return serializePrisma({ success: true, data: history });
  } catch (error) {
    console.error('getDealHistory error:', error);
    return { error: 'Failed to fetch history.' };
  }
}
