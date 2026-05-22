"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Gauge, Zap, Info, Calculator, Cable, RefreshCw } from "lucide-react";

interface CableRating {
  size: number; // mm2
  maxCurrent: number; // Amps
  conduitMaxCurrent: number; // Amps inside a conduit/wall
}

const CABLE_STANDARDS: CableRating[] = [
  { size: 1.5, maxCurrent: 19, conduitMaxCurrent: 15 },
  { size: 2.5, maxCurrent: 26, conduitMaxCurrent: 20 },
  { size: 4.0, maxCurrent: 35, conduitMaxCurrent: 27 },
  { size: 6.0, maxCurrent: 46, conduitMaxCurrent: 36 },
  { size: 10.0, maxCurrent: 63, conduitMaxCurrent: 50 },
  { size: 16.0, maxCurrent: 85, conduitMaxCurrent: 68 },
  { size: 25.0, maxCurrent: 112, conduitMaxCurrent: 89 },
  { size: 35.0, maxCurrent: 138, conduitMaxCurrent: 111 },
  { size: 50.0, maxCurrent: 168, conduitMaxCurrent: 138 },
  { size: 70.0, maxCurrent: 213, conduitMaxCurrent: 173 },
  { size: 95.0, maxCurrent: 258, conduitMaxCurrent: 211 },
  { size: 120.0, maxCurrent: 299, conduitMaxCurrent: 246 },
];

export default function ElectricalClient() {
  const [activeTab, setActiveTab] = useState<"POWER" | "CURRENT" | "CABLE">("POWER");

  // Tab 1: Power Converter States
  const [pW, setPW] = useState<string>("3517");
  const [pKw, setPKw] = useState<string>("3.517");
  const [pHp, setPHp] = useState<string>("4.72");
  const [pBtu, setPBtu] = useState<string>("12000");
  const [pTr, setPTr] = useState<string>("1");

  // Tab 2 & 3: Current & Cable Calculator States
  const [calcPower, setCalcPower] = useState<string>("15"); // 15 kW
  const [calcPowerUnit, setCalcPowerUnit] = useState<"KW" | "W" | "HP">("KW");
  const [voltage, setVoltage] = useState<string>("380"); // 380V (three phase standard)
  const [powerFactor, setPowerFactor] = useState<string>("0.85");
  const [phase, setPhase] = useState<number>(3); // 1 or 3 Phase
  const [wiringType, setWiringType] = useState<"FREE" | "CONDUIT">("CONDUIT");

  // Conversions handler for Tab 1
  const handlePowerConvert = (value: string, source: "W" | "KW" | "HP" | "BTU" | "TR") => {
    const val = parseFloat(value);
    if (isNaN(val)) {
      if (source === "W") setPW(value);
      if (source === "KW") setPKw(value);
      if (source === "HP") setPHp(value);
      if (source === "BTU") setPBtu(value);
      if (source === "TR") setPTr(value);
      return;
    }

    // Convert everything to Watts first
    let watts = 0;
    if (source === "W") watts = val;
    else if (source === "KW") watts = val * 1000;
    else if (source === "HP") watts = val * 745.7; // Mechanical HP
    else if (source === "BTU") watts = val * 0.293071; // 1 BTU/hr = 0.293071 W
    else if (source === "TR") watts = val * 3516.85; // 1 TR = 3516.85 W

    // Sync all states
    if (source !== "W") setPW(watts.toFixed(1));
    if (source !== "KW") setPKw((watts / 1000).toFixed(4));
    if (source !== "HP") setPHp((watts / 745.7).toFixed(3));
    if (source !== "BTU") setPBtu((watts / 0.293071).toFixed(1));
    if (source !== "TR") setPTr((watts / 3516.85).toFixed(4));
  };

  // Calculations for Current & Apparent Power (Tab 2 & 3)
  const currentCalculation = useMemo(() => {
    const rawPower = parseFloat(calcPower) || 0;
    const rawVolt = parseFloat(voltage) || 0;
    const rawPf = parseFloat(powerFactor) || 0;

    if (rawPower <= 0 || rawVolt <= 0 || rawPf <= 0 || rawPf > 1.0) {
      return null;
    }

    // Convert power to kW
    let powerKw = rawPower;
    if (calcPowerUnit === "W") powerKw = rawPower / 1000;
    else if (calcPowerUnit === "HP") powerKw = (rawPower * 745.7) / 1000;

    const powerW = powerKw * 1000;

    // Line Current (Amps)
    // 1-Phase: I = P / (V * PF)
    // 3-Phase: I = P / (1.732 * V * PF)
    let amps = 0;
    if (phase === 1) {
      amps = powerW / (rawVolt * rawPf);
    } else {
      amps = powerW / (Math.sqrt(3) * rawVolt * rawPf);
    }

    // Apparent Power S (kVA) = kW / PF
    const kva = powerKw / rawPf;

    // Reactive Power Q (kVAR) = sqrt(kVA^2 - kW^2)
    const kvar = Math.sqrt(Math.max(0, Math.pow(kva, 2) - Math.pow(powerKw, 2)));

    // Continuous load safety factor 125% for motor circuit cable sizing
    const safetyCurrent = amps * 1.25;

    // Sizing Recommended Cable from standard cable rating table
    let recommendedCable = CABLE_STANDARDS.find((c) => {
      const rating = wiringType === "FREE" ? c.maxCurrent : c.conduitMaxCurrent;
      return rating >= safetyCurrent;
    });

    if (!recommendedCable) {
      recommendedCable = CABLE_STANDARDS[CABLE_STANDARDS.length - 1]; // pick largest standard
    }

    return {
      powerKw,
      powerW,
      amps,
      kva,
      kvar,
      safetyCurrent,
      recommendedCable,
    };
  }, [calcPower, calcPowerUnit, voltage, powerFactor, phase, wiringType]);

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a25ddc] to-[#c084fc] flex items-center justify-center text-white">
              <Gauge size={16} />
            </div>
            <div>
              <h1 className="text-xs font-black text-[#323338] uppercase tracking-wide leading-none">
                Electrical Calculator
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
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-[#323338] uppercase tracking-tight">
            Kalkulator Elektrikal HVAC
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Konversi daya kompresor, hitung arus nominal beban, dan tentukan ukuran kabel standard
          </p>
        </div>

        {/* Tab Pills Selector */}
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 max-w-md text-xs font-black uppercase tracking-wider mb-8">
          <button
            onClick={() => setActiveTab("POWER")}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "POWER"
                ? "bg-[#0073ea] text-white shadow-md shadow-blue-200"
                : "text-slate-500 hover:bg-slate-200"
            }`}
          >
            <RefreshCw size={14} />
            Power Converter
          </button>
          <button
            onClick={() => setActiveTab("CURRENT")}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "CURRENT"
                ? "bg-[#0073ea] text-white shadow-md shadow-blue-200"
                : "text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Calculator size={14} />
            Kalkulator Arus
          </button>
          <button
            onClick={() => setActiveTab("CABLE")}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "CABLE"
                ? "bg-[#0073ea] text-white shadow-md shadow-blue-200"
                : "text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Cable size={14} />
            Cable Sizer
          </button>
        </div>

        {/* -------------------- TAB 1: POWER CONVERTER -------------------- */}
        {activeTab === "POWER" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Unit Power Converter (Ketik pada kolom manapun)
              </p>

              <div className="divide-y divide-slate-100">
                {/* Watt (W) */}
                <div className="flex items-center justify-between py-4">
                  <div className="min-w-[100px]">
                    <span className="text-sm font-black text-[#323338]">Watt</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-bold">W</span>
                  </div>
                  <input
                    type="number"
                    value={pW}
                    onChange={(e) => handlePowerConvert(e.target.value, "W")}
                    className="w-40 border-none bg-transparent text-right text-lg font-black text-[#0073ea] outline-none placeholder:text-slate-300"
                  />
                  <span className="ml-4 text-xs font-bold text-slate-400 w-12 text-right">Watt</span>
                </div>

                {/* Kilowatt (kW) */}
                <div className="flex items-center justify-between py-4">
                  <div className="min-w-[100px]">
                    <span className="text-sm font-black text-[#323338]">Kilowatt</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-bold">kW</span>
                  </div>
                  <input
                    type="number"
                    value={pKw}
                    onChange={(e) => handlePowerConvert(e.target.value, "KW")}
                    className="w-40 border-none bg-transparent text-right text-lg font-black text-[#0073ea] outline-none placeholder:text-slate-300"
                  />
                  <span className="ml-4 text-xs font-bold text-slate-400 w-12 text-right">kW</span>
                </div>

                {/* Horsepower (HP) */}
                <div className="flex items-center justify-between py-4">
                  <div className="min-w-[100px]">
                    <span className="text-sm font-black text-[#323338]">Horsepower</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-bold">HP</span>
                  </div>
                  <input
                    type="number"
                    value={pHp}
                    onChange={(e) => handlePowerConvert(e.target.value, "HP")}
                    className="w-40 border-none bg-transparent text-right text-lg font-black text-[#0073ea] outline-none placeholder:text-slate-300"
                  />
                  <span className="ml-4 text-xs font-bold text-slate-400 w-12 text-right">HP</span>
                </div>

                {/* BTU/hr */}
                <div className="flex items-center justify-between py-4">
                  <div className="min-w-[100px]">
                    <span className="text-sm font-black text-[#323338]">BTU / jam</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-bold">BTU/h</span>
                  </div>
                  <input
                    type="number"
                    value={pBtu}
                    onChange={(e) => handlePowerConvert(e.target.value, "BTU")}
                    className="w-40 border-none bg-transparent text-right text-lg font-black text-[#0073ea] outline-none placeholder:text-slate-300"
                  />
                  <span className="ml-4 text-xs font-bold text-slate-400 w-12 text-right">BTU/h</span>
                </div>

                {/* Ton Refrigeration (TR) */}
                <div className="flex items-center justify-between py-4">
                  <div className="min-w-[100px]">
                    <span className="text-sm font-black text-[#323338]">Ton Refrig.</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-bold">TR</span>
                  </div>
                  <input
                    type="number"
                    value={pTr}
                    onChange={(e) => handlePowerConvert(e.target.value, "TR")}
                    className="w-40 border-none bg-transparent text-right text-lg font-black text-[#0073ea] outline-none placeholder:text-slate-300"
                  />
                  <span className="ml-4 text-xs font-bold text-slate-400 w-12 text-right">TR</span>
                </div>
              </div>
            </div>

            {/* Sidebar explanations */}
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Faktor Konversi Acuan
              </p>
              <ul className="space-y-3 text-xs text-[#676879] font-medium leading-relaxed">
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span>1 HP (Mechanical)</span>
                  <strong className="text-[#323338]">745.7 Watts</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span>1 TR (Ton Cooling)</span>
                  <strong className="text-[#323338]">3516.85 Watts</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span>1 TR (Ton Cooling)</span>
                  <strong className="text-[#323338]">12,000 BTU/hr</strong>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span>1 Watt</span>
                  <strong className="text-[#323338]">3.412142 BTU/hr</strong>
                </li>
              </ul>
              <div className="rounded-xl bg-white p-4 text-[10px] leading-relaxed text-[#676879] mt-6">
                <strong>💡 Tip:</strong> Unit Ton Refrigerasi (TR) adalah standard industri HVAC untuk menghitung laju perpindahan panas pendingin, sedangkan HP/PK adalah ukuran daya input mekanik kompresor.
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 2: CURRENT CALCULATOR -------------------- */}
        {activeTab === "CURRENT" && (
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Input Card */}
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Parameter Beban Kompresor / AC
              </p>

              {/* Power Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1">
                    <Zap size={12} className="text-[#0073ea]" />
                    Besar Daya Input
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 text-[8px] font-black tracking-wider">
                    {["KW", "W", "HP"].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => {
                          const prevUnit = calcPowerUnit;
                          const rawVal = parseFloat(calcPower) || 0;
                          let pWatts = rawVal;
                          if (prevUnit === "KW") pWatts = rawVal * 1000;
                          else if (prevUnit === "HP") pWatts = rawVal * 745.7;

                          let newVal = pWatts;
                          if (unit === "KW") newVal = pWatts / 1000;
                          else if (unit === "HP") newVal = pWatts / 745.7;

                          setCalcPowerUnit(unit as any);
                          setCalcPower(newVal.toFixed(2));
                        }}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          calcPowerUnit === unit
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
                    value={calcPower}
                    onChange={(e) => setCalcPower(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {calcPowerUnit}
                  </span>
                </div>
              </div>

              {/* Phase Selection Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#323338]">
                  Fase Listrik
                </span>
                <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-black">
                  <button
                    onClick={() => {
                      setPhase(1);
                      setVoltage("220");
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      phase === 1
                        ? "bg-[#0073ea] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    1-Phase (220V)
                  </button>
                  <button
                    onClick={() => {
                      setPhase(3);
                      setVoltage("380");
                    }}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      phase === 3
                        ? "bg-[#0073ea] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    3-Phase (380V)
                  </button>
                </div>
              </div>

              {/* Voltage Input */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] block mb-2">
                  Tegangan Listrik (V)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    Volt
                  </span>
                </div>
              </div>

              {/* Power Factor (cos phi) */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] block mb-2">
                  Faktor Daya (cos φ)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.05"
                    max="1.0"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    cos φ
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-slate-400 mt-1 italic leading-normal">
                  * Inductive compressor motor default PF: 0.80 - 0.88.
                </p>
              </div>

            </div>

            {/* Results Card */}
            <div className="space-y-6">
              {!currentCalculation ? (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 h-[380px] flex flex-col items-center justify-center text-center p-8">
                  <Calculator size={48} className="text-slate-300 mb-4 stroke-[1.5]" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Masukkan Parameter Input Listrik
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Grid numbers */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-[#0073ea]/5 p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0073ea]">
                        Arus Listrik Nominal (I)
                      </p>
                      <p className="text-3xl font-black text-[#0073ea] mt-1">
                        {currentCalculation.amps.toFixed(2)}{" "}
                        <span className="text-xs font-bold">Ampere</span>
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        Continuous: {currentCalculation.safetyCurrent.toFixed(2)} A (1.25x)
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Apparent Power (S)
                      </p>
                      <p className="text-2xl font-black text-[#323338] mt-1">
                        {currentCalculation.kva.toFixed(2)}{" "}
                        <span className="text-xs font-bold text-slate-400">kVA</span>
                      </p>
                      <p className="text-[9px] font-bold text-[#0073ea] uppercase mt-0.5">
                        Daya Semu Total
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Reactive Power (Q)
                      </p>
                      <p className="text-2xl font-black text-[#323338] mt-1">
                        {currentCalculation.kvar.toFixed(2)}{" "}
                        <span className="text-xs font-bold text-slate-400">kVAR</span>
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        Daya Reaktif Induktif
                      </p>
                    </div>
                  </div>

                  {/* Calculations Details banner */}
                  <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Rekomendasi Proteksi & Instalasi
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                          Daya Aktif (Active Power)
                        </span>
                        <span className="text-sm font-bold text-[#323338]">
                          {currentCalculation.powerKw.toFixed(2)} kW
                        </span>
                        <span className="text-[9px] font-medium text-[#676879] block mt-0.5">
                          {currentCalculation.powerW.toLocaleString()} Watts
                        </span>
                      </div>

                      <div className="bg-[#00c875]/5 border border-[#00c875]/20 rounded-xl p-4 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#00c875] block">
                          Min. Ukuran Kabel Rekomendasi
                        </span>
                        <span className="text-sm font-black text-[#323338]">
                          {currentCalculation.recommendedCable.size} mm² (NYY / NYA)
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                          Max Amp: {wiringType === "CONDUIT" ? currentCalculation.recommendedCable.conduitMaxCurrent : currentCalculation.recommendedCable.maxCurrent} A
                        </span>
                      </div>
                    </div>

                    <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold self-start mt-4 max-w-xs">
                      <button
                        onClick={() => setWiringType("CONDUIT")}
                        className={`flex-1 py-1 rounded-md transition-all ${
                          wiringType === "CONDUIT"
                            ? "bg-[#0073ea] text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Dalam Conduit/Tembok
                      </button>
                      <button
                        onClick={() => setWiringType("FREE")}
                        className={`flex-1 py-1 rounded-md transition-all ${
                          wiringType === "FREE"
                            ? "bg-[#0073ea] text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Udara Bebas
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- TAB 3: CABLE SIZER REFERENCE -------------------- */}
        {activeTab === "CABLE" && (
          <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              Tabel Batas Kemampuan Hantar Arus (KHA) Kabel Tembaga NYA/NYM/NYY
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
              Referensi berdasarkan Standar PUIL / IEC 60364 pada suhu lingkungan 30°C
            </p>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Ukuran Penampang (mm²)</th>
                    <th className="py-3 px-4">Max Arus - Conduit / Dinding (A)</th>
                    <th className="py-3 px-4">Max Arus - Udara Bebas (A)</th>
                    <th className="py-3 px-4">Aplikasi Khas HVAC</th>
                  </tr>
                </thead>
                <tbody>
                  {CABLE_STANDARDS.map((cable) => {
                    const isSuggested = currentCalculation && currentCalculation.recommendedCable.size === cable.size;

                    return (
                      <tr
                        key={cable.size}
                        className={`border-b border-slate-50 transition-all ${
                          isSuggested
                            ? "bg-blue-50/50 font-bold text-[#0073ea]"
                            : "text-slate-600 hover:bg-slate-50/50"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black">
                          <div className="flex items-center gap-2">
                            <span>{cable.size.toFixed(1)} mm²</span>
                            {isSuggested && (
                              <span className="px-1.5 py-0.5 bg-[#0073ea]/10 text-[#0073ea] text-[7px] font-black rounded uppercase tracking-wider">
                                Rekomendasi Beban Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{cable.conduitMaxCurrent} A</td>
                        <td className="py-3.5 px-4">{cable.maxCurrent} A</td>
                        <td className="py-3.5 px-4 italic text-slate-400 font-medium">
                          {cable.size === 1.5 ? "AC Split Kecil (0.5 - 1.0 PK)" :
                           cable.size === 2.5 ? "AC Split Besar (1.5 - 2.5 PK)" :
                           cable.size === 4.0 ? "AC Cassette / Duct Medium (3 - 5 PK)" :
                           cable.size === 6.0 ? "Power Panel AC Lantai / Packaged 6 PK" :
                           cable.size === 10.0 ? "Panel Sub-distribusi HVAC Kecil" :
                           cable.size >= 16.0 && cable.size <= 35.0 ? "Kabel Utama Chiller Kecil / Multi-Split" :
                           "Kabel Distribusi Chiller Besar / Heavy Industry"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
