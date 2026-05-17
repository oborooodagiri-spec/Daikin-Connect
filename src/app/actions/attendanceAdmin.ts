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
                where: {
                    check_in_time: { gte: today },
                    OR: [
                        { check_out_photo: null },
                        { check_out_photo: "" }
                    ]
                }
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

export async function getAttendanceForRoster(params: {
    userIds: number[];
    startDate: string;
    endDate: string;
}) {
    unstable_noStore();
    try {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);

        const records = await prisma.vendor_attendance.findMany({
            where: {
                user_id: { in: params.userIds },
                check_in_time: {
                    gte: start,
                    lte: end
                }
            },
            select: {
                user_id: true,
                check_in_time: true,
                check_out_time: true,
                status: true
            }
        });

        return serializePrisma({
            success: true,
            data: records
        });
    } catch (error) {
        console.error("fetch attendance roster err", error);
        return { error: "Failed to fetch roster attendance." };
    }
}

// Fetch distinct list of users who have attendance logs in the project
export async function getAttendanceUsers(projectId?: string) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) {
        return { error: "Unauthorized access. Admins only." };
    }
    try {
        const whereClause: any = {};
        if (projectId && projectId !== "all" && projectId !== "empty") {
            whereClause.project_id = BigInt(projectId);
        }
        const attendances = await prisma.vendor_attendance.findMany({
            where: whereClause,
            select: {
                users: {
                    select: { id: true, name: true, email: true, company_name: true }
                }
            },
            distinct: ['user_id']
        });
        const users = attendances.map(a => a.users).filter(Boolean);
        return { success: true, data: users };
    } catch (error) {
        console.error("fetch attendance users err", error);
        return { error: "Failed to fetch users." };
    }
}

// Fetch comprehensive monthly attendance logs for a specific user
export async function getUserMonthlyAttendance(userId: number, month: number, year: number, projectId?: string) {
    unstable_noStore();
    const session = await getSession();
    
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    const isSelf = session && parseInt(session.userId) === userId;
    
    if (!session || (!isAdmin && !isSelf)) {
        return { error: "Unauthorized access." };
    }

    try {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const whereClause: any = {
            user_id: userId,
            check_in_time: {
                gte: start,
                lte: end
            }
        };

        if (projectId && projectId !== "all" && projectId !== "empty") {
            whereClause.project_id = BigInt(projectId);
        }

        const records = await prisma.vendor_attendance.findMany({
            where: whereClause,
            include: {
                users: {
                    select: { id: true, name: true, email: true, company_name: true }
                },
                projects: {
                    select: { name: true }
                }
            },
            orderBy: { check_in_time: "asc" }
        });

        return serializePrisma({
            success: true,
            data: records
        });
    } catch (error) {
        console.error("fetch user monthly attendance err", error);
        return { error: "Failed to fetch monthly attendance." };
    }
}
