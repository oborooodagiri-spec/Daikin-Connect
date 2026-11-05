"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

// 1. READ ALL PROJECTS BY CUSTOMER
export async function getProjectsByCustomer(customerId: string) {
  try {
    const where: any = {};
    if (customerId) {
      where.customer_id = parseInt(customerId);
    }

    const projects = await prisma.projects.findMany({
      where,
      include: {
        customers: { select: { name: true } },
        _count: {
          select: { units: true, schedules: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return serializePrisma({
      success: true,
      data: projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        customerName: p.customers?.name || "N/A",
        code: p.code || "N/A",
        status: p.status,
        enabled_forms: p.enabled_forms || "Audit,Preventive,Corrective",
        latitude: p.latitude != null ? Number(p.latitude) : null,
        longitude: p.longitude != null ? Number(p.longitude) : null,
        radius_meters: p.radius_meters != null ? Number(p.radius_meters) : 100,
        shift_start_time: p.shift_start_time || "08:00",
        shift_end_time: p.shift_end_time || "17:00",
        units_count: p._count.units,
        schedules_count: p._count.schedules
      }))
    });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return { error: "Failed to fetch projects." };
  }
}

// 1.5 READ ALL PROJECTS (Simplified for Dropdowns)
export async function getAllProjects() {
  try {
    const projects = await prisma.projects.findMany({
      where: { status: "active" },
      select: { 
        id: true, 
        name: true,
        customers: {
          select: {
            address: true
          }
        },
        units: {
          select: {
            id: true,
            unit_type: true,
            tag_number: true,
            model: true,
            capacity: true,
            building_floor: true,
            area: true,
            location: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    return serializePrisma({ success: true, data: projects });
  } catch (error) {
    return { error: "Failed to fetch project list" };
  }
}

// 2. CREATE PROJECT
export async function createProject(customerId: string, data: { 
  name: string; 
  code?: string; 
  enabled_forms?: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_meters?: number | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
}) {
  try {
    const cleanName = data.name ? String(data.name).trim().substring(0, 150) : "";
    if (!cleanName) return { error: "Nama proyek wajib diisi." };

    let lat: number | null = null;
    if (data.latitude !== undefined && data.latitude !== null && (data.latitude as any) !== "") {
      const parsed = parseFloat(String(data.latitude).replace(",", "."));
      lat = isNaN(parsed) ? null : Number(parsed.toFixed(8));
    }

    let lng: number | null = null;
    if (data.longitude !== undefined && data.longitude !== null && (data.longitude as any) !== "") {
      const parsed = parseFloat(String(data.longitude).replace(",", "."));
      lng = isNaN(parsed) ? null : Number(parsed.toFixed(8));
    }

    let radius = 100;
    if (data.radius_meters !== undefined && data.radius_meters !== null && (data.radius_meters as any) !== "") {
      const parsed = parseInt(String(data.radius_meters), 10);
      radius = isNaN(parsed) ? 100 : parsed;
    }

    const cleanCode = data.code ? String(data.code).trim().substring(0, 50) : null;
    const cleanShiftStart = data.shift_start_time ? String(data.shift_start_time).trim().substring(0, 5) : "08:00";
    const cleanShiftEnd = data.shift_end_time ? String(data.shift_end_time).trim().substring(0, 5) : "17:00";

    await prisma.projects.create({
      data: {
        customer_id: parseInt(customerId),
        name: cleanName,
        code: cleanCode,
        status: "active",
        enabled_forms: data.enabled_forms || "Audit,Preventive,Corrective",
        latitude: lat,
        longitude: lng,
        radius_meters: radius,
        shift_start_time: cleanShiftStart,
        shift_end_time: cleanShiftEnd
      }
    });

    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    revalidatePath(`/w/${customerId}/dashboard/customers/${customerId}/projects`);
    return { success: true };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { error: error?.message || "Failed to create project." };
  }
}

// 3. UPDATE PROJECT
export async function updateProject(customerId: string, projectId: string, data: { 
  name: string; 
  code?: string; 
  enabled_forms?: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_meters?: number | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
}) {
  try {
    if (!projectId || isNaN(Number(projectId))) {
      return { error: "ID proyek tidak valid." };
    }

    const cleanName = data.name ? String(data.name).trim().substring(0, 150) : "";
    if (!cleanName) return { error: "Nama proyek wajib diisi." };

    let lat: number | null = null;
    if (data.latitude !== undefined && data.latitude !== null && (data.latitude as any) !== "") {
      const parsed = parseFloat(String(data.latitude).replace(",", "."));
      lat = isNaN(parsed) ? null : Number(parsed.toFixed(8));
    }

    let lng: number | null = null;
    if (data.longitude !== undefined && data.longitude !== null && (data.longitude as any) !== "") {
      const parsed = parseFloat(String(data.longitude).replace(",", "."));
      lng = isNaN(parsed) ? null : Number(parsed.toFixed(8));
    }

    let radius = 100;
    if (data.radius_meters !== undefined && data.radius_meters !== null && (data.radius_meters as any) !== "") {
      const parsed = parseInt(String(data.radius_meters), 10);
      radius = isNaN(parsed) ? 100 : parsed;
    }

    const cleanCode = data.code ? String(data.code).trim().substring(0, 50) : null;
    const cleanShiftStart = data.shift_start_time ? String(data.shift_start_time).trim().substring(0, 5) : "08:00";
    const cleanShiftEnd = data.shift_end_time ? String(data.shift_end_time).trim().substring(0, 5) : "17:00";

    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: {
        name: cleanName,
        code: cleanCode,
        enabled_forms: data.enabled_forms,
        latitude: lat,
        longitude: lng,
        radius_meters: radius,
        shift_start_time: cleanShiftStart,
        shift_end_time: cleanShiftEnd
      }
    });

    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    revalidatePath(`/w/${customerId}/dashboard/customers/${customerId}/projects`);
    revalidatePath("/admin/attendance");
    revalidatePath("/home/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Update project error:", error);
    return { error: error?.message || "Failed to update project." };
  }
}

// 4. SUSPEND/ACTIVATE PROJECT
export async function toggleProjectStatus(customerId: string, projectId: string, currentStatus: string) {
  // Session check removed for client-side usage

  try {
    const newStatus = currentStatus === "active" ? "archived" : "active";
    await prisma.projects.update({
      where: { id: BigInt(projectId) },
      data: { status: newStatus as any }
    });
    revalidatePath(`/dashboard/customers/${customerId}/projects`);
    return { success: true };
  } catch (error) {
    console.error("Toggle project status error:", error);
    return { error: "Failed to update project status." };
  }
}

// Helper: Get Customer Name
export async function getCustomerData(customerId: string) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };
  
  try {
    const cust = await prisma.customers.findUnique({
      where: { id: parseInt(customerId) }
    });
    return serializePrisma({ success: true, data: cust });
  } catch (error) {
    return { error: "Failed to fetch customer data" };
  }
}
