"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wind, Droplets, Thermometer, Gauge, Info } from "lucide-react";
import Link from "next/link";

/* ───────── Psychrometric helpers ───────── */
const Patm = 101325; // Pa

function pws(T: number) {
  return 610.94 * Math.exp((17.625 * T) / (T + 243.04));
}

function humidityRatio(tdb: number, rh: number) {
  const pv = (rh / 100) * pws(tdb);
  return 0.622 * pv / (Patm - pv); // kg/kg
}

function enthalpy(tdb: number, W: number) {
  return 1.006 * tdb + W * (2501 + 1.86 * tdb); // kJ/kg
}

function rhFromTW(tdb: number, W: number) {
  const pvMix = (W * Patm) / (0.622 + W);
  return (pvMix / pws(tdb)) * 100;
}

/* ───────── Unit conversion ───────── */
function cfmToCmh(cfm: number) {
  return cfm / 0.5886;
}
function cmhToCfm(cmh: number) {
  return cmh * 0.5886;
}

/* ───────── Sub-components ───────── */

function InputRow({
  label,
  value,
  onChange,
  unit,
  step = "any",
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-[#0073ea] px-6 py-4 outline-none focus:border-[#0073ea]/40 transition-all min-w-0"
      />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-right shrink-0">
        {unit}
      </span>
    </div>
  );
}

function InfoRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-600">{value}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  );
}

function ResultItem({
  label,
  value,
  unit,
  delay = 0,
}: {
  label: string;
  value: string;
  unit: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center text-center p-4"
    >
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
        {label}
      </span>
      <span className="text-2xl md:text-3xl font-bold text-[#0073ea]">{value}</span>
      <span className="text-[10px] font-black text-slate-400 uppercase mt-1">{unit}</span>
    </motion.div>
  );
}

/* ───────── Mixing Diagram (SVG) ───────── */
function MixingDiagram({
  t1,
  q1,
  t2,
  q2,
  tMix,
  qTotal,
  flowUnit,
}: {
  t1: number;
  q1: number;
  t2: number;
  q2: number;
  tMix: number;
  qTotal: number;
  flowUnit: "CFM" | "CMH";
}) {
  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox="0 0 420 260" className="w-full max-w-[420px] h-auto" fill="none">
        {/* Stream 1 — top left arrow */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Pipe */}
          <rect x="20" y="52" width="130" height="28" rx="6" fill="#0073ea" opacity="0.12" />
          <motion.rect
            x="20"
            y="52"
            width="130"
            height="28"
            rx="6"
            fill="#0073ea"
            opacity="0.25"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Arrow head */}
          <polygon points="150,50 150,82 172,66" fill="#0073ea" opacity="0.6" />
          {/* Label */}
          <text x="85" y="46" textAnchor="middle" className="text-[10px] font-bold" fill="#0073ea">
            Stream 1
          </text>
          <text x="85" y="100" textAnchor="middle" className="text-[9px] font-semibold" fill="#64748b">
            {t1.toFixed(1)}°C · {q1.toFixed(0)} {flowUnit}
          </text>
        </motion.g>

        {/* Stream 2 — bottom left arrow */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <rect x="20" y="172" width="130" height="28" rx="6" fill="#fdab3d" opacity="0.15" />
          <motion.rect
            x="20"
            y="172"
            width="130"
            height="28"
            rx="6"
            fill="#fdab3d"
            opacity="0.25"
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <polygon points="150,170 150,202 172,186" fill="#fdab3d" opacity="0.6" />
          <text x="85" y="166" textAnchor="middle" className="text-[10px] font-bold" fill="#fdab3d">
            Stream 2
          </text>
          <text x="85" y="220" textAnchor="middle" className="text-[9px] font-semibold" fill="#64748b">
            {t2.toFixed(1)}°C · {q2.toFixed(0)} {flowUnit}
          </text>
        </motion.g>

        {/* Mixing box */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <rect x="172" y="96" width="80" height="60" rx="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="212" y="122" textAnchor="middle" className="text-[9px] font-black uppercase" fill="#94a3b8">
            Mixing
          </text>
          <text x="212" y="137" textAnchor="middle" className="text-[9px] font-black uppercase" fill="#94a3b8">
            Chamber
          </text>
        </motion.g>

        {/* Connector lines */}
        <motion.path
          d="M172 66 Q192 66 192 96"
          stroke="#0073ea"
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.path
          d="M172 186 Q192 186 192 156"
          stroke="#fdab3d"
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        />

        {/* Mixed air — right arrow */}
        <motion.g
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <rect x="252" y="112" width="130" height="28" rx="6" fill="#00c875" opacity="0.12" />
          <motion.rect
            x="252"
            y="112"
            width="130"
            height="28"
            rx="6"
            fill="#00c875"
            opacity="0.25"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <polygon points="382,110 382,142 404,126" fill="#00c875" opacity="0.6" />
          <text x="317" y="106" textAnchor="middle" className="text-[10px] font-bold" fill="#00c875">
            Mixed Air
          </text>
          <text x="317" y="158" textAnchor="middle" className="text-[9px] font-semibold" fill="#64748b">
            {tMix.toFixed(1)}°C · {qTotal.toFixed(0)} {flowUnit}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────── Main Component ───────── */
export default function AirMixingClient() {
  /* Flow unit toggle */
  const [flowUnit, setFlowUnit] = useState<"CFM" | "CMH">("CFM");

  /* Stream 1 state */
  const [q1, setQ1] = useState(1000);
  const [t1, setT1] = useState(35);
  const [rh1, setRh1] = useState(60);

  /* Stream 2 state */
  const [q2, setQ2] = useState(3000);
  const [t2, setT2] = useState(24);
  const [rh2, setRh2] = useState(50);

  /* All derived calculations */
  const calc = useMemo(() => {
    // Humidity ratios (kg/kg)
    const w1 = humidityRatio(t1, rh1);
    const w2 = humidityRatio(t2, rh2);

    // Enthalpies
    const h1 = enthalpy(t1, w1);
    const h2 = enthalpy(t2, w2);

    // Normalize flows to same unit for mixing math (use CFM internally)
    const flow1 = flowUnit === "CMH" ? cmhToCfm(q1) : q1;
    const flow2 = flowUnit === "CMH" ? cmhToCfm(q2) : q2;
    const totalFlow = flow1 + flow2;

    if (totalFlow === 0) {
      return {
        w1: 0, w2: 0, h1: 0, h2: 0,
        qTotal: 0, tMix: 0, wMix: 0, rhMix: 0, hMix: 0, shr: 0,
      };
    }

    const tMix = (flow1 * t1 + flow2 * t2) / totalFlow;
    const wMix = (flow1 * w1 + flow2 * w2) / totalFlow;
    const hMix = (flow1 * h1 + flow2 * h2) / totalFlow;
    const rhMix = Math.min(rhFromTW(tMix, wMix), 100);

    // Sensible heat ratio
    const hSensibleMix = 1.006 * tMix;
    const shr = hMix !== 0 ? hSensibleMix / hMix : 0;

    // Total flow in display unit
    const qTotal = q1 + q2;

    return {
      w1: w1 * 1000, // g/kg
      w2: w2 * 1000,
      h1,
      h2,
      qTotal,
      tMix,
      wMix: wMix * 1000, // g/kg
      rhMix,
      hMix,
      shr: Math.abs(shr),
    };
  }, [q1, t1, rh1, q2, t2, rh2, flowUnit]);

  const fmt = (v: number, d = 2) => (isFinite(v) ? v.toFixed(d) : "—");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#0073ea] transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0073ea]/10 flex items-center justify-center">
              <Wind size={20} className="text-[#0073ea]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#323338] tracking-tight">
                Air Mixing Calculator
              </h1>
            </div>
          </div>
        </motion.div>

        {/* ── Flow Unit Toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-8"
        >
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">
            Flow Unit
          </span>
          {(["CFM", "CMH"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setFlowUnit(u)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                flowUnit === u
                  ? "bg-[#0073ea] text-white shadow-lg shadow-[#0073ea]/20"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {u}
            </button>
          ))}
        </motion.div>

        {/* ── 3-column: Stream 1 | Diagram | Stream 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stream 1 Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#e6e9ef] rounded-[2rem] p-6 space-y-5 order-1"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#0073ea]" />
              <h2 className="text-sm font-black text-[#323338] uppercase tracking-wide">
                Air Stream 1
              </h2>
              <span className="text-[10px] font-bold text-slate-400 ml-auto">Outdoor Air</span>
            </div>

            <InputRow
              label="Air Flow"
              value={q1}
              onChange={setQ1}
              unit={flowUnit}
              step="10"
              min={0}
            />
            <InputRow
              label="Dry-Bulb Temp"
              value={t1}
              onChange={setT1}
              unit="°C"
              step="0.1"
            />
            <InputRow
              label="Relative Humidity"
              value={rh1}
              onChange={setRh1}
              unit="%"
              step="1"
              min={0}
              max={100}
            />

            {/* Auto-calculated info */}
            <div className="border-t border-slate-100 pt-4 space-y-1">
              <div className="flex items-center gap-1 mb-2">
                <Info size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Derived Properties
                </span>
              </div>
              <InfoRow label="Humidity Ratio" value={fmt(calc.w1, 2)} unit="g/kg" />
              <InfoRow label="Enthalpy" value={fmt(calc.h1, 2)} unit="kJ/kg" />
            </div>
          </motion.div>

          {/* Center Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex items-center justify-center order-2"
          >
            <MixingDiagram
              t1={t1}
              q1={q1}
              t2={t2}
              q2={q2}
              tMix={calc.tMix}
              qTotal={calc.qTotal}
              flowUnit={flowUnit}
            />
          </motion.div>

          {/* Stream 2 Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-[#e6e9ef] rounded-[2rem] p-6 space-y-5 order-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#fdab3d]" />
              <h2 className="text-sm font-black text-[#323338] uppercase tracking-wide">
                Air Stream 2
              </h2>
              <span className="text-[10px] font-bold text-slate-400 ml-auto">Return Air</span>
            </div>

            <InputRow
              label="Air Flow"
              value={q2}
              onChange={setQ2}
              unit={flowUnit}
              step="10"
              min={0}
            />
            <InputRow
              label="Dry-Bulb Temp"
              value={t2}
              onChange={setT2}
              unit="°C"
              step="0.1"
            />
            <InputRow
              label="Relative Humidity"
              value={rh2}
              onChange={setRh2}
              unit="%"
              step="1"
              min={0}
              max={100}
            />

            {/* Auto-calculated info */}
            <div className="border-t border-slate-100 pt-4 space-y-1">
              <div className="flex items-center gap-1 mb-2">
                <Info size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Derived Properties
                </span>
              </div>
              <InfoRow label="Humidity Ratio" value={fmt(calc.w2, 2)} unit="g/kg" />
              <InfoRow label="Enthalpy" value={fmt(calc.h2, 2)} unit="kJ/kg" />
            </div>
          </motion.div>
        </div>

        {/* ── Mobile Diagram ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:hidden mb-8 bg-white border border-[#e6e9ef] rounded-[2rem] p-6"
        >
          <MixingDiagram
            t1={t1}
            q1={q1}
            t2={t2}
            q2={q2}
            tMix={calc.tMix}
            qTotal={calc.qTotal}
            flowUnit={flowUnit}
          />
        </motion.div>

        {/* ── Results Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-8 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-8">
            <Gauge size={18} className="text-[#00c875]" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Mixed Air Results
            </h2>
            <div className="w-2 h-2 rounded-full bg-[#00c875] animate-pulse ml-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            <ResultItem
              label="Total Flow"
              value={fmt(calc.qTotal, 0)}
              unit={flowUnit}
              delay={0.05}
            />
            <ResultItem
              label="Dry-Bulb"
              value={fmt(calc.tMix, 1)}
              unit="°C"
              delay={0.1}
            />
            <ResultItem
              label="Humidity Ratio"
              value={fmt(calc.wMix, 2)}
              unit="g/kg"
              delay={0.15}
            />
            <ResultItem
              label="Relative Humidity"
              value={fmt(calc.rhMix, 1)}
              unit="%"
              delay={0.2}
            />
            <ResultItem
              label="Enthalpy"
              value={fmt(calc.hMix, 2)}
              unit="kJ/kg"
              delay={0.25}
            />
            <ResultItem
              label="Sensible Heat Ratio"
              value={fmt(calc.shr, 3)}
              unit="—"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* ── Footer Note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-start gap-3 px-2"
        >
          <Info size={14} className="text-slate-300 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Calculations assume standard atmospheric pressure (101,325 Pa) and use the
            August-Roche-Magnus approximation for saturation vapor pressure. Results are
            approximate and intended for preliminary HVAC design reference.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
