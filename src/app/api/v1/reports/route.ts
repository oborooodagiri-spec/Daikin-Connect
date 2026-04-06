import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const activities = await prisma.service_activities.findMany({
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        units: true,
        projects: true
      }
    });

    return NextResponse.json({
      success: true,
      data: activities.map(a => ({
        id: a.id,
        type: a.activity_type,
        unit: a.units?.tag_number,
        project: a.projects?.name,
        date: a.created_at,
        has_report: true,
        download_url: `/api/v1/reports/${a.id}/download`
      }))
    });

  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
