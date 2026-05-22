"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Snowflake, Thermometer, Gauge, Info } from "lucide-react";

// Saturation Pressure (kPa Absolute) from -40°C to +80°C in 5°C steps
const PT_DATA: Record<string, { t: number; p: number }[]> = {
  "R-32": [
    { t: -40, p: 181.0 }, { t: -35, p: 225.4 }, { t: -30, p: 278.4 }, { t: -25, p: 340.6 },
    { t: -20, p: 410.7 }, { t: -15, p: 494.3 }, { t: -10, p: 588.1 }, { t: -5, p: 694.5 },
    { t: 0, p: 813.0 }, { t: 5, p: 950.2 }, { t: 10, p: 1106.7 }, { t: 15, p: 1281.8 },
    { t: 20, p: 1478.0 }, { t: 25, p: 1693.4 }, { t: 30, p: 1933.8 }, { t: 35, p: 2197.8 },
    { t: 40, p: 2483.1 }, { t: 45, p: 2799.4 }, { t: 50, p: 3138.8 }, { t: 55, p: 3512.4 },
    { t: 60, p: 3911.2 }, { t: 65, p: 4344.2 }, { t: 70, p: 4811.8 }, { t: 75, p: 5313.4 },
    { t: 80, p: 5851.0 }
  ],
  "R-410A": [
    { t: -40, p: 175.0 }, { t: -35, p: 218.0 }, { t: -30, p: 270.0 }, { t: -25, p: 330.0 },
    { t: -20, p: 399.6 }, { t: -15, p: 480.0 }, { t: -10, p: 572.7 }, { t: -5, p: 678.0 },
    { t: 0, p: 798.7 }, { t: 5, p: 934.0 }, { t: 10, p: 1087.0 }, { t: 15, p: 1256.0 },
    { t: 20, p: 1444.7 }, { t: 25, p: 1652.0 }, { t: 30, p: 1883.0 }, { t: 35, p: 2135.0 },
    { t: 40, p: 2413.0 }, { t: 45, p: 2715.0 }, { t: 50, p: 3045.0 }, { t: 55, p: 3404.0 },
    { t: 60, p: 3795.0 }, { t: 65, p: 4210.0 }, { t: 70, p: 4660.0 }, { t: 75, p: 5150.0 },
    { t: 80, p: 5690.0 }
  ],
  "R-134a": [
    { t: -40, p: 51.2 }, { t: -35, p: 66.3 }, { t: -30, p: 84.4 }, { t: -25, p: 106.4 },
    { t: -20, p: 132.7 }, { t: -15, p: 163.9 }, { t: -10, p: 200.6 }, { t: -5, p: 243.5 },
    { t: 0, p: 292.8 }, { t: 5, p: 349.6 }, { t: 10, p: 414.6 }, { t: 15, p: 488.6 },
    { t: 20, p: 572.2 }, { t: 25, p: 666.3 }, { t: 30, p: 770.2 }, { t: 35, p: 887.0 },
    { t: 40, p: 1016.6 }, { t: 45, p: 1160.0 }, { t: 50, p: 1318.1 }, { t: 55, p: 1492.0 },
    { t: 60, p: 1681.8 }, { t: 65, p: 1889.0 }, { t: 70, p: 2116.8 }, { t: 75, p: 2362.0 },
    { t: 80, p: 2632.7 }
  ],
  "R-22": [
    { t: -40, p: 105.0 }, { t: -35, p: 131.6 }, { t: -30, p: 163.5 }, { t: -25, p: 201.3 },
    { t: -20, p: 244.8 }, { t: -15, p: 295.6 }, { t: -10, p: 354.3 }, { t: -5, p: 421.3 },
    { t: 0, p: 497.6 }, { t: 5, p: 583.7 }, { t: 10, p: 680.7 }, { t: 15, p: 789.0 },
    { t: 20, p: 909.9 }, { t: 25, p: 1044.2 }, { t: 30, p: 1191.4 }, { t: 35, p: 1354.1 },
    { t: 40, p: 1531.7 }, { t: 45, p: 1726.0 }, { t: 50, p: 1937.5 }, { t: 55, p: 2167.0 },
    { t: 60, p: 2415.8 }, { t: 65, p: 2684.0 }, { t: 70, p: 2973.5 }, { t: 75, p: 3284.0 },
    { t: 80, p: 3618.0 }
  ]
};

const ATMOSPHERIC_PRESSURE = 101.325; // kPa

export default function RefrigerantPTClient() {
  const [selectedRefrig, setSelectedRefrig] = useState<string>("R-32");
  const [mode, setMode] = useState<"T_TO_P" | "P_TO_T">("T_TO_P");
  const [pressureType, setPressureType] = useState<"GAUGE" | "ABS">("GAUGE");
  
  // User Input states
  const [tempInput, setTempInput] = useState<string>("25");
  const [pressureInput, setPressureInput] = useState<string>("1592"); // Default near R-32 25°C Gauge (1693.4 - 101.3 = 1592)
  const [pressureUnit, setPressureUnit] = useState<"KPA" | "PSI" | "BAR">("KPA");

  // Linear Interpolation helper functions
  const interpolatePressure = (t: number, refrigerant: string): number => {
    const data = PT_DATA[refrigerant];
    if (t <= data[0].t) return data[0].p;
    if (t >= data[data.length - 1].t) return data[data.length - 1].p;

    for (let i = 0; i < data.length - 1; i++) {
      if (t >= data[i].t && t <= data[i + 1].t) {
        const t1 = data[i].t;
        const t2 = data[i + 1].t;
        const p1 = data[i].p;
        const p2 = data[i + 1].p;
        return p1 + ((t - t1) / (t2 - t1)) * (p2 - p1);
      }
    }
    return data[0].p;
  };

  const interpolateTemperature = (pAbs: number, refrigerant: string): number => {
    const data = PT_DATA[refrigerant];
    if (pAbs <= data[0].p) return data[0].t;
    if (pAbs >= data[data.length - 1].p) return data[data.length - 1].t;

    for (let i = 0; i < data.length - 1; i++) {
      if (pAbs >= data[i].p && pAbs <= data[i + 1].p) {
        const p1 = data[i].p;
        const p2 = data[i + 1].p;
        const t1 = data[i].t;
        const t2 = data[i + 1].t;
        return t1 + ((pAbs - p1) / (p2 - p1)) * (t2 - t1);
      }
    }
    return data[0].t;
  };

  // Convert unit to kPa Absolute
  const convertToKpaAbs = (val: number, unit: "KPA" | "PSI" | "BAR", type: "GAUGE" | "ABS"): number => {
    let pKpa = val;
    if (unit === "PSI") pKpa = val / 0.1450377;
    else if (unit === "BAR") pKpa = val * 100;

    if (type === "GAUGE") {
      return pKpa + ATMOSPHERIC_PRESSURE;
    }
    return pKpa;
  };

  // Convert kPa Absolute to selected unit and type
  const convertFromKpaAbs = (pAbs: number, unit: "KPA" | "PSI" | "BAR", type: "GAUGE" | "ABS"): number => {
    const pKpa = type === "GAUGE" ? pAbs - ATMOSPHERIC_PRESSURE : pAbs;
    if (unit === "PSI") return pKpa * 0.1450377;
    if (unit === "BAR") return pKpa / 100;
    return pKpa;
  };

  // Real-time calculated output
  const calculatedOutput = useMemo(() => {
    if (mode === "T_TO_P") {
      const t = parseFloat(tempInput);
      if (isNaN(t)) return null;
      
      const pAbs = interpolatePressure(t, selectedRefrig);
      const pKpaGauge = pAbs - ATMOSPHERIC_PRESSURE;
      const pKpaAbs = pAbs;

      return {
        temp: t,
        kpaGauge: pKpaGauge,
        kpaAbs: pKpaAbs,
        psiGauge: pKpaGauge * 0.1450377,
        psiAbs: pKpaAbs * 0.1450377,
        barGauge: pKpaGauge / 100,
        barAbs: pKpaAbs / 100,
      };
    } else {
      const pInputVal = parseFloat(pressureInput);
      if (isNaN(pInputVal) || pInputVal < 0) return null;

      const pAbs = convertToKpaAbs(pInputVal, pressureUnit, pressureType);
      const t = interpolateTemperature(pAbs, selectedRefrig);

      const pKpaGauge = pAbs - ATMOSPHERIC_PRESSURE;
      const pKpaAbs = pAbs;

      return {
        temp: t,
        kpaGauge: pKpaGauge,
        kpaAbs: pKpaAbs,
        psiGauge: pKpaGauge * 0.1450377,
        psiAbs: pKpaAbs * 0.1450377,
        barGauge: pKpaGauge / 100,
        barAbs: pKpaAbs / 100,
      };
    }
  }, [mode, tempInput, pressureInput, pressureUnit, pressureType, selectedRefrig]);

  // Current highlighting temperature or temperature of interest
  const currentTemp = useMemo(() => {
    if (!calculatedOutput) return 25;
    return calculatedOutput.temp;
  }, [calculatedOutput]);

  // Handle table row click to set as input
  const handleRowClick = (t: number) => {
    setTempInput(t.toString());
    setMode("T_TO_P");
    
    // Also sync the pressure input to keep things smooth
    const pAbs = interpolatePressure(t, selectedRefrig);
    const convertedPres = convertFromKpaAbs(pAbs, pressureUnit, pressureType);
    setPressureInput(convertedPres.toFixed(1));
  };

  return (
    <div
      className="min-h-screen bg-white pb-12"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            href="/tools"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0073ea] transition-all uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Kembali ke Tools
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#579bfc] to-[#a25ddc] flex items-center justify-center text-white">
              <Snowflake size={16} />
            </div>
            <div>
              <h1 className="text-xs font-black text-[#323338] uppercase tracking-wide leading-none">
                Refrigerant P-T
              </h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                HVAC Tool
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#323338] uppercase tracking-tight">
              Tabel Pressure-Temperature
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              Lookup interaktif temperatur jenuh vs tekanan refrigerant HVAC umum
            </p>
          </div>

          {/* Refrigerant Selector */}
          <div className="flex flex-wrap bg-slate-100 rounded-xl p-1 gap-1 text-xs font-black uppercase tracking-wider self-start md:self-auto">
            {["R-32", "R-410A", "R-134a", "R-22"].map((ref) => (
              <button
                key={ref}
                onClick={() => {
                  setSelectedRefrig(ref);
                  // Trigger recalculation using the current inputs
                  if (mode === "T_TO_P") {
                    const t = parseFloat(tempInput);
                    if (!isNaN(t)) {
                      const pAbs = interpolatePressure(t, ref);
                      const convertedPres = convertFromKpaAbs(pAbs, pressureUnit, pressureType);
                      setPressureInput(convertedPres.toFixed(1));
                    }
                  } else {
                    const pIn = parseFloat(pressureInput);
                    if (!isNaN(pIn)) {
                      const pAbs = convertToKpaAbs(pIn, pressureUnit, pressureType);
                      const t = interpolateTemperature(pAbs, ref);
                      setTempInput(t.toFixed(1));
                    }
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedRefrig === ref
                    ? "bg-[#0073ea] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                {ref}
              </button>
            ))}
          </div>
        </div>

        {/* Outer Grid */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          
          {/* Left Panel: Calculators */}
          <div className="space-y-6">
            
            {/* Mode selection & Inputs card */}
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
                Kalkulator Interaktif
              </p>

              {/* Mode Toggle tabs */}
              <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-0.5 text-[10px] font-black uppercase tracking-wider mb-6">
                <button
                  onClick={() => setMode("T_TO_P")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "T_TO_P"
                      ? "bg-white text-[#0073ea] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Temp → Pressure
                </button>
                <button
                  onClick={() => setMode("P_TO_T")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "P_TO_T"
                      ? "bg-white text-[#0073ea] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pressure → Temp
                </button>
              </div>

              {/* Pressure Type Selection (Gauge vs Abs) */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Jenis Tekanan:
                </span>
                <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold">
                  <button
                    onClick={() => {
                      setPressureType("GAUGE");
                      // Sync inputs if possible
                      if (calculatedOutput) {
                        const pVal = pressureUnit === "KPA" ? calculatedOutput.kpaGauge : pressureUnit === "PSI" ? calculatedOutput.psiGauge : calculatedOutput.barGauge;
                        setPressureInput(pVal.toFixed(1));
                      }
                    }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      pressureType === "GAUGE"
                        ? "bg-[#0073ea] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Gauge
                  </button>
                  <button
                    onClick={() => {
                      setPressureType("ABS");
                      if (calculatedOutput) {
                        const pVal = pressureUnit === "KPA" ? calculatedOutput.kpaAbs : pressureUnit === "PSI" ? calculatedOutput.psiAbs : calculatedOutput.barAbs;
                        setPressureInput(pVal.toFixed(1));
                      }
                    }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      pressureType === "ABS"
                        ? "bg-[#0073ea] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Absolute
                  </button>
                </div>
              </div>

              {mode === "T_TO_P" ? (
                /* TEMP INPUT */
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5 mb-2">
                      <Thermometer size={12} className="text-[#0073ea]" />
                      Temperatur Jenuh
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                      />
                      <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        °C
                      </span>
                    </div>
                  </div>

                  {/* Calculated Results Block */}
                  {calculatedOutput && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 mt-6">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Tekanan Jenuh ({pressureType})
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">
                            kPa
                          </span>
                          <span className="text-sm font-black text-[#0073ea] block mt-1">
                            {(pressureType === "GAUGE" ? calculatedOutput.kpaGauge : calculatedOutput.kpaAbs).toFixed(1)}
                          </span>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">
                            PSI
                          </span>
                          <span className="text-sm font-black text-[#323338] block mt-1">
                            {(pressureType === "GAUGE" ? calculatedOutput.psiGauge : calculatedOutput.psiAbs).toFixed(1)}
                          </span>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">
                            Bar
                          </span>
                          <span className="text-sm font-black text-[#323338] block mt-1">
                            {(pressureType === "GAUGE" ? calculatedOutput.barGauge : calculatedOutput.barAbs).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PRESSURE INPUT */
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5">
                        <Gauge size={12} className="text-[#0073ea]" />
                        Tekanan Jenuh ({pressureType})
                      </label>
                      <div className="flex bg-slate-100 rounded-lg p-0.5 text-[8px] font-bold">
                        {["KPA", "PSI", "BAR"].map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              // Reconvert current value to the new unit so the number input updates nicely
                              const prevUnit = pressureUnit;
                              const pRaw = parseFloat(pressureInput) || 0;
                              let pKpaAbs = convertToKpaAbs(pRaw, prevUnit, pressureType);
                              let newUnitVal = convertFromKpaAbs(pKpaAbs, unit as any, pressureType);
                              setPressureUnit(unit as any);
                              setPressureInput(newUnitVal.toFixed(1));
                            }}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              pressureUnit === unit
                                ? "bg-white text-[#0073ea] shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={pressureInput}
                        onChange={(e) => setPressureInput(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                      />
                      <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        {pressureUnit}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Results Block */}
                  {calculatedOutput && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 mt-6">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Temperatur Jenuh Hasil
                      </p>

                      <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer size={18} className="text-[#0073ea]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Temp Sat.
                          </span>
                        </div>
                        <span className="text-xl font-black text-[#0073ea]">
                          {calculatedOutput.temp.toFixed(2)}{" "}
                          <span className="text-xs font-bold text-slate-400">°C</span>
                        </span>
                      </div>
                      <span className="block text-[8px] font-semibold text-slate-400 text-right uppercase">
                        Fahrenheit: {(calculatedOutput.temp * 1.8 + 32).toFixed(1)} °F
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* General Info Box */}
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-xs leading-relaxed text-[#676879] space-y-2">
              <div className="flex items-center gap-2 text-[#0073ea] mb-2">
                <Info size={14} className="shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Penjelasan Teknis</h4>
              </div>
              <p>
                <strong>Tekanan Gauge (g)</strong> dihitung relatif terhadap tekanan atmosfer lokal standar (101.325 kPa). Kebanyakan alat ukur di lapangan menggunakan tekanan gauge (psig, barg).
              </p>
              <p>
                <strong>Tekanan Absolute (a)</strong> dihitung dari kondisi vakum mutlak. Sangat penting digunakan pada kalkulasi termodinamika murni.
              </p>
            </div>

          </div>

          {/* Right Panel: Reference Table */}
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                Tabel Referensi Jenuh {selectedRefrig}
              </p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
                Klik baris tabel di bawah untuk langsung memasukkannya ke kalkulator
              </p>

              <div className="max-h-[500px] overflow-y-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-xs relative">
                  <thead className="sticky top-0 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 z-10">
                    <tr>
                      <th className="py-3 px-4">Temp (°C)</th>
                      <th className="py-3 px-4">Press. Abs (kPa)</th>
                      <th className="py-3 px-4">Press. Gauge (kPa)</th>
                      <th className="py-3 px-4">Press. Gauge (PSI)</th>
                      <th className="py-3 px-4">Press. Gauge (Bar)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PT_DATA[selectedRefrig].map((row) => {
                      const pAbs = row.p;
                      const pGauge = pAbs - ATMOSPHERIC_PRESSURE;
                      const psiGauge = pGauge * 0.1450377;
                      const barGauge = pGauge / 100;
                      
                      // Highlight row closest to current value
                      const isHighlighted = Math.abs(currentTemp - row.t) < 2.5;

                      return (
                        <tr
                          key={row.t}
                          onClick={() => handleRowClick(row.t)}
                          className={`cursor-pointer border-b border-slate-50 transition-all text-slate-600 hover:bg-blue-50/20 ${
                            isHighlighted
                              ? "bg-blue-50/50 font-bold text-[#0073ea]"
                              : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-black">
                            {row.t > 0 ? `+${row.t}` : row.t} °C
                          </td>
                          <td className="py-3.5 px-4">{pAbs.toFixed(1)}</td>
                          <td className="py-3.5 px-4">
                            {pGauge > 0 ? pGauge.toFixed(1) : "Vacuum"}
                          </td>
                          <td className="py-3.5 px-4">
                            {pGauge > 0 ? psiGauge.toFixed(1) : "Vacuum"}
                          </td>
                          <td className="py-3.5 px-4">
                            {pGauge > 0 ? barGauge.toFixed(2) : "Vacuum"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
