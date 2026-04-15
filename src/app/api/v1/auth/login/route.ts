import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client_v2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { checkRateLimit, handleFailedLogin, resetLoginFails, recordAuditLog } from "@/lib/security";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_fallback_secret";

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

export async function POST(req: NextRequest) {
  try {
    const { email, password, otpCode, is2fVerification } = await req.json();

    if (!email || (!password && !otpCode)) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // 1. Check Rate Limit / Lockout
    const rateLimit = await checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: { include: { roles: true } }
      }
    });

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Handle 2FA Verification Step
    if (is2fVerification && otpCode) {
      if (user.otp_code !== otpCode || !user.otp_expiry || user.otp_expiry < new Date()) {
        await recordAuditLog({ userId: user.id, action: "2FA_FAILED", details: "Invalid or expired OTP" });
        return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
      }

      // Success - Clear OTP and Proceed to Login
      await prisma.users.update({
        where: { id: user.id },
        data: { otp_code: null, otp_expiry: null }
      });
      
      await recordAuditLog({ userId: user.id, action: "2FA_SUCCESS" });
    } 
    else {
      // 3. Initial Password Check
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await handleFailedLogin(email);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Check if 2FA is required
      if (user.two_factor_enabled) {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.users.update({
          where: { id: user.id },
          data: { otp_code: generatedOtp, otp_expiry: expiry }
        });

        // Send Email
        try {
          await transporter.sendMail({
            from: '"Daikin Connect Security" <no-reply@daikin-connect.com>',
            to: user.email,
            subject: 'Security Verification Code',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #003366;">
                <h2>Security Verification</h2>
                <p>Your login verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; background: #f0f9ff; padding: 20px; display: inline-block; border-radius: 12px; letter-spacing: 5px;">
                  ${generatedOtp}
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #64748b;">This code is valid for 10 minutes. If you did not request this, please change your password immediately.</p>
              </div>
            `
          });
        } catch (mailError) {
          console.error("Mail Delivery Failed:", mailError);
        }

        await recordAuditLog({ userId: user.id, action: "2FA_CHALLENGE", details: "OTP Sent to email" });
        return NextResponse.json({ requires2f: true, message: "Verification code sent to your email" });
      }
    }

    // 4. Final Success - Issue Tokens (Session Rotation)
    await resetLoginFails(email);
    
    const roles = user.user_roles.map(ur => ur.roles.role_name);
    const primaryRole = roles.includes("Admin") ? "Admin" : (roles[0] || "User");
    const isInternal = primaryRole === "Admin" || primaryRole === "Internal" || primaryRole === "Technician";

    // Access Token (Short-lived: 1 hour)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: primaryRole, isInternal }, 
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Refresh Token (Long-lived: 30 days)
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "30d" });

    // Store Refresh Token in DB for rotation/revocation
    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: refreshToken, // ideally hash this, but for rotation comparison we use it
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await recordAuditLog({ userId: user.id, action: "LOGIN_SUCCESS", details: `Role: ${primaryRole}` });

    return NextResponse.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        company: user.company_name,
        isInternal
      }
    });

  } catch (error) {
    console.error("Security Authentication Error:", error);
    return NextResponse.json({ error: "System security error" }, { status: 500 });
  }
}
