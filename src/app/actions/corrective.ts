"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { serializePrisma } from "@/lib/serialize";

export async function createCorrectiveActivity(data: any) {
  try {
    const {
      unit_id,
      inspector_name,
      engineer_note,
      technical_json,
      pdf_report_url,
      photos,
      location,
      unit_tag,
    } = data;

    // Save to service_activities (unified table)
    const newActivity = await prisma.service_activities.create({
      data: {
        unit_id: parseInt(unit_id),
        type: "Corrective",
        service_date: new Date(),
        engineer_note,
        inspector_name,
        technical_json,
        technical_advice: data.recommendation || "",
        location: location || "",
        unit_tag: unit_tag || "",
        pdf_report_url,
      },
    });

    // Also save to legacy corrective table for backwards compatibility
    try {
      await prisma.corrective.create({
        data: {
          unit_id: parseInt(unit_id),
          service_date: new Date(),
          technician_name: inspector_name,
          case_complain: data.case_complain || "",
          root_cause: data.root_cause || "",
          temp_action: data.temp_action || "",
          perm_action: data.perm_action || "",
          recommendation: data.recommendation || "",
          photo_url: pdf_report_url || "",
          status: "Submitted",
        },
      });
    } catch (legacyErr) {
      console.warn("Legacy corrective save skipped:", legacyErr);
    }

    // Save Photos
    if (photos && Array.isArray(photos)) {
      await prisma.activity_photos.createMany({
        data: photos.map((p: any) => ({
          activity_id: newActivity.id,
          type: "CORRECTIVE",
          photo_url: p.photo_url,
          description: p.description || "Corrective Documentation",
        })),
      });
    }

    // Update unit status to On_Progress
    try {
      await prisma.units.update({
        where: { id: parseInt(unit_id) },
        data: { status: "On_Progress" as any },
      });
    } catch (statusErr) {
      console.warn("Unit status update skipped:", statusErr);
    }

    revalidatePath("/dashboard", "layout");

    return serializePrisma({ success: true, id: newActivity.id });
  } catch (error: any) {
    console.error("Corrective DB Save Error:", error);
    return { success: false, error: error.message };
  }
}
