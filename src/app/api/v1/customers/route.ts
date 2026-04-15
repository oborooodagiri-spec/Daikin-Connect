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
    const customers = await prisma.customers.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: customers.map(c => ({
        id: c.id,
        name: c.name,
        type: c.customer_type,
        pic: c.pic_name,
        phone: c.pic_phone,
        address: c.address,
        project_count: c._count.projects
      }))
    });

  } catch (error) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
