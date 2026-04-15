import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Enterprise Audit Logging Utility
 * Records user actions for compliance and security forensics.
 */
export async function recordAuditLog({
  userId,
  action,
  targetType,
  targetId,
  details
}: {
  userId?: number;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}) {
  try {
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    await prisma.audit_logs.create({
      data: {
        user_id: userId,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });
  } catch (error) {
    console.error("Audit Logging Error:", error);
    // Suppress error to avoid blocking main application logic
  }
}

/**
 * Brute Force Protection (Rate Limiting)
 * Checks if a user or IP is currently locked out.
 */
export async function checkRateLimit(email: string) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { failed_login_attempts: true, locked_until: true }
  });

  if (!user) return { allowed: true };

  const now = new Date();
  if (user.locked_until && user.locked_until > now) {
    const minutesLeft = Math.ceil((user.locked_until.getTime() - now.getTime()) / 60000);
    return { 
      allowed: false, 
      error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      lockedUntil: user.locked_until
    };
  }

  return { allowed: true };
}

/**
 * Handle Failed Login Logic
 * Increments fail count and triggers lockout if necessary.
 */
export async function handleFailedLogin(email: string) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return;

  const newCount = user.failed_login_attempts + 1;
  let lockedUntil = null;

  // Lockout after 5 failed attempts
  if (newCount >= 5) {
    lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout
  }

  await prisma.users.update({
    where: { email },
    data: {
      failed_login_attempts: newCount,
      locked_until: lockedUntil
    }
  });

  await recordAuditLog({
    userId: user.id,
    action: "LOGIN_FAILED",
    details: `Failed attempt #${newCount}. ${lockedUntil ? "Account Locked for 15m." : ""}`
  });
}

/**
 * Reset Login Fail Count
 */
export async function resetLoginFails(email: string) {
  await prisma.users.update({
    where: { email },
    data: {
      failed_login_attempts: 0,
      locked_until: null
    }
  });
}
