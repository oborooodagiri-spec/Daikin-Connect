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
  pool: true,
  maxConnections: 3,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  auth: {
    user: 'no-reply@epllink.com',
    pass: process.env.SMTP_PASS || 'Onta12345@',
  },
  tls: { rejectUnauthorized: false }
};

const transporter = nodemailer.createTransport(transportConfig);

async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // Auto-pass in development if using testing secret or if we want to facilitate local testing
  if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: skipping or using testing Turnstile verification");
    return true;
  }

  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not set, skipping verification");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const outcome = await res.json();
    return outcome.success;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

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

import { getVerificationCodeTemplate } from "@/lib/mail-templates";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otpCode = formData.get("otpCode") as string;
  const is2fVerification = formData.get("is2fVerification") === "true";
  const trustDevice = formData.get("trustDevice") === "true";

  const cfToken = formData.get("cf-turnstile-response") as string;

  if (!email || (!password && !otpCode)) {
    return { error: "Required fields missing" };
  }

  // Verify Turnstile on initial login (not needed for 2FA step which already has session)
  if (!is2fVerification && !otpCode) {
    // TEMPORARY BYPASS: If Turnstile is failing to render, we allow login
    // but still verify if a token is actually provided.
    if (cfToken) {
      const isHuman = await verifyTurnstile(cfToken);
      if (!isHuman) return { error: "Security check failed. Please refresh." };
    }
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

        // Send Email detached to prevent UI hanging
        try {
          const mailPromise = transporter.sendMail({
            from: '"EPL Link Security" <no-reply@epllink.com>',
            to: user.email,
            subject: 'Security Verification Code - EPL Link',
            html: getVerificationCodeTemplate(generatedOtp)
          });
          
          // Don't await it so we don't block the UI.
          // In a PM2 long-running Node environment, this will finish in the background.
          mailPromise.catch(e => console.error("Detached Mail Error:", e));
        } catch (mailError) {
          console.error("Mail Dispatch Failed:", mailError);
        }  // We still proceed so the user gets the chance to enter a code if it actually arrived late

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
    return { error: `System Error: ${error?.message || "Unknown error"}` };
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

  // All users now go through the /home Personal Hub
  redirect("/home");
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
    maxAge: 60 * 60 * 24 * 30, // 30 days (1 Month)
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
  const session = await getSession();
  if (session?.userId) {
    await recordAuditLog({ userId: parseInt(session.userId), action: "LOGOUT_WEB" });
  }
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


