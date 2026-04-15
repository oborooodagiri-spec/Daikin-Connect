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

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    let whereClause: any = {};
    
    if (projectId) whereClause.project_id = BigInt(projectId);
    
    if (month && year) {
        const m = parseInt(month);
        const y = parseInt(year);
        whereClause.start_at = {
            gte: new Date(y, m, 1),
            lte: new Date(y, m + 1, 0, 23, 59, 59)
        };
    }

    // Role-based filtering for external users
    if (!user.isInternal) {
        const userProjects = await prisma.user_project_access.findMany({
            where: { user_id: parseInt(user.userId) },
            select: { project_id: true }
        });
        const projectIds = userProjects.map(up => up.project_id);
        
        if (whereClause.project_id) {
            if (!projectIds.includes(whereClause.project_id)) {
                return NextResponse.json({ success: true, data: [] });
            }
        } else {
            whereClause.project_id = { in: projectIds };
        }
    }

    const schedules = await prisma.schedules.findMany({
      where: whereClause,
      include: {
        projects: { select: { name: true } },
        units: { select: { tag_number: true, room_tenant: true, model: true } },
        users: { select: { name: true } }
      },
      orderBy: { start_at: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: schedules.map((s: any) => ({
        id: s.id.toString(),
        title: s.title,
        description: s.description,
        type: s.type,
        status: s.status,
        start_at: s.start_at.toISOString(),
        end_at: s.end_at.toISOString(),
        projectName: s.projects?.name,
        unitTag: s.units?.tag_number,
        unitRoom: s.units?.room_tenant,
        unitModel: s.units?.model,
        assigneeName: s.users?.name || "Unassigned"
      }))
    });

  } catch (error) {
    console.error("Schedules API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, status } = await req.json();
        if (!id || !status) return NextResponse.json({ error: "ID and Status required" }, { status: 400 });

        const updated = await prisma.schedules.update({
            where: { id: BigInt(id) },
            data: { status: status }
        });

        return NextResponse.json({ success: true, data: { id: updated.id.toString(), status: updated.status } });
    } catch (error) {
        console.error("Schedules PATCH Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
