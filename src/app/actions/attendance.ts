"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath, unstable_noStore } from "next/cache";
import { serializePrisma } from "@/lib/serialize";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getActiveAttendance(projectId: string) {
  unstable_noStore();
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find the active record (no check-out photo or empty string)
    const activeRecord = await (prisma as any).vendor_attendance.findFirst({
      where: {
        user_id: parseInt(session.userId),
        OR: [
          { check_out_photo: null },
          { check_out_photo: "" }
        ]
      },
      include: {
        projects: { select: { name: true, latitude: true, longitude: true, radius_meters: true } }
      },
      orderBy: { check_in_time: "desc" }
    });

    // Determine target project location (either from active record, or the selected project)
    const targetProject = activeRecord?.projects || (projectId && projectId !== "empty" && !isNaN(Number(projectId)) ? await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      select: { name: true, latitude: true, longitude: true, radius_meters: true }
    }) : null);

    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.userId) },
      select: { face_reference_url: true }
    });

    // Convert BigInt for JSON serialization
    return serializePrisma({
      success: true,
      data: activeRecord,
      hasFace: !!user?.face_reference_url,
      faceUrl: user?.face_reference_url,
      projectLocation: targetProject ? { 
        name: targetProject.name || 'Proyek Tanpa Nama',
        lat: Number(targetProject.latitude), 
        long: Number(targetProject.longitude), 
        radius: targetProject.radius_meters 
      } : null
    });
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: error?.message || "Failed to fetch attendance record" };
  }
}

export async function getAttendanceHistory(month?: number, year?: number) {
  unstable_noStore();
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await (prisma as any).vendor_attendance.findMany({
      where: {
        user_id: parseInt(session.userId),
        check_in_time: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        projects: {
          select: { name: true }
        }
      },
      orderBy: {
        check_in_time: "desc",
      },
    });

    return serializePrisma({ success: true, data: records });
  } catch (error) {
    console.error("fetch attendance history err", error);
    return { error: "Failed to fetch attendance history." };
  }
}

export async function getAttendanceStats(month?: number, year?: number) {
  unstable_noStore();
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await (prisma as any).vendor_attendance.findMany({
      where: {
        user_id: parseInt(session.userId),
        check_in_time: {
          gte: startDate,
          lte: endDate,
        },
      }
    });

    // Simple mock stats for now as we don't have shift schedule comparison logic fully here yet
    // In real app, we'd compare check_in_time with scheduled start_at
    const stats = {
      absent: 0,
      late: records.filter((r: any) => {
        const checkIn = new Date(r.check_in_time);
        return checkIn.getHours() > 8 || (checkIn.getHours() === 8 && checkIn.getMinutes() > 30);
      }).length,
      earlyOut: records.filter((r: any) => {
        if (!r.check_out_photo || r.check_out_photo === "") return false;
        const checkOut = new Date(r.check_out_time);
        return checkOut.getHours() < 17 || (checkOut.getHours() === 17 && checkOut.getMinutes() < 30);
      }).length,
      noClockIn: 0,
      noClockOut: records.filter((r: any) => !r.check_out_photo || r.check_out_photo === "").length
    };

    return { success: true, data: stats };
  } catch (error) {
    return { error: "Failed to fetch stats" };
  }
}

export async function submitCheckIn(data: {
  projectId: string;
  lat: number;
  long: number;
  photoUrl: string;
  notes?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (!data.projectId || data.projectId === "empty" || isNaN(Number(data.projectId))) {
      return { error: "Invalid project ID" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Prevent simultaneous active shifts
    const activeShift = await (prisma as any).vendor_attendance.findFirst({
      where: {
        user_id: parseInt(session.userId),
        OR: [
          { check_out_photo: null },
          { check_out_photo: "" }
        ]
      },
      include: {
        projects: { select: { name: true } }
      }
    });

    if (activeShift) {
       return { error: `System Locked: Anda masih berstatus AKTIF di lokasi "${activeShift.projects?.name}". Silakan Check-out terlebih dahulu sebelum melakukan Check-in baru.` };
    }

    // 1b. Time-Throttle: Prevent rapid double submission (within 1 minute)
    const recentRecord = await (prisma as any).vendor_attendance.findFirst({
      where: {
        user_id: parseInt(session.userId),
        check_in_time: {
          gte: new Date(Date.now() - 60000) // Within last 1 minute
        }
      }
    });

    if (recentRecord) {
      return { error: "Terdeteksi pengiriman ganda. Mohon tunggu 1 menit sebelum mencoba lagi." };
    }

    // 2. Geofencing Enforcement
    const project = await prisma.projects.findUnique({
      where: { id: BigInt(data.projectId) }
    });

    let finalNotes = data.notes || "";

    if (project?.latitude && project?.longitude) {
      const distance = calculateDistance(
        data.lat, data.long, 
        Number(project.latitude), Number(project.longitude)
      );
      const radius = project.radius_meters || 100;

      if (distance > radius) {
        // PER USER REQUEST: Allow check-ins outside the area, but the frontend will add a note.
        console.warn(`[GEOFENCE] User clocked in out of range: ${Math.round(distance)}m`);
        if (!finalNotes.includes("DI LUAR AREA") && !finalNotes.includes("OUTSIDE_AREA")) {
          finalNotes = `[DI LUAR AREA: ${Math.round(distance)}m] ${finalNotes}`.trim();
        }
      }
    }

    // 2b. AI Face verification check
    const faceCheck = await verifyFaceMatch(data.photoUrl);
    if (faceCheck.error) {
      return { error: faceCheck.error };
    }
    if (!faceCheck.match) {
      return { error: `Verifikasi Wajah Gagal: Wajah Anda tidak sesuai dengan referensi terdaftar. (${faceCheck.reason || "Silakan hubungi administrator."})` };
    }

    const record = await (prisma as any).vendor_attendance.create({
      data: {
        user_id: parseInt(session.userId),
        project_id: BigInt(data.projectId),
        check_in_time: new Date(), // Enforced Server Time
        check_in_lat: data.lat,
        check_in_long: data.long,
        check_in_photo: data.photoUrl,
        check_in_notes: finalNotes,
        check_out_time: null, // Mencegah MySQL auto-populating default timestamp
      },
    });

    // --- SMART BRIDGE INTEGRATION ---
    try {
      await syncAttendanceWithSchedule({
        userId: parseInt(session.userId),
        projectId: data.projectId,
        action: "IN",
        photoUrl: data.photoUrl,
        notes: data.notes
      });
    } catch (e: any) {
      console.warn("[SYNC_ERR] Schedule sync failed:", e.message);
    }
    // ---------------------------------

    revalidatePath("/home/attendance");
    revalidatePath("/admin/attendance");
    
    return { success: true, id: Number(record.id) };
  } catch (err) {
    console.error("CheckIn Error:", err);
    return { error: "Failed to check in" };
  }
}

export async function submitCheckOut(data: {
  attendanceId: number;
  lat: number;
  long: number;
  photoUrl: string;
  notes?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const attendanceRecord = await (prisma as any).vendor_attendance.findUnique({
      where: { id: data.attendanceId },
      include: { projects: true }
    });

    if (!attendanceRecord) return { error: "Sesi absensi tidak ditemukan" };

    let finalNotes = data.notes || "";
    const project = attendanceRecord.projects;

    if (project?.latitude && project?.longitude) {
      const distance = calculateDistance(
        data.lat, data.long, 
        Number(project.latitude), Number(project.longitude)
      );
      const radius = project.radius_meters || 100;

      if (distance > radius) {
        console.warn(`[GEOFENCE] User clocked out out of range: ${Math.round(distance)}m`);
        if (!finalNotes.includes("DI LUAR AREA") && !finalNotes.includes("OUTSIDE_AREA")) {
          finalNotes = `[DI LUAR AREA: ${Math.round(distance)}m] ${finalNotes}`.trim();
        }
      }
    }

    // AI Face verification check
    const faceCheck = await verifyFaceMatch(data.photoUrl);
    if (faceCheck.error) {
      return { error: faceCheck.error };
    }
    if (!faceCheck.match) {
      return { error: `Verifikasi Wajah Gagal: Wajah Anda tidak sesuai dengan referensi terdaftar. (${faceCheck.reason || "Silakan hubungi administrator."})` };
    }

    const record = await (prisma as any).vendor_attendance.update({
      where: { id: data.attendanceId },
      data: {
        check_out_time: new Date(), // Enforced Server Time
        check_out_lat: data.lat,
        check_out_long: data.long,
        check_out_photo: data.photoUrl,
        check_out_notes: finalNotes,
      },
    });

    // --- SMART BRIDGE INTEGRATION ---
    try {
      await syncAttendanceWithSchedule({
        userId: parseInt(session.userId),
        projectId: record.project_id.toString(),
        action: "OUT",
        photoUrl: data.photoUrl,
        notes: finalNotes
      });
    } catch (e: any) {
      console.warn("[SYNC_ERR] Schedule checkout sync failed:", e.message);
    }
    // ---------------------------------

    revalidatePath("/home/attendance");
    revalidatePath("/admin/attendance");

    return { success: true, id: Number(record.id) };
  } catch (err) {
    console.error("CheckOut Error:", err);
    return { error: "Failed to check out" };
  }
}

/**
 * AI FACE VERIFICATION
 * Compares current capture with registered face profile
 */
export async function verifyFaceMatch(photoUrl: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: "Keamanan Gagal: API Key Gemini belum dikonfigurasi di server (.env)." };
    }

    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.userId) }
    });

    if (!user) return { error: "User not found" };

    // Zero-Friction First-Time Enrollment
    if (!user.face_reference_url) {
      await prisma.users.update({
        where: { id: parseInt(session.userId) },
        data: { 
          face_reference_url: photoUrl,
          face_verification_enabled: true 
        }
      });
      return { success: true, match: true, confidence: 100, isEnrollment: true };
    }

    if (!user.face_verification_enabled) return { success: true, match: true, confidence: 100 };

    // Fetch images and convert to base64 for Gemini
    const [refImageBase64, currentImageBase64] = await Promise.all([
       imageUrlToBase64(user.face_reference_url),
       imageUrlToBase64(photoUrl)
    ]);

    if (!refImageBase64) {
      return { error: `Gagal memproses foto referensi wajah terdaftar. (URL: ${user.face_reference_url}). Silakan hubungi admin untuk mendaftarkan ulang wajah.` };
    }
    if (!currentImageBase64) {
      return { error: `Gagal memproses foto absensi saat ini. Silakan coba memotret ulang.` };
    }

    const prompt = `
      Act as a high-precision biometric facial recognition auditor for an enterprise attendance system.
      Compare the identity of the person in Image 1 (Authorized Reference) with the person in Image 2 (Current Live Capture).

      EVALUATION GUIDELINES:
      - PRIMARY FOCUS: Bone structure, eye shape, nose bridge, and facial proportions.
      - TOLERANCE: Allow for changes in lighting, background, hair length, facial hair (beard/mustache), and minor skin blemishes.
      - ACCESSORIES: Do not reject if the user is wearing glasses or a mask unless it completely obscures identity.
      - ANTI-SPOOFING: Reject if Image 2 appears to be a photo of a screen, a printed photo, or a digital manipulation.
      - CONFIDENCE: Provide a percentage based on structural similarity.

      OUTPUT FORMAT (JSON ONLY):
      {"match": boolean, "confidence": number (0-100), "reason": "concise technical explanation"}
    `;

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    let aiResult = null;
    let errors: string[] = [];

    for (const modelName of candidateModels) {
      try {
        console.log(`[verifyFaceMatch] Attempting facial comparison with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1" });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: refImageBase64, mimeType: "image/jpeg" } },
          { inlineData: { data: currentImageBase64, mimeType: "image/jpeg" } },
        ]);
        const response = result.response.text();
        const jsonMatch = response.match(/\{.*\}/s);
        if (!jsonMatch) throw new Error("Format respon AI tidak valid.");
        aiResult = JSON.parse(jsonMatch[0]);
        console.log(`[verifyFaceMatch] Success with model: ${modelName}`);
        break;
      } catch (err: any) {
        console.warn(`[verifyFaceMatch] Model ${modelName} failed:`, err.message || err);
        errors.push(`[${modelName}]: ${err.message || String(err)}`);
      }
    }

    if (!aiResult) {
      throw new Error(`Seluruh model AI gagal dipanggil. Detail kesalahan:\n${errors.join("\n")}`);
    }

    if (aiResult.match && aiResult.confidence >= 75) {
       return { success: true, match: true, confidence: aiResult.confidence };
    } else {
       return { 
         success: true, 
         match: false, 
         confidence: aiResult.confidence, 
         reason: aiResult.reason || "Wajah tidak cocok dengan referensi." 
       };
    }

  } catch (err: any) {
    console.error("AI Verification Error:", err);
    return { error: `Keamanan Gagal: ${err.message || err}` };
  }
}

/**
 * Register or update face profile
 */
export async function updateFaceProfile(photoUrl: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    await prisma.users.update({
      where: { id: parseInt(session.userId) },
      data: { face_reference_url: photoUrl }
    });

    return { success: true };
  } catch (err) {
    return { error: "Failed to update profile" };
  }
}

// HELPER: Convert URL to Base64 for Gemini (Optimized for Server-side)
async function imageUrlToBase64(url: string) {
  try {
    const isLocal = url.startsWith('/') || url.includes('localhost') || url.includes('127.0.0.1');
    
    if (isLocal) {
      // Resolve path: /api/assets/attendance/filename.jpg -> public/uploads/attendance/filename.jpg
      const parts = url.split('/');
      const folder = parts[parts.length - 2];
      const filename = parts[parts.length - 1];
      
      const filePath = path.join(process.cwd(), 'public', 'uploads', folder, filename);
      
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        return buffer.toString('base64');
      }

      // Alt path resolution fallback
      const altPath = path.join(__dirname, '..', '..', '..', '..', 'public', 'uploads', folder, filename);
      if (fs.existsSync(altPath)) {
        const buffer = fs.readFileSync(altPath);
        return buffer.toString('base64');
      }
    }

    // Fallback to fetch with absolute URL construction
    let fetchUrl = url;
    if (url.startsWith('/')) {
      try {
        const { headers } = require("next/headers");
        const headersList = await headers();
        const host = headersList.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
        fetchUrl = `${protocol}://${host}${url}`;
      } catch (err) {
        fetchUrl = `http://localhost:3000${url}`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (e: any) {
    console.error("Base64 conversion failed for URL:", url, e.message);
    return null;
  }
}

/**
 * HELPER: Haversine Formula for Geofencing
 * Calculates distance between two points in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * SMART BRIDGE: Synchronize Attendance with Operational Schedules
 */
async function syncAttendanceWithSchedule({ 
  userId, projectId, action, photoUrl, notes 
}: { 
  userId: number; projectId: string; action: "IN" | "OUT"; photoUrl: string; notes?: string;
}) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    // 1. Get User Profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, roles: { select: { role_name: true } } }
    });
    if (!user) return;

    // 2. Find Relevant Schedule for Lanud/Project today
    // Types: DailyLog or Preventive usually represent operational duty
    const relevantSchedule = await prisma.schedules.findFirst({
      where: {
        project_id: BigInt(projectId),
        assignee_id: userId,
        start_at: { gte: startOfDay, lte: endOfDay },
        status: { in: ["Planned", "InProgress"] }
      },
      orderBy: { start_at: 'asc' }
    });

    if (relevantSchedule) {
      // Update Schedule Status
      await prisma.schedules.update({
        where: { id: relevantSchedule.id },
        data: { 
          status: action === "IN" ? "InProgress" : "Completed",
          description: (relevantSchedule.description || "") + 
            `\n[Auto ${action}]: ${user.name} at ${new Date().toLocaleTimeString()} - Notes: ${notes || '-'}`
        }
      });

      // Mark Presence
      if (action === "IN") {
        await (prisma as any).schedule_attendance.create({
          data: {
            schedule_id: relevantSchedule.id,
            name: user.name,
            role: (user.roles as any)?.role_name || "Technical Team",
            is_present: true,
            signature: photoUrl // Store biometric proof in signature field for now
          }
        });
      }
    } else if (action === "IN") {
      // If NO schedule exists but we are at a critical site like LANUD, auto-create a DailyLog
      // LANUD Rusmin Nuryadin ID is 4 (identified from scratch script)
      if (projectId === "4") {
        await prisma.schedules.create({
          data: {
            project_id: BigInt(projectId),
            assignee_id: userId,
            title: `Daily Duty: ${user.name} (Auto-Generated)`,
            description: `Automatic attendance record. Clock-in at ${new Date().toLocaleTimeString()}.`,
            start_at: new Date(),
            end_at: new Date(new Date().getTime() + 8 * 3600000), // Default 8h shift
            type: "DailyLog",
            status: "InProgress"
          }
        });
      }
    }
  } catch (err: any) {
    console.error("[CRITICAL] syncAttendanceWithSchedule error:", err.message);
  } finally {
    try {
       revalidatePath("/admin/schedule");
       if (projectId) revalidatePath(`/w/${projectId}/dashboard/attendance-records`);
    } catch (e) {}
  }
}
