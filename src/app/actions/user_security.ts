"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";

/**
 * Fetch current user's security profile and recent audit logs
 */
export async function getMySecurityProfile() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        two_factor_enabled: true,
        company_name: true,
        is_active: true,
        audit_logs: {
          take: 10,
          orderBy: { created_at: "desc" }
        }
      }
    });

    if (!user) return { error: "User not found" };

    return { 
      success: true, 
      data: serializePrisma(user) 
    };
  } catch (error) {
    console.error("Security Profile Fetch Error:", error);
    return { error: "Failed to fetch security data" };
  }
}
