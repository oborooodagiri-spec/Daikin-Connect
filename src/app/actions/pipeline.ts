"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore as noStore, unstable_cache } from "next/cache";

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

export interface DealData {
  id?: number;
  client_name: string;
  area?: string;
  project_name: string;
  bill_material?: string;
  type?: string;
  region?: string;
  sales_planner?: string;
  pic?: string;
  pic_id?: number;
  category?: string;
  sector?: string;
  quotation?: number;
  status?: string;
  est_booking_month?: string | null;
  target_po_date?: string | null;
  booking_fc?: string | null;
  remarks?: string;
  source?: string;
  priority?: string;
  latitude?: number;
  longitude?: number;
  is_closed?: boolean;
  is_partial_close?: boolean;
  partial_percentage?: number | null;
  parent_deal_id?: number | null;
  closed_period?: string | null;
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
// GET ALL INTERNAL USERS (FOR PARTNERSHIP CONFIG)
// ============================================
export async function getInternalUsers() {
  noStore();
  try {
    const users = await prisma.users.findMany({
      where: {
        is_active: true,
        user_roles: {
          some: {
            roles: {
              role_name: {
                in: ["Super Administrator", "Administrator", "Management", "Director", "Sales Engineer", "Sales Supervisor"]
              }
            }
          }
        }
      },
      select: { name: true, id: true },
      orderBy: { name: 'asc' }
    });
    
    // Fallback: If no users found by strict role_name, just get users with any role containing 'admin', 'manage', 'direct', 'sales'
    if (users.length === 0) {
      const fallbackUsers = await prisma.users.findMany({
        where: {
          is_active: true,
          user_roles: {
            some: {
              roles: {
                OR: [
                  { role_name: { contains: "admin" } },
                  { role_name: { contains: "manage" } },
                  { role_name: { contains: "direct" } },
                  { role_name: { contains: "sales" } }
                ]
              }
            }
          }
        },
        select: { name: true, id: true },
        orderBy: { name: 'asc' }
      });
      return serializePrisma({ success: true, data: fallbackUsers });
    }

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
    
    // Removed role-based filtering so all roles can see the global pipeline in the dashboard.
    // Strict RBAC for the Sales Pipeline table is handled on the client (LiveDataClient.tsx -> filteredDeals).
    // Apply optional filters
    if (filters?.status) whereConditions.push({ status: filters.status });
    if (filters?.pic) whereConditions.push({ pic: filters.pic });
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
export async function createDeal(data: Partial<DealData>) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );

    if (!isAdminOrMgmt && data.pic && data.pic !== session.name) {
      return { error: "You can only create deals assigned to yourself." };
    }

    // --- SERVER SIDE LOCATION VALIDATION ---
    const isMissingLocation = !data.latitude || !data.longitude || 
                              data.latitude === 0 || data.longitude === 0 || 
                              String(data.latitude) === "null" || String(data.longitude) === "null";

    if (data.status && ["A", "B"].includes(data.status) && isMissingLocation) {
      return { error: "Lokasi proyek (koordinat map) wajib diisi sebelum mengatur status menjadi A atau B." };
    }
    
    if (data.is_closed && isMissingLocation) {
      return { error: "Lokasi proyek (koordinat map) wajib diisi sebelum menutup proyek." };
    }
    // ---------------------------------------

    let assignedPicId = parseInt(session.userId, 10);
    if (isAdminOrMgmt && data.pic && data.pic !== session.name) {
       const userMatch = await prisma.users.findFirst({ where: { name: data.pic } });
       if (userMatch) assignedPicId = userMatch.id;
    }

    const picName = data.pic || session.name;
    const picAreas = await getPICAreas();
    const autoRegion = picAreas[picName] || data.region || null;

    const deal = await prisma.pipeline_deals.create({
      data: {
        client_name: data.client_name!,
        area: data.area || null,
        project_name: data.project_name!,
        bill_material: data.bill_material || null,
        type: data.type || null,
        region: autoRegion,
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
        is_closed: data.is_closed ?? false,
        closed_period: data.closed_period || null,
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

    // --- SERVER SIDE LOCATION VALIDATION ---
    const newStatus = data.status !== undefined ? data.status : existing.status;
    const newIsClosed = data.is_closed !== undefined ? data.is_closed : existing.is_closed;
    const newLat = data.latitude !== undefined ? data.latitude : existing.latitude;
    const newLng = data.longitude !== undefined ? data.longitude : existing.longitude;

    const isMissingLocation = !newLat || !newLng || newLat === 0 || newLng === 0 || 
                              String(newLat) === "null" || String(newLng) === "null";

    // Validate Location Requirement for A/B status
    if (newStatus && ["A", "B"].includes(newStatus) && isMissingLocation) {
      return { error: "Lokasi proyek (koordinat map) wajib diisi sebelum mengubah status menjadi A atau B." };
    }

    // Validate Location Requirement for is_closed
    if (newIsClosed && isMissingLocation) {
      return { error: "Lokasi proyek (koordinat map) wajib diisi sebelum menutup proyek." };
    }
    // ---------------------------------------

    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );

    // Enforce ownership based on pic_id for non-admins
    if (!isAdminOrMgmt && existing.pic_id !== parseInt(session.userId) && existing.sales_planner !== session.name) {
      return { error: "You can only update your own deals." };
    }

    const updateData: any = {};

    if (data.client_name !== undefined) updateData.client_name = data.client_name;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.project_name !== undefined) updateData.project_name = data.project_name;
    if (data.bill_material !== undefined) updateData.bill_material = data.bill_material;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.sales_planner !== undefined) updateData.sales_planner = data.sales_planner;
    if (data.pic !== undefined) {
      updateData.pic = data.pic;
      
      const userMatch = await prisma.users.findFirst({ where: { name: data.pic } });
      if (userMatch) {
        updateData.pic_id = userMatch.id;
      }

      const picAreas = await getPICAreas();
      if (picAreas[data.pic]) {
        updateData.region = picAreas[data.pic];
      }
    } else if (data.region !== undefined) {
      updateData.region = data.region;
    }
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
    if (data.is_closed !== undefined) updateData.is_closed = data.is_closed;
    if (data.closed_period !== undefined) updateData.closed_period = data.closed_period;

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

    if (
      existing.target_po_date?.getTime() !== deal.target_po_date?.getTime()
    ) {
      await prisma.pipeline_history.create({
        data: {
          deal_id: deal.id,
          changed_by_id: parseInt(session.userId, 10),
          field_changed: "target_po_date",
          old_value: existing.target_po_date?.toISOString(),
          new_value: deal.target_po_date?.toISOString(),
          remark: (data as any).target_po_reason || "Target PO revised"
        }
      });
    }

    if (existing.is_closed !== deal.is_closed) {
      await prisma.pipeline_history.create({
        data: {
          deal_id: deal.id,
          changed_by_id: parseInt(session.userId, 10),
          field_changed: "is_closed",
          old_value: existing.is_closed ? "Closed" : "Open",
          new_value: deal.is_closed ? "Closed" : "Open",
          remark: deal.is_closed ? "Project marked as closed/won" : "Project re-opened"
        }
      });
    }

    const fieldsToTrack = [
      { key: 'client_name', label: 'Client Name' },
      { key: 'project_name', label: 'Project Name' },
      { key: 'category', label: 'Category' },
      { key: 'sector', label: 'Sector' },
      { key: 'pic', label: 'PIC' },
      { key: 'source', label: 'Source' },
      { key: 'sales_planner', label: 'Sales Planner' },
      { key: 'area', label: 'Project Area' },
      { key: 'remarks', label: 'Remarks' }
    ];

    for (const field of fieldsToTrack) {
      if ((existing as any)[field.key] !== (deal as any)[field.key]) {
        await prisma.pipeline_history.create({
          data: {
            deal_id: deal.id,
            changed_by_id: parseInt(session.userId, 10),
            field_changed: field.key,
            old_value: String((existing as any)[field.key] || ''),
            new_value: String((deal as any)[field.key] || ''),
            remark: `${field.label} updated`
          }
        });
      }
    }

    revalidatePath("/dashboard/pipeline");
    return serializePrisma({ success: true, data: deal });
  } catch (error: any) {
    console.error("updateDeal error:", error);
    return { error: `Failed to update deal: ${error.message || error}` };
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
    if (!session.isInternal && existing.pic !== session.name && existing.sales_planner !== session.name) {
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
// PIPELINE SETTINGS FOR PIC AREAS
// ============================================
export async function getPICAreas() {
  noStore();
  try {
    const record = await prisma.pipeline_settings.findUnique({
      where: { key: "PIC_AREAS" }
    });
    return record?.value ? (record.value as Record<string, string>) : {};
  } catch (error) {
    console.error("getPICAreas error:", error);
    return {};
  }
}

export async function updatePICAreas(mapping: Record<string, string>) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );
    if (!isAdminOrMgmt) return { error: "Only admins can update PIC settings." };

    await prisma.pipeline_settings.upsert({
      where: { key: "PIC_AREAS" },
      update: { value: mapping as any },
      create: { key: "PIC_AREAS", value: mapping as any, description: "Mapping of PIC name to Region/Area" }
    });

    // Retroactively update existing deals to match the new mapping
    for (const [picName, region] of Object.entries(mapping)) {
      if (picName && region) {
        await prisma.pipeline_deals.updateMany({
          where: { pic: picName },
          data: { region: region }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("updatePICAreas error:", error);
    return { error: "Failed to update PIC settings." };
  }
}

// ============================================
// PIPELINE SETTINGS FOR PARTNERSHIP PICS
// ============================================
export async function getPartnershipPICs() {
  noStore();
  try {
    const record = await prisma.pipeline_settings.findUnique({
      where: { key: "PARTNERSHIP_PICS" }
    });
    return record?.value ? (record.value as string[]) : [];
  } catch (error) {
    console.error("getPartnershipPICs error:", error);
    return [];
  }
}

export async function updatePartnershipPICs(names: string[]) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );
    if (!isAdminOrMgmt) return { error: "Only admins can update Partnership PIC settings." };

    await prisma.pipeline_settings.upsert({
      where: { key: "PARTNERSHIP_PICS" },
      update: { value: names as any },
      create: { key: "PARTNERSHIP_PICS", value: names as any, description: "List of users designated as Partnership PICs" }
    });

    revalidatePath("/admin/live-data");
    return { success: true };
  } catch (error: any) {
    console.error("updatePartnershipPICs error:", error);
    return { error: error.message };
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
    return { error: "Failed to delete operational record." };
  }
}



// ============================================
// 9. GET PIPELINE STATS (Aggregated)
// ============================================
// ============================================

const getCachedDealsForStats = unstable_cache(
  async () => {
    return prisma.pipeline_deals.findMany({
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
  },
  ["pipeline-stats-deals"],
  { revalidate: 30 } // Cache for 30 seconds
);

export async function getPipelineStats() {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const deals = await getCachedDealsForStats();

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
        return diff > BigInt(0) ? 1 : diff < BigInt(0) ? -1 : 0;
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

    // Expose necessary fields for leaderboard stats, overdue calculation, and modal presentation
    const deals = await prisma.pipeline_deals.findMany({
      select: { 
        id: true,
        pic: true, 
        status: true, 
        quotation: true, 
        target_po_date: true,
        is_closed: true,
        client_name: true,
        project_name: true
      }
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

// ============================================
// TARGET SETTINGS (Total & PIC Targets)
// ============================================
export async function getTargetSettings() {
  noStore();
  try {
    const record = await prisma.pipeline_settings.findUnique({
      where: { key: "TARGETS" }
    });
    return record?.value ? (record.value as any) : { total: 0, byPic: {} };
  } catch (error) {
    console.error("getTargetSettings error:", error);
    return { total: 0, byPic: {} };
  }
}

export async function updateTargetSettings(data: any) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAdminOrMgmt = session.roles?.some((r: string) => 
      ["admin", "super", "management", "director"].some(kw => r.toLowerCase().includes(kw))
    );
    if (!isAdminOrMgmt) return { error: "Only admins can update target settings." };

    await prisma.pipeline_settings.upsert({
      where: { key: "TARGETS" },
      update: { value: data },
      create: { key: "TARGETS", value: data, description: "Sales target settings (Total & per PIC)" }
    });
    return { success: true };
  } catch (error) {
    console.error("updateTargetSettings error:", error);
    return { error: "Failed to update target settings." };
  }
}

export async function partialCloseDeal(id: number, closedAmount: number) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const existing = await prisma.pipeline_deals.findUnique({ where: { id } });
    if (!existing) return { error: "Deal not found" };

    const totalQuotation = Number(existing.quotation);
    if (closedAmount <= 0 || closedAmount >= totalQuotation) {
      return { error: "Invalid partial close amount" };
    }

    const remainingAmount = totalQuotation - closedAmount;
    const partialPercentage = parseFloat(((closedAmount / totalQuotation) * 100).toFixed(2));

    // 1. Create the new closed deal (the partial close chunk)
    const closedDeal = await prisma.pipeline_deals.create({
      data: {
        client_name: existing.client_name,
        area: existing.area,
        project_name: `${existing.project_name}`,
        bill_material: existing.bill_material,
        type: existing.type,
        region: existing.region,
        sales_planner: existing.sales_planner,
        pic: existing.pic,
        pic_id: existing.pic_id,
        category: existing.category,
        sector: existing.sector,
        quotation: closedAmount,
        status: existing.status,
        est_booking_month: existing.est_booking_month,
        booking_fc: existing.booking_fc,
        remarks: existing.remarks,
        source: existing.source,
        priority: existing.priority,
        latitude: existing.latitude,
        longitude: existing.longitude,
        target_po_date: existing.target_po_date,
        is_closed: true,
        is_partial_close: true,
        partial_percentage: partialPercentage,
        parent_deal_id: existing.id
      }
    });

    // 2. Update the existing deal to reflect the remaining amount
    const updatedDeal = await prisma.pipeline_deals.update({
      where: { id },
      data: {
        quotation: remainingAmount,
        is_partial_close: true
      }
    });

    // 3. Log history for original deal
    await prisma.pipeline_history.create({
      data: {
        deal_id: existing.id,
        changed_by_id: parseInt(session.userId, 10),
        field_changed: "quotation",
        old_value: totalQuotation.toString(),
        new_value: remainingAmount.toString(),
        remark: `Partially closed Rp ${closedAmount.toLocaleString("id-ID")} (${partialPercentage}%). Split into new closed deal ID ${closedDeal.id}.`
      }
    });

    return { success: true, newDealId: closedDeal.id, remainingDealId: updatedDeal.id };
  } catch (error) {
    console.error("partialCloseDeal error:", error);
    return { error: "Failed to perform partial close" };
  }
}

