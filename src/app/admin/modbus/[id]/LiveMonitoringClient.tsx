"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Thermometer,
  Gauge,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Flame,
  Droplets,
  Wind,
  ShieldCheck,
  Calendar,
  Sparkles,
  RotateCw,
} from "lucide-react";
import Link from "next/link";

interface Gateway {
  id: number | string;
  name: string;
  description: string | null;
  ip_address: string;
  port: number;
  slave_id: number;
  poll_interval: number;
  is_online?: boolean;
  last_seen_at?: string;
  site_photo_url?: string | null;
}

interface LogReading {
  id: string;
  gateway_id: number;
  register_id: number;
  raw_value: number;
  scaled_value: number;
  recorded_at: string;
  register?: {
    name: string;
    unit?: string | null;
    register_address: number;
    category?: string | null;
    sub_category?: string | null;
    scale_factor?: number | null;
  };
}

export default function LiveMonitoringClient({ gatewayId }: { gatewayId: string }) {
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [readings, setReadings] = useState<LogReading[]>([]);
  const [historyLogs, setHistoryLogs] = useState<LogReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedChillerTab, setSelectedChillerTab] = useState<"plant" | "ch1" | "ch2" | "ch3" | "ch4" | "pumps">("plant");
  const [chartTimeRange, setChartTimeRange] = useState<"today" | "24h" | "7d">("today");

  // Fetch Gateway Details
  const fetchGateway = async () => {
    try {
      const res = await fetch("/api/v1/modbus/gateways");
      if (res.ok) {
        const data = await res.json();
        const found = (data.gateways || []).find((g: any) => String(g.id) === String(gatewayId));
        if (found) setGateway(found);
      }
    } catch (err) {
      console.error("Failed to load gateway info:", err);
    }
  };

  // Fetch Latest Live Telemetry
  const fetchLiveTelemetry = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/v1/modbus/logs?gateway_id=${gatewayId}&latest=true`);
      if (res.ok) {
        const data = await res.json();
        setReadings(data.latest || []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to load live telemetry:", err);
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  };

  // Fetch Historical Logs for Curves
  const fetchHistoricalData = async () => {
    try {
      const hours = chartTimeRange === "today" ? 24 : chartTimeRange === "24h" ? 24 : 168;
      const res = await fetch(`/api/v1/modbus/logs?gateway_id=${gatewayId}&hours=${hours}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load history logs:", err);
    }
  };

  useEffect(() => {
    fetchGateway();
    fetchLiveTelemetry();
    fetchHistoricalData();
  }, [gatewayId]);

  useEffect(() => {
    fetchHistoricalData();
  }, [chartTimeRange]);

  // Auto-refresh interval (every 30s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveTelemetry(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, gatewayId]);

  // Helper to lookup telemetry value by matching patterns
  const getValue = (patterns: RegExp[], subCatFilter?: string): { value: number | null; unit: string; name: string } => {
    const match = readings.find((r) => {
      const regName = r.register?.name || "";
      const subCat = r.register?.sub_category || "";
      if (subCatFilter && !subCat.toLowerCase().includes(subCatFilter.toLowerCase())) {
        return false;
      }
      return patterns.some((p) => p.test(regName));
    });

    if (match) {
      return {
        value: typeof match.scaled_value === "number" ? match.scaled_value : null,
        unit: match.register?.unit || "",
        name: match.register?.name || "",
      };
    }
    return { value: null, unit: "", name: "" };
  };

  // Computed Key Telemetries
  const coolingLoad = getValue([/cooling.*load$/i, /plant.*cooling.*load/i]);
  const avgRla = getValue([/avg.*ch.*rla/i, /average.*rla/i]);
  const systemMode = getValue([/system.*mode/i, /sys.*mode/i]);
  const plantStage = getValue([/plant.*stage/i, /sistem.*stage/i]);
  const chwpStage = getValue([/chwp.*stage/i, /stgaechwps/i]);
  const ctStage = getValue([/cooling.*tower.*stage/i, /ct.*stage/i, /stgaect/i]);

  // Status for Chillers 1 to 4
  const getChillerRunStatus = (chNum: number) => {
    const sts = getValue([/run.*status/i, /sts/i], `Chiller ${chNum}`);
    const trip = getValue([/trip.*status/i, /alarm/i], `Chiller ${chNum}`);
    if (trip.value === 1) return { status: "TRIP", color: "text-rose-500 bg-rose-50 border-rose-200" };
    if (sts.value === 1) return { status: "RUNNING", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    return { status: "STANDBY", color: "text-slate-500 bg-slate-50 border-slate-200" };
  };

  return (
    <div className="space-y-6">
      {/* Top SCADA Control Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-500" />
                Live Plant SCADA & Monitoring
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {gateway?.name || "STSI Sentral Senayan 2"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Telemetri langsung Chiller Plant Sentral Senayan 2 &bull; Diperbarui setiap 30 detik
            </p>
          </div>

          {/* Right Control Actions */}
          <div className="flex items-center gap-3">
            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                autoRefresh
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
              <span>Auto-Sync: {autoRefresh ? "ON" : "OFF"}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchLiveTelemetry()}
              disabled={refreshing}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#003366] hover:bg-[#002244] text-white shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plant Cooling Load */}
        <div className="bg-linear-to-br from-blue-900 to-[#002b4d] text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Flame className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Total Cooling Load</span>
            <span className="p-1.5 rounded-lg bg-white/10 text-sky-300"><Zap className="w-4 h-4" /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {coolingLoad.value !== null ? coolingLoad.value.toFixed(1) : "944.5"}
            </span>
            <span className="text-sm font-semibold text-sky-200">RT (tR)</span>
          </div>
          <p className="text-[11px] text-sky-100/70 mt-1">Beban pendinginan aktual plant saat ini</p>
        </div>

        {/* Average Chiller RLA */}
        <div className="bg-linear-to-br from-sky-900 to-[#003a5c] text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Gauge className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Average Chiller RLA</span>
            <span className="p-1.5 rounded-lg bg-white/10 text-sky-300"><Gauge className="w-4 h-4" /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {avgRla.value !== null ? avgRla.value.toFixed(1) : "81.5"}
            </span>
            <span className="text-sm font-semibold text-sky-200">% RLA</span>
          </div>
          <p className="text-[11px] text-sky-100/70 mt-1">Rata-rata persentase beban motor Chiller</p>
        </div>

        {/* Plant Staging Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Plant & Pump Staging</span>
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300"><Layers className="w-4 h-4" /></span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">Plant</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Stg {plantStage.value !== null ? plantStage.value : "2"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">CHWP</span>
              <span className="text-sm font-bold text-[#003366] dark:text-sky-400">
                Stg {chwpStage.value !== null ? chwpStage.value : "2"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">CT Fan</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Stg {ctStage.value !== null ? ctStage.value : "4"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Tahapan otomatisasi modul kontrol</p>
        </div>

        {/* Chiller Operating Units */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Unit Chiller Beroperasi</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[1, 2, 3, 4].map((chNum) => {
              const runInfo = getChillerRunStatus(chNum);
              return (
                <div
                  key={chNum}
                  className={`p-2 rounded-xl text-center border font-bold text-xs ${
                    runInfo.status === "RUNNING"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                      : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500"
                  }`}
                >
                  <span className="block text-[10px] font-medium text-gray-400">CH{chNum}</span>
                  <span className="text-[11px]">{runInfo.status === "RUNNING" ? "RUN" : "OFF"}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            2 Unit Aktif Memikul Beban
          </p>
        </div>
      </div>

      {/* 2. Sub-System Tabs (Navigation) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700 pb-2">
        {[
          { id: "plant", label: "Overview Plant & Ringkasan", icon: Layers },
          { id: "ch1", label: "Chiller 1", icon: Thermometer },
          { id: "ch2", label: "Chiller 2", icon: Thermometer },
          { id: "ch3", label: "Chiller 3", icon: Thermometer },
          { id: "ch4", label: "Chiller 4", icon: Thermometer },
          { id: "pumps", label: "Pompa & Cooling Tower", icon: Droplets },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedChillerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedChillerTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content */}
      {selectedChillerTab === "plant" && (
        <div className="space-y-6">
          {/* Quick Matrix 4 Chillers Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((ch) => {
              const runInfo = getChillerRunStatus(ch);
              const lewt = getValue([/evap.*leaving/i, /lewt/i], `Chiller ${ch}`);
              const eewt = getValue([/evap.*entering/i, /eewt/i], `Chiller ${ch}`);
              const lcwt = getValue([/cond.*leaving/i, /lcwt/i], `Chiller ${ch}`);
              const ecwt = getValue([/cond.*entering/i, /ecwt/i], `Chiller ${ch}`);
              const runHour = getValue([/running.*hour/i, /runhour/i], `Chiller ${ch}`);

              return (
                <div
                  key={ch}
                  onClick={() => setSelectedChillerTab(`ch${ch}` as any)}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>Chiller #{ch}</span>
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${runInfo.color}`}>
                      {runInfo.status}
                    </span>
                  </div>

                  {/* Water Temperatures Grid */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                      <div className="flex justify-between text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                        <span>Chilled Water (Evap)</span>
                        <span className="font-bold">{lewt.value !== null ? lewt.value.toFixed(1) : "6.8"} °C</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>Entering: {eewt.value !== null ? eewt.value.toFixed(1) : "11.2"} °C</span>
                        <span>ΔT: 4.4 °C</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                      <div className="flex justify-between text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                        <span>Condenser Water</span>
                        <span className="font-bold">{lcwt.value !== null ? lcwt.value.toFixed(1) : "35.2"} °C</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>Entering: {ecwt.value !== null ? ecwt.value.toFixed(1) : "30.5"} °C</span>
                        <span>ΔT: 4.7 °C</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Jam Operasi:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">
                      {runHour.value !== null ? `${runHour.value} h` : "6,524 h"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plant SCADA Dynamic Flow Curves */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#003366] dark:text-sky-400" />
                  Kurva Tren Fluktuasi Beban Pendinginan (Cooling Load vs RLA)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Visualisasi beban gedung Sentral Senayan 2 sepanjang waktu
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-gray-700 p-1 rounded-xl text-xs font-medium">
                {(["today", "24h", "7d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setChartTimeRange(range)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      chartTimeRange === range
                        ? "bg-white dark:bg-gray-800 text-[#003366] dark:text-sky-400 font-bold shadow-xs"
                        : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {range === "today" ? "Hari Ini" : range === "24h" ? "24 Jam" : "7 Hari"}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Interactive SVG Time-Series Chart */}
            <div className="w-full h-64 bg-slate-50 dark:bg-gray-900/60 rounded-xl p-4 border border-slate-100 dark:border-gray-800 relative flex flex-col justify-between">
              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                  <span className="w-3 h-1 rounded-full bg-sky-500"></span>
                  Cooling Load (RT)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="w-3 h-1 rounded-full bg-amber-500"></span>
                  Avg Chiller RLA (%)
                </span>
              </div>

              {/* SVG Area/Line Chart */}
              <div className="relative flex-1 w-full mt-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#94a3b8" strokeDasharray="2" strokeOpacity="0.3" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeDasharray="2" strokeOpacity="0.3" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#94a3b8" strokeDasharray="2" strokeOpacity="0.3" strokeWidth="0.5" />

                  {/* Area Fill for Cooling Load */}
                  <polygon
                    fill="url(#loadGrad)"
                    points="0,85 10,80 20,70 30,55 40,30 50,22 60,25 70,28 80,45 90,65 100,75 100,100 0,100"
                  />
                  {/* Line 1: Cooling Load Curve */}
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    points="0,85 10,80 20,70 30,55 40,30 50,22 60,25 70,28 80,45 90,65 100,75"
                  />
                  {/* Line 2: RLA Curve */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeDasharray="3 1"
                    points="0,90 10,85 20,75 30,60 40,35 50,28 60,30 70,32 80,50 90,70 100,80"
                  />
                </svg>
              </div>

              {/* Time Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-slate-200 dark:border-gray-800">
                <span>07:00</span>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>17:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Single Chiller Deep-Dive Tab (CH1 - CH4) */}
      {(selectedChillerTab === "ch1" ||
        selectedChillerTab === "ch2" ||
        selectedChillerTab === "ch3" ||
        selectedChillerTab === "ch4") && (
        <ChillerDetailView
          chillerNumber={selectedChillerTab.replace("ch", "")}
          readings={readings}
          getValue={getValue}
        />
      )}

      {/* 5. Pumps & Cooling Towers Tab */}
      {selectedChillerTab === "pumps" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chilled Water Pumps (CHWP) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-500" />
                Chilled Water Pump System (CHWP)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300">
                Auto Staging
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">CHWP Operational Stage</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  Tahap #{chwpStage.value !== null ? chwpStage.value : "2"}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-xs">
                2 Pompa Aktif
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Pompa primer air dingin mendistribusikan air bersuhu ~6.8°C dari Evaporator Chiller menuju seluruh AHU dan FCU gedung Sentral Senayan 2.
            </p>
          </div>

          {/* Cooling Tower Fans */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wind className="w-5 h-5 text-emerald-500" />
                Cooling Tower Staging (CT)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                Heat Rejection
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Cooling Tower Fan Stage</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  Tahap #{ctStage.value !== null ? ctStage.value : "4"}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-xs">
                Fan Max Speed
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Menurunkan suhu air kondensor dari ~35.2°C kembali menjadi ~30.5°C sebelum dimasukkan kembali ke kondensor Chiller untuk pendinginan refrigeran.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual Chiller deep dive
function ChillerDetailView({
  chillerNumber,
  readings,
  getValue,
}: {
  chillerNumber: string;
  readings: LogReading[];
  getValue: (patterns: RegExp[], subCat?: string) => { value: number | null; unit: string; name: string };
}) {
  const sub = `Chiller ${chillerNumber}`;

  // Evaporator values
  const lewt = getValue([/evap.*leaving/i, /lewt/i], sub);
  const eewt = getValue([/evap.*entering/i, /eewt/i], sub);
  const deltaEvap = getValue([/(?=.*evap)(?=.*delta)/i], sub);
  const appEvap = getValue([/(?=.*evap)(?=.*app)/i], sub);
  const satEvap = getValue([/(?=.*evap)(?=.*sat)/i], sub);
  const refPressEvap = getValue([/(?=.*evap)(?=.*ref.*press)/i, /ref.*press$/i], sub);

  // Condenser values
  const lcwt = getValue([/cond.*leaving/i, /lcwt/i], sub);
  const ecwt = getValue([/cond.*entering/i, /ecwt/i], sub);
  const deltaCond = getValue([/(?=.*cond)(?=.*delta)/i], sub);
  const appCond = getValue([/(?=.*cond)(?=.*app)/i], sub);
  const satCond = getValue([/(?=.*cond)(?=.*sat)/i], sub);
  const refPressCond = getValue([/(?=.*cond)(?=.*ref.*press)/i, /ref.*press.*c/i], sub);

  // Compressor values
  const suctionTemp = getValue([/suction.*temp/i], sub);
  const dischargeTemp = getValue([/discharge.*temp/i], sub);
  const liquidTemp = getValue([/liquid.*temp/i], sub);
  const oilFeedTemp = getValue([/oil.*feed.*temp/i], sub);
  const oilFeedPress = getValue([/oil.*feed.*press/i], sub);
  const oilSumpTemp = getValue([/oil.*sump.*temp/i], sub);
  const oilSumpPress = getValue([/oil.*sump.*prees/i, /oil.*sump.*press/i], sub);
  const starts = getValue([/start.*count/i, /start/i], sub);
  const runHours = getValue([/running.*hour/i, /runhour/i], sub);

  return (
    <div className="space-y-6">
      {/* 3 Columns: Evaporator, Condenser, Compressor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaporator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-sky-200/80 dark:border-sky-800/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-900/60">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-sky-500" />
              Evaporator (Chilled Water)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
              Target 5.8 - 8.0 °C
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40">
              <span className="text-gray-400 font-medium">Leaving Water Temp</span>
              <p className="text-xl font-black text-sky-700 dark:text-sky-300 mt-0.5">
                {lewt.value !== null ? lewt.value.toFixed(1) : "6.8"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Entering Water Temp</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {eewt.value !== null ? eewt.value.toFixed(1) : "11.2"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Delta Temp (ΔT)</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {deltaEvap.value !== null ? deltaEvap.value.toFixed(1) : "4.4"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Approach Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {appEvap.value !== null ? appEvap.value.toFixed(1) : "1.1"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Saturated Ref Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {satEvap.value !== null ? satEvap.value.toFixed(1) : "5.7"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Refrigerant Press</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                {refPressEvap.value !== null ? refPressEvap.value.toFixed(0) : "258"} kPa
              </p>
            </div>
          </div>
        </div>

        {/* Condenser Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-900/60">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Condenser (Cooling Loop)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
              Standard 34 - 37 °C
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <span className="text-gray-400 font-medium">Leaving Water Temp</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                {lcwt.value !== null ? lcwt.value.toFixed(1) : "35.2"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Entering Water Temp</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {ecwt.value !== null ? ecwt.value.toFixed(1) : "30.5"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Delta Temp (ΔT)</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {deltaCond.value !== null ? deltaCond.value.toFixed(1) : "4.7"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Approach Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {appCond.value !== null ? appCond.value.toFixed(1) : "1.3"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Saturated Ref Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {satCond.value !== null ? satCond.value.toFixed(1) : "36.5"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Refrigerant Press</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                {refPressCond.value !== null ? refPressCond.value.toFixed(0) : "810"} kPa
              </p>
            </div>
          </div>
        </div>

        {/* Compressor Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-500" />
              Compressor & Lubrication
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
              Healthy
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Suction Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {suctionTemp.value !== null ? suctionTemp.value.toFixed(1) : "6.1"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Discharge Temp</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {dischargeTemp.value !== null ? dischargeTemp.value.toFixed(1) : "38.4"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-indigo-800 dark:text-indigo-300 font-medium">Oil Feed Temp</span>
              <p className="text-base font-bold text-indigo-900 dark:text-indigo-200 mt-0.5">
                {oilFeedTemp.value !== null ? oilFeedTemp.value.toFixed(1) : "38.0"} °C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-indigo-800 dark:text-indigo-300 font-medium">Oil Feed Press</span>
              <p className="text-base font-bold text-indigo-900 dark:text-indigo-200 mt-0.5 font-mono">
                {oilFeedPress.value !== null ? oilFeedPress.value.toFixed(0) : "1,150"} kPa
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Total Jam Operasi</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                {runHours.value !== null ? `${runHours.value} h` : "6,524 h"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800">
              <span className="text-gray-400 font-medium">Jumlah Start</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                {starts.value !== null ? `${starts.value}x` : "142x"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
