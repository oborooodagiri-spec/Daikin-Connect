"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Wind,
  Gauge,
  Droplets,
  Snowflake,
  ArrowDownUp,
  Pipette,
  Thermometer,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CategoryField {
  key: string;
  label: string;
  unit: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  fields: CategoryField[];
  convert: (key: string, value: number) => Record<string, number>;
  formulas: string[];
}

/* ------------------------------------------------------------------ */
/*  Pipe reference table                                               */
/* ------------------------------------------------------------------ */

const PIPE_SIZES = [
  { dn: "DN15", inch: '½"' },
  { dn: "DN20", inch: '¾"' },
  { dn: "DN25", inch: '1"' },
  { dn: "DN32", inch: '1¼"' },
  { dn: "DN40", inch: '1½"' },
  { dn: "DN50", inch: '2"' },
  { dn: "DN65", inch: '2½"' },
  { dn: "DN80", inch: '3"' },
  { dn: "DN100", inch: '4"' },
  { dn: "DN125", inch: '5"' },
  { dn: "DN150", inch: '6"' },
  { dn: "DN200", inch: '8"' },
  { dn: "DN250", inch: '10"' },
  { dn: "DN300", inch: '12"' },
];

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

const categories: Category[] = [
  {
    id: "airflow",
    name: "Air Flow",
    icon: <Wind size={16} />,
    fields: [
      { key: "cmh", label: "CMH", unit: "m³/h" },
      { key: "cfm", label: "CFM", unit: "ft³/min" },
      { key: "ls", label: "L/s", unit: "liters/s" },
    ],
    convert: (key, v) => {
      if (key === "cmh") return { cmh: v, cfm: v * 0.5886, ls: v / 3.6 };
      if (key === "cfm") {
        const cmh = v / 0.5886;
        return { cmh, cfm: v, ls: cmh / 3.6 };
      }
      // ls
      const cmh = v * 3.6;
      return { cmh, cfm: cmh * 0.5886, ls: v };
    },
    formulas: ["CMH × 0.5886 = CFM", "CMH ÷ 3.6 = L/s"],
  },
  {
    id: "airvelocity",
    name: "Air Velocity",
    icon: <Gauge size={16} />,
    fields: [
      { key: "ms", label: "m/s", unit: "meters/s" },
      { key: "fpm", label: "fpm", unit: "feet/min" },
    ],
    convert: (key, v) => {
      if (key === "ms") return { ms: v, fpm: v * 196.85 };
      return { ms: v / 196.85, fpm: v };
    },
    formulas: ["m/s × 196.85 = fpm"],
  },
  {
    id: "waterflow",
    name: "Water Flow",
    icon: <Droplets size={16} />,
    fields: [
      { key: "gpm", label: "GPM", unit: "gal/min" },
      { key: "lpm", label: "LPM", unit: "liters/min" },
      { key: "lps", label: "LPS", unit: "liters/s" },
    ],
    convert: (key, v) => {
      if (key === "gpm")
        return { gpm: v, lpm: v * 3.785, lps: v * 0.0631 };
      if (key === "lpm") {
        const gpm = v / 3.785;
        return { gpm, lpm: v, lps: gpm * 0.0631 };
      }
      const gpm = v / 0.0631;
      return { gpm, lpm: gpm * 3.785, lps: v };
    },
    formulas: ["GPM × 3.785 = LPM", "GPM × 0.0631 = LPS"],
  },
  {
    id: "cooling",
    name: "Cooling Capacity",
    icon: <Snowflake size={16} />,
    fields: [
      { key: "tr", label: "TR", unit: "ton" },
      { key: "btu", label: "BTU/hr", unit: "BTU/hr" },
      { key: "kw", label: "kW", unit: "kilowatt" },
    ],
    convert: (key, v) => {
      if (key === "tr") return { tr: v, btu: v * 12000, kw: v * 3.517 };
      if (key === "btu") {
        const tr = v / 12000;
        return { tr, btu: v, kw: tr * 3.517 };
      }
      const tr = v / 3.517;
      return { tr, btu: tr * 12000, kw: v };
    },
    formulas: ["1 TR = 12,000 BTU/hr", "1 TR = 3.517 kW"],
  },
  {
    id: "pressure",
    name: "Pressure",
    icon: <ArrowDownUp size={16} />,
    fields: [
      { key: "psi", label: "PSI", unit: "psi" },
      { key: "bar", label: "Bar", unit: "bar" },
      { key: "kpa", label: "kPa", unit: "kilopascal" },
      { key: "pa", label: "Pa", unit: "pascal" },
      { key: "inwg", label: "inWG", unit: "in. water" },
      { key: "mmwg", label: "mmWG", unit: "mm water" },
    ],
    convert: (key, v) => {
      let psi: number;
      if (key === "psi") psi = v;
      else if (key === "bar") psi = v / 0.06895;
      else if (key === "kpa") psi = v / 6.895;
      else if (key === "pa") psi = v / 6894.76;
      else if (key === "inwg") psi = v / 27.68;
      else psi = v / 703.07; // mmwg
      return {
        psi,
        bar: psi * 0.06895,
        kpa: psi * 6.895,
        pa: psi * 6894.76,
        inwg: psi * 27.68,
        mmwg: psi * 703.07,
      };
    },
    formulas: [
      "1 PSI = 0.06895 bar",
      "1 PSI = 6.895 kPa",
      "1 PSI = 6,894.76 Pa",
      "1 PSI = 27.68 inWG",
      "1 PSI = 703.07 mmWG",
    ],
  },
  {
    id: "pipe",
    name: "Pipe Sizing",
    icon: <Pipette size={16} />,
    fields: [
      { key: "mm", label: "mm", unit: "millimeters" },
      { key: "inch", label: "inch", unit: "inches" },
    ],
    convert: (key, v) => {
      if (key === "mm") return { mm: v, inch: v / 25.4 };
      return { mm: v * 25.4, inch: v };
    },
    formulas: ["mm ÷ 25.4 = inch"],
  },
  {
    id: "temperature",
    name: "Temperature",
    icon: <Thermometer size={16} />,
    fields: [
      { key: "c", label: "°C", unit: "Celsius" },
      { key: "f", label: "°F", unit: "Fahrenheit" },
    ],
    convert: (key, v) => {
      if (key === "c") return { c: v, f: (v * 9) / 5 + 32 };
      return { c: ((v - 32) * 5) / 9, f: v };
    },
    formulas: ["(°C × 9/5) + 32 = °F"],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number, decimals = 4): string {
  if (!isFinite(n)) return "";
  const rounded = parseFloat(n.toFixed(decimals));
  return String(rounded);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UnitConverterClient() {
  const [activeTab, setActiveTab] = useState("airflow");
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => {
      const init: Record<string, Record<string, string>> = {};
      for (const cat of categories) {
        init[cat.id] = {};
        for (const f of cat.fields) {
          init[cat.id][f.key] = "";
        }
      }
      return init;
    }
  );

  const activeCat = useMemo(
    () => categories.find((c) => c.id === activeTab)!,
    [activeTab]
  );

  /* Handle input change: convert from the edited field to all others */
  const handleChange = (catId: string, fieldKey: string, raw: string) => {
    const cat = categories.find((c) => c.id === catId)!;
    const parsed = parseFloat(raw);

    if (raw === "" || isNaN(parsed)) {
      /* Clear all fields when input is empty or invalid */
      setValues((prev) => {
        const next = { ...prev, [catId]: { ...prev[catId] } };
        for (const f of cat.fields) {
          next[catId][f.key] = f.key === fieldKey ? raw : "";
        }
        return next;
      });
      return;
    }

    const converted = cat.convert(fieldKey, parsed);
    setValues((prev) => {
      const next = { ...prev, [catId]: { ...prev[catId] } };
      for (const f of cat.fields) {
        next[catId][f.key] =
          f.key === fieldKey ? raw : fmt(converted[f.key]);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        {/* ---- Back button ---- */}
        <Link
          href="/tools"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-[#0073ea]"
        >
          <ArrowLeft size={16} />
          Back to Tools
        </Link>

        {/* ---- Title ---- */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-2xl font-extrabold text-[#323338] md:text-3xl"
        >
          Unit Converter
        </motion.h1>

        {/* ---- Tab pills ---- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === cat.id
                  ? "bg-[#0073ea] text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cat.icon}
              <span className="whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </motion.div>

        {/* ---- Main content grid ---- */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* ---- Converter card ---- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm md:p-8"
            >
              {/* Section header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0073ea]">
                  {activeCat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Convert
                  </p>
                  <h2 className="text-lg font-bold text-[#323338]">
                    {activeCat.name}
                  </h2>
                </div>
              </div>

              {/* Input rows */}
              <div>
                {activeCat.fields.map((field, idx) => (
                  <div
                    key={field.key}
                    className={`flex items-center justify-between py-4 ${
                      idx < activeCat.fields.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    {/* Label */}
                    <div className="min-w-[72px]">
                      <span className="text-sm font-bold text-[#323338]">
                        {field.label}
                      </span>
                      <span className="ml-2 hidden text-xs text-[#676879] sm:inline">
                        {field.unit}
                      </span>
                    </div>

                    {/* Input */}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[activeCat.id][field.key]}
                      onChange={(e) =>
                        handleChange(activeCat.id, field.key, e.target.value)
                      }
                      placeholder="0"
                      className="w-32 border-none bg-transparent text-right text-lg font-bold text-[#0073ea] outline-none placeholder:text-slate-300 sm:w-40"
                    />

                    {/* Unit badge */}
                    <span className="ml-3 min-w-[56px] text-right text-xs font-semibold text-slate-400">
                      {field.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pipe reference table (only for pipe sizing) */}
              {activeCat.id === "pipe" && (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Common Pipe Sizes
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4">
                    {PIPE_SIZES.map((p) => (
                      <div
                        key={p.dn}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 odd:bg-white"
                      >
                        <span className="font-semibold text-[#323338]">
                          {p.dn}
                        </span>
                        <span className="font-bold text-[#0073ea]">
                          {p.inch}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ---- Reference card (desktop only) ---- */}
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCat.id + "-ref"}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, delay: 0.06 }}
                className="sticky top-8 rounded-[2rem] border border-slate-100 bg-slate-50 p-8"
              >
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Formulas
                </p>
                <ul className="space-y-3">
                  {activeCat.formulas.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-[#676879]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#0073ea]">
                        {i + 1}
                      </span>
                      <code className="font-mono text-[13px] text-[#323338]">
                        {f}
                      </code>
                    </li>
                  ))}
                </ul>

                {/* Pipe reference in sidebar as well */}
                {activeCat.id === "pipe" && (
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Reference Sizes
                    </p>
                    <div className="space-y-1 text-sm">
                      {PIPE_SIZES.map((p) => (
                        <div
                          key={p.dn}
                          className="flex items-center justify-between rounded-lg px-2 py-1 odd:bg-white"
                        >
                          <span className="font-medium text-[#323338]">
                            {p.dn}
                          </span>
                          <span className="font-bold text-[#0073ea]">
                            {p.inch}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 rounded-xl bg-white p-4 text-xs leading-relaxed text-[#676879]">
                  <p className="mb-1 font-bold text-[#323338]">💡 Tip</p>
                  <p>
                    Type in any field and all other values update instantly. Results are
                    rounded to 4 decimal places.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
