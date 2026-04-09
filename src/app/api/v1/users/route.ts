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
    const users = await prisma.users.findMany({
      include: {
        roles: { select: { role_name: true } }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone_number,
        role: u.roles?.role_name || "Guest",
        status: u.is_active ? "Active" : "Inactive"
      }))
    });

  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
