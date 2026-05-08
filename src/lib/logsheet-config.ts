/**
 * HVAC Monitoring Logsheet — Parameter Configuration
 * Based on: "Logsheet - Monitoring HVAC - Lanud Roesmin Nurjadin" (Tab 13 MARET)
 */

export type ParamType = "number" | "toggle" | "select" | "text";

export interface LogsheetParam {
  key: string;
  label: string;
  unit?: string;
  type: ParamType;
  design?: number | string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface ParamGroup {
  group: string;
  color: string;       // Header color for the group row
  params: LogsheetParam[];
}

export interface LogsheetFormatConfig {
  type: "Chiller" | "AHU" | "FCU" | "CRAC";
  label: string;
  description: string;
  icon: string; // lucide icon name
  groups: ParamGroup[];
  defaultTimeSlots: string[];
}

// ─── FORMAT 1: CHILLER & CHWP ───────────────────────────────
export const CHILLER_CONFIG: LogsheetFormatConfig = {
  type: "Chiller",
  label: "Air Cooled Chiller & CHWP",
  description: "Monitoring chiller utama, pompa air dingin, dan pipa utama",
  icon: "Snowflake",
  defaultTimeSlots: ["08:00", "10:00", "12:00", "14:00", "16:00", "20:00"],
  groups: [
    {
      group: "Air Cooled Chiller",
      color: "#003366",
      params: [
        { key: "ch_status", label: "Status", type: "select", options: ["ON", "OFF", "Auto", "Trip"] },
        { key: "ch_jam_jalan", label: "Jam Jalan", unit: "hr", type: "number" },
        { key: "ch_status_mv", label: "Status MV", type: "select", options: ["Open", "Close", "Modulating"] },
        { key: "ch_kapasitas", label: "Kapasitas", unit: "%", type: "number", design: 100, min: 0, max: 100 },
        { key: "ch_ewt", label: "EWT", unit: "°C", type: "number", design: 12 },
        { key: "ch_lwt", label: "LWT", unit: "°C", type: "number", design: 7 },
        { key: "ch_delta_t", label: "Δt", unit: "°C", type: "number", design: 5 },
        { key: "ch_tek_inlet", label: "Tekanan Inlet", unit: "Bar", type: "number" },
        { key: "ch_tek_outlet", label: "Tekanan Outlet", unit: "Bar", type: "number" },
        { key: "ch_delta_p", label: "ΔP", unit: "Bar", type: "number" },
        { key: "ch_arus_r", label: "Arus R", unit: "Amp", type: "number", design: 168.5 },
        { key: "ch_arus_s", label: "Arus S", unit: "Amp", type: "number", design: 168.5 },
        { key: "ch_arus_t", label: "Arus T", unit: "Amp", type: "number", design: 168.5 },
        { key: "ch_volt_rs", label: "Tegangan R-S", unit: "Volt", type: "number", design: 400 },
        { key: "ch_volt_rt", label: "Tegangan R-T", unit: "Volt", type: "number", design: 400 },
        { key: "ch_volt_st", label: "Tegangan S-T", unit: "Volt", type: "number", design: 400 },
      ]
    },
    {
      group: "CHWP (Chilled Water Pump)",
      color: "#0369a1",
      params: [
        { key: "chwp_status", label: "Status", type: "select", options: ["ON", "OFF", "Auto", "Trip"] },
        { key: "chwp_tek_inlet", label: "Tekanan Inlet", unit: "Bar", type: "number" },
        { key: "chwp_tek_outlet", label: "Tekanan Outlet", unit: "Bar", type: "number" },
        { key: "chwp_delta_p", label: "ΔP", unit: "Bar", type: "number" },
        { key: "chwp_arus_r", label: "Arus R", unit: "Amp", type: "number", design: 15.6 },
        { key: "chwp_arus_s", label: "Arus S", unit: "Amp", type: "number", design: 15.6 },
        { key: "chwp_arus_t", label: "Arus T", unit: "Amp", type: "number", design: 15.6 },
        { key: "chwp_volt_rs", label: "Tegangan R-S", unit: "Volt", type: "number", design: 400 },
        { key: "chwp_volt_rt", label: "Tegangan R-T", unit: "Volt", type: "number", design: 400 },
        { key: "chwp_volt_st", label: "Tegangan S-T", unit: "Volt", type: "number", design: 400 },
      ]
    },
    {
      group: "Main Line Pipe",
      color: "#059669",
      params: [
        { key: "mlp_temp_inlet", label: "Temp Inlet", unit: "°C", type: "number", design: 7 },
        { key: "mlp_temp_outlet", label: "Temp Outlet", unit: "°C", type: "number", design: 12 },
        { key: "mlp_debit", label: "Debit Air", unit: "L/s", type: "number" },
        { key: "mlp_bukaan_mv", label: "Bukaan MV", unit: "%", type: "number" },
      ]
    }
  ]
};

// ─── FORMAT 2: AHU (Per Ruangan) ────────────────────────────
export const AHU_CONFIG: LogsheetFormatConfig = {
  type: "AHU",
  label: "Air Handling Unit (AHU)",
  description: "Monitoring AHU per ruangan — suhu, kelembapan, filter, heater, fan VSD",
  icon: "Wind",
  defaultTimeSlots: ["08:00", "10:00", "12:00", "14:00", "16:00", "20:00"],
  groups: [
    {
      group: "Monitoring Ruangan",
      color: "#7c3aed",
      params: [
        { key: "room_temp", label: "Temperatur Ruangan", unit: "°C", type: "number", design: 22 },
        { key: "room_rh", label: "Kelembapan Ruangan", unit: "%", type: "number", design: 55 },
        { key: "room_pressure", label: "Tekanan Ruangan", unit: "Pa", type: "number" },
      ]
    },
    {
      group: "Motorized Valve",
      color: "#0891b2",
      params: [
        { key: "mv_status", label: "MV Status", type: "select", options: ["Open", "Close", "Modulating"] },
        { key: "mv_persen", label: "Bukaan MV", unit: "%", type: "number" },
      ]
    },
    {
      group: "Filter",
      color: "#ca8a04",
      params: [
        { key: "filter_pre", label: "Pre Filter", type: "select", options: ["Bersih", "Kotor", "Ganti"] },
        { key: "filter_medium", label: "Medium Filter", type: "select", options: ["Bersih", "Kotor", "Ganti"] },
        { key: "filter_hepa", label: "HEPA Filter", type: "select", options: ["Bersih", "Kotor", "Ganti"] },
      ]
    },
    {
      group: "Electric Heater",
      color: "#dc2626",
      params: [
        { key: "heater_status", label: "Status Heater", type: "select", options: ["ON", "OFF"] },
        { key: "heater_stage", label: "Stage", type: "select", options: ["1", "2", "3", "OFF"] },
        { key: "heater_arus_r", label: "Arus R", unit: "Amp", type: "number" },
        { key: "heater_arus_s", label: "Arus S", unit: "Amp", type: "number" },
        { key: "heater_arus_t", label: "Arus T", unit: "Amp", type: "number" },
        { key: "heater_volt_rs", label: "Tegangan R-S", unit: "Volt", type: "number" },
        { key: "heater_volt_rt", label: "Tegangan R-T", unit: "Volt", type: "number" },
        { key: "heater_volt_st", label: "Tegangan S-T", unit: "Volt", type: "number" },
      ]
    },
    {
      group: "Fan (VSD)",
      color: "#2563eb",
      params: [
        { key: "fan_status", label: "Status Fan", type: "select", options: ["ON", "OFF", "Trip"] },
        { key: "fan_freq", label: "Frekuensi VSD", unit: "Hz", type: "number" },
        { key: "fan_arus_r", label: "Arus R", unit: "Amp", type: "number" },
        { key: "fan_arus_s", label: "Arus S", unit: "Amp", type: "number" },
        { key: "fan_arus_t", label: "Arus T", unit: "Amp", type: "number" },
        { key: "fan_volt_rs", label: "Tegangan R-S", unit: "Volt", type: "number" },
        { key: "fan_volt_rt", label: "Tegangan R-T", unit: "Volt", type: "number" },
        { key: "fan_volt_st", label: "Tegangan S-T", unit: "Volt", type: "number" },
      ]
    },
    {
      group: "Damper",
      color: "#65a30d",
      params: [
        { key: "damper_status", label: "Status Damper", type: "select", options: ["Open", "Close", "Modulating"] },
        { key: "fresh_air_persen", label: "Fresh Air", unit: "%", type: "number" },
      ]
    }
  ]
};

// ─── FORMAT 3: FCU (Per Ruangan — Simplified) ───────────────
export const FCU_CONFIG: LogsheetFormatConfig = {
  type: "FCU",
  label: "Fan Coil Unit (FCU)",
  description: "Monitoring FCU per ruangan — suhu, fan, valve, filter",
  icon: "Fan",
  defaultTimeSlots: ["08:00", "12:00", "16:00", "20:00"],
  groups: [
    {
      group: "Unit Status",
      color: "#003366",
      params: [
        { key: "fcu_status", label: "Status Unit", type: "select", options: ["ON", "OFF", "Trip"] },
        { key: "fcu_mode", label: "Mode", type: "select", options: ["Cooling", "Fan Only", "Auto"] },
      ]
    },
    {
      group: "Climate Control",
      color: "#0369a1",
      params: [
        { key: "fcu_temp_setpoint", label: "Temp Set Point", unit: "°C", type: "number", design: 24 },
        { key: "fcu_temp_actual", label: "Temp Actual", unit: "°C", type: "number" },
        { key: "fcu_rh", label: "RH Ruangan", unit: "%", type: "number" },
      ]
    },
    {
      group: "Fan & Valve",
      color: "#2563eb",
      params: [
        { key: "fcu_fan_speed", label: "Fan Speed", type: "select", options: ["Low", "Medium", "High", "Auto"] },
        { key: "fcu_valve", label: "Valve Opening", unit: "%", type: "number" },
      ]
    },
    {
      group: "Maintenance Check",
      color: "#ca8a04",
      params: [
        { key: "fcu_filter", label: "Filter Status", type: "select", options: ["Bersih", "Kotor", "Ganti"] },
        { key: "fcu_condensate", label: "Condensate Drain", type: "select", options: ["Normal", "Tersumbat", "Bocor"] },
        { key: "fcu_vibration", label: "Vibrasi Motor", type: "select", options: ["Normal", "Abnormal"] },
        { key: "fcu_noise", label: "Noise Level", type: "select", options: ["Normal", "Abnormal"] },
      ]
    }
  ]
};

// ─── FORMAT 4: CRAC ─────────────────────────────────────────
export const CRAC_CONFIG: LogsheetFormatConfig = {
  type: "CRAC",
  label: "Computer Room AC (CRAC)",
  description: "Monitoring CRAC — status unit, kompresor, alarm, temperatur dan kelembapan",
  icon: "Server",
  defaultTimeSlots: ["08:00", "12:00", "16:00", "20:00"],
  groups: [
    {
      group: "Status Unit",
      color: "#003366",
      params: [
        { key: "crac_status", label: "Status Unit", type: "select", options: ["ON", "OFF", "Standby", "Trip"] },
        { key: "crac_fan", label: "Status Fan", type: "select", options: ["ON", "OFF"] },
        { key: "crac_comp1", label: "Status Comp - 1", type: "select", options: ["ON", "OFF", "Trip"] },
        { key: "crac_comp2", label: "Status Comp - 2", type: "select", options: ["ON", "OFF", "Trip"] },
      ]
    },
    {
      group: "Alarm",
      color: "#dc2626",
      params: [
        { key: "crac_temp_alarm", label: "Temp High Alarm", type: "select", options: ["Normal", "Alarm"] },
        { key: "crac_rh_alarm", label: "RH High Alarm", type: "select", options: ["Normal", "Alarm"] },
        { key: "crac_alarm_status", label: "Alarm Status", type: "select", options: ["Normal", "Active", "Acknowledged"] },
      ]
    },
    {
      group: "Monitoring",
      color: "#0369a1",
      params: [
        { key: "crac_fan_speed", label: "Supply Fan Speed", unit: "%", type: "number", design: 100 },
        { key: "crac_return_temp", label: "Return Air Temp", unit: "°C", type: "number", design: 22 },
        { key: "crac_return_rh", label: "Return Air RH", unit: "%", type: "number", design: 55 },
      ]
    }
  ]
};

// ─── MASTER CONFIG MAP ──────────────────────────────────────
export const LOGSHEET_CONFIGS: Record<string, LogsheetFormatConfig> = {
  Chiller: CHILLER_CONFIG,
  AHU: AHU_CONFIG,
  FCU: FCU_CONFIG,
  CRAC: CRAC_CONFIG,
};

/** Get all parameters flat for a given type */
export function getAllParams(type: string): LogsheetParam[] {
  const config = LOGSHEET_CONFIGS[type];
  if (!config) return [];
  return config.groups.flatMap(g => g.params);
}

/** Get design values as a key-value map */
export function getDesignValues(type: string): Record<string, number | string> {
  const params = getAllParams(type);
  const design: Record<string, number | string> = {};
  for (const p of params) {
    if (p.design !== undefined) design[p.key] = p.design;
  }
  return design;
}

/** Get default time slots for a type */
export function getDefaultTimeSlots(type: string): string[] {
  return LOGSHEET_CONFIGS[type]?.defaultTimeSlots || ["08:00", "12:00", "16:00", "20:00"];
}
