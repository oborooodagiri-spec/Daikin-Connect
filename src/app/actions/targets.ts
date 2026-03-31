// @ts-nocheck
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function getMonthlyTargets(month: number, year: number, projectId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const targets = await prisma.schedule_targets.findMany({
      where: { 
        month, 
        year,
        ...(projectId ? { project_id: BigInt(projectId) } : {})
      },
      include: {
        users: { select: { name: true, role_id: true } },
        projects: { select: { name: true } }
      }
    });

    return { success: true, data: targets };
  } catch (error: any) {
    console.error("Fetch targets error:", error);
    return { error: "Failed to fetch targets" };
  }
}

export async function setTarget(data: {
  assignee_id?: string,
  project_id?: string,
  type: "Preventive" | "Corrective" | "Audit",
  daily_target: number,
  monthly_target: number,
  month: number,
  year: number
}) {
  const session = await getSession();
  if (!session || !session.isAdmin) return { error: "Unlimited access denied" };

  try {
    const assigneeId = data.assignee_id ? parseInt(data.assignee_id) : null;
    const projectId = data.project_id ? BigInt(data.project_id) : null;
    
    // Check if target exists
    const existing = await prisma.schedule_targets.findFirst({
      where: {
        assignee_id: assigneeId,
        project_id: projectId,
        type: data.type,
        month: data.month,
        year: data.year
      }
    });

    if (existing) {
      await prisma.schedule_targets.update({
        where: { id: existing.id },
        data: {
          daily_target: data.daily_target,
          monthly_target: data.monthly_target
        }
      });
    } else {
      await prisma.schedule_targets.create({
        data: {
          assignee_id: assigneeId,
          project_id: projectId,
          type: data.type,
          daily_target: data.daily_target,
          monthly_target: data.monthly_target,
          month: data.month,
          year: data.year
        }
      });
    }

    revalidatePath('/dashboard/schedules/targets');
    return { success: true };
  } catch (error: any) {
    console.error("Set Target Error:", error);
    return { error: "Failed to set target" };
  }
}

export async function getCompletionStats(month: number, year: number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const stats = await (prisma.service_activities as any).groupBy({
      by: ['type'],
      where: {
        service_date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _count: true
    });

    return { 
      success: true, 
      data: {
        byType: stats.map((s: any) => ({ type: s.type, count: s._count })),
      } 
    };
  } catch (error: any) {
    console.error("Fetch completion stats error:", error);
    return { error: "Failed to fetch stats" };
  }
}
