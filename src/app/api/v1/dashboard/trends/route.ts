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
    // Replicating Trend Logic from Dashboard Actions
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const reports = await prisma.reports.findMany({
      where: {
        created_at: { gte: sixMonthsAgo }
      },
      select: {
        type: true,
        created_at: true
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = months[d.getMonth()];
      const yearStr = d.getFullYear().toString().slice(-2);
      const label = `${mLabel} '${yearStr}`;
      
      const inMonth = reports.filter(r => 
        r.created_at.getMonth() === d.getMonth() && 
        r.created_at.getFullYear() === d.getFullYear()
      );

      trendData.push({
        month: label,
        audit: inMonth.filter(r => r.type === "Audit").length,
        preventive: inMonth.filter(r => r.type === "Preventive").length,
        corrective: inMonth.filter(r => r.type === "Corrective").length,
      });
    }

    return NextResponse.json({
      success: true,
      data: trendData
    });

  } catch (error) {
    console.error("Trends API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
