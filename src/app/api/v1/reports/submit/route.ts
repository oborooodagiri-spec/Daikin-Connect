import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const unitId = formData.get("unit_id") as string;
    const type = formData.get("type") as string;
    const summary = formData.get("summary") as string;
    const status = formData.get("status") as string; // Target unit status (Normal/Problem)
    const photos = formData.getAll("photos") as File[];

    if (!unitId || !type || !summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Save Activity
    const activityType = type === "Corrective" ? "Corrective" : (type === "Preventive" ? "Preventive" : "Audit");
    const idNum = parseInt(unitId);

    const activity = await prisma.service_activities.create({
      data: {
        unit_id: idNum,
        type: activityType,
        engineer_note: summary,
        created_at: new Date(),
        // We'll link photos later or store them in a related table if exists
      }
    });

    // 2. Update Unit Status
    if (status) {
      await prisma.units.update({
        where: { id: idNum },
        data: { status: status as any }
      });
    }

    // 3. Process Photos
    const uploadedFilePaths: string[] = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads", "mobile_reports");
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${photo.name}`;
      const filePath = path.join(uploadDir, filename);
      
      await writeFile(filePath, buffer);
      uploadedFilePaths.push(`/uploads/mobile_reports/${filename}`);
    }

    // (Opt) Store photo paths in activity if your schema supports it
    // For now we'll just log them or return them to mobile
    
    return NextResponse.json({
      success: true,
      activity_id: activity.id.toString(),
      message: "Service record saved successfully",
      photos: uploadedFilePaths
    });

  } catch (error) {
    console.error("Report Submit API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
