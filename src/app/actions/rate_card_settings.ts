"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRateCardSettings() {
  try {
    const settings = await prisma.rate_card_settings.findMany();
    const config: Record<string, any> = {};
    
    settings.forEach(s => {
      try {
        config[s.setting_key] = JSON.parse(s.setting_value || "null");
      } catch {
        config[s.setting_key] = s.setting_value;
      }
    });

    // Provide defaults if missing
    return {
      success: true,
      data: {
        vendors: config.vendors || [],
        period_year: config.period_year || new Date().getFullYear().toString(),
        selected_vendor: config.selected_vendor || "",
        vendor_prices: config.vendor_prices || {},
        allowed_users: config.allowed_users || []
      }
    };
  } catch (error) {
    console.error("Error fetching rate card settings:", error);
    return { error: "Failed to fetch settings" };
  }
}

export async function updateRateCardSetting(key: string, value: any) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await prisma.rate_card_settings.upsert({
      where: { setting_key: key },
      update: { setting_value: stringValue },
      create: { setting_key: key, setting_value: stringValue }
    });

    revalidatePath("/admin/database/rate-card");
    return { success: true };
  } catch (error) {
    console.error("Error updating rate card setting:", error);
    return { error: "Failed to update setting" };
  }
}
