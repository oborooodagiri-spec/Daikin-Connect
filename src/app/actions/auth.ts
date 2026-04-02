"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendRegistrationReceivedEmail } from "@/lib/mail";
import { serializePrisma } from "@/lib/serialize";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "daikin-connect-secret-key-change-in-production"
);

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("company_name") as string;

  if (!name || !email || !password || !companyName) {
    return { error: "All fields are required" };
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered. Try logging in or contact support." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          company_name: companyName,
          is_active: false
        } as any,
      });

      // Send initial registration email (Bilingual)
      await sendRegistrationReceivedEmail(email, name);

    return { success: "Request sent! Please wait for admin approval." };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to send request. Please try again." };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let token: string | null = null;

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    if (!user.is_active) {
      return { error: "Account is disabled or pending approval." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid email or password" };
    }

    // Create JWT session token
    token = await new SignJWT({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

  } catch (error: any) {
    console.error("Login error:", error?.message || error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("session", token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  // Role-based redirect
  let isInternal = false;
  try {
    const userRoleData = await prisma.users.findUnique({
      where: { email },
      include: { user_roles: { include: { roles: true } } }
    });
    if (userRoleData) {
      const roles = userRoleData.user_roles.map(ur => ur.roles.role_name.toLowerCase());
      isInternal = roles.some(r => ["super_admin", "admin", "administrator", "internal", "engineer", "sales engineer", "management"].includes(r));
    }
  } catch (e) {
    console.error("Redirect check error:", e);
  }

  if (isInternal) {
    redirect("/dashboard");
  } else {
    redirect("/client/dashboard");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    
    // Fetch latest user data including roles
    const user = await prisma.users.findUnique({
      where: { id: parseInt(payload.userId as string, 10) },
      include: {
        user_roles: {
          include: { roles: true }
        }
      }
    });

    if (!user) return null;

    const roles = user.user_roles.map(ur => ur.roles.role_name);
    // Determine internal/external based on roles
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const isInternal = normalizedRoles.some(r => 
      ["super_admin", "admin", "administrator", "internal", "engineer", "sales engineer", "management"].includes(r)
    );

    return serializePrisma({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      roles: roles,
      isInternal: isInternal
    });
  } catch {
    return null;
  }
}


