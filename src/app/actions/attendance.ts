"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getActiveAttendance(projectId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRecord = await (prisma as any).vendor_attendance.findFirst({
      where: {
        user_id: parseInt(session.userId),
        project_id: BigInt(projectId),
        check_in_time: {
          gte: today,
        },
      },
      orderBy: {
        check_in_time: "desc",
      },
    });

    if (!activeRecord) {
      return { data: null };
    }

    // Convert BigInt for JSON serialization
    return {
      data: {
        ...activeRecord,
        id: Number(activeRecord.id),
        project_id: Number(activeRecord.project_id),
      },
    };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { error: "Failed to fetch attendance record" };
  }
}

export async function submitCheckIn(data: {
  projectId: string;
  lat: number;
  long: number;
  photoUrl: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const record = await (prisma as any).vendor_attendance.create({
      data: {
        user_id: parseInt(session.userId),
        project_id: BigInt(data.projectId),
        check_in_time: new Date(), // Enforced Server Time
        check_in_lat: data.lat,
        check_in_long: data.long,
        check_in_photo: data.photoUrl,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/client/dashboard");
    
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
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const record = await (prisma as any).vendor_attendance.update({
      where: { id: data.attendanceId },
      data: {
        check_out_time: new Date(), // Enforced Server Time
        check_out_lat: data.lat,
        check_out_long: data.long,
        check_out_photo: data.photoUrl,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/client/dashboard");

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
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.userId) }
    });

    if (!user) return { error: "User not found" };
    if (!user.face_verification_enabled) return { success: true, match: true, confidence: 100 };
    if (!user.face_reference_url) return { error: "IDENTITY_NOT_REGISTERED" };

    // Fetch images and convert to base64 for Gemini
    const [refImageBase64, currentImageBase64] = await Promise.all([
       imageUrlToBase64(user.face_reference_url),
       imageUrlToBase64(photoUrl)
    ]);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Act as a high-security facial recognition system.
      Compare the person in Image 1 (Registered Identity) with Image 2 (Current Attendance Snapshot).
      
      RULES:
      - Ignore differences in lighting, background, or camera quality.
      - Ignore hair style changes if facial features match.
      - Reject if it is a photo of a screen or paper (spoofing).
      - Return ONLY a JSON object: {"match": boolean, "confidence": number (0-100), "reason": "short explanation"}.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: refImageBase64!, mimeType: "image/jpeg" } },
      { inlineData: { data: currentImageBase64!, mimeType: "image/jpeg" } },
    ]);

    const response = result.response.text();
    const jsonMatch = response.match(/\{.*\}/s);
    
    if (!jsonMatch) throw new Error("Invalid AI response");
    const aiResult = JSON.parse(jsonMatch[0]);

    if (aiResult.match && aiResult.confidence >= 85) {
       return { success: true, match: true, confidence: aiResult.confidence };
    } else {
       return { 
         success: true, 
         match: false, 
         confidence: aiResult.confidence, 
         reason: aiResult.reason || "Face mismatch detected." 
       };
    }

  } catch (err) {
    console.error("AI Verification Error:", err);
    return { error: "Security check failed. Please ensure good lighting." };
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

// HELPER: Convert URL to Base64 for Gemini
async function imageUrlToBase64(url: string) {
  try {
    const isAbsolute = url.startsWith('http');
    const fullUrl = isAbsolute ? url : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${url}`;
    
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (e) {
    console.error("Base64 conversion failed", e);
    return null;
  }
}

