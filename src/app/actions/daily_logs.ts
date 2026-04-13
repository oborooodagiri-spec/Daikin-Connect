"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";

/**
 * Check if a log already exists for today for a specific unit
 */
export async function checkDailyLogStatus(unitId: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.daily_ops_logs.findFirst({
      where: {
        unit_id: unitId,
        service_date: today
      },
      orderBy: { created_at: 'desc' }
    });

    if (existing) {
      return serializePrisma({
        success: true,
        exists: true,
        data: existing
      });
    }

    return { success: true, exists: false };
  } catch (error) {
    console.error("Check daily log error:", error);
    return { error: "Failed to check log status" };
  }
}

/**
 * Submit a new Daily Operational Log
 */
export async function submitDailyLog(unitId: number, data: any) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Final duplicate check (safety)
    const existing = await prisma.daily_ops_logs.findFirst({
      where: { unit_id: unitId, service_date: today }
    });
    if (existing) return { error: "Data untuk hari ini sudah diinput." };

    // Helper to parse numbers and handle empty strings as null
    const parseNum = (val: any) => {
        if (val === "" || val === null || val === undefined) return null;
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    };

    const parseIntNum = (val: any) => {
        if (val === "" || val === null || val === undefined) return null;
        const n = parseInt(val, 10);
        return isNaN(n) ? null : n;
    };

    // 2. Create Log
    await prisma.daily_ops_logs.create({
      data: {
        unit_id: unitId,
        inspector_name: data.inspectorName,
        service_date: today,
        
        // Fan
        fan_on: data.fan_on === true || data.fan_on === "true",
        fan_speed: parseNum(data.fan_speed),
        fan_curr_r: parseNum(data.fan_curr_r),
        fan_curr_s: parseNum(data.fan_curr_s),
        fan_curr_t: parseNum(data.fan_curr_t),
        fan_volt_r: parseIntNum(data.fan_volt_r),
        fan_volt_s: parseIntNum(data.fan_volt_s),
        fan_volt_t: parseIntNum(data.fan_volt_t),

        // Heater
        heater_on: data.heater_on === true || data.heater_on === "true",
        heater_curr_r: parseNum(data.heater_curr_r),
        heater_curr_s: parseNum(data.heater_curr_s),
        heater_curr_t: parseNum(data.heater_curr_t),
        heater_volt_r: parseIntNum(data.heater_volt_r),
        heater_volt_s: parseIntNum(data.heater_volt_s),
        heater_volt_t: parseIntNum(data.heater_volt_t),

        // Valve
        valve_opening: parseNum(data.valve_opening),

        // Air
        supply_temp: parseNum(data.supply_temp),
        supply_rh: parseNum(data.supply_rh),
        return_temp: parseNum(data.return_temp),
        return_rh: parseNum(data.return_rh),
        fresh_temp: parseNum(data.fresh_temp),
        fresh_rh: parseNum(data.fresh_rh),

        // Filter
        filter_pre: data.filter_pre || null,
        filter_med: data.filter_med || null,
        filter_hepa: data.filter_hepa || null,

        // Room
        room_temp: parseNum(data.room_temp),
        room_diff_press: parseNum(data.room_diff_press),

        // Spots
        temp_s1: parseNum(data.temp_s1),
        temp_s2: parseNum(data.temp_s2),
        temp_s3: parseNum(data.temp_s3),
        temp_s4: parseNum(data.temp_s4),
        temp_s5: parseNum(data.temp_s5),

        // Standards
        static_pressure: parseNum(data.static_pressure),
        vibration_status: data.vibration_status || null,
        drainage_status: data.drainage_status || null,
        notes: data.notes || null
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Submit daily log error details:", error);
    return { error: "Gagal menyimpan log operasional. Pastikan input angka sudah benar." };
  }
}
