"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore, revalidatePath } from "next/cache";

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
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        company_name: true,
                        face_reference_url: true,
                        face_verification_enabled: true 
                    }
                },
                projects: {
                    select: { name: true, customer_id: true, shift_start_time: true, shift_end_time: true }
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
        // Explicitly calculate midnight in WIB (UTC+7)
        const now = new Date();
        const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        wibTime.setUTCHours(0, 0, 0, 0);
        const today = new Date(wibTime.getTime() - 7 * 60 * 60 * 1000);

        const [totalToday, activeNow] = await Promise.all([
            prisma.vendor_attendance.count({
                where: { check_in_time: { gte: today } }
            }),
            prisma.vendor_attendance.count({
                where: {
                    check_out_time: null
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
                check_out_time: true
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
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        company_name: true,
                        face_reference_url: true,
                        face_verification_enabled: true 
                    }
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

// Fetch all personnel attendance for one month (WIB), used by the admin overtime calculator
export async function getMonthlyOvertimeData(month: number, year: number, projectId?: string) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) {
        return { error: "Unauthorized access. Admins only." };
    }

    if (!Number.isInteger(month) || month < 0 || month > 11 || !Number.isInteger(year) || year < 2000 || year > 2100) {
        return { error: "Periode tidak valid." };
    }

    try {
        const mm = String(month + 1).padStart(2, "0");
        const lastDay = new Date(year, month + 1, 0).getDate();
        const start = new Date(`${year}-${mm}-01T00:00:00.000+07:00`);
        const end = new Date(`${year}-${mm}-${String(lastDay).padStart(2, "0")}T23:59:59.999+07:00`);

        const whereClause: any = {
            check_in_time: { gte: start, lte: end }
        };
        if (projectId && projectId !== "all" && projectId !== "empty") {
            whereClause.project_id = BigInt(projectId);
        }

        const records = await prisma.vendor_attendance.findMany({
            where: whereClause,
            select: {
                id: true,
                user_id: true,
                project_id: true,
                check_in_time: true,
                check_out_time: true,
                users: {
                    select: { id: true, name: true, email: true, company_name: true }
                },
                projects: {
                    select: { name: true, shift_start_time: true, shift_end_time: true }
                }
            },
            orderBy: { check_in_time: "asc" }
        });

        return serializePrisma({
            success: true,
            data: records
        });
    } catch (error) {
        console.error("fetch monthly overtime data err", error);
        return { error: "Failed to fetch monthly attendance for overtime." };
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
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00.000+07:00`;
        const start = new Date(startStr);
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`;
        const end = new Date(endStr);

        console.log("getUserMonthlyAttendance bounds (WIB):", { startStr, endStr, start, end, month, year });

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
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        company_name: true,
                        face_reference_url: true,
                        face_verification_enabled: true 
                    }
                },
                projects: {
                    select: { name: true, shift_start_time: true, shift_end_time: true }
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

/**
 * Admin Action: Reset registered face profile for a user
 * When reset, user will be prompted to re-enroll their face cleanly on next attendance.
 */
export async function adminResetUserFace(userId: number) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) return { error: "Unauthorized access. Admins only." };

    try {
        await prisma.users.update({
            where: { id: userId },
            data: { 
                face_reference_url: null,
                face_verification_enabled: true 
            }
        });
        revalidatePath("/admin/attendance");
        revalidatePath("/admin/users");
        revalidatePath("/home/attendance");
        return { 
            success: true, 
            message: "Foto referensi wajah berhasil di-reset. Karyawan akan diminta mendaftarkan foto wajah baru saat absensi berikutnya." 
        };
    } catch (err: any) {
        console.error("adminResetUserFace error:", err);
        return { error: "Gagal me-reset foto referensi wajah." };
    }
}

/**
 * Admin Action: Toggle face verification requirement per user
 */
export async function adminToggleFaceVerification(userId: number, enabled: boolean) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) return { error: "Unauthorized access. Admins only." };

    try {
        await prisma.users.update({
            where: { id: userId },
            data: { face_verification_enabled: enabled }
        });
        revalidatePath("/admin/attendance");
        revalidatePath("/admin/users");
        revalidatePath("/home/attendance");
        return { success: true, enabled };
    } catch (err: any) {
        console.error("adminToggleFaceVerification error:", err);
        return { error: "Gagal memperbarui status verifikasi wajah." };
    }
}

/**
 * Admin Action: Upload/set a validated face photo directly for a user
 */
export async function adminUpdateUserFace(userId: number, photoUrl: string) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) return { error: "Unauthorized access. Admins only." };

    try {
        const { validateFacePhoto } = await import("./attendance");
        const validation = await validateFacePhoto(photoUrl);
        if (!validation.valid) {
            return { error: validation.error || "Wajah tidak terdeteksi jelas pada foto yang diunggah." };
        }

        await prisma.users.update({
            where: { id: userId },
            data: { 
                face_reference_url: photoUrl,
                face_verification_enabled: true
            }
        });
        revalidatePath("/admin/attendance");
        revalidatePath("/admin/users");
        revalidatePath("/home/attendance");
        return { success: true, message: "Foto referensi wajah berhasil diperbarui." };
    } catch (err: any) {
        console.error("adminUpdateUserFace error:", err);
        return { error: "Gagal memperbarui foto wajah karyawan." };
    }
}

/**
 * Admin Action: Emergency manual clock-out when employee is stuck on-site
 */
export async function adminManualClockOut(params: {
    attendanceId: number;
    notes: string;
    checkOutTime?: string;
}) {
    unstable_noStore();
    const session = await getSession();
    const isAdmin = session?.roles?.some((r: any) => /admin|super/i.test(typeof r === "string" ? r : r.role_name));
    if (!session || !isAdmin) return { error: "Unauthorized access. Admins only." };

    if (!params.notes || params.notes.trim().length === 0) {
        return { error: "Catatan alasan clock-out manual wajib diisi oleh Admin." };
    }

    try {
        const attendance = await prisma.vendor_attendance.findUnique({
            where: { id: params.attendanceId }
        });

        if (!attendance) return { error: "Data absensi tidak ditemukan." };
        if (attendance.check_out_time) return { error: "Sesi absensi ini sudah di-clock out sebelumnya." };

        const outTime = params.checkOutTime ? new Date(params.checkOutTime) : new Date();
        const adminNote = `[MANUAL CLOCK-OUT OLEH ADMIN (${session.name || "Admin"}): ${params.notes.trim()}]`;

        await prisma.vendor_attendance.update({
            where: { id: params.attendanceId },
            data: {
                check_out_time: outTime,
                check_out_notes: attendance.check_out_notes 
                    ? `${attendance.check_out_notes} | ${adminNote}` 
                    : adminNote
            }
        });

        revalidatePath("/admin/attendance");
        revalidatePath("/home/attendance");
        return { success: true, message: "Clock-out manual berhasil diproses." };
    } catch (err: any) {
        console.error("adminManualClockOut error:", err);
        return { error: "Gagal melakukan clock-out manual." };
    }
}
