"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { getProjectProgress } from "./project_targets";

export async function getClientDashboardData() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    // 1. Get assigned projects
    const access = await prisma.user_project_access.findMany({
      where: { user_id: parseInt(session.userId) },
      include: { 
        projects: {
          include: {
            _count: { select: { units: true } }
          }
        } 
      }
    });

    const projects = access.map(a => a.projects).filter(Boolean);

    // 2. Wrap projects with progress and next schedule
    const enrichedProjects = await Promise.all(projects.map(async (p: any) => {
      const progress = await getProjectProgress(p.id.toString());
      
      const nextSchedule = await prisma.schedules.findFirst({
        where: { 
          project_id: p.id,
          start_at: { gte: new Date() }
        },
        orderBy: { start_at: 'asc' },
        include: { users: { select: { name: true } } }
      });

      const customer = await prisma.customers.findUnique({
        where: { id: p.customer_id },
        select: { name: true }
      });

      // 2. Transform raw progress object into array for frontend
      const progressItems = [];
      if ('success' in progress && progress.success && progress.data) {
        const { targets, corrective } = progress.data;
        
        // Add Preventive
        if (targets.Preventive) {
          const { actual, target } = targets.Preventive.monthly;
          progressItems.push({
             type: 'Preventive',
             actual,
             target,
             percentage: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
          });
        }

        // Add Audit
        if (targets.Audit) {
          const { actual, target } = targets.Audit.monthly;
          progressItems.push({
             type: 'Audit',
             actual,
             target,
             percentage: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
          });
        }

        // Add Corrective
        if (corrective) {
          const actual = corrective.completed;
          const target = corrective.total;
          progressItems.push({
             type: 'Corrective',
             actual,
             target,
             percentage: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
          });
        }
      }

      return {
        id: p.id.toString(),
        name: p.name,
        customerName: customer?.name || "N/A",
        code: p.code,
        unit_count: p._count.units,
        progress: progressItems,
        next_visit: nextSchedule ? {
          date: nextSchedule.start_at,
          engineer: nextSchedule.users?.name || "Assigning..."
        } : null
      };
    }));

    return serializePrisma({ 
      success: true, 
      data: {
        projects: enrichedProjects,
        total_assets: enrichedProjects.reduce((sum, p) => sum + p.unit_count, 0)
      } 
    });
  } catch (error) {
    console.error("Client dashboard data fetch error:", error);
    return { error: "Failed to load dashboard data" };
  }
}

export async function getClientInventory() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const access = await prisma.user_project_access.findMany({
      where: { user_id: parseInt(session.userId) },
      select: { project_id: true }
    });

    const projectIds = access.map(a => a.project_id);

    const inventory = await prisma.units.findMany({
      where: { project_ref_id: { in: projectIds } },
      orderBy: { tag_number: 'asc' }
    });

    return serializePrisma({ 
      success: true, 
      data: inventory.map(u => ({ 
        ...u, 
        project_ref_id: u.project_ref_id?.toString() 
      })) 
    });
  } catch (error) {
    return { error: "Failed to load inventory" };
  }
}

export async function getClientSchedules() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const access = await prisma.user_project_access.findMany({
      where: { user_id: parseInt(session.userId) },
      select: { project_id: true }
    });
    const projectIds = access.map(a => a.project_id);

    const schedules = await prisma.schedules.findMany({
      where: { project_id: { in: projectIds } },
      include: { 
        projects: { select: { name: true } },
        units: { select: { tag_number: true, location: true } }
      },
      orderBy: { start_at: 'desc' }
    });

    return serializePrisma({ 
      success: true, 
      data: schedules.map(s => ({
        ...s,
        id: s.id.toString(),
        project_id: s.project_id.toString()
      }))
    });
  } catch (error) {
    return { error: "Failed to load schedules" };
  }
}

export async function getClientReports() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const access = await prisma.user_project_access.findMany({
      where: { user_id: parseInt(session.userId) },
      select: { project_id: true }
    });
    const projectIds = access.map(a => a.project_id);

    const reports = await prisma.service_activities.findMany({
      where: { 
        units: { project_ref_id: { in: projectIds } }, 
        status: 'Final_Approved' 
      },
      include: { 
        units: { 
          select: { tag_number: true, code: true, brand: true, model: true } 
        },
        activity_photos: true,
        audit_velocity_points: true
      },
      orderBy: { service_date: 'desc' }
    });

    return serializePrisma({ success: true, data: reports });
  } catch (error) {
    return { error: "Failed to load reports" };
  }
}

export async function requestClientVisit(projectId: string, note?: string) {
    const session = await getSession();
    if (!session) return { error: "Not authenticated" };

    try {
        const start = new Date();
        start.setDate(start.getDate() + 7); // Default to one week from now
        start.setHours(9, 0, 0, 0);
        
        const end = new Date(start);
        end.setHours(17, 0, 0, 0);

        await prisma.schedules.create({
            data: {
                project_id: BigInt(projectId),
                title: "Client Requested Visit",
                description: note || "Customer requested a visit via portal dashboard.",
                start_at: start,
                end_at: end,
                type: "Preventive",
                status: "Planned"
            }
        });

        return { success: true };
    } catch (err) {
        return { error: "Failed to submit request" };
    }
}
