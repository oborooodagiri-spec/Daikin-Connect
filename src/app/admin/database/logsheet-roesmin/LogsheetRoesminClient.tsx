"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Snowflake, Wind, Server, Fan,
  ChevronDown, ChevronRight, Save, Calendar,
  User, ClipboardList, Zap, Folder, FileText, History, FileDown
} from "lucide-react";
import Link from "next/link";

/* ───────── DATA DEFINITIONS ───────── */

type ParamDef = { key: string; label: string; unit?: string; type: "number" | "select"; options?: string[]; design?: string };
type UnitDef  = { id: string; label: string; params: ParamDef[] };
type GroupDef = { id: string; label: string; color: string; units: UnitDef[] };

const STATUS_OPTS   = ["ON", "OFF", "Auto", "Trip"];
const MV_OPTS       = ["Open", "Close", "Modulating"];
const FILTER_OPTS   = ["Normal", "Kotor", "Ganti"];
const ON_OFF        = ["ON", "OFF"];
const ON_OFF_TRIP   = ["ON", "OFF", "Trip"];
const ALARM_OPTS    = ["Normal", "Alarm"];
const ALARM_STATUS  = ["Normal", "Active", "Acknowledged"];
const DAMPER_OPTS   = ["Auto", "Manual"];
const HEATER_STAGE  = ["Stage 1", "Stage 2", "Stage 3", "OFF"];
const CONDENSER     = ["Clean", "Dirty"];
const UNIT_STATUS   = ["ON", "OFF", "Standby", "Trip"];

/* ── Chiller params ── */
const chillerParams: ParamDef[] = [
  { key: "status", label: "Chiller Status", type: "select", options: STATUS_OPTS },
  { key: "run_hours", label: "Run Hours", unit: "hr", type: "number" },
  { key: "mv_status", label: "MV Status", type: "select", options: MV_OPTS },
  { key: "capacity", label: "Unit Capacity", unit: "%", type: "number" },
  { key: "ewt", label: "EWT", unit: "°C", type: "number", design: "12" },
  { key: "lwt", label: "LWT", unit: "°C", type: "number", design: "7" },
  { key: "delta_t", label: "Δt", unit: "°C", type: "number", design: "5" },
  { key: "press_inlet", label: "Pressure Inlet", unit: "Bar", type: "number" },
  { key: "press_outlet", label: "Pressure Outlet", unit: "Bar", type: "number" },
  { key: "delta_p", label: "ΔP", unit: "Bar", type: "number" },
  { key: "arus_r", label: "Arus R", unit: "Amp", type: "number", design: "168.5" },
  { key: "arus_s", label: "Arus S", unit: "Amp", type: "number", design: "168.5" },
  { key: "arus_t", label: "Arus T", unit: "Amp", type: "number", design: "168.5" },
  { key: "volt_rs", label: "Voltage R-S", unit: "V", type: "number", design: "400" },
  { key: "volt_rt", label: "Voltage R-T", unit: "V", type: "number", design: "400" },
  { key: "volt_st", label: "Voltage S-T", unit: "V", type: "number", design: "400" },
  { key: "condenser", label: "Condenser", type: "select", options: CONDENSER },
];

const chwpParams: ParamDef[] = [
  { key: "status", label: "CHWP Status", type: "select", options: STATUS_OPTS },
  { key: "press_inlet", label: "Pressure Inlet", unit: "Bar", type: "number" },
  { key: "press_outlet", label: "Pressure Outlet", unit: "Bar", type: "number" },
  { key: "delta_p", label: "ΔP", unit: "Bar", type: "number" },
  { key: "arus_r", label: "Arus R", unit: "Amp", type: "number", design: "15.6" },
  { key: "arus_s", label: "Arus S", unit: "Amp", type: "number", design: "15.6" },
  { key: "arus_t", label: "Arus T", unit: "Amp", type: "number", design: "15.6" },
  { key: "volt_rs", label: "Voltage R-S", unit: "V", type: "number", design: "400" },
  { key: "volt_rt", label: "Voltage R-T", unit: "V", type: "number", design: "400" },
  { key: "volt_st", label: "Voltage S-T", unit: "V", type: "number", design: "400" },
];

const mainLineParams: ParamDef[] = [
  { key: "temp_inlet", label: "Temperature Inlet", unit: "°C", type: "number", design: "7" },
  { key: "temp_outlet", label: "Temperature Outlet", unit: "°C", type: "number", design: "12" },
  { key: "water_flow", label: "Water Flow", unit: "L/s", type: "number" },
  { key: "mv_persen", label: "Motorized Valve", unit: "%", type: "number" },
];

/* ── AHU params ── */
const ahuSimParams: ParamDef[] = [
  { key: "room_temp", label: "Room Temperature", unit: "°C", type: "number", design: "19" },
  { key: "room_rh", label: "Room Humidity", unit: "%", type: "number", design: "50-60" },
  { key: "room_press", label: "Room Pressure", unit: "Pa", type: "number", design: "10-15" },
  { key: "filter_pre", label: "Pre Filter", type: "select", options: FILTER_OPTS },
  { key: "filter_med", label: "Medium Filter", type: "select", options: FILTER_OPTS },
  { key: "filter_hepa", label: "HEPA Filter", type: "select", options: FILTER_OPTS },
  { key: "heater_status", label: "Heater Status", type: "select", options: ON_OFF },
  { key: "heater_stage", label: "Heater Stage", type: "select", options: HEATER_STAGE },
  { key: "heater_amp_r", label: "Heater Ampere R", unit: "Amp", type: "number" },
  { key: "heater_amp_s", label: "Heater Ampere S", unit: "Amp", type: "number" },
  { key: "heater_amp_t", label: "Heater Ampere T", unit: "Amp", type: "number" },
  { key: "heater_volt_rs", label: "Heater Voltage R-S", unit: "V", type: "number", design: "400" },
  { key: "heater_volt_rt", label: "Heater Voltage R-T", unit: "V", type: "number", design: "400" },
  { key: "heater_volt_st", label: "Heater Voltage S-T", unit: "V", type: "number", design: "400" },
  { key: "fan_status", label: "VSD Fan Status", type: "select", options: STATUS_OPTS },
  { key: "fan_freq", label: "Frequency", unit: "Hz", type: "number", design: "50" },
  { key: "fan_amp_r", label: "Fan Ampere R", unit: "Amp", type: "number" },
  { key: "fan_amp_s", label: "Fan Ampere S", unit: "Amp", type: "number" },
  { key: "fan_amp_t", label: "Fan Ampere T", unit: "Amp", type: "number" },
  { key: "fan_volt_rs", label: "Fan Voltage R-S", unit: "V", type: "number", design: "400" },
  { key: "fan_volt_rt", label: "Fan Voltage R-T", unit: "V", type: "number", design: "400" },
  { key: "fan_volt_st", label: "Fan Voltage S-T", unit: "V", type: "number", design: "400" },
  { key: "damper_status", label: "Damper Status", type: "select", options: DAMPER_OPTS },
  { key: "fresh_air_pct", label: "Fresh Air Percentage", unit: "%", type: "number" },
  { key: "ef_damper", label: "EF Damper", unit: "%", type: "number" },
  { key: "sa_1_1", label: "SA 1.1", unit: "%", type: "number", design: "100" },
  { key: "sa_1_2", label: "SA 1.2", unit: "%", type: "number", design: "100" },
  { key: "sa_1_3", label: "SA 1.3", unit: "%", type: "number", design: "100" },
  { key: "sa_1_4", label: "SA 1.4", unit: "%", type: "number", design: "100" },
];

const ahuCorridorParams: ParamDef[] = [
  ...ahuSimParams,
  { key: "damper_corr_supply", label: "Damper Corr Supply", unit: "%", type: "number", design: "100" },
  { key: "damper_corr_return", label: "Damper Corr Return", unit: "%", type: "number", design: "100" },
  { key: "damper_comp_supply", label: "Damper Comp Supply", unit: "%", type: "number" },
  { key: "fa_fan_status", label: "Fresh Air Fan Status", type: "select", options: ON_OFF },
  { key: "fa_fan_freq", label: "Fresh Air Fan Frequency", unit: "Hz", type: "number" },
  { key: "fa_fan_amp_r", label: "Fresh Air Fan Ampere R", unit: "Amp", type: "number" },
  { key: "fa_fan_amp_s", label: "Fresh Air Fan Ampere S", unit: "Amp", type: "number" },
  { key: "fa_fan_amp_t", label: "Fresh Air Fan Ampere T", unit: "Amp", type: "number" },
  { key: "fa_fan_volt_rs", label: "Fresh Air Fan Voltage R-S", unit: "V", type: "number", design: "400" },
  { key: "fa_fan_volt_rt", label: "Fresh Air Fan Voltage R-T", unit: "V", type: "number", design: "400" },
  { key: "fa_fan_volt_st", label: "Fresh Air Fan Voltage S-T", unit: "V", type: "number", design: "400" },
];

/* ── CRAC params ── */
const cracParams: ParamDef[] = [
  { key: "status", label: "Status Unit", type: "select", options: UNIT_STATUS },
  { key: "fan_status", label: "Status Fan", type: "select", options: ON_OFF },
  { key: "comp1", label: "Status Comp - 1", type: "select", options: ON_OFF_TRIP },
  { key: "comp2", label: "Status Comp - 2", type: "select", options: ON_OFF_TRIP },
  { key: "temp_alarm", label: "Temp High Alarm", type: "select", options: ALARM_OPTS },
  { key: "rh_alarm", label: "RH High Alarm", type: "select", options: ALARM_OPTS },
  { key: "alarm_status", label: "Alarm Status", type: "select", options: ALARM_STATUS },
  { key: "fan_speed", label: "Supply Fan Speed", unit: "%", type: "number" },
  { key: "return_temp", label: "Return Air Temp", unit: "°C", type: "number" },
  { key: "return_rh", label: "Return Air RH", unit: "%", type: "number" },
];

const powerParams: ParamDef[] = [
  { key: "l1_l2", label: "L1 - L2", unit: "V", type: "number", design: "400" },
  { key: "l2_l3", label: "L2 - L3", unit: "V", type: "number", design: "400" },
  { key: "l3_l1", label: "L3 - L1", unit: "V", type: "number", design: "400" },
];

/* ── FCU params ── */
const fcuParams: ParamDef[] = [
  { key: "room_temp", label: "Room Temp", unit: "°C", type: "number" },
  { key: "setpoint", label: "Room Setpoint", unit: "°C", type: "number" },
  { key: "fcu_status", label: "FCU Status", type: "select", options: ON_OFF },
  { key: "mv_status", label: "MV Status", type: "select", options: ON_OFF },
  { key: "ampere", label: "Ampere", unit: "A", type: "number", design: "0.98" },
];

const FCU_GF_ROOMS = [
  "MDF Room","Electrical Room","Server IDF Room","Ship & Packing Room","Utility Office",
  "Computer Workshop","Video Workshop","Corridor","Tech Pub Room","Maintenance Manager Office",
  "Cafetaria","Meeting Room","Building Main Office","Security Desk","Instructor Manager",
  "Briefing Room","Local Instructor Office","Simulator Operator","Simulator Technical",
  "Trainee's Office","IOS S1","IOS S2"
];

const FCU_1F_ROOMS = [
  "Security Supervision","Cafetaria","Gan Room","Male Changing Room","Seller IT Room",
  "Training IT Room","Prayer Room","Sparepart Room","IT Administration Office",
  "IT Network Supervision","PPT Room","Tutorial Classroom","Tutorial Classroom 2",
  "Trainer Office Room 2","Media Classroom","Tutorial Classroom 3","Meeting Room",
  "Coaching Room","Secretariat Office","General Manager Office","Administrative Manager",
  "Practical Academic 2","Practical Academic 1","Planification Room"
];

/* ── Build section configs ── */
const SECTIONS: { id: string; label: string; icon: string; color: string; bgColor: string; groups: GroupDef[] }[] = [
  {
    id: "chiller", label: "Chiller & CHWP", icon: "snowflake", color: "#0369a1", bgColor: "bg-blue-50",
    groups: [
      { id: "chillers", label: "Air Cooled Chiller", color: "#003366",
        units: Array.from({ length: 10 }, (_, i) => ({ id: `ch_${i+1}`, label: `Chiller ${i+1}`, params: chillerParams }))
      },
      { id: "chwp", label: "Chilled Water Pump", color: "#0369a1",
        units: ["2.01","2.02","1.01","1.02","1.03","1.04"].map(n => ({ id: `chwp_${n}`, label: `CHWP ${n}`, params: chwpParams }))
      },
      { id: "mainline", label: "Main Line Pipe", color: "#059669",
        units: [{ id: "main_line", label: "Main Line Pipe", params: mainLineParams }]
      }
    ]
  },
  {
    id: "ahu", label: "AHU", icon: "wind", color: "#4f46e5", bgColor: "bg-indigo-50",
    groups: [
      { id: "ahu_sim", label: "AHU Simulator", color: "#7c3aed",
        units: [
          { id: "ahu_sim_1", label: "AHU Simulator 1", params: ahuSimParams },
          { id: "ahu_sim_2", label: "AHU Simulator 2", params: ahuSimParams },
        ]
      },
      { id: "ahu_corr", label: "AHU Corridor", color: "#0891b2",
        units: [{ id: "ahu_corridor", label: "AHU Corridor", params: ahuCorridorParams }]
      }
    ]
  },
  {
    id: "crac", label: "CRAC & Power", icon: "server", color: "#e11d48", bgColor: "bg-rose-50",
    groups: [
      { id: "crac_units", label: "CRAC Units", color: "#be123c",
        units: ["GF-01","GF-02","2ND-01","2ND-02"].map(n => ({ id: `crac_${n.toLowerCase().replace("-","_")}`, label: `CRAC-${n}`, params: cracParams }))
      },
      { id: "genset", label: "Power Meter Genset", color: "#ca8a04",
        units: [{ id: "pm_genset", label: "Power Meter Genset", params: powerParams }]
      },
      { id: "pln", label: "Power Meter PLN", color: "#059669",
        units: [{ id: "pm_pln", label: "Power Meter PLN", params: powerParams }]
      }
    ]
  },
  {
    id: "fcu", label: "FCU", icon: "fan", color: "#059669", bgColor: "bg-emerald-50",
    groups: [
      { id: "fcu_gf", label: "FCU - Ground Floor", color: "#059669",
        units: FCU_GF_ROOMS.map((r, i) => ({ id: `fcu_gf_${i}`, label: r, params: fcuParams }))
      },
      { id: "fcu_1f", label: "FCU - 1st Floor", color: "#0d9488",
        units: FCU_1F_ROOMS.map((r, i) => ({ id: `fcu_1f_${i}`, label: r, params: fcuParams }))
      }
    ]
  }
];

/* ───────── ICON HELPER ───────── */
function SectionIcon({ name, size = 28, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  switch (name) {
    case "snowflake": return <Snowflake size={size} className={className} style={style} />;
    case "wind":      return <Wind size={size} className={className} style={style} />;
    case "server":    return <Server size={size} className={className} style={style} />;
    case "fan":       return <Fan size={size} className={className} style={style} />;
    default:          return <ClipboardList size={size} className={className} style={style} />;
  }
}

/* ───────── MAIN COMPONENT ───────── */
export default function LogsheetRoesminClient({ projectId }: { projectId?: string }) {
  const [activeTab, setActiveTab] = useState<"input" | "history">("input");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [inspector, setInspector] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { getRoesminLogsheets } = await import("@/app/actions/logsheet_roesmin");
      const res = await getRoesminLogsheets({ projectId, limit: 100 });
      if (res && 'success' in res && res.success && 'data' in res) {
        setHistoryData((res as any).data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingHistory(false);
  };

  const renderHistory = () => {
    // Group historyData by Year > Month > Date/Day
    const grouped: any = {};
    const monthsStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const daysStr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    
    historyData.forEach(item => {
      if (!item.service_date) return;
      const d = new Date(item.service_date);
      const year = d.getFullYear();
      const month = monthsStr[d.getMonth()];
      const dateKey = `${daysStr[d.getDay()]}, ${d.getDate()} ${month} ${year}`;
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = {};
      if (!grouped[year][month][dateKey]) grouped[year][month][dateKey] = [];
      
      grouped[year][month][dateKey].push(item);
    });

    return (
      <div className="max-w-5xl mx-auto py-8 pb-32">
        <h2 className="text-xl font-black text-[#003366] mb-6 flex items-center gap-2 px-4 md:px-0">
          <History className="text-[#00a1e4]" /> Riwayat Logsheet
        </h2>
        {loadingHistory ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-[#003366]/20 border-t-[#00a1e4] rounded-full animate-spin" /></div>
        ) : historyData.length === 0 ? (
          <div className="mx-4 md:mx-0 text-center py-20 text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">Belum ada riwayat logsheet.</div>
        ) : (
          <div className="space-y-4 px-4 md:px-0">
            {Object.keys(grouped).sort((a,b) => Number(b) - Number(a)).map(year => (
              <div key={year} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-[#003366] flex items-center gap-2 mb-4">
                  <Folder className="text-amber-400" fill="currentColor" /> Tahun {year}
                </h3>
                <div className="pl-4 border-l-2 border-slate-100 space-y-4 ml-3">
                  {Object.keys(grouped[year]).map(month => (
                    <div key={month}>
                      <h4 className="text-md font-bold text-slate-700 flex items-center gap-2 mb-3">
                        <Folder className="text-blue-400 w-5 h-5" fill="currentColor" /> {month}
                      </h4>
                      <div className="pl-4 border-l-2 border-slate-100 space-y-3 ml-2.5">
                        {Object.keys(grouped[year][month]).map(dateKey => (
                          <div key={dateKey}>
                            <h5 className="text-sm font-bold text-slate-500 mb-2">{dateKey}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {grouped[year][month][dateKey].map((item: any) => (
                                <div key={item.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-[#00a1e4]/30 hover:shadow-md transition-all group">
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID: #{item.id}</p>
                                    <p className="text-sm font-black text-[#003366] flex items-center gap-2">
                                      <User size={14} className="text-[#00a1e4]" /> {item.inspector_name || "Unknown"}
                                    </p>
                                  </div>
                                  <Link href={`/reports/preventive/${item.id}`} target="_blank"
                                    className="p-3 bg-white text-[#003366] border border-slate-200 rounded-xl hover:bg-[#00a1e4] hover:text-white hover:border-[#00a1e4] transition-all flex items-center gap-2">
                                    <FileDown size={16} /> <span className="text-xs font-bold hidden sm:inline">Buka PDF</span>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem("roesmin_logsheet_draft");
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.formData) setFormData(draft.formData);
        if (draft.date) setDate(draft.date);
        if (draft.inspector) setInspector(draft.inspector);
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  }, []);

  // Auto-save draft whenever data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("roesmin_logsheet_draft", JSON.stringify({
          formData, date, inspector
        }));
        setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.error("Failed to save draft:", e);
      }
    }, 2000); // Debounce auto-save by 2 seconds
    return () => clearTimeout(timer);
  }, [formData, date, inspector]);

  const handleInput = (unitId: string, key: string, val: string) => {
    setFormData(prev => ({ ...prev, [unitId]: { ...prev[unitId], [key]: val } }));
  };

  const handleSave = async () => {
    if (!inspector.trim()) {
      alert("Harap isi nama Inspector terlebih dahulu.");
      return;
    }
    
    // Check if any data was filled
    const filledUnits = Object.keys(formData).filter(k => Object.keys(formData[k] || {}).some(pk => formData[k][pk]));
    if (filledUnits.length === 0) {
      alert("Harap isi minimal satu parameter sebelum menyimpan.");
      return;
    }

    setSaving(true);
    try {
      const { saveRoesminLogsheet } = await import("@/app/actions/logsheet_roesmin");
      
      // Build sections metadata for PDF template
      const sectionsData = SECTIONS.map(s => ({
        id: s.id, label: s.label, icon: s.icon, color: s.color,
        groups: s.groups.map(g => ({
          id: g.id, label: g.label, color: g.color,
          units: g.units.map(u => ({
            id: u.id, label: u.label,
            params: u.params.map(p => ({ key: p.key, label: p.label, unit: p.unit, type: p.type, design: p.design }))
          }))
        }))
      }));
      
      const result = await saveRoesminLogsheet({
        date,
        inspector,
        formData,
        sections: sectionsData,
      }, projectId);
      
      if (result.success) {
        // Clear draft on successful save
        localStorage.removeItem("roesmin_logsheet_draft");
        setFormData({});
        setInspector("");
        setLastSaved(null);
        
        alert(`✅ Logsheet berhasil disimpan! ID: ${result.id}\n\nAnda dapat melihat dan generate report di halaman Project Lanud Roesmin Nurjadin.`);
        // Open the report in new tab
        window.open(`/reports/preventive/${result.id}`, "_blank");
      } else {
        alert("❌ Gagal menyimpan: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("❌ Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const section = SECTIONS.find(s => s.id === activeSection);

  /* ── Section Detail View ── */
  if (section) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveSection(null); setExpandedUnit(null); }}
              className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-[#003366] hover:text-white transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Logsheet Lanud Roesmin Nurjadin</p>
              <h1 className="text-lg font-black text-[#003366] uppercase tracking-tight truncate">{section.label}</h1>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: section.bgColor.replace("bg-","").includes("blue") ? "#dbeafe" : section.bgColor.replace("bg-","").includes("indigo") ? "#e0e7ff" : section.bgColor.replace("bg-","").includes("rose") ? "#ffe4e6" : "#d1fae5" }}>
              <SectionIcon name={section.icon} size={22} className="text-[#003366]" />
            </div>
          </div>
        </div>

        {/* Groups & Units */}
        <div className="p-4 md:p-8 space-y-8 pb-32">
          {section.groups.map(group => (
            <div key={group.id}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: group.color }} />
                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: group.color }}>{group.label}</h2>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{group.units.length} unit</span>
              </div>

              {/* Unit Accordions */}
              <div className="space-y-3">
                {group.units.map(unit => {
                  const isOpen = expandedUnit === unit.id;
                  const filledCount = Object.keys(formData[unit.id] || {}).filter(k => formData[unit.id]?.[k]).length;
                  return (
                    <div key={unit.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedUnit(isOpen ? null : unit.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                            style={{ backgroundColor: group.color }}>
                            {unit.label.match(/\d+/)?.[0] || "•"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#003366] truncate">{unit.label}</p>
                            <p className="text-[9px] font-bold text-slate-400">{filledCount}/{unit.params.length} parameter terisi</p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={18} className="text-slate-400" />
                        </motion.div>
                      </button>

                      {/* Accordion Body */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-2 border-t border-slate-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {unit.params.map(p => (
                                  <div key={p.key} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider truncate">
                                        {p.label}
                                        {p.unit && <span className="ml-1 text-[#00a1e4] lowercase">({p.unit})</span>}
                                      </label>
                                      {p.design && (
                                        <span className="text-[8px] font-black text-slate-300 shrink-0 ml-2">
                                          D: {p.design}
                                        </span>
                                      )}
                                    </div>
                                    {p.type === "select" ? (
                                      <select
                                        value={formData[unit.id]?.[p.key] || ""}
                                        onChange={e => handleInput(unit.id, p.key, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#003366] outline-none focus:bg-white focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5 transition-all appearance-none"
                                      >
                                        <option value="">Pilih...</option>
                                        {p.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                      </select>
                                    ) : (
                                      <input
                                        type="number"
                                        step="0.1"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={formData[unit.id]?.[p.key] || ""}
                                        onChange={e => handleInput(unit.id, p.key, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#003366] outline-none focus:bg-white focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5 transition-all"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 md:px-8">
          <div className="flex items-center gap-3 max-w-5xl mx-auto">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-[#003366] outline-none focus:border-[#00a1e4]"
                />
              </div>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Inspector" value={inspector} onChange={e => setInspector(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-[#003366] outline-none focus:border-[#00a1e4]"
                />
              </div>
            </div>
            
            {lastSaved && (
              <span className="hidden md:inline text-[10px] text-slate-400 font-bold mr-2 whitespace-nowrap">
                Draft auto-saved {lastSaved}
              </span>
            )}
            
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-[#003366] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#00a1e4] transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-lg shadow-[#003366]/20">
              {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Grid View (4 Section Icons) ── */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-6 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/database"
            className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-[#003366] hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00a1e4]">Daily Logsheet</p>
            <h1 className="text-xl md:text-2xl font-black text-[#003366] uppercase tracking-tight">Lanud Roesmin Nurjadin</h1>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Rafale Simulator — Monitoring HVAC Harian</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("input")}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === "input" 
                ? "bg-[#003366] text-white shadow-md shadow-[#003366]/20" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Input Logsheet
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "history" 
                ? "bg-[#00a1e4] text-white shadow-md shadow-[#00a1e4]/20" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <History size={14} /> Riwayat
          </button>
        </div>

        {/* Date & Inspector Bar (Only for Input Tab) */}
        {activeTab === "input" && (
          <div className="mt-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#003366] outline-none focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5"
              />
            </div>
            <div className="relative flex-1">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Nama Inspector" value={inspector} onChange={e => setInspector(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#003366] outline-none focus:border-[#00a1e4] focus:ring-4 focus:ring-[#00a1e4]/5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === "history" ? renderHistory() : (
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          {SECTIONS.map((sec, i) => {
            const totalParams = sec.groups.reduce((a, g) => a + g.units.reduce((b, u) => b + u.params.length, 0), 0);
            const totalUnits  = sec.groups.reduce((a, g) => a + g.units.length, 0);
            const filledParams = sec.groups.reduce((a, g) => a + g.units.reduce((b, u) => b + Object.keys(formData[u.id] || {}).filter(k => formData[u.id]?.[k]).length, 0), 0);

            return (
              <motion.button
                key={sec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSection(sec.id)}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5 transition-transform duration-700 group-hover:scale-[2]"
                  style={{ backgroundColor: sec.color }} />

                {/* Icon */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 ${sec.bgColor}`}>
                  <SectionIcon name={sec.icon} size={32} style={{ color: sec.color } as any} />
                </div>

                {/* Label */}
                <h3 className="text-sm md:text-base font-black text-[#003366] uppercase tracking-tight mb-1 group-hover:text-[#00a1e4] transition-colors">
                  {sec.label}
                </h3>

                {/* Stats */}
                <p className="text-[9px] font-bold text-slate-400 mb-3">
                  {totalUnits} unit &bull; {totalParams} parameter
                </p>

                {/* Progress */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${totalParams > 0 ? (filledParams / totalParams) * 100 : 0}%`, backgroundColor: sec.color }} />
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                  {filledParams}/{totalParams} terisi
                </p>

                {/* Arrow */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  <ChevronRight size={16} style={{ color: sec.color }} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
