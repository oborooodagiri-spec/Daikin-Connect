import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, company_name } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (inactive by default for admin review)
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company_name: company_name || "Guest Partner",
        is_active: false // Needs admin approval like web
      }
    });

    return NextResponse.json({
      success: true,
      message: "Request access sent. Waiting for Admin approval.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
