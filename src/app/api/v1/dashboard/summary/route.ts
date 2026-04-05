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
    const [auditCount, preventiveCount, correctiveCount, totalUnits] = await Promise.all([
      prisma.service_activities.count({ where: { type: "Audit" } }),
      prisma.service_activities.count({ where: { type: "Preventive" } }),
      prisma.service_activities.count({ where: { type: "Corrective" } }),
      prisma.units.count()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          audit: auditCount,
          preventive: preventiveCount,
          corrective: correctiveCount
        },
        total_assets: totalUnits,
        server_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
