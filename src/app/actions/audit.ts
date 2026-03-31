"use server";

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function createAuditActivity(data: any) {
  try {
    // We expect the frontend to pass us exactly what the schema needs
    // Plus photos and velocity points as arrays

    const {
      unit_id,
      engineer_note,
      inspector_name,
      technical_json, // Stringified JSON of accessories
      technical_advice,
      location,
      unit_tag,
      design_airflow,
      design_cooling_capacity,
      entering_db,
      entering_wb,
      entering_rh,
      leaving_db,
      leaving_wb,
      leaving_rh,
      room_db,
      room_wb,
      room_rh,
      chws_temp,
      chwr_temp,
      chws_press,
      chwr_press,
      water_flow_gpm,
      amp_r,
      amp_s,
      amp_t,
      volt_rs,
      volt_st,
      volt_rt,
      volt_ln,
      pdf_report_url,
      
      // Related Data
      velocity_points, // Array of { point_number, velocity_value }
      photos // Array of { photo_url, description } 
    } = data;

    const newActivity = await prisma.service_activities.create({
      data: {
        unit_id: parseInt(unit_id),
        type: "Audit",
        service_date: new Date(),
        engineer_note,
        inspector_name,
        technical_json,
        technical_advice,
        location,
        unit_tag,
        
        design_airflow: parseFloat(design_airflow) || 0,
        design_cooling_capacity: parseFloat(design_cooling_capacity) || 0,
        
        entering_db: parseFloat(entering_db) || 0,
        entering_wb: parseFloat(entering_wb) || 0,
        entering_rh: parseFloat(entering_rh) || 0,
        leaving_db: parseFloat(leaving_db) || 0,
        leaving_wb: parseFloat(leaving_wb) || 0,
        leaving_rh: parseFloat(leaving_rh) || 0,
        room_db: parseFloat(room_db) || 0,
        room_wb: parseFloat(room_wb) || 0,
        room_rh: parseFloat(room_rh) || 0,
        
        chws_temp: parseFloat(chws_temp) || 0,
        chwr_temp: parseFloat(chwr_temp) || 0,
        chws_press: parseFloat(chws_press) || 0,
        chwr_press: parseFloat(chwr_press) || 0,
        water_flow_gpm: parseFloat(water_flow_gpm) || 0,
        
        amp_r: amp_r ? new Decimal(amp_r) : new Decimal(0),
        amp_s: amp_s ? new Decimal(amp_s) : new Decimal(0),
        amp_t: amp_t ? new Decimal(amp_t) : new Decimal(0),
        
        volt_rs: parseInt(volt_rs) || 0,
        volt_st: parseInt(volt_st) || 0,
        volt_rt: parseInt(volt_rt) || 0,
        volt_ln: parseInt(volt_ln) || 0,

        pdf_report_url
      }
    });

    // Save Velocity Points
    if (velocity_points && Array.isArray(velocity_points)) {
      await prisma.audit_velocity_points.createMany({
        data: velocity_points.map((vp: any) => ({
          audit_id: newActivity.id,
          point_number: vp.point_number,
          velocity_value: vp.velocity_value ? new Decimal(vp.velocity_value) : new Decimal(0)
        }))
      });
    }

    // Save Photos
    if (photos && Array.isArray(photos)) {
      await prisma.activity_photos.createMany({
        data: photos.map((p: any) => ({
          activity_id: newActivity.id,
          type: "AUDIT",
          photo_url: p.photo_url,
          description: p.description || ""
        }))
      });
    }

    // No unit update payload needed for now unless we add an explicitly defined column

    return { success: true, id: newActivity.id };
  } catch (error: any) {
    console.error("Audit DB Save Error:", error);
    return { success: false, error: error.message };
  }
}
