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

    // 2. Create Log
    await prisma.daily_ops_logs.create({
      data: {
        unit_id: unitId,
        inspector_name: data.inspectorName,
        service_date: today,
        
        // Fan
        fan_on: data.fan_on,
        fan_speed: data.fan_speed,
        fan_curr_r: data.fan_curr_r,
        fan_curr_s: data.fan_curr_s,
        fan_curr_t: data.fan_curr_t,
        fan_volt_r: data.fan_volt_r,
        fan_volt_s: data.fan_volt_s,
        fan_volt_t: data.fan_volt_t,

        // Heater
        heater_on: data.heater_on,
        heater_curr_r: data.heater_curr_r,
        heater_curr_s: data.heater_curr_s,
        heater_curr_t: data.heater_curr_t,
        heater_volt_r: data.heater_volt_r,
        heater_volt_s: data.heater_volt_s,
        heater_volt_t: data.heater_volt_t,

        // Valve
        valve_opening: data.valve_opening,

        // Air
        supply_temp: data.supply_temp,
        supply_rh: data.supply_rh,
        return_temp: data.return_temp,
        return_rh: data.return_rh,
        fresh_temp: data.fresh_temp,
        fresh_rh: data.fresh_rh,

        // Filter
        filter_pre: data.filter_pre,
        filter_med: data.filter_med,
        filter_hepa: data.filter_hepa,

        // Room
        room_temp: data.room_temp,
        room_diff_press: data.room_diff_press,

        // Spots
        temp_s1: data.temp_s1,
        temp_s2: data.temp_s2,
        temp_s3: data.temp_s3,
        temp_s4: data.temp_s4,
        temp_s5: data.temp_s5,

        // Standards
        static_pressure: data.static_pressure,
        vibration_status: data.vibration_status,
        drainage_status: data.drainage_status,
        notes: data.notes
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Submit daily log error:", error);
    return { error: "Gagal menyimpan log operasional." };
  }
}
