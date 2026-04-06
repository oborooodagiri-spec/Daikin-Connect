// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getAllSchedules() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const schedules = await prisma.schedules.findMany({
      include: {
        projects: { select: { name: true } },
        units: { select: { tag_number: true } }, 
        users: { select: { name: true, email: true } }
      },
      orderBy: { start_at: 'asc' }
    });

    const now = new Date();
    const processedSchedules = await Promise.all(schedules.map(async (s: any) => {
      let currentStatus = s.status;
      if (currentStatus === "Planned" && s.end_at < now) {
        currentStatus = "Missed";
        await prisma.schedules.update({
          where: { id: s.id },
          data: { status: "Missed" }
        });
      }
      return {
        id: s.id.toString(),
        title: s.title,
        description: s.description,
        type: s.type,
        status: currentStatus,
        start_at: s.start_at.toISOString(),
        end_at: s.end_at.toISOString(),
        google_event_id: s.google_event_id,
        project: s.projects,
        unit: s.units,
        assignee: s.users
      };
    }));

    return {
      success: true,
      data: processedSchedules
    };
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
        units: { select: { tag_number: true } }, 
        users: { select: { name: true, email: true } }
      },
      orderBy: { start_at: 'asc' }
    });

    const now = new Date();
    const processedSchedules = await Promise.all(schedules.map(async (s: any) => {
        let currentStatus = s.status;
        if (currentStatus === "Planned" && s.end_at < now) {
          currentStatus = "Missed";
          await prisma.schedules.update({
            where: { id: s.id },
            data: { status: "Missed" }
          });
        }
        return {
          id: s.id.toString(),
          title: s.title,
          description: s.description,
          type: s.type,
          status: currentStatus,
          start_at: s.start_at.toISOString(),
          end_at: s.end_at.toISOString(),
          google_event_id: s.google_event_id,
          unit: s.units,
          assignee: s.users
        };
      }));

    return {
      success: true,
      data: processedSchedules
    };
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
    
    revalidatePath(`/dashboard/customers`);
    revalidatePath(`/dashboard/schedules`);
    
    return { success: true, id: newSchedule.id.toString() };
  } catch (error: any) {
    console.error("Create schedule error:", error);
    return { error: "Failed to create schedule" };
  }
}

export async function deleteSchedule(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await prisma.schedules.delete({
      where: { id: BigInt(id) }
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
    }
    
    revalidatePath(`/dashboard/schedules`);
    return { success: true };
  } catch (error: any) {
    console.error("Update schedule status error:", error);
    return { error: "Failed to update schedule status" };
  }
}

export async function getScheduleFormOptions() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const [projects, units, users] = await Promise.all([
      prisma.projects.findMany({ select: { id: true, name: true, customer_id: true } }),
      prisma.units.findMany({ 
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
          OR: [
            { 
              roles: { 
                role_name: { in: ["Engineer", "Vendor", "STE", "CAPS"] } 
              } 
            },
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
        },
        select: { id: true, name: true, role_id: true } 
      })
    ]);

    return {
      success: true,
      data: {
        projects: projects.map(p => ({ id: p.id.toString(), name: p.name, customer_id: p.customer_id })),
        units: units.map(u => ({ 
          id: u.id, 
          tag_number: u.tag_number || "Untagged", 
          code: u.code || "N/A",
          room_tenant: u.room_tenant || "Private",
          model: u.model || "Unknown",
          serial_number: u.serial_number || "N/A",
          area: u.area || "N/A",
          project_id: u.project_ref_id?.toString(),
          qr_code_token: u.qr_code_token
        })),
        users: users.map(u => ({ id: u.id, name: u.name, role_id: u.role_id }))
      }
    };
  } catch (error) {
    return { error: "Failed to fetch form options" };
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
      const userProjects = await prisma.project_users.findMany({
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
            qr_code_token: true
          }
        }
      },
      orderBy: { start_at: 'asc' }
    });

    return {
      success: true,
      data: schedules.map((s: any) => ({
        id: s.id.toString(),
        title: s.title,
        type: s.type,
        status: s.status,
        start_at: s.start_at.toISOString(),
        end_at: s.end_at.toISOString(),
        projectName: s.projects?.name || "N/A",
        customerName: s.projects?.customers?.name || "N/A",
        assigneeName: s.users?.name || "Unassigned",
        unitId: s.units?.id?.toString(),
        unitTag: s.units?.tag_number,
        unitArea: s.units?.area,
        unitModel: s.units?.model,
        unitToken: s.units?.qr_code_token
      }))
    };
  } catch (error) {
    console.error("Fetch calendar schedules error:", error);
    return { error: "Failed to fetch calendar schedules" };
  }
}
