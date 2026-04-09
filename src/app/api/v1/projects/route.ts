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

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  try {
    const projects = await (prisma.projects as any).findMany({
      where: customerId ? { customer_id: parseInt(customerId) } : {},
      include: {
        customers: {
          select: { name: true }
        },
        _count: {
          select: { units: true }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: projects.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        code: p.code,
        status: p.status,
        customer_id: p.customer_id,
        customer_name: p.customers?.name,
        unit_count: p._count.units
      }))
    });

  } catch (error) {
    console.error("Projects API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
