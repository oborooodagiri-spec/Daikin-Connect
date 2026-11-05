/**
 * Overtime calculation engine for vendor attendance records.
 *
 * All day/time boundaries are evaluated in WIB (UTC+7) so results do not depend on
 * the timezone of the server or the admin's browser.
 *
 * Supported methods:
 *  - REGULATION : tiered multipliers per Indonesian regulation (PP 35/2021 Pasal 31)
 *  - FLAT       : one custom multiplier for every overtime hour
 *  - ACTUAL     : actual overtime hours, multiplier 1x (no weighting)
 */

export type OvertimeMethod = "REGULATION" | "FLAT" | "ACTUAL";
export type OvertimeDayType = "WEEKDAY" | "REST_DAY" | "HOLIDAY";

export interface OvertimeSettings {
  method: OvertimeMethod;
  /** 5 or 6 working days per week. Decides whether Saturday is a rest day. */
  workDaysPerWeek: 5 | 6;
  /** Overtime shorter than this (minutes) is ignored. */
  minOvertimeMinutes: number;
  /** Overtime is rounded DOWN to this block size (minutes). */
  roundingMinutes: 1 | 15 | 30 | 60;
  /** Max overtime hours per working day (0 = unlimited). Rest days / holidays are not capped. */
  maxWeekdayHoursPerDay: number;
  /** Break deducted from worked time on rest days / holidays when the session is longer than 6 hours. */
  breakMinutes: number;
  /** Multiplier used by the FLAT method. */
  flatMultiplier: number;
  /** Public holidays, formatted yyyy-MM-dd (WIB). */
  holidays: string[];
  /** Default monthly wage (base wage + fixed allowances) used when a person has no specific wage. */
  defaultMonthlyWage: number;
  /** Divisor to get the hourly wage from the monthly wage (regulation: 173). */
  wageDivisor: number;
}

export const DEFAULT_OVERTIME_SETTINGS: OvertimeSettings = {
  method: "REGULATION",
  workDaysPerWeek: 5,
  minOvertimeMinutes: 30,
  roundingMinutes: 30,
  maxWeekdayHoursPerDay: 4,
  breakMinutes: 60,
  flatMultiplier: 1.5,
  holidays: [],
  defaultMonthlyWage: 0,
  wageDivisor: 173,
};

export const WEEKLY_OVERTIME_LIMIT_HOURS = 18;

export interface OvertimeRecordInput {
  id: number | string;
  check_in_time: string | Date;
  check_out_time: string | Date | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
}

export interface OvertimeTier {
  hours: number;
  multiplier: number;
}

export interface OvertimeDayResult {
  id: number | string;
  /** yyyy-MM-dd in WIB */
  dateKey: string;
  dayType: OvertimeDayType;
  checkIn: Date;
  checkOut: Date | null;
  workedMinutes: number;
  /** Overtime before threshold / rounding / cap. */
  rawOvertimeMinutes: number;
  /** Final overtime after threshold, rounding and cap. */
  overtimeMinutes: number;
  /** Minutes removed because of the daily cap. */
  cappedMinutes: number;
  /** Hours multiplied by their multipliers ("jam setara"). */
  weightedHours: number;
  tiers: OvertimeTier[];
  /** Session has no check-out, so overtime cannot be calculated. */
  incomplete: boolean;
  flags: string[];
}

export interface WeeklyWarning {
  weekStart: string;
  hours: number;
}

export interface OvertimeTotals {
  overtimeDays: number;
  overtimeMinutes: number;
  weightedHours: number;
  incompleteCount: number;
  flaggedCount: number;
  weeklyWarnings: WeeklyWarning[];
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

function toWib(d: Date): Date {
  return new Date(d.getTime() + WIB_OFFSET_MS);
}

export function wibDateKey(d: Date): string {
  const w = toWib(d);
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}`;
}

/** UTC milliseconds of 00:00 WIB for the WIB date that contains `d`. */
function wibDayStartMs(d: Date): number {
  const w = toWib(d);
  return Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - WIB_OFFSET_MS;
}

function parseHm(value: string | null | undefined, fallbackMinutes: number): number {
  if (!value) return fallbackMinutes;
  const [h, m] = String(value).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return fallbackMinutes;
  return h * 60 + m;
}

export function getDayType(dateKey: string, dowWib: number, settings: OvertimeSettings): OvertimeDayType {
  if (settings.holidays.includes(dateKey)) return "HOLIDAY";
  if (dowWib === 0) return "REST_DAY"; // Sunday
  if (dowWib === 6 && settings.workDaysPerWeek === 5) return "REST_DAY"; // Saturday on a 5-day week
  return "WEEKDAY";
}

/** Multiplier tiers defined by PP 35/2021 Pasal 31. */
export function getRegulationTiers(dayType: OvertimeDayType, workDaysPerWeek: 5 | 6): OvertimeTier[] {
  if (dayType === "WEEKDAY") {
    return [
      { hours: 1, multiplier: 1.5 },
      { hours: Infinity, multiplier: 2 },
    ];
  }
  const firstTier = workDaysPerWeek === 5 ? 8 : 7;
  return [
    { hours: firstTier, multiplier: 2 },
    { hours: 1, multiplier: 3 },
    { hours: Infinity, multiplier: 4 },
  ];
}

/** Splits `hours` over the tiers and returns only the tiers that are actually used. */
export function applyTiers(hours: number, tiers: OvertimeTier[]): { weighted: number; used: OvertimeTier[] } {
  let remaining = hours;
  let weighted = 0;
  const used: OvertimeTier[] = [];
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, tier.hours);
    weighted += take * tier.multiplier;
    used.push({ hours: take, multiplier: tier.multiplier });
    remaining -= take;
  }
  return { weighted, used };
}

function isoWeekStartKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const dow = utc.getUTCDay(); // 0 = Sunday
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(utc.getTime() + diffToMonday * DAY_MS);
  return `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
}

export function calculateOvertimeDay(record: OvertimeRecordInput, settings: OvertimeSettings): OvertimeDayResult {
  const checkIn = new Date(record.check_in_time);
  const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
  const dateKey = wibDateKey(checkIn);
  const dowWib = toWib(checkIn).getUTCDay();
  const dayType = getDayType(dateKey, dowWib, settings);

  const base: OvertimeDayResult = {
    id: record.id,
    dateKey,
    dayType,
    checkIn,
    checkOut,
    workedMinutes: 0,
    rawOvertimeMinutes: 0,
    overtimeMinutes: 0,
    cappedMinutes: 0,
    weightedHours: 0,
    tiers: [],
    incomplete: !checkOut,
    flags: [],
  };

  if (!checkOut) {
    base.flags.push("Belum check-out");
    return base;
  }

  const workedMinutes = Math.max(0, Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000));
  base.workedMinutes = workedMinutes;

  let rawOvertime = 0;
  if (dayType === "WEEKDAY") {
    // Overtime = time worked after the project shift ends.
    const dayStart = wibDayStartMs(checkIn);
    const shiftStartMin = parseHm(record.shift_start_time, 8 * 60);
    let shiftEndMin = parseHm(record.shift_end_time, 17 * 60);
    if (shiftEndMin <= shiftStartMin) shiftEndMin += 24 * 60; // overnight shift
    const shiftEndMs = dayStart + shiftEndMin * 60000;
    const overtimeStartMs = Math.max(shiftEndMs, checkIn.getTime());
    rawOvertime = Math.max(0, Math.floor((checkOut.getTime() - overtimeStartMs) / 60000));
  } else {
    // Rest day / public holiday: the whole working session is overtime (minus break).
    rawOvertime = workedMinutes > 360 ? Math.max(0, workedMinutes - settings.breakMinutes) : workedMinutes;
  }
  base.rawOvertimeMinutes = rawOvertime;

  // Threshold, then rounding down to the configured block.
  let overtime = 0;
  if (rawOvertime >= settings.minOvertimeMinutes && rawOvertime > 0) {
    const block = settings.roundingMinutes || 1;
    overtime = Math.floor(rawOvertime / block) * block;
  }

  // Daily cap applies to working days only.
  if (dayType === "WEEKDAY" && settings.maxWeekdayHoursPerDay > 0) {
    const capMinutes = Math.round(settings.maxWeekdayHoursPerDay * 60);
    if (overtime > capMinutes) {
      base.cappedMinutes = overtime - capMinutes;
      overtime = capMinutes;
      base.flags.push(`Melebihi batas ${settings.maxWeekdayHoursPerDay} jam/hari (dipotong)`);
    }
  }

  if (workedMinutes > 14 * 60) {
    base.flags.push("Durasi kerja sangat panjang, verifikasi check-out");
  }

  base.overtimeMinutes = overtime;

  const hours = overtime / 60;
  if (hours > 0) {
    if (settings.method === "REGULATION") {
      const { weighted, used } = applyTiers(hours, getRegulationTiers(dayType, settings.workDaysPerWeek));
      base.weightedHours = weighted;
      base.tiers = used;
    } else if (settings.method === "FLAT") {
      base.weightedHours = hours * settings.flatMultiplier;
      base.tiers = [{ hours, multiplier: settings.flatMultiplier }];
    } else {
      base.weightedHours = hours;
      base.tiers = [{ hours, multiplier: 1 }];
    }
  }

  return base;
}

export function calculateOvertimeForRecords(
  records: OvertimeRecordInput[],
  settings: OvertimeSettings
): OvertimeDayResult[] {
  return records
    .map((r) => calculateOvertimeDay(r, settings))
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
}

export function summarizeOvertime(days: OvertimeDayResult[]): OvertimeTotals {
  const weekly = new Map<string, number>();
  let overtimeDays = 0;
  let overtimeMinutes = 0;
  let weightedHours = 0;
  let incompleteCount = 0;
  let flaggedCount = 0;

  for (const day of days) {
    if (day.incomplete) incompleteCount++;
    if (day.flags.length > 0 && !day.incomplete) flaggedCount++;
    if (day.overtimeMinutes > 0) {
      overtimeDays++;
      overtimeMinutes += day.overtimeMinutes;
      weightedHours += day.weightedHours;
      // The weekly limit excludes rest-day / holiday work.
      if (day.dayType === "WEEKDAY") {
        const key = isoWeekStartKey(day.dateKey);
        weekly.set(key, (weekly.get(key) || 0) + day.overtimeMinutes / 60);
      }
    }
  }

  const weeklyWarnings: WeeklyWarning[] = [];
  weekly.forEach((hours, weekStart) => {
    if (hours > WEEKLY_OVERTIME_LIMIT_HOURS) weeklyWarnings.push({ weekStart, hours });
  });

  return { overtimeDays, overtimeMinutes, weightedHours, incompleteCount, flaggedCount, weeklyWarnings };
}

export function calculateOvertimePay(weightedHours: number, monthlyWage: number, divisor: number): number {
  if (!monthlyWage || monthlyWage <= 0 || !divisor) return 0;
  return Math.round((weightedHours * monthlyWage) / divisor);
}

export function formatOvertimeMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return "-";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} Menit`;
  if (mins === 0) return `${hrs} Jam`;
  return `${hrs} Jam ${mins} Menit`;
}

export function formatTiers(tiers: OvertimeTier[]): string {
  if (tiers.length === 0) return "-";
  return tiers
    .map((t) => `${Number(t.hours.toFixed(2))} jam x ${t.multiplier}`)
    .join(" + ");
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

/** Restores settings from storage while guarding against missing / invalid fields. */
export function sanitizeOvertimeSettings(input: any): OvertimeSettings {
  const d = DEFAULT_OVERTIME_SETTINGS;
  if (!input || typeof input !== "object") return { ...d };
  const num = (v: any, fallback: number, min = 0) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };
  const rounding = [1, 15, 30, 60].includes(Number(input.roundingMinutes)) ? Number(input.roundingMinutes) : d.roundingMinutes;
  return {
    method: ["REGULATION", "FLAT", "ACTUAL"].includes(input.method) ? input.method : d.method,
    workDaysPerWeek: Number(input.workDaysPerWeek) === 6 ? 6 : 5,
    minOvertimeMinutes: num(input.minOvertimeMinutes, d.minOvertimeMinutes),
    roundingMinutes: rounding as OvertimeSettings["roundingMinutes"],
    maxWeekdayHoursPerDay: num(input.maxWeekdayHoursPerDay, d.maxWeekdayHoursPerDay),
    breakMinutes: num(input.breakMinutes, d.breakMinutes),
    flatMultiplier: num(input.flatMultiplier, d.flatMultiplier, 0.1),
    holidays: Array.isArray(input.holidays)
      ? input.holidays.filter((h: any) => typeof h === "string" && /^\d{4}-\d{2}-\d{2}$/.test(h))
      : [],
    defaultMonthlyWage: num(input.defaultMonthlyWage, d.defaultMonthlyWage),
    wageDivisor: num(input.wageDivisor, d.wageDivisor, 1),
  };
}
