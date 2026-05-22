"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────
const P_ATM = 101325; // Pa

// ─── Core Psychrometric Functions ────────────────────────────────────────────
function pws(T: number): number {
  return 610.94 * Math.exp((17.625 * T) / (T + 243.04));
}

function humidityRatio(Pv: number): number {
  return 0.622 * Pv / (P_ATM - Pv);
}

function enthalpy(Tdb: number, W: number): number {
  return 1.006 * Tdb + W * (2501 + 1.86 * Tdb);
}

function specificVolume(Tdb: number, W: number): number {
  return (287.058 * (Tdb + 273.15) * (1 + 1.6078 * W)) / P_ATM;
}

function dewPoint(Pv: number): number {
  if (Pv <= 0) return -50;
  const ln = Math.log(Pv / 610.94);
  return (243.04 * ln) / (17.625 - ln);
}

function wetBulbFromPv(Tdb: number, Pv: number): number {
  const dp = dewPoint(Pv);
  let lo = Math.max(dp, -50);
  let hi = Tdb;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pvCalc = pws(mid) - 0.000662 * P_ATM * (Tdb - mid);
    if (pvCalc < Pv) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

// ─── Types ───────────────────────────────────────────────────────────────────
type InputMode = "dbt_rh" | "dbt_wbt" | "dbt_dp";

interface PsychResult {
  dbt: number;
  wbt: number;
  dp: number;
  rh: number;
  W: number; // g/kg
  h: number;
  v: number;
  density: number;
  Pv: number; // kPa
  Pws: number; // kPa
}

// ─── Calculation Engine ──────────────────────────────────────────────────────
function calculate(
  mode: InputMode,
  input1: number,
  input2: number
): PsychResult | null {
  const dbt = input1;

  if (isNaN(dbt)) return null;
  if (isNaN(input2)) return null;

  let Pv: number;
  let PwsAtDbt = pws(dbt);

  switch (mode) {
    case "dbt_rh": {
      const rh = input2;
      if (rh < 0 || rh > 100) return null;
      Pv = (rh / 100) * PwsAtDbt;
      break;
    }
    case "dbt_wbt": {
      const wbt = input2;
      if (wbt > dbt) return null;
      Pv = pws(wbt) - 0.000662 * P_ATM * (dbt - wbt);
      if (Pv < 0) Pv = 0;
      break;
    }
    case "dbt_dp": {
      const dpIn = input2;
      if (dpIn > dbt) return null;
      Pv = pws(dpIn);
      break;
    }
    default:
      return null;
  }

  if (Pv < 0) Pv = 0;
  if (Pv >= P_ATM) return null;

  const rh = (Pv / PwsAtDbt) * 100;
  const W = humidityRatio(Pv);
  const h = enthalpy(dbt, W);
  const v = specificVolume(dbt, W);
  const density = 1 / v;
  const dp = dewPoint(Pv);
  const wbt = mode === "dbt_wbt" ? input2 : wetBulbFromPv(dbt, Pv);

  return {
    dbt,
    wbt,
    dp,
    rh: Math.min(rh, 100),
    W: W * 1000,
    h,
    v,
    density,
    Pv: Pv / 1000,
    Pws: PwsAtDbt / 1000,
  };
}

// ─── Chart Constants ─────────────────────────────────────────────────────────
const CHART_W = 800;
const CHART_H = 500;
const PAD_L = 60;
const PAD_R = 60;
const PAD_T = 30;
const PAD_B = 50;
const CW = CHART_W - PAD_L - PAD_R;
const CH = CHART_H - PAD_T - PAD_B;
const T_MIN = 0;
const T_MAX = 50;
const W_MIN = 0;
const W_MAX = 30;

function toSvgX(T: number): number {
  return PAD_L + ((T - T_MIN) / (T_MAX - T_MIN)) * CW;
}
function toSvgY(W: number): number {
  return PAD_T + CH - ((W - W_MIN) / (W_MAX - W_MIN)) * CH;
}

// ─── RH Line Paths ──────────────────────────────────────────────────────────
const RH_LINES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const LABELED_RH = [20, 40, 60, 80];

function buildRhPaths(): { rh: number; d: string; labelPos: { x: number; y: number } | null }[] {
  return RH_LINES.map((rhVal) => {
    const pts: { x: number; y: number }[] = [];
    for (let T = T_MIN; T <= T_MAX; T += 0.5) {
      const PwsT = pws(T);
      const PvT = (rhVal / 100) * PwsT;
      const Wt = (0.622 * PvT) / (P_ATM - PvT) * 1000;
      if (Wt >= W_MIN && Wt <= W_MAX) {
        pts.push({ x: toSvgX(T), y: toSvgY(Wt) });
      }
    }
    if (pts.length === 0) return { rh: rhVal, d: "", labelPos: null };

    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
    }

    // Label position near the end of the curve (75% along)
    const labelIdx = Math.min(Math.floor(pts.length * 0.85), pts.length - 1);
    const labelPos = LABELED_RH.includes(rhVal)
      ? { x: pts[labelIdx].x, y: pts[labelIdx].y }
      : null;

    return { rh: rhVal, d, labelPos };
  });
}

// ─── Input Mode Config ───────────────────────────────────────────────────────
const INPUT_MODES: { key: InputMode; label: string; icon: React.ReactNode; fields: [string, string] }[] = [
  {
    key: "dbt_rh",
    label: "DBT + RH",
    icon: <Thermometer size={14} />,
    fields: ["Dry-Bulb Temperature (°C)", "Relative Humidity (%)"],
  },
  {
    key: "dbt_wbt",
    label: "DBT + WBT",
    icon: <Droplets size={14} />,
    fields: ["Dry-Bulb Temperature (°C)", "Wet-Bulb Temperature (°C)"],
  },
  {
    key: "dbt_dp",
    label: "DBT + DP",
    icon: <Wind size={14} />,
    fields: ["Dry-Bulb Temperature (°C)", "Dew Point Temperature (°C)"],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function PsychrometricClient() {
  const [mode, setMode] = useState<InputMode>("dbt_rh");
  const [input1, setInput1] = useState("30");
  const [input2, setInput2] = useState("60");
  const [showChart, setShowChart] = useState(false);

  const modeConfig = INPUT_MODES.find((m) => m.key === mode)!;

  // Pre-calculate chart RH curves
  const rhPaths = useMemo(() => buildRhPaths(), []);

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    // Vertical: every 5°C
    for (let T = T_MIN; T <= T_MAX; T += 5) {
      const x = toSvgX(T);
      lines.push(
        <line key={`vg-${T}`} x1={x} y1={PAD_T} x2={x} y2={PAD_T + CH} stroke="#e2e8f0" strokeWidth={0.5} />
      );
    }
    // Horizontal: every 5 g/kg
    for (let W = W_MIN; W <= W_MAX; W += 5) {
      const y = toSvgY(W);
      lines.push(
        <line key={`hg-${W}`} x1={PAD_L} y1={y} x2={PAD_L + CW} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
      );
    }
    return lines;
  }, []);

  // X-axis labels
  const xLabels = useMemo(() => {
    const labels: React.ReactElement[] = [];
    for (let T = T_MIN; T <= T_MAX; T += 5) {
      labels.push(
        <text
          key={`xl-${T}`}
          x={toSvgX(T)}
          y={PAD_T + CH + 20}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize={10}
          fontWeight={600}
        >
          {T}°
        </text>
      );
    }
    return labels;
  }, []);

  // Y-axis labels (right)
  const yLabels = useMemo(() => {
    const labels: React.ReactElement[] = [];
    for (let W = W_MIN; W <= W_MAX; W += 5) {
      labels.push(
        <text
          key={`yl-${W}`}
          x={PAD_L + CW + 10}
          y={toSvgY(W) + 4}
          textAnchor="start"
          className="fill-slate-400"
          fontSize={10}
          fontWeight={600}
        >
          {W}
        </text>
      );
    }
    return labels;
  }, []);

  // Calculate results
  const result = useMemo(() => {
    const v1 = parseFloat(input1);
    const v2 = parseFloat(input2);
    return calculate(mode, v1, v2);
  }, [mode, input1, input2]);

  // State point SVG coordinates
  const statePoint = useMemo(() => {
    if (!result) return null;
    return {
      x: toSvgX(result.dbt),
      y: toSvgY(result.W),
    };
  }, [result]);

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    // Reset input2 to sensible defaults
    if (newMode === "dbt_rh") setInput2("60");
    else if (newMode === "dbt_wbt") setInput2("24");
    else if (newMode === "dbt_dp") setInput2("20");
  };

  const resultItems = result
    ? [
        { label: "Dry-Bulb Temp", value: result.dbt.toFixed(1), unit: "°C" },
        { label: "Wet-Bulb Temp", value: result.wbt.toFixed(1), unit: "°C" },
        { label: "Dew Point Temp", value: result.dp.toFixed(1), unit: "°C" },
        { label: "Relative Humidity", value: result.rh.toFixed(1), unit: "%" },
        { label: "Humidity Ratio", value: result.W.toFixed(2), unit: "g/kg" },
        { label: "Enthalpy", value: result.h.toFixed(2), unit: "kJ/kg" },
        { label: "Specific Volume", value: result.v.toFixed(4), unit: "m³/kg" },
        { label: "Air Density", value: result.density.toFixed(4), unit: "kg/m³" },
        { label: "Vapor Pressure", value: result.Pv.toFixed(3), unit: "kPa" },
        { label: "Saturation Pressure", value: result.Pws.toFixed(3), unit: "kPa" },
      ]
    : [];

  // ─── SVG Chart ──────────────────────────────────────────────────────────
  const chartSvg = (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background */}
      <rect x={PAD_L} y={PAD_T} width={CW} height={CH} fill="#f8fafc" rx={4} />

      {/* Grid */}
      {gridLines}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T + CH} x2={PAD_L + CW} y2={PAD_T + CH} stroke="#94a3b8" strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CH} stroke="#94a3b8" strokeWidth={1} />
      <line x1={PAD_L + CW} y1={PAD_T} x2={PAD_L + CW} y2={PAD_T + CH} stroke="#94a3b8" strokeWidth={0.5} />

      {/* X-axis title */}
      <text
        x={PAD_L + CW / 2}
        y={CHART_H - 4}
        textAnchor="middle"
        className="fill-slate-500"
        fontSize={11}
        fontWeight={700}
      >
        Dry-Bulb Temperature (°C)
      </text>

      {/* Y-axis title (right) */}
      <text
        x={CHART_W - 4}
        y={PAD_T + CH / 2}
        textAnchor="middle"
        className="fill-slate-500"
        fontSize={11}
        fontWeight={700}
        transform={`rotate(-90, ${CHART_W - 4}, ${PAD_T + CH / 2})`}
      >
        Humidity Ratio (g/kg)
      </text>

      {/* Axis labels */}
      {xLabels}
      {yLabels}

      {/* RH Curves */}
      {rhPaths.map(({ rh, d, labelPos }) => {
        if (!d) return null;
        const isSat = rh === 100;
        return (
          <g key={`rh-${rh}`}>
            <path
              d={d}
              fill="none"
              stroke={isSat ? "#0073ea" : "#cbd5e1"}
              strokeWidth={isSat ? 2.5 : 1}
              strokeLinejoin="round"
            />
            {labelPos && (
              <text
                x={labelPos.x + 4}
                y={labelPos.y - 6}
                className="fill-slate-400"
                fontSize={9}
                fontWeight={700}
              >
                {rh}%
              </text>
            )}
          </g>
        );
      })}

      {/* State Point */}
      {statePoint && statePoint.x >= PAD_L && statePoint.x <= PAD_L + CW && statePoint.y >= PAD_T && statePoint.y <= PAD_T + CH && (
        <g>
          {/* Crosshairs */}
          <line
            x1={statePoint.x}
            y1={PAD_T}
            x2={statePoint.x}
            y2={PAD_T + CH}
            stroke="#0073ea"
            strokeWidth={0.8}
            strokeDasharray="4 3"
            opacity={0.4}
          />
          <line
            x1={PAD_L}
            y1={statePoint.y}
            x2={PAD_L + CW}
            y2={statePoint.y}
            stroke="#0073ea"
            strokeWidth={0.8}
            strokeDasharray="4 3"
            opacity={0.4}
          />

          {/* Pulsing outer ring */}
          <circle cx={statePoint.x} cy={statePoint.y} r={12} fill="#0073ea" opacity={0.1}>
            <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Core dot */}
          <circle cx={statePoint.x} cy={statePoint.y} r={5} fill="#0073ea" stroke="#fff" strokeWidth={2} />

          {/* Value label */}
          <rect
            x={statePoint.x + 10}
            y={statePoint.y - 24}
            width={90}
            height={20}
            rx={6}
            fill="#0073ea"
            opacity={0.9}
          />
          <text
            x={statePoint.x + 55}
            y={statePoint.y - 11}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontWeight={700}
          >
            {result!.dbt.toFixed(1)}°C, {result!.W.toFixed(1)} g/kg
          </text>
        </g>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/tools"
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#323338] tracking-tight">
              Psychrometric Calculator
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── Left Column: Inputs + Results ────────────────────────────── */}
          <div className="space-y-6">
            {/* Input Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-[2rem] border border-[#e6e9ef] p-6"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Select Known Properties
              </p>
              <div className="flex flex-wrap gap-2">
                {INPUT_MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleModeChange(m.key)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      mode === m.key
                        ? "bg-[#0073ea] text-white shadow-lg shadow-blue-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    {modeConfig.fields[0]}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm px-6 py-4 text-[#323338] outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Enter value..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    {modeConfig.fields[1]}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm px-6 py-4 text-[#323338] outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Enter value..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Results Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 rounded-[2rem] p-6"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
                Calculated Properties
              </p>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {resultItems.map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white rounded-2xl border border-slate-100 p-4"
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                          {item.label}
                        </p>
                        <p className="text-lg font-bold text-[#0073ea] leading-tight">
                          {item.value}
                          <span className="text-xs font-bold text-slate-400 ml-1">
                            {item.unit}
                          </span>
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-slate-400 text-sm font-medium"
                  >
                    Enter valid inputs to see results
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ─── Right Column: SVG Chart (desktop) ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">
                Psychrometric Chart
              </p>
              {chartSvg}
            </div>
          </motion.div>
        </div>

        {/* ─── Mobile Chart Toggle ──────────────────────────────────────── */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => setShowChart(!showChart)}
            className="w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            <BarChart3 size={16} />
            {showChart ? "Sembunyikan Grafik" : "Tampilkan Grafik"}
            <ChevronDown
              size={16}
              className={`transition-transform ${showChart ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {showChart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">
                    Psychrometric Chart
                  </p>
                  {chartSvg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
