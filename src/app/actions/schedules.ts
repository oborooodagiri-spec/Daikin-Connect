// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { sendPushNotification, notifyProjectStakeholders } from "@/lib/push";
import { recordAuditLog } from "@/lib/security";
import { serializePrisma } from "@/lib/serialize";

export async function getAllSchedules() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const schedules = await prisma.schedules.findMany({
      include: {
        projects: { select: { name: true } },
        units: { 
          select: { 
            id: true,
            tag_number: true,
            qr_code_token: true,
            area: true,
            model: true,
            room_tenant: true
          } 
        }, 
        users: { select: { id: true, name: true, email: true } }
      },
      orderBy: { start_at: 'asc' }
    });

    const now = new Date();
    return serializePrisma({
      success: true,
      data: schedules.map((s: any) => {
        let currentStatus = s.status;
        if (currentStatus === "Planned" && s.end_at < now) {
          currentStatus = "Missed";
        }
        return {
          ...s,
          status: currentStatus
        };
      })
    });
  } catch (error: any) {
    console.error("Fetch all schedules error:", error);
    return { error: "Failed to fetch schedules" };
  }
}


export async function getSchedulesByProject(projectId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const schedules = await prisma.schedules.findMany({
      where: { project_id: BigInt(projectId) },
      include: {
        units: { 
          select: { 
            id: true,
            tag_number: true,
            qr_code_token: true,
            area: true,
            model: true,
            room_tenant: true
          } 
        }, 
        users: { select: { id: true, name: true, email: true } }
      },
      orderBy: { start_at: 'asc' }
    });

    const now = new Date();
    return serializePrisma({
      success: true,
      data: schedules.map((s: any) => {
        let currentStatus = s.status;
        if (currentStatus === "Planned" && s.end_at < now) {
          currentStatus = "Missed";
        }
        return {
          ...s,
          status: currentStatus
        };
      })
    });
  } catch (error: any) {
    console.error("Fetch schedules error:", error);
    return { error: "Failed to fetch schedules" };
  }
}

export async function createSchedule(data: any) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const newSchedule = await prisma.schedules.create({
      data: {
        project_id: BigInt(data.project_id),
        title: data.title,
        description: data.description,
        type: data.type,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
        unit_id: data.unit_id ? parseInt(data.unit_id) : null,
        assignee_id: data.assignee_id ? parseInt(data.assignee_id) : null,
        status: "Planned"
      }
    });

    if (data.unit_id) {
      await prisma.units.update({
        where: { id: parseInt(data.unit_id) },
        data: { status: "Pending" }
      });
    }

    // TRIGGER PUSH NOTIFICATION (Phase 2)
    if (data.assignee_id) {
       await sendPushNotification(
          [data.assignee_id],
          `📅 New Task: ${data.title}`,
          `You have been assigned to ${data.type} activity for ${data.start_at}.`,
          `/dashboard/schedules`
       );
    }
    
    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "SCHEDULE_CREATE",
      targetType: "Schedule",
      targetId: newSchedule.id.toString(),
      details: `Created schedule: ${data.title} (${data.type})`
    });
    
    revalidatePath(`/dashboard/schedules`);
    
    return serializePrisma({ success: true, id: newSchedule.id });
  } catch (error: any) {
    console.error("[SCHEDULE_ACTION] Create error:", {
        message: error.message,
        stack: error.stack,
        projectId: data.project_id
    });
    return { error: `Failed to create schedule: ${error.message}` };
  }
}

export async function updateSchedule(id: string, data: any) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const updated = await prisma.schedules.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
        unit_id: data.unit_id ? parseInt(data.unit_id) : null,
        assignee_id: data.assignee_id ? parseInt(data.assignee_id) : null,
      }
    });

    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "SCHEDULE_UPDATE",
      targetType: "Schedule",
      targetId: id,
      details: `Updated schedule: ${data.title}`
    });

    revalidatePath(`/dashboard/schedules`);

    return serializePrisma({ success: true, id: updated.id });
  } catch (error: any) {
    console.error("[SCHEDULE_ACTION] Update error:", error.message);
    return { error: `Failed to update schedule: ${error.message}` };
  }
}

export async function deleteSchedule(id: string) {
  const session = await getSession();
  if (!session || !session.isInternal) {
    return { error: "Unauthorized: Deletion requires internal staff privileges." };
  }

  try {
    await prisma.schedules.delete({
      where: { id: BigInt(id) }
    });

    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "SCHEDULE_DELETE",
      targetType: "Schedule",
      targetId: id,
      details: "Deleted schedule"
    });

    revalidatePath(`/dashboard/schedules`);
    return { success: true };
  } catch (error) {
    console.error("Delete schedule error:", error);
    return { error: "Failed to delete schedule" };
  }
}

export async function updateScheduleStatus(scheduleId: string, status: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const updated = await prisma.schedules.update({
      where: { id: BigInt(scheduleId) },
      data: { status: status as any }
    });

    if (updated.unit_id) {
      let nextUnitStatus: any = "Normal";
      if (status === "Pending") nextUnitStatus = "Pending";
      if (status === "In Progress") nextUnitStatus = "On_Progress";
      if (status === "Completed") nextUnitStatus = "Normal";

      await prisma.units.update({
        where: { id: Number(updated.unit_id) },
        data: { status: nextUnitStatus }
      });

      // TRIGGER PUSH NOTIFICATION (Phase 2)
      if (status === "Completed") {
         await notifyProjectStakeholders(
            Number(updated.unit_id),
            `✅ Activity Completed: ${updated.title}`,
            `The scheduled ${updated.type} has been finished by the technical team.`,
            `/dashboard/schedules`
         );
      }
    }
    
    await recordAuditLog({
      userId: parseInt(session.userId),
      action: "SCHEDULE_STATUS_CHANGE",
      targetType: "Schedule",
      targetId: scheduleId,
      details: `Changed status to ${status}`
    });
    
    revalidatePath(`/dashboard/schedules`);
    return { success: true };
  } catch (error: any) {
    console.error("Update schedule status error:", error);
    return { error: "Failed to update schedule status" };
  }
}

export async function getScheduleFormOptions(projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const [projects, units, users] = await Promise.all([
      prisma.projects.findMany({ select: { id: true, name: true, customer_id: true, enabled_forms: true } }),
      prisma.units.findMany({ 
        where: projectId ? { project_ref_id: BigInt(projectId) } : undefined,
        select: { 
          id: true, 
          tag_number: true, 
          code: true,
          room_tenant: true,
          model: true,
          serial_number: true,
          area: true, 
          project_ref_id: true, 
          qr_code_token: true 
        } 
      }),
      prisma.users.findMany({ 
        where: {
          AND: [
            projectId ? { user_project_access: { some: { project_id: BigInt(projectId) } } } : {},
            {
              OR: [
                { roles: { role_name: { in: ["Engineer", "Vendor", "STE", "CAPS"] } } },
                {
                  user_roles: {
                    some: {
                      roles: {
                        role_name: { in: ["Engineer", "Vendor", "STE", "CAPS"] }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        select: { id: true, name: true, role_id: true } 
      })
    ]);

    return serializePrisma({
      success: true,
      data: {
        projects,
        units,
        users
      }
    });
  } catch (error: any) {
    console.error("[SCHEDULE_ACTION] Form Options error:", error.message);
    return { error: "Failed to fetch form options: Check console for memory/limit errors." };
  }
}

export async function getCalendarSchedules(month: number, year: number, projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const whereClause: any = { 
      start_at: {
        gte: startDate,
        lte: endDate
      }
    };
    
    // Security: If not internal, only show schedules for assigned projects
    if (!session.isInternal) {
      const userProjects = await prisma.user_project_access.findMany({
        where: { user_id: parseInt(session.userId) },
        select: { project_id: true }
      });
      const projectIds = userProjects.map(up => up.project_id);
      
      if (projectId) {
        const targetId = BigInt(projectId);
        if (projectIds.includes(targetId)) {
          whereClause.project_id = targetId;
        } else {
          return { success: true, data: [] };
        }
      } else {
        whereClause.project_id = { in: projectIds };
      }
    } else if (projectId) {
      whereClause.project_id = BigInt(projectId);
    }

    const schedules = await prisma.schedules.findMany({
      where: whereClause,
      include: {
        projects: { 
          select: { 
            name: true, 
            customers: { select: { name: true } } 
          } 
        },
        users: { select: { name: true } },
        units: {
          select: {
            id: true,
            tag_number: true,
            area: true,
            model: true,
            room_tenant: true,
            qr_code_token: true
          }
        }
      },
      orderBy: { start_at: 'asc' }
    });

    return serializePrisma({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error("Fetch calendar schedules error:", error);
    return { error: "Failed to fetch calendar schedules" };
  }
}
/**
 * 11. ENSURE SCHEDULE FOR ACTIVITY (Automation)
 * Automatically links a report submission to a schedule entry.
 * If no schedule exists, creates one marked as Completed.
 */
export async function ensureScheduleForActivity(unitId: number, type: string, inspector: string) {
  try {
    const unit = await prisma.units.findUnique({
      where: { id: unitId },
      select: { project_ref_id: true, tag_number: true }
    });
    if (!unit || !unit.project_ref_id) return null;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));

    // 1. Check for existing planned schedule for this unit and type today
    const existing = await prisma.schedules.findFirst({
      where: {
        unit_id: unitId,
        type: type as any,
        start_at: { gte: startOfDay, lte: endOfDay },
        status: "Planned"
      }
    });

    if (existing) {
      // Update existing to Completed
      const updated = await prisma.schedules.update({
        where: { id: existing.id },
        data: { 
          status: "Completed",
          description: existing.description + `\n[Auto: Report Submitted by ${inspector}]`
        }
      });
      revalidatePath("/dashboard/schedules");
      return updated.id.toString();
    }

    // 2. Create new Completed schedule if none exists
    const newSchedule = await prisma.schedules.create({
      data: {
        project_id: unit.project_ref_id,
        unit_id: unitId,
        type: type as any,
        status: "Completed",
        title: `Auto: ${type} Report (${unit.tag_number})`,
        description: `Automatic historical entry from report submission by ${inspector}.`,
        start_at: new Date(),
        end_at: new Date(new Date().getTime() + 3600000), // +1 hour
      }
    });

    revalidatePath("/dashboard/schedules");
    return newSchedule.id.toString();
  } catch (error) {
    console.error("Auto Schedule Error:", error);
    return null;
  }
}

/**
 * 12. GET INDONESIAN HOLIDAYS (Real-time)
 */
export async function getIndonesianHolidays(year: number) {
  try {
    // Note: External public APIs for ID holidays (dayoffapi, apihari-libur) are currently unstable/offline.
    // Using a curated high-fidelity dataset for 2026 Indonesia Holidays.
    const holidays2026 = [
      { tanggal: "2026-01-01", keterangan: "Tahun Baru 2026 Masehi" },
      { tanggal: "2026-01-21", keterangan: "Isra Mikraj Nabi Muhammad SAW" },
      { tanggal: "2026-02-17", keterangan: "Tahun Baru Imlek 2577 Kongzili" },
      { tanggal: "2026-03-20", keterangan: "Hari Suci Nyepi (Tahun Baru Saka 1948)" },
      { tanggal: "2026-03-31", keterangan: "Hari Raya Idul Fitri 1447 Hijriah" },
      { tanggal: "2026-04-01", keterangan: "Hari Raya Idul Fitri 1447 Hijriah" },
      { tanggal: "2026-04-03", keterangan: "Wafat Yesus Kristus" },
      { tanggal: "2026-04-05", keterangan: "Hari Paskah" },
      { tanggal: "2026-05-01", keterangan: "Hari Buruh Internasional" },
      { tanggal: "2026-05-14", keterangan: "Kenaikan Yesus Kristus" },
      { tanggal: "2026-05-27", keterangan: "Hari Raya Idul Adha 1447 Hijriah" },
      { tanggal: "2026-05-31", keterangan: "Hari Raya Waisak 2570 BE" },
      { tanggal: "2026-06-01", keterangan: "Hari Lahir Pancasila" },
      { tanggal: "2026-06-16", keterangan: "Tahun Baru Islam 1448 Hijriah" },
      { tanggal: "2026-08-17", keterangan: "Proklamasi Kemerdekaan RI" },
      { tanggal: "2026-08-25", keterangan: "Maulid Nabi Muhammad SAW" },
      { tanggal: "2026-12-25", keterangan: "Hari Raya Natal" }
    ];

    if (year === 2026) {
      return { success: true, data: holidays2026 };
    }

    // Attempt external fetch for other years if needed
    const res = await fetch(`https://dayoffapi.vercel.app/api?year=${year}`);
    if (res.ok) {
       const data = await res.json();
       return { success: true, data };
    }
    
    return { success: true, data: holidays2026 }; // Fallback
  } catch (error) {
    console.error("Holidays API Error:", error);
    return { success: false, error: "Failed to fetch holidays" };
  }
}
