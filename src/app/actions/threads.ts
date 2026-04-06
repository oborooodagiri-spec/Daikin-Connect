"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { revalidatePath } from "next/cache";
import { notifyThreadParticipants } from "@/lib/push";

/**
 * 1. GET ALL MESSAGES FOR A THREAD (Optimized)
 */
export async function getThreadMessages(scheduleId: string | number) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const id = typeof scheduleId === 'string' ? BigInt(scheduleId) : BigInt(scheduleId);
    
    // First, ensure legacy data is migrated for this thread
    await migrateLegacyData(id);

    const messages = await prisma.schedule_messages.findMany({
      where: { schedule_id: id },
      include: {
        users: {
          select: {
            name: true,
            user_roles: { include: { roles: { select: { role_name: true } } } }
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    return serializePrisma({
      success: true,
      data: messages.map((m: any) => ({
        id: m.id.toString(),
        userId: m.user_id,
        userName: m.is_system ? "System" : (m.users?.name || "Unknown"),
        userRole: m.is_system ? "SYSTEM" : (m.users?.user_roles?.[0]?.roles?.role_name || "Guest"),
        message: m.message,
        attachments: m.attachments ? JSON.parse(m.attachments) : [],
        isSystem: m.is_system,
        systemType: m.system_type,
        createdAt: m.created_at
      }))
    });
  } catch (error) {
    console.error("Fetch thread messages error:", error);
    return { error: "Failed to fetch discussion thread." };
  }
}

/**
 * 2. POST NEW MESSAGE
 */
export async function postChatMessage(scheduleId: string | number, message: string, photos: string[] = []) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const id = typeof scheduleId === 'string' ? BigInt(scheduleId) : BigInt(scheduleId);
    const userId = parseInt(session.userId);
    
    const newMessage = await prisma.schedule_messages.create({
      data: {
        schedule_id: id,
        user_id: userId,
        message: message.trim(),
        attachments: photos.length > 0 ? JSON.stringify(photos) : null,
        is_system: false
      }
    });

    // TRIGGER PUSH NOTIFICATION (Real-time Phase 2)
    await notifyThreadParticipants(scheduleId, userId, message.trim());

    revalidatePath("/dashboard/schedules");
    return { success: true, id: newMessage.id.toString() };
  } catch (error) {
    console.error("Post chat error:", error);
    return { error: "Failed to send message." };
  }
}

/**
 * 3. MIGRATE LEGACY DATA (MOM & Attendance)
 */
async function migrateLegacyData(scheduleId: bigint) {
  try {
    const hasMigration = await prisma.schedule_messages.findFirst({
      where: { schedule_id: scheduleId, is_system: true }
    });
    
    if (hasMigration) return;

    const [mom, attendance] = await Promise.all([
      prisma.schedule_mom.findFirst({ where: { schedule_id: scheduleId } }),
      prisma.schedule_attendance.findMany({ where: { schedule_id: scheduleId } })
    ]);

    if (mom && mom.content) {
      await prisma.schedule_messages.create({
        data: {
          schedule_id: scheduleId,
          message: mom.content,
          is_system: true,
          system_type: "MOM",
          created_at: mom.updated_at
        }
      });
    }

    if (attendance.length > 0) {
      const summary = attendance.map((a: any) => `- ${a.name} (${a.role || 'Staff'}): ${a.is_present ? 'PRESENT' : 'ABSENT'}`).join("\n");
      await prisma.schedule_messages.create({
        data: {
          schedule_id: scheduleId,
          message: `### Meeting Attendance Summary\n${summary}`,
          is_system: true,
          system_type: "ATTENDANCE",
          created_at: attendance[0].created_at
        }
      });
    }
  } catch (error) {
    console.warn("Migration warning for schedule", scheduleId.toString(), error);
  }
}
