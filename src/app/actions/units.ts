"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import * as xlsx from "xlsx";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

/**
 * 0. HELPER: Generate Tag Number (DKN[CCC][UUU])
 * CCC = Customer ID, UUU = Unit Sequence Number
 */
async function generateNextUnitTag(customerId: number) {
  const count = await (prisma.units as any).count({
    where: { projects: { customer_id: customerId } }
  });
  
  const ccc = String(customerId).padStart(3, '0');
  const uuu = String(count + 1).padStart(3, '0');
  
  return `DKN${ccc}${uuu}`;
}

// 1. GET UNITS BY PROJECT ref ID (Advance with Activities)
export async function getUnitsByProject(projectId: string) {
  noStore();
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  // Verification Logic:
  // 1. Internal users have full access
  // 2. Customers/Vendors must have record in user_project_access
  if (!session.isInternal) {
    const hasAccess = await prisma.user_project_access.findFirst({
      where: {
        user_id: parseInt(session.userId),
        project_id: BigInt(projectId)
      }
    });

    if (!hasAccess) return { error: "Unauthorized: You don't have access to this project." };
  }

  try {
    const units = await (prisma.units as any).findMany({
      where: { project_ref_id: BigInt(projectId) },
      orderBy: [
        { status: 'asc' }, // Trick: Critical, On_Progress, Problem start with C, O, P. Actually better use manual CASE in Raw Query if needed, but let's try frontend sort or a smarter approach.
        { id: 'desc' }
      ],
      include: {
        activities: {
          orderBy: { created_at: 'desc' },
          take: 3
        },
        service_activities: {
          where: { 
            type: { in: ['Audit', 'Preventive'] },
            deleted_at: null
          },
          orderBy: { service_date: 'desc' },
          take: 5
        }
      }
    });

    return serializePrisma({
      success: true,
      data: units.map((u: any) => {
        // PRIORITY: Find Latest Audit from modern service_activities, fallback to activities
        const latestAudit = u.service_activities?.[0] || u.activities.find((a: any) => a.type === "Audit");
        const latestCorrective = u.activities.find((a: any) => a.type === "Corrective");
        
        // Calculate unified health
        const healthData = internalCalculateHealth(u, latestAudit);

        const { activities, service_activities, ...unitData } = u; 
        
        return {
          ...unitData,
          last_corrective_date: latestCorrective?.service_date || null,
          last_problem: latestCorrective?.engineer_note || "-",
          health_score: healthData.score,
          health_label: healthData.label,
          health_color: healthData.color,
          ahi: healthData.ahi
        };
      })
    });
  } catch (error) {
    console.error("Fetch units error:", error);
    return { error: "Failed to fetch units." };
  }
}

// 2. CREATE UNIT (Auto Generate Tag Number)
export async function createUnit(projectId: string, data: any) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) }
    });
    if (!project) return { error: "Project not found" };

    // Auto-generate tag number if missing (Format: DKN001001)
    let finalTagNumber = data.tag_number;
    if (!finalTagNumber || finalTagNumber.trim() === "") {
      finalTagNumber = await generateNextUnitTag(project.customer_id);
    }

    // Auto-generate QR Token
    const crypto = require('crypto');
    const qrToken = crypto.randomBytes(16).toString('hex');

    // Sanitize input: Trim and convert empty strings to null for unique/optional fields
    const cleanData = {
      tag_number: finalTagNumber?.trim() || null,
      model: data.model?.trim() || "Unknown",
      brand: data.brand?.trim() || "Daikin",
      location: data.location?.trim() || null,
      area: data.area?.trim() || null,
      building_floor: data.building_floor?.trim() || null,
      room_tenant: data.room_tenant?.trim() || null,
      capacity: data.capacity?.trim() || "0",
      yoi: (data.yoi && !isNaN(parseInt(data.yoi))) ? parseInt(data.yoi) : null,
      serial_number: (data.serial_number && data.serial_number.trim() !== "") ? data.serial_number.trim() : null,
      status: data.status || "Normal",
      unit_type: data.unit_type || "Uncategorized"
    };

    await (prisma.units as any).create({
      data: {
        project_ref_id: BigInt(projectId),
        qr_code_token: qrToken,
        ...cleanData
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create unit error:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes('serial_number')) {
        return { error: "Serial number already exists in database." };
      }
      if (target.includes('qr_code_token')) {
        return { error: "QR Token collision. Please try again." };
      }
    }
    return { error: "Failed to create unit. Please check all fields." };
  }
}

// 3. EDIT UNIT
export async function updateUnit(unitId: number, data: any) {
  const session = await getSession();
  const isVendor = session?.roles?.some(r => r.toLowerCase().includes("vendor"));
  
  if (!session || (!session.isInternal && !isVendor)) return { error: "Unauthorized access" };

  try {
    // Sanitize input: Trim and convert empty strings to null for unique fields
    const serial = (data.serial_number && data.serial_number.trim() !== "") ? data.serial_number.trim() : null;
    const tag = (data.tag_number && data.tag_number.trim() !== "") ? data.tag_number.trim() : null;

    await (prisma.units as any).update({
      where: { id: unitId },
      data: {
        tag_number: tag,
        model: data.model?.trim() || "Unknown",
        brand: data.brand?.trim() || "Daikin",
        location: data.location?.trim() || null,
        area: data.area?.trim() || null,
        building_floor: data.building_floor?.trim() || null,
        room_tenant: data.room_tenant?.trim() || null,
        capacity: data.capacity?.trim() || "0",
        yoi: (data.yoi && !isNaN(parseInt(data.yoi))) ? parseInt(data.yoi) : null,
        serial_number: serial,
        status: data.status,
        unit_type: data.unit_type
      }
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update unit error:", error);
    
    // Handle Prisma specific unique constraint error
    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes('serial_number')) {
        return { error: "Serial number already exists on another unit." };
      }
      if (target.includes('tag_number')) {
        return { error: "Tag number already exists on another unit." };
      }
    }
    
    return { error: "Failed to update unit. Please check your data and try again." };
  }
}

// 4. Helper get project details
export async function getProjectData(projectId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };
  
  if (!session.isInternal) {
    const hasAccess = await prisma.user_project_access.findFirst({
      where: {
        user_id: parseInt(session.userId),
        project_id: BigInt(projectId)
      }
    });
    if (!hasAccess) return { error: "Unauthorized access" };
  }
  
  try {
    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      include: { customers: true }
    });
    if (!project) return { error: "Project not found" };
    
    return serializePrisma({ 
      success: true, 
      data: { 
        name: project.name, 
        customer_name: project.customers.name, 
        customer_id: project.customers.id 
      } 
    });
  } catch (error) {
    return { error: "Failed to fetch project data" };
  }
}

// 5. BULK EXPORT TO EXCEL
export async function exportUnitsExcel(projectId: string) {
  const res = await getUnitsByProject(projectId) as any;
  if (res.error) throw new Error(res.error);

  const data = res.data.map((u: any) => ({
    "Tag Number": u.tag_number,
    "Brand": u.brand,
    "Model": u.model,
    "Capacity": u.capacity,
    "Unit Type": u.unit_type,
    "Year of Install": u.yoi,
    "Serial Number": u.serial_number,
    "Area": u.area,
    "Floor": u.building_floor,
    "Room / Tenant": u.room_tenant,
    "Status": u.status,
    "Last Problem": u.last_problem,
    "Last Corrective Date": u.last_corrective_date ? new Date(u.last_corrective_date).toLocaleDateString() : "-"
  }));

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Units_Data");
  
  // Return base64 for client side downloading
  const base64Excel = xlsx.write(workbook, { bookType: "xlsx", type: "base64" });
  return { success: true, base64: base64Excel };
}

// 6. BULK IMPORT FROM EXCEL
export async function importUnitsExcel(projectId: string, base64Data: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };
  
  if (!projectId) return { error: "Missing Project ID" };

  try {
    // Sanitize base64 data: Strip prefixes and whitespace
    let cleanBase64 = base64Data.trim();
    if (cleanBase64.includes("base64,")) {
      cleanBase64 = cleanBase64.split("base64,")[1];
    }

    // Use Buffer for more reliable reading in Node environment
    const buffer = Buffer.from(cleanBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    if (!workbook.SheetNames.length) {
      return { error: "Excel file has no sheets." };
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (!rawData || rawData.length === 0) {
      return { error: "No data found in the first sheet. Please check your Excel format." };
    }

    const crypto = require('crypto');
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Helper: Normalize strings for matching (lowercase, alphanumeric only)
    const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

    // Helper: get value with robust matching
    const getVal = (row: any, ...keys: string[]): string => {
      const normalizedKeys = keys.map(norm);
      const rowKeys = Object.keys(row);
      
      for (const k of rowKeys) {
        const normalizedRowKey = norm(k);
        if (normalizedKeys.includes(normalizedRowKey)) {
          const val = String(row[k] || "").trim();
          // Filter out placeholders
          if (val && val !== "-" && val !== "—") return val;
        }
      }
      return "";
    };

    const projectBigInt = BigInt(projectId);

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any;
      const rowNum = i + 2; 

      try {
        const tag = getVal(row, "Tag Number", "TAG NUMBER", "Unit Tag", "Tag");
        const brand = getVal(row, "Brand", "Merk");
        const model = getVal(row, "Model", "Type");
        const capacity = getVal(row, "Capacity", "Kapasitas", "PK", "BTU");
        const unitType = getVal(row, "Unit Type", "Kategori");
        const yoiStr = getVal(row, "Year of Install", "Instalasi", "Tahun", "YOI");
        const serial = getVal(row, "Serial Number", "Serial", "S/N");
        const area = getVal(row, "Area", "Lokasi", "Building");
        const floor = getVal(row, "Floor", "Lantai", "Level");
        const room = getVal(row, "Room / Tenant", "Ruangan", "Tenant", "Room");
        const statusRaw = getVal(row, "Status");

        // Skip truly empty rows (if header exists but row is blank)
        if (!tag && !brand && !model && !serial && !room) {
          skipped++;
          continue;
        }

        const qrToken = crypto.randomBytes(16).toString('hex');

        // Automatic Tagging Logic for Import
        let finalTag = tag;
        if (!finalTag) {
          // Fetch project to get customer_id
          const p = await prisma.projects.findUnique({
            where: { id: projectBigInt },
            select: { customer_id: true }
          });
          if (p) {
            finalTag = await generateNextUnitTag(p.customer_id);
          } else {
            const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
            finalTag = `DKN-${projectId}-${new Date().getFullYear()}-${randomPart}`;
          }
        }

        // Parse YOI
        let yoi: number | null = null;
        if (yoiStr) {
          const parsed = parseInt(yoiStr);
          if (!isNaN(parsed) && parsed > 1950 && parsed < 2100) yoi = parsed;
        }

        // Clean status
        const validStatuses = ['Normal', 'Warning', 'Critical', 'Problem', 'Pending', 'On_Progress'];
        const cleanStatus = validStatuses.find(s => s.toLowerCase() === norm(statusRaw)) || 'Normal';

        await (prisma.units as any).create({
          data: {
            project_ref_id: projectBigInt,
            qr_code_token: qrToken,
            tag_number: finalTag,
            brand: brand || "Daikin",
            model: model || null,
            capacity: capacity || null,
            yoi,
            serial_number: serial || null, // null is important for @unique
            area: area || null,
            building_floor: floor || null,
            room_tenant: room || null,
            unit_type: unitType || "Uncategorized",
            status: cleanStatus
          }
        });
        imported++;
      } catch (rowError: any) {
        const rowId = getVal(row, "Tag Number") || `Row ${rowNum}`;
        const errorMsg = rowError.code === 'P2002' 
          ? "Duplicate Serial or Tag Number" 
          : rowError.message?.substring(0, 50) || "Invalid data format";
        errors.push(`${rowId}: ${errorMsg}`);
        skipped++;
      }
    }

    return { 
      success: true, 
      imported, 
      skipped, 
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined 
    };
  } catch (error: any) {
    console.error("IMPORT CRITICAL ERROR:", error);
    return { error: `Failed to process Excel: ${error.message || 'Check file format'}` };
  }
}

// 7. GET UNIT HISTORY (Unified)
export async function getUnitHistory(unitId: number | string) {
  noStore();
  try {
    const id = typeof unitId === 'string' ? Number(unitId) : unitId;

    const serviceActs = await (prisma.service_activities as any).findMany({
      where: { unit_id: id, deleted_at: null },
      include: {
        audit_velocity_points: true,
        activity_photos: true
      },
      orderBy: { service_date: 'desc' }
    });

    const quickActs = await (prisma.activities as any).findMany({
      where: { unit_id: id, deleted_at: null },
      orderBy: { service_date: 'desc' }
    });

    // Merge and sort
    const allHistory = [
      ...serviceActs.map((a: any) => ({
        ...a,
        id: a.id.toString(),
        type: a.type,
        date: a.service_date,
        engineer: a.inspector_name,
        note: a.engineer_note,
        pdf: a.pdf_report_url,
        baPdf: a.berita_acara_pdf_url,
        isApproved: a.is_approved_by_customer,
        approverName: a.customer_approver_name,
        approvedAt: a.customer_approved_at,
        technical_json: a.technical_json,
        technical_advice: a.technical_advice,
        isFormal: true
      })),
      ...quickActs.map((a: any) => ({
        ...a,
        id: a.id.toString(),
        type: a.type,
        date: a.service_date,
        engineer: a.inspector_name,
        note: a.engineer_note,
        pdf: null,
        isFormal: false
      }))
    ].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

    return serializePrisma({ success: true, data: allHistory });
  } catch (error) {
    console.error("Fetch history error:", error);
    return { error: "Failed to fetch unit history" };
  }
}

import { sendPushNotification } from "@/lib/push";

/**
 * 8. UPDATE UNIT STATUS
 */
export async function updateUnitStatus(unitId: string | number, status: string) {
  try {
    const id = typeof unitId === 'string' ? BigInt(unitId) : BigInt(unitId);
    
    const unit = await (prisma.units as any).update({
      where: { id },
      data: { status },
      include: { projects: true }
    });

    // TRIGGER PUSH NOTIFICATION (Real-time Phase 2)
    if (['Problem', 'Critical', 'Warning'].includes(status)) {
       // Get all internal users (Admins, Engineers, Management)
       const internalUsers = await prisma.users.findMany({
          where: {
             user_roles: {
                some: {
                   roles: {
                      role_name: { contains: 'Admin' }
                   }
                }
             }
          },
          select: { id: true }
       });
       
       const userIds = internalUsers.map(u => u.id);
       if (userIds.length > 0) {
          await sendPushNotification(
            userIds,
            `⚠️ Unit Alert: ${unit.tag_number}`,
            `Status changed to ${status.toUpperCase()} at ${unit.projects?.name || 'Site'}`,
            `/dashboard/units/${unitId}`
          );
       }
    }

    revalidatePath("/dashboard");
    return serializePrisma({ success: true, data: unit });
  } catch (error) {
    console.error("Update status error:", error);
    return { error: "Failed to update status" };
  }
}

// 9. GET UNIT BY TAG (For Dashboard Redirects)
export async function getUnitByTag(tagNumber: string) {
  try {
    const unit = await (prisma.units as any).findFirst({
      where: { tag_number: tagNumber },
      include: { projects: { select: { name: true, id: true, customer_id: true } } }
    });
    
    if (!unit) return { success: false, error: "Unit not found" };

    return serializePrisma({
      success: true,
      data: unit
    });
  } catch (error) {
    return { success: false, error: "Failed to fetch unit by tag" };
  }
}

// 10. GET GLOBAL PROBLEM UNITS (For Real-time Notification Banner)
export async function getGlobalProblemUnits() {
  noStore();
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const problemUnits = await (prisma.units as any).findMany({
      where: {
        status: { in: ['Problem', 'Critical', 'Warning'] }
      },
      include: {
        projects: {
          select: { id: true, customer_id: true, name: true }
        }
      },
      take: 10 // Only notify for top 10 recent problems
    });

    return serializePrisma({
      success: true,
      data: problemUnits
    });
  } catch (error) {
    console.error("Fetch global problem units error:", error);
    return { error: "Failed to fetch problem units" };
  }
}

/**
 * 11. BULK MIGRATE ALL TAGS (DKN001001 Format)
 */
export async function migrateAllUnitTags() {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized" };

  try {
    const customers = await (prisma.customers as any).findMany({
      include: {
        projects: {
          include: {
            units: {
              orderBy: { id: 'asc' }
            }
          }
        }
      }
    });

    let updatedCount = 0;

    for (const customer of customers) {
      const ccc = String(customer.id).padStart(3, '0');
      let sequence = 1;

      // Flatten units from all projects for this customer
      const allUnits = customer.projects.flatMap((p: any) => p.units)
        .sort((a: any, b: any) => a.id - b.id);

      for (const unit of allUnits) {
        const uuu = String(sequence).padStart(3, '0');
        const newTag = `DKN${ccc}${uuu}`;
        
        await (prisma.units as any).update({
          where: { id: unit.id },
          data: { tag_number: newTag }
        });
        
        sequence++;
        updatedCount++;
      }
    }

    revalidatePath("/dashboard");
    return serializePrisma({ success: true, updatedCount });
  } catch (error) {
    console.error("Migration error:", error);
    return { error: "Failed to perform migration" };
  }
}

import { calculateUnitHealth } from "@/lib/physics/enthalpy";
import { calculateBalancedAHI } from "@/lib/physics/ahi-calculation";

/**
 * PRIVATE HELPER: Shared Health Logic for Absolute Consistency
 */
function internalCalculateHealth(unit: any, lastAudit: any) {
    if (!lastAudit || (!lastAudit.entering_db && !lastAudit.technical_json)) {
       return { score: 0, label: "No Audit Data", color: "slate", ahi: null };
    }

    let measuredFlow = lastAudit.measured_airflow || lastAudit.design_airflow || 0;
    let designCapStr = (unit.capacity || (lastAudit.design_cooling_capacity > 0 ? `${lastAudit.design_cooling_capacity} BTU` : "10 kW"));

    let tj: any = {};
    try {
      if (lastAudit.technical_json) {
        tj = typeof lastAudit.technical_json === 'string' ? JSON.parse(lastAudit.technical_json) : lastAudit.technical_json;
        if (measuredFlow === 0 && tj.totalCfmSupply) {
           measuredFlow = parseFloat(tj.totalCfmSupply) * 1.699;
        }
      }
    } catch (e) {}

    const ahi = calculateBalancedAHI({
      fincoil: tj.fincoil_cond || 'GOOD',
      drainPan: tj.drain_pan_cond || 'GOOD',
      blowerFan: tj.blower_fan_cond || 'GOOD',
      accessories: [...(tj.inlet || []), ...(tj.outlet || [])],
      enteringDB: lastAudit.entering_db || 25,
      leavingDB: lastAudit.leaving_db || 15,
      enteringRH: lastAudit.entering_rh || 50,
      leavingRH: lastAudit.leaving_rh || 50,
      measuredAirflow: measuredFlow > 0 ? measuredFlow : (parseFloat(unit.capacity) * 0.4719 || 1000),
      designCapacityStr: designCapStr,
      yearOfInstall: unit.yoi
    });

    let label = "Normal Condition";
    let color = "emerald";
    if (ahi.totalScore < 50) { label = "Need Replace"; color = "rose"; }
    else if (ahi.totalScore < 80) { label = "Need Repair"; color = "amber"; }

    return { score: ahi.totalScore, label, color, ahi, metrics: ahi.physics };
}

/**
 * 12. CALCULATE UNIT HEALTH SCORE (Modal View)
 */
export async function getUnitHealthScore(unitId: number) {
  try {
    const unit = await (prisma.units as any).findUnique({
      where: { id: unitId },
      include: {
        service_activities: {
          where: { 
            type: { in: ['Audit', 'Preventive'] },
            deleted_at: null
          },
          orderBy: { service_date: 'desc' },
          take: 1
        }
      }
    });

    if (!unit) return { error: "Unit not found" };

    const lastAudit = unit.service_activities?.[0];
    const auditDate = lastAudit?.service_date || unit.created_at;

    const health = internalCalculateHealth(unit, lastAudit);

    return serializePrisma({
      success: true,
      data: {
        score: health.score,
        label: health.label,
        color: health.color,
        ahi: health.ahi,
        metrics: health.metrics
      }
    });
  } catch (error) {
    console.error("Health score error:", error);
    return { error: "Health calculation failed." };
  }
}

/**
 * 13. DIGITAL APPROVAL HUB (Sequential Multi-Tier)
 * TIER 1: Engineer (Internal Review)
 * TIER 2: Customer (Final Approval)
 */
export async function approveServiceActivity(activityId: number, approverName: string, tier: 'engineer' | 'customer' = 'customer') {
  try {
    const data: any = {};
    
    if (tier === 'engineer') {
      data.engineer_signer_name = approverName;
      data.status = "Reviewed"; // Progress step
    } else {
      data.is_approved_by_customer = true;
      data.customer_approver_name = approverName;
      data.customer_approved_at = new Date();
      data.status = "Final Approved"; // Final step
    }

    const updated = await (prisma.service_activities as any).update({
      where: { id: activityId },
      data: data
    });

    revalidatePath("/dashboard");
    revalidatePath("/passport");
    return serializePrisma({ success: true, activity: updated });
  } catch (error) {
    console.error("Approval error:", error);
    return { error: `Failed to approve as ${tier}` };
  }
}

/**
 * 14. UPDATE BERITA ACARA URL (For Backfilling)
 */
export async function updateActivityBAUrl(activityId: number, baUrl: string) {
  try {
    const updated = await (prisma.service_activities as any).update({
      where: { id: activityId },
      data: {
        berita_acara_pdf_url: baUrl
      }
    });

    revalidatePath("/dashboard");
    return serializePrisma({ success: true, activity: updated });
  } catch (error) {
    console.error("Backfill update error:", error);
    return { error: "Failed to update official record URL" };
  }
}

/**
 * 15. UPDATE MULTIPLE REPORT URLS (After Digital Approval Re-generation)
 */
export async function updateActivityReportUrls(activityId: number, reportUrl: string, baUrl: string) {
  try {
    const updated = await (prisma.service_activities as any).update({
      where: { id: activityId },
      data: {
        pdf_report_url: reportUrl,
        berita_acara_pdf_url: baUrl
      }
    });

    revalidatePath("/dashboard");
    return serializePrisma({ success: true, activity: updated });
  } catch (error) {
    console.error("Multi-report update error:", error);
    return { error: "Failed to synchronise signed reports" };
  }
}

/**
 * 16. SOFT DELETE ACTIVITY (7-Day Retention)
 */
export async function softDeleteActivity(id: number, type: 'formal' | 'quick') {
  const session = await getSession();
  const isAdmin = session?.roles?.some(r => /admin|super/i.test(r)) || false;
  
  if (!session || !isAdmin) {
     return { error: "Unauthorized: Admin privileges required." };
  }

  try {
    const table = type === 'formal' ? 'service_activities' : 'activities';
    
    await (prisma as any)[table].update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    revalidatePath("/dashboard");
    revalidatePath("/passport");
    return serializePrisma({ success: true });
  } catch (error) {
    console.error("Soft delete error:", error);
    return { error: "Failed to remove report." };
  }
}

/**
 * 17. PERMANENT PURGE (Soft-Delete Retention Cleanup)
 * This function permanently removes records that were soft-deleted more than 7 days ago.
 * IMPORTANT: This is for database maintenance/hygiene ONLY. 
 * Do NOT use this function to automatically approve or change the status of active reports.
 * Maintenance of strict manual sequential signatures is required for all report lifecycles.
 */
export async function permanentPurgeOldRecords() {
  const session = await getSession();
  const isAdmin = session?.roles?.some(r => /admin|super/i.test(r)) || false;
  if (!session || !isAdmin) return { error: "Unauthorized" };

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tables = ['service_activities', 'activities', 'corrective', 'audits'];
    let totalPurged = 0;

    for (const table of tables) {
      const { count } = await (prisma as any)[table].deleteMany({
        where: {
          deleted_at: {
            lt: sevenDaysAgo,
            not: null
          }
        }
      });
      totalPurged += count;
    }

    if (totalPurged > 0) {
      console.log(`[PURGE] Permanently removed ${totalPurged} old reports.`);
    }

    return serializePrisma({ success: true, purged: totalPurged });
  } catch (error) {
    console.error("Purge error:", error);
    return { error: "Failed to purge old records." };
  }
}

/**
 * 18. GET ACTIVITY DETAIL FOR REPORT HUB
 * Aggregates all data needed for high-fidelity PDF rendering
 */
export async function getActivityDetailForReport(id: string | number, isFormal: boolean = true) {
  noStore();
  try {
    const activityId = typeof id === 'string' ? Number(id) : id;

    if (isFormal) {
      const activity = await (prisma.service_activities as any).findUnique({
        where: { id: activityId },
        include: {
          units: {
            include: {
              projects: {
                include: { customers: true }
              }
            }
          },
          audit_velocity_points: true,
          activity_photos: true
        }
      });

      if (!activity) return { error: "Formal report not found" };

      return serializePrisma({
        success: true,
        data: {
          activity,
          unit: activity.units,
          project: activity.units.projects,
          customer: activity.units.projects.customers,
          photos: activity.activity_photos || [],
          velocityPoints: activity.audit_velocity_points || []
        }
      });
    } else {
      const activity = await (prisma.activities as any).findUnique({
        where: { id: activityId },
        include: {
          units: {
            include: {
              projects: {
                include: { customers: true }
              }
            }
          }
        }
      });

      if (!activity) return { error: "Quick activity not found" };

      return serializePrisma({
        success: true,
        data: {
          activity,
          unit: activity.units,
          project: activity.units.projects,
          customer: activity.units.projects.customers,
          photos: [], // Quick reports don't have separate photo table in this schema yet
          velocityPoints: []
        }
      });
    }
  } catch (error) {
    console.error("Fetch report detail error:", error);
    return { error: "Failed to fetch report data" };
  }
}
