import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client_v2";
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
    const complaints = await prisma.complaints.findMany({
      include: {
        units: { 
          include: {
            projects: { select: { name: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: complaints.map(c => ({
        id: c.id.toString(),
        title: c.customer_name || "Untitled Complaint",
        description: c.description,
        status: c.status,
        priority: "Medium",
        projectName: c.units?.projects?.name || "General",
        unitTag: c.units?.tag_number,
        createdAt: c.created_at.toISOString()
      }))
    });

  } catch (error) {
    console.error("Complaints API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
