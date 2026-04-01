"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getProjectProgress(projectId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Get targets for the project
    const targets = await prisma.schedule_targets.findMany({
      where: {
        project_id: BigInt(projectId),
        month: currentMonth,
        year: currentYear
      }
    });

    const periods = {
      day: { start: new Date(currentYear, currentMonth - 1, currentDay, 0,0,0), end: new Date(currentYear, currentMonth - 1, currentDay, 23,59,59) },
      month: { start: new Date(currentYear, currentMonth - 1, 1, 0,0,0), end: new Date(currentYear, currentMonth, 0, 23,59,59) },
      year: { start: new Date(currentYear, 0, 1, 0,0,0), end: new Date(currentYear, 11, 31, 23,59,59) }
    };

    // 2. Calculate Stats for Preventive & Audit (Target vs Actual)
    const types = ["Preventive", "Audit"] as const;
    const stats: any = {};

    for (const type of types) {
      const target = targets.find(t => t.type === type);
      
      const counts = await Promise.all([
        prisma.service_activities.count({ where: { type, status: 'Final_Approved', units: { project_ref_id: BigInt(projectId) }, service_date: { gte: periods.day.start, lte: periods.day.end } } }),
        prisma.service_activities.count({ where: { type, status: 'Final_Approved', units: { project_ref_id: BigInt(projectId) }, service_date: { gte: periods.month.start, lte: periods.month.end } } }),
        prisma.service_activities.count({ where: { type, status: 'Final_Approved', units: { project_ref_id: BigInt(projectId) }, service_date: { gte: periods.year.start, lte: periods.year.end } } })
      ]);

      stats[type] = {
        daily: { target: target?.daily_target || 0, actual: counts[0] },
        monthly: { target: target?.monthly_target || 0, actual: counts[1] },
        yearly: { target: target?.yearly_target || 0, actual: counts[2] }
      };
    }

    // 3. Special Logic for Corrective (Performance Breakdown)
    const correctiveSchedules = await prisma.schedules.findMany({
      where: {
        project_id: BigInt(projectId),
        type: 'Corrective',
        start_at: { gte: periods.month.start, lte: periods.month.end }
      },
      select: { status: true }
    });

    const correctiveStats = {
      total: correctiveSchedules.length,
      completed: correctiveSchedules.filter(s => s.status === 'Completed').length,
      inProgress: correctiveSchedules.filter(s => s.status === 'InProgress').length,
      missed: correctiveSchedules.filter(s => s.status === 'Missed').length,
      planned: correctiveSchedules.filter(s => s.status === 'Planned').length
    };

    return { 
      success: true, 
      data: {
        targets: stats,
        corrective: correctiveStats
      }
    };
  } catch (error) {
    console.error("Fetch project progress error:", error);
    return { error: "Failed to fetch progress" };
  }
}

export async function setProjectTarget(data: {
  projectId: string,
  type: "Preventive" | "Audit",
  daily: number,
  monthly: number,
  yearly: number
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
        data: { 
          daily_target: data.daily,
          monthly_target: data.monthly,
          yearly_target: data.yearly
        }
      });
    } else {
      await prisma.schedule_targets.create({
        data: {
          project_id: BigInt(data.projectId),
          type: data.type,
          daily_target: data.daily,
          monthly_target: data.monthly,
          yearly_target: data.yearly,
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
