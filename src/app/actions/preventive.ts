"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createPreventiveActivity(data: any) {
  try {
    const {
      unit_id,
      inspector_name,
      engineer_note,       // Technical Advice
      technical_json,      // Stringified JSON of all checksheet data
      pdf_report_url,
      photos,              // Array of { photo_url, description }
      // Header fields stored in technical_json:
      // project, date, model, so_number, serial_number, visit,
      // unit_number, nominal_capacity, location, team_opt
      // scope_of_work rows, parts info, etc.
    } = data;

    const newActivity = await prisma.service_activities.create({
      data: {
        unit_id: parseInt(unit_id),
        type: "Preventive",
        service_date: new Date(),
        engineer_note,
        inspector_name,
        technical_json,
        technical_advice: engineer_note,
        location: data.location || "",
        unit_tag: data.unit_tag || "",
        pdf_report_url
      }
    });

    // Save Photos
    if (photos && Array.isArray(photos)) {
      await prisma.activity_photos.createMany({
        data: photos.map((p: any) => ({
          activity_id: newActivity.id,
          type: "PREVENTIVE",
          photo_url: p.photo_url,
          description: p.description || "Preventive Maintenance Documentation"
        }))
      });
    }

    return { success: true, id: newActivity.id };
  } catch (error: any) {
    console.error("Preventive DB Save Error:", error);
    return { success: false, error: error.message };
  }
}
