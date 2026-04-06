import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Auth helper
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

export async function GET(
  req: NextRequest,
  { params }: { params: { tag: string } }
) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tag } = params;

  try {
    const unit = await prisma.units.findFirst({
      where: { tag_number: tag },
      include: {
        projects: {
          include: { customers: true }
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Fetch recent history
    const history = await prisma.service_activities.findMany({
      where: { unit_id: unit.id },
      orderBy: { created_at: "desc" },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        id: unit.id,
        tag_number: unit.tag_number,
        model_number: unit.model_number,
        serial_number: unit.serial_number,
        status: unit.status,
        area: unit.area,
        location_detail: unit.location_detail,
        project_name: unit.projects?.name,
        customer_name: unit.projects?.customers?.name,
        history: history.map(h => ({
          id: h.id,
          activity_type: h.activity_type,
          date: h.created_at,
          summary: h.summary
        }))
      }
    });

  } catch (error) {
    console.error("QR Scan API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
