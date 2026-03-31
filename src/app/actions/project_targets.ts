"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getProjectProgress(projectId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Get targets for the project this month
    const targets = await prisma.schedule_targets.findMany({
      where: {
        project_id: BigInt(projectId),
        month: currentMonth,
        year: currentYear
      }
    });

    // 2. Get actual completion stats for the project this month
    // We count service_activities linked to units that belong to this project
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const actuals = await prisma.service_activities.groupBy({
      by: ['type'],
      where: {
        units: {
          project_ref_id: BigInt(projectId)
        },
        service_date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'Final_Approved'
      },
      _count: true
    });

    // 3. Map targets and actuals
    const progress = targets.map(t => {
      const actual = actuals.find(a => a.type === t.type)?._count || 0;
      return {
        type: t.type,
        target: t.monthly_target,
        actual: actual,
        percentage: t.monthly_target > 0 ? Math.min(Math.round((actual / t.monthly_target) * 100), 100) : 0
      };
    });

    return { success: true, data: progress };
  } catch (error) {
    console.error("Fetch project progress error:", error);
    return { error: "Failed to fetch progress" };
  }
}

export async function setProjectTarget(data: {
  projectId: string,
  type: "Preventive" | "Corrective" | "Audit",
  target: number
}) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Permission denied" };

  try {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const existing = await prisma.schedule_targets.findFirst({
      where: {
        project_id: BigInt(data.projectId),
        type: data.type,
        month,
        year
      }
    });

    if (existing) {
      await prisma.schedule_targets.update({
        where: { id: existing.id },
        data: { monthly_target: data.target }
      });
    } else {
      await prisma.schedule_targets.create({
        data: {
          project_id: BigInt(data.projectId),
          type: data.type,
          monthly_target: data.target,
          daily_target: Math.ceil(data.target / 20), // Default assumption 20 days/month
          month,
          year
        }
      });
    }

    revalidatePath(`/dashboard/customers/[id]/projects`, 'page');
    return { success: true };
  } catch (error) {
    console.error("Set project target error:", error);
    return { error: "Failed to set target" };
  }
}

export async function getProjectSchedules(projectId: string) {
  try {
    const schedules = await prisma.schedules.findMany({
      where: { project_id: BigInt(projectId) },
      include: {
        users: { select: { name: true } },
        units: { select: { tag_number: true, location: true } }
      },
      orderBy: { start_at: 'asc' }
    });

    return {
      success: true,
      data: schedules.map(s => ({
        ...s,
        id: s.id.toString(),
        project_id: s.project_id.toString()
      }))
    };
  } catch (error) {
    return { error: "Failed to fetch schedules" };
  }
}
