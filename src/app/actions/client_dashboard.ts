"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
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

      return {
        id: p.id.toString(),
        name: p.name,
        customerName: customer?.name || "N/A",
        code: p.code,
        unit_count: p._count.units,
        progress: progress.success ? progress.data : [],
        next_visit: nextSchedule ? {
          date: nextSchedule.start_at,
          engineer: nextSchedule.users?.name || "Assigning..."
        } : null
      };
    }));

    return { 
      success: true, 
      data: {
        projects: enrichedProjects,
        total_assets: enrichedProjects.reduce((sum, p) => sum + p.unit_count, 0)
      } 
    };
  } catch (error) {
    console.error("Client dashboard data fetch error:", error);
    return { error: "Failed to load dashboard data" };
  }
}
