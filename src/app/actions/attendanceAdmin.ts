"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore } from "next/cache";

// Fetch Attendance logs for an admin, filtered by projectId, search query, and date range
export async function getAttendanceRecords(params: {
    projectId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
} = {}) {
    unstable_noStore();
    const session = await getSession();
    // Verify Admin rights
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) {
        return { error: "Unauthorized access. Admins only." };
    }

    try {
        const whereClause: any = {};
        
        if (params.projectId && params.projectId !== "all" && params.projectId !== "empty") {
            whereClause.project_id = BigInt(params.projectId);
        }

        if (params.search) {
            whereClause.users = {
                name: { contains: params.search }
            };
        }

        if (params.startDate || params.endDate) {
            whereClause.check_in_time = {};
            if (params.startDate) {
                whereClause.check_in_time.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                const end = new Date(params.endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.check_in_time.lte = end;
            }
        }

        const records = await prisma.vendor_attendance.findMany({
            where: whereClause,
            include: {
                users: {
                    select: { name: true, email: true, company_name: true }
                },
                projects: {
                    select: { name: true, customer_id: true }
                }
            },
            orderBy: { check_in_time: "desc" }
        });

        return serializePrisma({
            success: true,
            data: records
        });
    } catch (error) {
        console.error("fetch attendance admin err", error);
        return { error: "Failed to fetch vendor attendance." };
    }
}

export async function getAttendanceSummary() {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) return { error: "Unauthorized" };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalToday, activeNow] = await Promise.all([
            prisma.vendor_attendance.count({
                where: { check_in_time: { gte: today } }
            }),
            prisma.vendor_attendance.count({
                where: { check_out_time: null, check_in_time: { gte: today } }
            })
        ]);

        return {
            success: true,
            data: {
                totalToday,
                activeNow,
                projectsTracked: await prisma.projects.count({ where: { status: 'active' } })
            }
        };
    } catch (error) {
        return { error: "Failed to fetch summary" };
    }
}
