"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore } from "next/cache";

// Fetch Attendance logs for an admin, filtered by projectId
export async function getAttendanceRecords(projectId?: string) {
    unstable_noStore();
    const session = await getSession();
    // Verify Admin rights
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) {
        return { error: "Unauthorized access. Admins only." };
    }

    try {
        const whereClause: any = {};
        if (projectId && projectId !== "empty") {
            whereClause.project_id = BigInt(projectId);
        }

        const records = await prisma.vendor_attendance.findMany({
            where: whereClause,
            include: {
                users: {
                    select: { name: true }
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
