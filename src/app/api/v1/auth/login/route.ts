import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: { roles: true }
        }
      }
    });

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Invalid credentials or account inactive" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Determine primary role
    const roles = user.user_roles.map(ur => ur.roles.role_name);
    const primaryRole = roles.includes("Admin") ? "Admin" : (roles[0] || "User");

    // Fetch project access list
    const projectAccess = await prisma.user_project_access.findMany({
      where: { user_id: user.id },
      select: { project_id: true }
    });
    const assignedProjectIds = projectAccess.map(pa => pa.project_id.toString());

    // Create JWT Token
    const isInternal = primaryRole === "Admin" || primaryRole === "Internal" || primaryRole === "Technician";
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        role: primaryRole,
        isInternal,
        assignedProjectIds
      }, 
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      token,
      required_version: "V1.9.0",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        company: user.company_name,
        isInternal,
        assignedProjectIds
      }
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
