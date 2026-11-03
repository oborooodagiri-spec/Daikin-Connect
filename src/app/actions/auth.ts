"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendRegistrationReceivedEmail, sendOtpEmail } from "@/lib/mail";
import { serializePrisma } from "@/lib/serialize";
import { checkRateLimit, handleFailedLogin, resetLoginFails, recordAuditLog } from "@/lib/security";

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);



async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
  
  // Auto-pass in development if using testing secret or if we want to facilitate local testing
  if (process.env.NODE_ENV === 'development') {
    console.log("Development mode: skipping or using testing Turnstile verification");
    return true;
  }

  // If using Cloudflare's official testing keys, treat as passed
  if (secretKey === "1x0000000000000000000000000000000AA") {
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const outcome = await res.json();
    return outcome.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

// Normalize Indonesian phone numbers to WhatsApp format (62xxxxxxxxxx)
function normalizePhone(raw: string): string | null {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.substring(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (!/^628\d{7,12}$/.test(digits)) return null;
  return digits;
}

// Simple in-memory per-IP throttle for registration (fallback when CAPTCHA can't load)
const registerAttempts = new Map<string, number[]>();
function isRegisterThrottled(ip: string, max = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const hits = (registerAttempts.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  registerAttempts.set(ip, hits);
  return hits.length > max;
}

export async function register(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const companyName = (formData.get("company_name") as string)?.trim();
  const rawPhone = formData.get("phone") as string;
  const cfToken = formData.get("cf-turnstile-response") as string;
  const honeypot = formData.get("website") as string;

  // Bots usually fill every field – pretend success and drop silently
  if (honeypot) {
    return { success: "Request sent! Please wait for admin approval." };
  }

  if (!name || !email || !password || !companyName || !rawPhone) {
    return { error: "Semua kolom wajib diisi (termasuk No. HP)." };
  }

  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { error: "Format No. HP tidak valid. Contoh: 081234567890" };
  }

  // CAPTCHA: verify when a token is present. If the widget failed to load on the
  // client (e.g. blocked network / mobile browser), fall back to IP throttling +
  // honeypot. New accounts remain inactive until an admin approves them.
  if (cfToken) {
    const isHuman = await verifyTurnstile(cfToken);
    if (!isHuman) return { error: "Verifikasi keamanan gagal. Silakan muat ulang halaman." };
  } else {
    const hdrs = await headers();
    const ip = (hdrs.get("x-forwarded-for") || "").split(",")[0].trim() || hdrs.get("x-real-ip") || "unknown";
    if (isRegisterThrottled(ip)) {
      return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };
    }
    console.warn(`[register] No Turnstile token (status=${formData.get("cf-turnstile-status")}) from IP ${ip}, email ${email}`);
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
          phone,
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
        
        // Handle OTP Method Selection
        const otpMethod = formData.get("otpMethod") as string;
        
        if (!otpMethod) {
          // Tell the UI to ask for method selection (Email or WA)
          return { requires2fMethodSelection: true, hasPhone: !!user.phone, phoneMasked: user.phone ? user.phone.replace(/(\d{4})\d{4,}(\d{2})/, "$1****$2") : "" };
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.users.update({
          where: { id: user.id },
          data: { otp_code: generatedOtp, otp_expiry: expiry }
        });

        if (otpMethod === "whatsapp" && user.phone) {
          // Send OTP via WhatsApp Template to bypass 24h Meta restriction
          const { sendWhatsAppAuthTemplate } = await import('@/lib/whatsapp');
          sendWhatsAppAuthTemplate(user.phone, generatedOtp.toString()).catch(e => console.error("OTP WA Error:", e));
        } else {
          // Default: Send OTP Email
          sendOtpEmail(user.email, generatedOtp).catch(e => console.error("OTP Mail Error:", e));
        }

        await recordAuditLog({ userId: user.id, action: "2FA_CHALLENGE_WEB", details: `Method: ${otpMethod}` });
        return { requires2f: true, methodSent: otpMethod };
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

  // All users now go through the /home Personal Hub
  redirect("/home");
}

// Security: Trusted Device Logic (30 days)
if (!process.env.TRUSTED_DEVICE_SECRET) {
  throw new Error("FATAL: TRUSTED_DEVICE_SECRET environment variable is not set.");
}
const TRUSTED_DEVICE_SECRET = new TextEncoder().encode(process.env.TRUSTED_DEVICE_SECRET);

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
      attendance_enabled: user.attendance_enabled,
      pives_scanner_enabled: user.pives_scanner_enabled
    });
  } catch {
    return null;
  }
}


