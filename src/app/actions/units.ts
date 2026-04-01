"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import * as xlsx from "xlsx";
import { unstable_noStore as noStore } from "next/cache";

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
          take: 5 
        }
      }
    });

    return serializePrisma({
      success: true,
      data: units.map((u: any) => {
        // Find the last corrective & problem logic
        const latestCorrective = u.activities.find((a: any) => a.type === "Corrective");
        
        const { activities, ...unitData } = u; // Destructure activities out
        
        return {
          ...unitData,
          last_corrective_date: latestCorrective?.service_date || null,
          last_problem: latestCorrective?.engineer_note || "-",
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

    // Auto-generate tag number if missing
    let finalTagNumber = data.tag_number;
    if (!finalTagNumber || finalTagNumber.trim() === "") {
      const crypto = require('crypto');
      const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
      finalTagNumber = `DKN-${projectId}-${new Date().getFullYear()}-${randomPart}`;
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
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    await (prisma.units as any).update({
      where: { id: unitId },
      data: {
        tag_number: data.tag_number,
        model: data.model,
        brand: data.brand,
        location: data.location,
        area: data.area,
        building_floor: data.building_floor,
        room_tenant: data.room_tenant,
        capacity: data.capacity,
        yoi: data.yoi ? parseInt(data.yoi) : null,
        serial_number: data.serial_number,
        status: data.status,
        unit_type: data.unit_type
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Update unit error:", error);
    return { error: "Failed to update unit." };
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
  
  try {
    const workbook = xlsx.read(base64Data, { type: "base64" });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const crypto = require('crypto');
    let imported = 0;

    for (const row of rawData as any[]) {
      const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
      const qrToken = crypto.randomBytes(16).toString('hex');
      
      await (prisma.units as any).create({
        data: {
          project_ref_id: BigInt(projectId),
          qr_code_token: qrToken,
          tag_number: row["Tag Number"] || `DKN-${projectId}-${new Date().getFullYear()}-${randomPart}`,
          brand: row["Brand"] || "Daikin",
          model: row["Model"] || "-",
          capacity: row["Capacity"] || "-",
          yoi: row["Year of Install"] ? parseInt(row["Year of Install"]) : null,
          serial_number: row["Serial Number"] || "-",
          area: row["Area"] || "-",
          building_floor: row["Floor"] || "-",
          room_tenant: row["Room / Tenant"] || "-",
          unit_type: row["Unit Type"] || "Uncategorized",
          status: row["Status"] || "Normal"
        }
      });
      imported++;
    }

    return { success: true, imported };
  } catch (error: any) {
    console.error("Import error:", error);
    return { error: "Failed to parse Excel file" };
  }
}

// 7. GET UNIT HISTORY (Unified)
export async function getUnitHistory(unitId: string | number) {
  try {
    const id = typeof unitId === 'string' ? parseInt(unitId) : unitId;
    
    // Fetch from service_activities
    const serviceActs = await prisma.service_activities.findMany({
      where: { unit_id: id },
      orderBy: { service_date: 'desc' }
    });

    // Fetch from activities (Quick Report)
    const quickActs = await prisma.activities.findMany({
      where: { unit_id: id },
      orderBy: { service_date: 'desc' }
    });

    // Merge and sort
    const allHistory = [
      ...serviceActs.map(a => ({
        id: a.id.toString(),
        type: a.type,
        date: a.service_date,
        engineer: a.inspector_name,
        note: a.engineer_note,
        pdf: a.pdf_report_url,
        isFormal: true
      })),
      ...quickActs.map(a => ({
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

// 8. UPDATE UNIT STATUS
export async function updateUnitStatus(unitId: string | number, status: string) {
  try {
    const id = typeof unitId === 'string' ? BigInt(unitId) : BigInt(unitId);
    await (prisma.units as any).update({
      where: { id },
      data: { status }
    });
    return { success: true };
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

