"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

/**
 * Request a password reset link.
 * 1. Checks if user exists.
 * 2. Generates a random token.
 * 3. Hashes the token and stores it in the DB with an expiry.
 * 4. Sends the email.
 */
export async function requestPasswordReset(email: string) {
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    // We return success even if user doesn't exist for security (avoid enumeration)
    if (!user) {
      return { success: "If an account exists with that email, a reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Upsert the reset token for this email
    await prisma.password_reset_tokens.upsert({
      where: { email },
      update: {
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date(),
      },
      create: {
        email,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    await sendPasswordResetEmail(email, user.name, resetToken);

    return { success: "If an account exists with that email, a reset link has been sent." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Failed to process request. Please try again later." };
  }
}

/**
 * Reset the password using a valid token.
 */
export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) return { error: "Token and new password are required" };

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.password_reset_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!resetRecord) {
      return { error: "Invalid or expired reset token" };
    }

    if (resetRecord.expires_at < new Date()) {
      await prisma.password_reset_tokens.delete({ where: { id: resetRecord.id } });
      return { error: "Reset token has expired" };
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.users.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Delete the token
    await prisma.password_reset_tokens.delete({
      where: { id: resetRecord.id },
    });

    return { success: "Password has been successfully reset. You can now login." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
