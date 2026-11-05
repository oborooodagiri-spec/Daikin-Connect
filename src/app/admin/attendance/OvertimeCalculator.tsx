"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getMonthlyOvertimeData } from "@/app/actions/attendanceAdmin";
import {
  DEFAULT_OVERTIME_SETTINGS,
  WEEKLY_OVERTIME_LIMIT_HOURS,
  calculateOvertimeForRecords,
  calculateOvertimePay,
  formatOvertimeMinutes,
  formatRupiah,
  formatTiers,
  sanitizeOvertimeSettings,
  summarizeOvertime,
  type OvertimeDayResult,
  type OvertimeDayType,
  type OvertimeMethod,
  type OvertimeSettings,
  type OvertimeTotals,
} from "@/lib/overtime";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import {
  AlertTriangle,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileSpreadsheet,
  Info,
  Loader2,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";

const STORAGE_KEY = "dssi_overtime_settings_v1";

const METHOD_OPTIONS: { value: OvertimeMethod; title: string; desc: string }[] = [
  {
    value: "REGULATION",
    title: "Sesuai Regulasi (PP 35/2021)",
    desc: "Pengali bertingkat: hari kerja 1,5x jam pertama dan 2x berikutnya; hari libur 2x, 3x, 4x. Direkomendasikan untuk karyawan.",
  },
  {
    value: "FLAT",
    title: "Pengali Tetap (Flat)",
    desc: "Satu pengali yang sama untuk seluruh jam lembur. Cocok untuk vendor atau kontrak dengan ketentuan khusus.",
  },
  {
    value: "ACTUAL",
    title: "Jam Aktual (Tanpa Pengali)",
    desc: "Hanya merekap jam lembur sebenarnya (pengali 1x), misalnya untuk kompensasi berupa jam libur pengganti.",
  },
];

const DAY_TYPE_LABEL: Record<OvertimeDayType, string> = {
  WEEKDAY: "Hari Kerja",
  REST_DAY: "Libur Mingguan",
  HOLIDAY: "Libur Nasional",
};

const DAY_TYPE_STYLE: Record<OvertimeDayType, string> = {
  WEEKDAY: "bg-slate-50 text-slate-500 border-slate-200",
  REST_DAY: "bg-indigo-50 text-indigo-600 border-indigo-100",
  HOLIDAY: "bg-rose-50 text-rose-600 border-rose-100",
};

interface PersonRow {
  userId: number;
  name: string;
  email: string;
  company: string;
  projectNames: string[];
  days: OvertimeDayResult[];
  totals: OvertimeTotals;
  wage: number;
  hasCustomWage: boolean;
  pay: number;
}

const wibTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const fmtTime = (d: Date | null) => (d ? wibTimeFormatter.format(d) : "-");

const fmtDateKey = (dateKey: string, pattern = "EEE, dd MMM yyyy") => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return format(new Date(y, m - 1, d), pattern, { locale: idLocale });
};

const roundHours = (value: number) => Math.round(value * 100) / 100;
const fmtHours = (value: number) => (value > 0 ? `${roundHours(value).toLocaleString("id-ID")} jam` : "-");

export default function OvertimeCalculator() {
  const [month, setMonth] = useState<Date>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectFilter, setProjectFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const [settings, setSettings] = useState<OvertimeSettings>({ ...DEFAULT_OVERTIME_SETTINGS });
  const [wages, setWages] = useState<Record<string, number>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [holidayInput, setHolidayInput] = useState("");
  const [exporting, setExporting] = useState(false);

  // Restore saved settings (browser only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings(sanitizeOvertimeSettings(parsed.settings));
        if (parsed.wages && typeof parsed.wages === "object") {
          const clean: Record<string, number> = {};
          Object.entries(parsed.wages).forEach(([k, v]) => {
            const n = Number(v);
            if (Number.isFinite(n) && n > 0) clean[k] = n;
          });
          setWages(clean);
        }
      }
    } catch (err) {
      console.error("Failed to restore overtime settings", err);
    }
    setStorageReady(true);
  }, []);

  // Persist settings
  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, wages }));
    } catch (err) {
      console.error("Failed to save overtime settings", err);
    }
  }, [settings, wages, storageReady]);

  // Load monthly attendance
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res: any = await getMonthlyOvertimeData(month.getMonth(), month.getFullYear());
      if (cancelled) return;
      if (res && res.success) {
        setRecords(res.data || []);
      } else {
        setRecords([]);
        setError(res?.error || "Gagal memuat data absensi.");
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const updateSetting = <K extends keyof OvertimeSettings>(key: K, value: OvertimeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const numberFrom = (value: string, fallback = 0) => {
    const n = parseFloat(value.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const addHoliday = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(holidayInput)) return;
    if (settings.holidays.includes(holidayInput)) return;
    updateSetting("holidays", [...settings.holidays, holidayInput].sort());
    setHolidayInput("");
  };

  const setPersonWage = (userId: number, value: string) => {
    setWages((prev) => {
      const next = { ...prev };
      const n = parseFloat(value);
      if (!value || !Number.isFinite(n) || n <= 0) delete next[String(userId)];
      else next[String(userId)] = n;
      return next;
    });
  };

  const handlePrevMonth = () => setMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNextMonth = () => setMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      if (r.project_id !== undefined && r.project_id !== null) {
        map.set(String(r.project_id), r.projects?.name || `Project ${r.project_id}`);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  const rows: PersonRow[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const grouped = new Map<number, { user: any; recs: any[]; projects: Set<string> }>();

    records.forEach((r) => {
      if (!r.users) return;
      if (projectFilter !== "all" && String(r.project_id) !== projectFilter) return;
      const entry = grouped.get(r.user_id) || { user: r.users, recs: [], projects: new Set<string>() };
      entry.recs.push(r);
      if (r.projects?.name) entry.projects.add(r.projects.name);
      grouped.set(r.user_id, entry);
    });

    const result: PersonRow[] = [];
    grouped.forEach((entry, userId) => {
      const { user } = entry;
      if (q) {
        const haystack = `${user.name || ""} ${user.company_name || ""} ${user.email || ""}`.toLowerCase();
        if (!haystack.includes(q)) return;
      }

      const days = calculateOvertimeForRecords(
        entry.recs.map((r) => ({
          id: r.id,
          check_in_time: r.check_in_time,
          check_out_time: r.check_out_time,
          shift_start_time: r.projects?.shift_start_time,
          shift_end_time: r.projects?.shift_end_time,
        })),
        settings
      );
      const totals = summarizeOvertime(days);
      const customWage = wages[String(userId)];
      const wage = customWage || settings.defaultMonthlyWage || 0;

      result.push({
        userId,
        name: user.name || "-",
        email: user.email || "",
        company: user.company_name || "Independent Vendor",
        projectNames: Array.from(entry.projects),
        days,
        totals,
        wage,
        hasCustomWage: !!customWage,
        pay: calculateOvertimePay(totals.weightedHours, wage, settings.wageDivisor),
      });
    });

    return result.sort(
      (a, b) => b.totals.weightedHours - a.totals.weightedHours || a.name.localeCompare(b.name)
    );
  }, [records, projectFilter, search, settings, wages]);

  const grand = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        if (r.totals.overtimeMinutes > 0) acc.people += 1;
        acc.minutes += r.totals.overtimeMinutes;
        acc.weighted += r.totals.weightedHours;
        acc.pay += r.pay;
        acc.incomplete += r.totals.incompleteCount;
        acc.weeklyWarnings += r.totals.weeklyWarnings.length;
        return acc;
      },
      { people: 0, minutes: 0, weighted: 0, pay: 0, incomplete: 0, weeklyWarnings: 0 }
    );
  }, [rows]);

  const hasAnyWage = settings.defaultMonthlyWage > 0 || Object.keys(wages).length > 0;
  const methodTitle = METHOD_OPTIONS.find((m) => m.value === settings.method)?.title || "";

  const handleExport = async () => {
    if (rows.length === 0) return;
    setExporting(true);
    try {
      const mod: any = await import("exceljs");
      const ExcelJS = mod.default || mod;
      const workbook = new ExcelJS.Workbook();
      const periodLabel = format(month, "MMMM yyyy", { locale: idLocale });
      const headerStyle = (row: any) => {
        row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF003366" } };
        row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        row.height = 28;
      };

      // Sheet 1: summary per personnel
      const summary = workbook.addWorksheet("Rekap Lembur");
      summary.addRow([`REKAP LEMBUR PERSONEL - ${periodLabel.toUpperCase()}`]).font = { bold: true, size: 14 };
      summary.addRow([`Metode: ${methodTitle}`]).font = { italic: true, color: { argb: "FF666666" } };
      summary.addRow([]);
      const sHead = summary.addRow([
        "No", "Nama", "Perusahaan", "Proyek", "Hari Lembur", "Lembur Aktual (Jam)", "Jam Setara (Pengali)",
        "Upah Bulanan (Rp)", "Upah Sejam (Rp)", "Estimasi Upah Lembur (Rp)", "Catatan",
      ]);
      headerStyle(sHead);
      rows.forEach((r, i) => {
        const notes: string[] = [];
        if (r.totals.incompleteCount > 0) notes.push(`${r.totals.incompleteCount} sesi belum check-out`);
        if (r.totals.weeklyWarnings.length > 0) notes.push(`Melebihi ${WEEKLY_OVERTIME_LIMIT_HOURS} jam/minggu`);
        summary.addRow([
          i + 1,
          r.name,
          r.company,
          r.projectNames.join(", "),
          r.totals.overtimeDays,
          roundHours(r.totals.overtimeMinutes / 60),
          roundHours(r.totals.weightedHours),
          r.wage || 0,
          r.wage ? Math.round(r.wage / settings.wageDivisor) : 0,
          r.pay,
          notes.join("; "),
        ]);
      });
      const totalRow = summary.addRow([
        "", "TOTAL", "", "", "", roundHours(grand.minutes / 60), roundHours(grand.weighted), "", "", grand.pay, "",
      ]);
      totalRow.font = { bold: true };
      [6, 7, 8, 9, 10].forEach((c) => (summary.getColumn(c).numFmt = "#,##0.##"));
      [5, 15, 24, 28, 12, 18, 18, 20, 18, 24, 36].forEach((w, i) => (summary.getColumn(i + 1).width = w));
      summary.views = [{ state: "frozen", ySplit: 4 }];

      // Sheet 2: daily detail
      const detail = workbook.addWorksheet("Detail Harian");
      const dHead = detail.addRow([
        "Nama", "Tanggal", "Jenis Hari", "Masuk (WIB)", "Keluar (WIB)", "Durasi Kerja (Jam)",
        "Lembur (Jam)", "Rincian Pengali", "Jam Setara", "Estimasi Upah (Rp)", "Catatan",
      ]);
      headerStyle(dHead);
      rows.forEach((r) => {
        r.days.forEach((d) => {
          detail.addRow([
            r.name,
            fmtDateKey(d.dateKey, "dd/MM/yyyy (EEE)"),
            DAY_TYPE_LABEL[d.dayType],
            fmtTime(d.checkIn),
            fmtTime(d.checkOut),
            roundHours(d.workedMinutes / 60),
            roundHours(d.overtimeMinutes / 60),
            formatTiers(d.tiers),
            roundHours(d.weightedHours),
            calculateOvertimePay(d.weightedHours, r.wage, settings.wageDivisor),
            d.flags.join("; "),
          ]);
        });
      });
      [26, 20, 16, 12, 12, 16, 14, 28, 12, 20, 40].forEach((w, i) => (detail.getColumn(i + 1).width = w));
      detail.views = [{ state: "frozen", ySplit: 1 }];

      // Sheet 3: parameters (audit trail)
      const params = workbook.addWorksheet("Parameter");
      params.addRow(["Parameter", "Nilai"]).font = { bold: true };
      [
        ["Periode", periodLabel],
        ["Metode", methodTitle],
        ["Pola hari kerja", `${settings.workDaysPerWeek} hari/minggu`],
        ["Lembur minimal", `${settings.minOvertimeMinutes} menit`],
        ["Pembulatan ke bawah", `${settings.roundingMinutes} menit`],
        ["Batas lembur hari kerja", settings.maxWeekdayHoursPerDay > 0 ? `${settings.maxWeekdayHoursPerDay} jam/hari` : "Tanpa batas"],
        ["Potongan istirahat hari libur", `${settings.breakMinutes} menit (sesi lebih dari 6 jam)`],
        ["Pengali flat", settings.method === "FLAT" ? settings.flatMultiplier : "-"],
        ["Pembagi upah sejam", settings.wageDivisor],
        ["Upah bulanan default", settings.defaultMonthlyWage || "-"],
        ["Hari libur nasional", settings.holidays.length ? settings.holidays.join(", ") : "-"],
      ].forEach((p) => params.addRow(p));
      params.getColumn(1).width = 34;
      params.getColumn(2).width = 60;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rekap_Lembur_${format(month, "yyyy-MM")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export overtime", err);
      alert("Gagal mengekspor data lembur.");
    } finally {
      setExporting(false);
    }
  };

  const labelCls = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1";
  const inputCls =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-4 items-end">
          <div className="space-y-2">
            <label className={labelCls}>Periode</label>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-1.5 rounded-xl min-w-[220px]">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-500 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {format(month, "MMMM yyyy", { locale: idLocale })}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-500 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Proyek</label>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className={inputCls}>
              <option value="all">Semua Proyek</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Cari Personel</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama, perusahaan, atau email..."
                className={`${inputCls} pl-10`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-1">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all"
            >
              <Settings2 size={14} /> Pengaturan Perhitungan
              {showSettings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all"
            >
              <Info size={14} /> Panduan Metode
              {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || rows.length === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-3">
            <label className={labelCls}>Metode Perhitungan</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {METHOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => updateSetting("method", m.value)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    settings.method === m.value
                      ? "border-[#003366] bg-blue-50/50 ring-2 ring-blue-100"
                      : "border-slate-100 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-[11px] font-black text-[#003366] uppercase tracking-wide">{m.title}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1.5 leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Pola Hari Kerja</label>
              <select
                value={settings.workDaysPerWeek}
                onChange={(e) => updateSetting("workDaysPerWeek", Number(e.target.value) === 6 ? 6 : 5)}
                className={inputCls}
              >
                <option value={5}>5 hari kerja (Sabtu libur)</option>
                <option value={6}>6 hari kerja (Sabtu kerja)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Lembur Minimal (menit)</label>
              <input
                type="number"
                min={0}
                value={settings.minOvertimeMinutes}
                onChange={(e) => updateSetting("minOvertimeMinutes", numberFrom(e.target.value))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Pembulatan ke Bawah</label>
              <select
                value={settings.roundingMinutes}
                onChange={(e) => updateSetting("roundingMinutes", Number(e.target.value) as OvertimeSettings["roundingMinutes"])}
                className={inputCls}
              >
                <option value={1}>Tanpa pembulatan (per menit)</option>
                <option value={15}>Per 15 menit</option>
                <option value={30}>Per 30 menit</option>
                <option value={60}>Per 1 jam</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Batas Lembur Hari Kerja (jam/hari, 0 = tanpa batas)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={settings.maxWeekdayHoursPerDay}
                onChange={(e) => updateSetting("maxWeekdayHoursPerDay", numberFrom(e.target.value))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Potongan Istirahat Hari Libur (menit)</label>
              <input
                type="number"
                min={0}
                value={settings.breakMinutes}
                onChange={(e) => updateSetting("breakMinutes", numberFrom(e.target.value))}
                className={inputCls}
              />
            </div>
            {settings.method === "FLAT" && (
              <div className="space-y-1.5">
                <label className={labelCls}>Pengali Flat (x)</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={settings.flatMultiplier}
                  onChange={(e) => updateSetting("flatMultiplier", numberFrom(e.target.value, 1.5) || 1.5)}
                  className={inputCls}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className={labelCls}>Upah Bulanan Default (Rp)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={settings.defaultMonthlyWage || ""}
                placeholder="Gaji pokok + tunjangan tetap"
                onChange={(e) => updateSetting("defaultMonthlyWage", numberFrom(e.target.value))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Pembagi Upah Sejam</label>
              <input
                type="number"
                min={1}
                value={settings.wageDivisor}
                onChange={(e) => updateSetting("wageDivisor", numberFrom(e.target.value, 173) || 173)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Hari Libur Nasional / Cuti Bersama</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={holidayInput}
                onChange={(e) => setHolidayInput(e.target.value)}
                className={`${inputCls} !w-auto`}
              />
              <button
                onClick={addHoliday}
                disabled={!holidayInput}
                className="px-4 py-2.5 bg-[#003366] hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus size={12} /> Tambah
              </button>
            </div>
            {settings.holidays.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {settings.holidays.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black"
                  >
                    {fmtDateKey(h, "dd MMM yyyy")}
                    <button
                      onClick={() => updateSetting("holidays", settings.holidays.filter((x) => x !== h))}
                      className="hover:text-rose-800"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] font-medium text-slate-400 ml-1">
              Sabtu dan Minggu otomatis dikenali sebagai hari libur mingguan sesuai pola hari kerja. Tambahkan hanya hari libur nasional / cuti bersama.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <p className="text-[10px] font-medium text-slate-400">Pengaturan tersimpan otomatis di browser ini.</p>
            <button
              onClick={() => setSettings({ ...DEFAULT_OVERTIME_SETTINGS })}
              className="text-[10px] font-black text-slate-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
            >
              Kembalikan ke Default
            </button>
          </div>
        </div>
      )}

      {/* Method guide */}
      {showGuide && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 text-slate-600">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Rumus Dasar</h3>
            <p className="text-xs leading-relaxed">
              <span className="font-black text-slate-800">Upah sejam</span> = Upah sebulan (gaji pokok + tunjangan tetap) / 173
              <br />
              <span className="font-black text-slate-800">Upah lembur</span> = Jam setara x Upah sejam
              <br />
              <span className="font-black text-slate-800">Jam setara</span> = jumlah jam lembur dikalikan pengalinya masing-masing.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-3">Jenis Hari</th>
                  <th className="p-3">Jam Lembur</th>
                  <th className="p-3 text-center">Pengali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                <tr><td className="p-3" rowSpan={2}>Hari kerja</td><td className="p-3">Jam pertama</td><td className="p-3 text-center">1,5x</td></tr>
                <tr><td className="p-3">Jam kedua dan seterusnya</td><td className="p-3 text-center">2x</td></tr>
                <tr><td className="p-3" rowSpan={3}>Libur mingguan / nasional (5 hari kerja)</td><td className="p-3">Jam ke-1 sampai ke-8</td><td className="p-3 text-center">2x</td></tr>
                <tr><td className="p-3">Jam ke-9</td><td className="p-3 text-center">3x</td></tr>
                <tr><td className="p-3">Jam ke-10 dan seterusnya</td><td className="p-3 text-center">4x</td></tr>
                <tr><td className="p-3" rowSpan={3}>Libur mingguan / nasional (6 hari kerja)</td><td className="p-3">Jam ke-1 sampai ke-7</td><td className="p-3 text-center">2x</td></tr>
                <tr><td className="p-3">Jam ke-8</td><td className="p-3 text-center">3x</td></tr>
                <tr><td className="p-3">Jam ke-9 dan seterusnya</td><td className="p-3 text-center">4x</td></tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Aturan yang Diterapkan Sistem</h3>
            <ul className="text-xs leading-relaxed list-disc pl-5 space-y-1">
              <li>Hari kerja: lembur dihitung sejak jam akhir shift proyek hingga check-out (jam masuk lebih awal tidak dihitung lembur).</li>
              <li>Hari libur: seluruh durasi kerja dihitung lembur, dikurangi potongan istirahat jika sesi lebih dari 6 jam.</li>
              <li>Lembur di bawah batas minimal diabaikan, selebihnya dibulatkan ke bawah sesuai blok pembulatan.</li>
              <li>Batas lembur hari kerja {settings.maxWeekdayHoursPerDay > 0 ? `${settings.maxWeekdayHoursPerDay} jam/hari` : "dinonaktifkan"} dan {WEEKLY_OVERTIME_LIMIT_HOURS} jam/minggu (tidak termasuk kerja di hari libur). Kelebihan harian dipotong, kelebihan mingguan ditandai peringatan.</li>
              <li>Sesi tanpa check-out tidak dihitung dan ditandai agar diperiksa.</li>
            </ul>
          </div>

          <div className="space-y-2 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
            <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Rekomendasi</h3>
            <ul className="text-xs leading-relaxed list-disc pl-5 space-y-1">
              <li>Gunakan metode <span className="font-black">Sesuai Regulasi</span> untuk karyawan; ini standar yang paling aman secara hukum dan mudah diaudit.</li>
              <li>Hitung per jam dengan pembulatan <span className="font-black">ke bawah per 30 menit</span> dan lembur minimal <span className="font-black">30 menit</span> agar selisih check-out beberapa menit tidak menjadi lembur.</li>
              <li>Untuk vendor / subkontraktor, gunakan <span className="font-black">Pengali Tetap</span> atau <span className="font-black">Jam Aktual</span> sesuai klausul kontrak, karena PP 35/2021 mengatur hubungan kerja karyawan.</li>
              <li>Sebaiknya lembur disetujui atasan (SPL) sebelum dibayarkan; hasil di halaman ini adalah dasar verifikasi, bukan pengganti persetujuan.</li>
              <li>Pastikan hasil akhir diverifikasi bersama HR / Legal sebelum dijadikan dasar pembayaran.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Personel Lembur" value={`${grand.people}`} sub={`dari ${rows.length} personel`} />
        <StatCard label="Total Lembur Aktual" value={formatOvertimeMinutes(grand.minutes)} sub="setelah pembulatan dan batas" />
        <StatCard label="Total Jam Setara" value={fmtHours(grand.weighted)} sub={methodTitle} highlight />
        <StatCard
          label="Estimasi Upah Lembur"
          value={hasAnyWage ? formatRupiah(grand.pay) : "-"}
          sub={hasAnyWage ? `pembagi upah sejam ${settings.wageDivisor}` : "isi upah bulanan untuk menghitung"}
        />
      </div>

      {(grand.incomplete > 0 || grand.weeklyWarnings > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {grand.incomplete > 0 && (
            <div className="flex-1 flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-xs font-bold">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              {grand.incomplete} sesi absensi belum check-out dan tidak dihitung. Mohon verifikasi sebelum finalisasi.
            </div>
          )}
          {grand.weeklyWarnings > 0 && (
            <div className="flex-1 flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-bold">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              {grand.weeklyWarnings} minggu melebihi batas lembur {WEEKLY_OVERTIME_LIMIT_HOURS} jam/minggu. Periksa baris bertanda peringatan.
            </div>
          )}
        </div>
      )}

      {/* Personnel table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin text-[#003366] w-8 h-8" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghitung Lembur...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-rose-600 text-xs font-bold">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-24 text-center text-slate-400">
            <Calculator size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada data absensi pada periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[9px] font-black text-slate-400 tracking-widest">
                  <th className="px-4 sm:px-6 py-4">Personel</th>
                  <th className="px-4 py-4 text-center">Hari Lembur</th>
                  <th className="px-4 py-4 text-center">Lembur Aktual</th>
                  <th className="px-4 py-4 text-center">Jam Setara</th>
                  <th className="px-4 py-4">Upah Bulanan (Rp)</th>
                  <th className="px-4 py-4 text-right">Estimasi Upah</th>
                  <th className="px-4 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => {
                  const expanded = expandedUserId === r.userId;
                  return (
                    <React.Fragment key={r.userId}>
                      <tr
                        onClick={() => setExpandedUserId(expanded ? null : r.userId)}
                        className={`cursor-pointer transition-colors ${expanded ? "bg-blue-50/40" : "hover:bg-slate-50/80"}`}
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black uppercase shrink-0">
                              {r.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-xs">{r.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{r.company}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {r.totals.incompleteCount > 0 && (
                                  <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase">
                                    {r.totals.incompleteCount} belum check-out
                                  </span>
                                )}
                                {r.totals.weeklyWarnings.length > 0 && (
                                  <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase">
                                    Melebihi {WEEKLY_OVERTIME_LIMIT_HOURS} jam/minggu
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-slate-600 text-xs">
                          {r.totals.overtimeDays} / {r.days.length}
                        </td>
                        <td className="px-4 py-4 text-center font-black text-slate-800 text-xs whitespace-nowrap">
                          {formatOvertimeMinutes(r.totals.overtimeMinutes)}
                        </td>
                        <td className="px-4 py-4 text-center font-black text-amber-700 text-xs whitespace-nowrap">
                          {fmtHours(r.totals.weightedHours)}
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={r.hasCustomWage ? r.wage : ""}
                            placeholder={settings.defaultMonthlyWage ? String(settings.defaultMonthlyWage) : "0"}
                            onChange={(e) => setPersonWage(r.userId, e.target.value)}
                            className="w-36 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-black text-slate-800 text-xs whitespace-nowrap">
                          {r.wage ? formatRupiah(r.pay) : "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      </tr>

                      {expanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50/60 px-3 sm:px-6 py-5">
                            <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Jenis Hari</th>
                                    <th className="p-3">Masuk</th>
                                    <th className="p-3">Keluar</th>
                                    <th className="p-3 text-center">Durasi</th>
                                    <th className="p-3 text-center">Lembur</th>
                                    <th className="p-3">Rincian Pengali</th>
                                    <th className="p-3 text-center">Jam Setara</th>
                                    <th className="p-3 text-right">Estimasi Upah</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {r.days.map((d) => (
                                    <tr key={d.id} className="align-top">
                                      <td className="p-3 font-bold text-slate-700 whitespace-nowrap">{fmtDateKey(d.dateKey)}</td>
                                      <td className="p-3">
                                        <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${DAY_TYPE_STYLE[d.dayType]}`}>
                                          {DAY_TYPE_LABEL[d.dayType]}
                                        </span>
                                      </td>
                                      <td className="p-3 font-bold text-emerald-600">{fmtTime(d.checkIn)}</td>
                                      <td className="p-3 font-bold text-rose-600">{fmtTime(d.checkOut)}</td>
                                      <td className="p-3 text-center font-bold text-slate-600 whitespace-nowrap">
                                        {d.incomplete ? "-" : formatOvertimeMinutes(d.workedMinutes)}
                                      </td>
                                      <td className="p-3 text-center font-black text-slate-800 whitespace-nowrap">
                                        {formatOvertimeMinutes(d.overtimeMinutes)}
                                      </td>
                                      <td className="p-3 font-medium text-slate-500">
                                        {formatTiers(d.tiers)}
                                        {d.flags.length > 0 && (
                                          <div className="mt-1 space-y-0.5">
                                            {d.flags.map((f) => (
                                              <p key={f} className="text-[9px] font-black text-amber-600 flex items-center gap-1">
                                                <AlertTriangle size={9} /> {f}
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-3 text-center font-black text-amber-700 whitespace-nowrap">{fmtHours(d.weightedHours)}</td>
                                      <td className="p-3 text-right font-bold text-slate-700 whitespace-nowrap">
                                        {r.wage && d.weightedHours > 0
                                          ? formatRupiah(calculateOvertimePay(d.weightedHours, r.wage, settings.wageDivisor))
                                          : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Klik baris untuk melihat rincian harian. Estimasi upah bersifat perkiraan, verifikasi dengan HR sebelum pembayaran.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight = false }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border ${
        highlight ? "bg-[#003366] text-white border-blue-900 shadow-md shadow-blue-900/20" : "bg-white text-slate-800 border-slate-100 shadow-sm"
      }`}
    >
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</p>
      <h4 className="text-lg sm:text-xl font-black tracking-tight mt-2 break-words">{value}</h4>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2 truncate">{sub}</p>
    </div>
  );
}
