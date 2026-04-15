"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendRegistrationReceivedEmail } from "@/lib/mail";
import { serializePrisma } from "@/lib/serialize";
import { checkRateLimit, handleFailedLogin, resetLoginFails, recordAuditLog } from "@/lib/security";
import nodemailer from "nodemailer";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "daikin-connect-secret-key-change-in-production"
);

// SMTP Configuration from test-email.js
const transportConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@daikin-connect.com',
    pass: 'Doda4244@#',
  },
  tls: { rejectUnauthorized: false }
};

const transporter = nodemailer.createTransport(transportConfig);

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
  const otpCode = formData.get("otpCode") as string;
  const is2fVerification = formData.get("is2fVerification") === "true";
  const trustDevice = formData.get("trustDevice") === "true";

  if (!email || (!password && !otpCode)) {
    return { error: "Required fields missing" };
  }

  // 1. Check Rate Limit / Lockout
  const rateLimit = await checkRateLimit(email);
  if (!rateLimit.allowed) {
    return { error: rateLimit.error };
  }

  let token: string | null = null;
  let user: any = null;

  try {
    user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: { include: { roles: true } }
      }
    });

    if (!user || !user.is_active) {
      return { error: "Invalid email or password" };
    }

    // 2. Handle 2FA Verification Step
    if (is2fVerification && otpCode) {
      if (user.otp_code !== otpCode || !user.otp_expiry || user.otp_expiry < new Date()) {
        await recordAuditLog({ userId: user.id, action: "2FA_FAILED_WEB", details: "Invalid or expired OTP" });
        return { error: "Invalid or expired verification code" };
      }

      // Success - Clear OTP and Proceed
      await prisma.users.update({
        where: { id: user.id },
        data: { otp_code: null, otp_expiry: null }
      });

      if (trustDevice) {
        await setTrustedDevice(email);
      }

      await recordAuditLog({ userId: user.id, action: "2FA_SUCCESS_WEB" });
    } 
    else {
      // 3. Initial Password Check
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        await handleFailedLogin(email);
        return { error: "Invalid email or password" };
      }

      // Check if 2FA is required AND if device is NOT trusted
      const trusted = await isTrustedDevice(email);
      if (user.two_factor_enabled && !trusted) {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.users.update({
          where: { id: user.id },
          data: { otp_code: generatedOtp, otp_expiry: expiry }
        });

        // Send Email with Timeout Resilience
        try {
          const mailPromise = transporter.sendMail({
            from: '"Daikin Connect Security" <no-reply@daikin-connect.com>',
            to: user.email,
            subject: 'Security Verification Code',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #003366;">
                <h2>Web Access Security</h2>
                <p>Your login verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; background: #f0f9ff; padding: 20px; display: inline-block; border-radius: 12px; letter-spacing: 5px;">
                  ${generatedOtp}
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Valid for 10 minutes.</p>
              </div>
            `
          });
          
          // Don't wait forever for the mail server
          await Promise.race([
            mailPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Mail timeout")), 8000))
          ]);
        } catch (mailError) {
          console.error("Mail Delivery Failed or Timed Out:", mailError);
          // We still proceed so the user gets the chance to enter a code if it actually arrived late
        }

        await recordAuditLog({ userId: user.id, action: "2FA_CHALLENGE_WEB" });
        return { requires2f: true };
      }
    }

    // 4. Final Success - Create JWT session token
    await resetLoginFails(email);
    token = await new SignJWT({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Increased to 24h for professional standard
      .sign(JWT_SECRET);

    await recordAuditLog({ userId: user.id, action: "LOGIN_SUCCESS_WEB" });

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
      const roles = userRoleData.user_roles.map(ur => ur.roles.role_name.toLowerCase().trim());
      isInternal = roles.some(r => 
        ["admin", "super", "internal", "engineer", "sales", "management", "administrator"].some(keyword => r.includes(keyword))
      );
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

// Security: Trusted Device Logic (30 days)
const TRUSTED_DEVICE_SECRET = new TextEncoder().encode(
  process.env.TRUSTED_DEVICE_SECRET || "daikin-trusted-device-secret-key-change-me"
);

export async function setTrustedDevice(email: string) {
  const cookieStore = await cookies();
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(TRUSTED_DEVICE_SECRET);

  cookieStore.set("trusted_device", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function isTrustedDevice(email: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("trusted_device")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, TRUSTED_DEVICE_SECRET);
    return payload.email === email;
  } catch {
    return false;
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
    
    // Fetch latest user data including roles from both sources (link table and direct column)
    const user = await prisma.users.findUnique({
      where: { id: parseInt(payload.userId as string, 10) },
      include: {
        roles: true,
        user_roles: {
          include: { roles: true }
        }
      }
    });

    if (!user) return null;

    // Get roles from the link table
    const rolesFromLinkTable = user.user_roles.map(ur => ur.roles.role_name);
    
    // Get role from the direct column
    const roleFromDirectColumn = user.roles?.role_name;
    
    // Merge and deduplicate roles
    const roles = Array.from(new Set([
      ...(roleFromDirectColumn ? [roleFromDirectColumn] : []),
      ...rolesFromLinkTable
    ]));

    // Determine internal/external based on roles
    const normalizedRoles = roles.map(r => r.toLowerCase().trim());
    const isInternal = normalizedRoles.some(r => 
      ["admin", "super", "internal", "engineer", "sales", "management", "administrator"].some(keyword => r.includes(keyword))
    );

    return serializePrisma({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      roles: roles,
      isInternal: isInternal,
      attendance_enabled: user.attendance_enabled
    });
  } catch {
    return null;
  }
}


