"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";

/**
 * Register or update a Web Push / FCM token for the current user
 */
export async function registerPushToken(token: string, platform: string = "web") {
  const session = await getSession();
  if (!session) return { error: "Log in to register notifications." };

  try {
    const userId = parseInt(session.userId);

    // Upsert token for this user
    await prisma.user_push_tokens.upsert({
      where: { token: token },
      update: { user_id: userId, platform: platform }, // Re-assign if token exists but user changed
      create: {
        token: token,
        user_id: userId,
        platform: platform
      }
    });

    console.log(`[NOTIF_ACTION] Token registered for user ${userId} on ${platform}: ${token.substring(0, 15)}...`);
    return { success: true };
  } catch (error: any) {
    console.error("[NOTIF_ACTION] Token registration failed:", error?.message || error);
    return { error: "Failed to sync notification token." };
  }
}

/**
 * Cleanup/Unregister token (useful for logout)
 */
export async function unregisterPushToken(token: string) {
  try {
    await prisma.user_push_tokens.deleteMany({
      where: { token: token }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to unregister notification token" };
  }
}
