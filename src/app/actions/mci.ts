"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";
import { ensureScheduleForActivity } from "./schedules";
import { notifyProjectStakeholders } from "@/lib/push";
import { getSession } from "./auth";
import { recordAuditLog } from "@/lib/security";

export async function createMciActivity(data: any) {
  try {
    const {
      unit_id,
      inspector_name,
      engineer_note,
      technical_json,
      pdf_report_url,
      berita_acara_pdf_url,
      photos,
      reviewer_signature,
      engineer_signer_name
    } = data;

    const newActivity = await prisma.service_activities.create({
      data: {
        unit_id: parseInt(unit_id),
        type: "MCI",
        service_date: new Date(),
        engineer_note,
        inspector_name,
        technical_json,
        technical_advice: engineer_note,
        location: data.location || "",
        unit_tag: data.unit_tag || "",
        pdf_report_url,
        reviewer_signature,
        engineer_signer_name
      }
    });

    // Save Photos & Videos
    if (photos && Array.isArray(photos)) {
      await prisma.activity_photos.createMany({
        data: photos.map((p: any) => ({
          activity_id: newActivity.id,
          type: "MCI",
          media_type: p.media_type || "image",
          photo_url: p.photo_url,
          description: p.description || "MCI Documentation"
        }))
      });
    }

    // Auto Schedule Synchronization
    try {
      await ensureScheduleForActivity(parseInt(unit_id), "MCI" as any, inspector_name);
    } catch (err) {
      console.warn("Auto schedule sync skipped:", err);
    }

    // TRIGGER PUSH NOTIFICATION
    await notifyProjectStakeholders(
      parseInt(unit_id),
      `🛠️ MCI Completed: ${data.unit_tag}`,
      `Mandatory Check Inspection for ${data.unit_tag} submitted by ${inspector_name}.`,
      `/dashboard/units/${unit_id}`
    );

    const session = await getSession();
    if (session && "userId" in session && session.userId) {
      await recordAuditLog({
        userId: parseInt(session.userId as string),
        action: "REPORT_SUBMIT",
        targetType: "MCI",
        targetId: newActivity.id.toString(),
        details: `Submitted MCI Report for ${data.unit_tag}`
      });
    }

    return serializePrisma({ success: true, id: newActivity.id });
  } catch (error: any) {
    console.error("MCI DB Save Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMciActivity(id: number, data: any) {
  try {
    const {
      inspector_name,
      engineer_note,
      technical_json,
      pdf_report_url,
      berita_acara_pdf_url,
      photos,
      reviewer_signature,
      engineer_signer_name
    } = data;

    const updatedActivity = await prisma.service_activities.update({
      where: { id },
      data: {
        engineer_note,
        inspector_name,
        technical_json,
        technical_advice: engineer_note,
        pdf_report_url,
        reviewer_signature,
        engineer_signer_name
      }
    });

    // Refresh Media Photos
    if (photos && Array.isArray(photos)) {
      await (prisma as any).activity_photos.deleteMany({ where: { activity_id: id } });
      await prisma.activity_photos.createMany({
        data: photos.map((p: any) => ({
          activity_id: id,
          type: "MCI",
          media_type: p.media_type || "image",
          photo_url: p.photo_url,
          description: p.description || "MCI Documentation"
        }))
      });
    }

    const session = await getSession();
    if (session && "userId" in session && session.userId) {
      await recordAuditLog({
        userId: parseInt(session.userId as string),
        action: "REPORT_UPDATE",
        targetType: "MCI",
        targetId: id.toString(),
        details: `Updated MCI Report`
      });
    }

    return serializePrisma({ success: true, id: updatedActivity.id });
  } catch (error: any) {
    console.error("MCI Update Error:", error);
    return { success: false, error: error.message };
  }
}
