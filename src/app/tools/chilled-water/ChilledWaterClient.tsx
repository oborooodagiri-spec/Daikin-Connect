"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, PipetteIcon, Droplets, Info, Thermometer } from "lucide-react";

interface PipeInfo {
  dn: string;
  inch: string;
  idMm: number; // Inside diameter in mm
}

const PIPE_SIZES: PipeInfo[] = [
  { dn: "DN15", inch: '½"', idMm: 15.8 },
  { dn: "DN20", inch: '¾"', idMm: 20.9 },
  { dn: "DN25", inch: '1"', idMm: 26.6 },
  { dn: "DN32", inch: '1¼"', idMm: 35.1 },
  { dn: "DN40", inch: '1½"', idMm: 40.9 },
  { dn: "DN50", inch: '2"', idMm: 52.5 },
  { dn: "DN65", inch: '2½"', idMm: 62.7 },
  { dn: "DN80", inch: '3"', idMm: 77.9 },
  { dn: "DN100", inch: '4"', idMm: 102.3 },
  { dn: "DN125", inch: '5"', idMm: 128.2 },
  { dn: "DN150", inch: '6"', idMm: 154.1 },
  { dn: "DN200", inch: '8"', idMm: 202.7 },
  { dn: "DN250", inch: '10"', idMm: 254.5 },
  { dn: "DN300", inch: '12"', idMm: 304.8 },
];

export default function ChilledWaterClient() {
  const [loadVal, setLoadVal] = useState<string>("100"); // Default 100 TR
  const [loadUnit, setLoadUnit] = useState<"TR" | "KW">("TR");
  const [deltaTVal, setDeltaTVal] = useState<string>("5"); // Default 5°C
  const [material, setMaterial] = useState<"STEEL" | "COPPER" | "PVC">("STEEL");
  const [customPipeId, setCustomPipeId] = useState<string>(""); // Optional manual select
  
  // Hazen-Williams Roughness Coefficient
  const roughnessC = useMemo(() => {
    if (material === "COPPER") return 140;
    if (material === "PVC") return 150;
    return 120; // STEEL
  }, [material]);

  // Core calculations
  const calculation = useMemo(() => {
    const rawLoad = parseFloat(loadVal) || 0;
    const rawDeltaT = parseFloat(deltaTVal) || 0;

    if (rawLoad <= 0 || rawDeltaT <= 0) return null;

    // Convert load to kW
    // 1 TR = 3.51685 kW
    const loadKw = loadUnit === "TR" ? rawLoad * 3.51685 : rawLoad;
    const loadTr = loadUnit === "KW" ? rawLoad / 3.51685 : rawLoad;

    // Flow calculation
    // Flow (L/s) = Q (kW) / (4.186 kJ/kg.K * dT)
    const flowLps = loadKw / (4.186 * rawDeltaT);
    const flowLpm = flowLps * 60;
    const flowM3h = flowLps * 3.6;
    const flowGpm = flowLpm / 3.78541;

    // Process all pipe sizing statistics
    const sizingOptions = PIPE_SIZES.map((pipe) => {
      const dM = pipe.idMm / 1000; // diameter in meters
      const area = (Math.PI * Math.pow(dM, 2)) / 4; // cross-section area in m2
      const flowM3s = flowLps / 1000; // m3/s

      // Velocity V = Q / A (m/s)
      const velocityMs = flowM3s / area;
      const velocityFps = velocityMs * 3.28084;

      // Reynolds Number (assuming chilled water at 7°C: viscosity = 0.0014 Pa.s, density = 1000 kg/m3)
      const re = (1000 * velocityMs * dM) / 0.0014;

      // Hazen-Williams Head Loss per Meter
      // hf = 10.67 * Q^1.852 / (C^1.852 * D^4.87)
      const hf =
        (10.67 * Math.pow(flowM3s, 1.852)) /
        (Math.pow(roughnessC, 1.852) * Math.pow(dM, 4.87));

      // Pressure drop (Pa/m) = hf * g * density (9810)
      const pressureDropPam = hf * 9810;
      const pressureDropKpa100m = (pressureDropPam * 100) / 1000; // kPa per 100m

      return {
        ...pipe,
        area,
        velocityMs,
        velocityFps,
        re,
        pressureDropPam,
        pressureDropKpa100m,
      };
    });

    // Determine recommended size based on standard velocities
    // Chilled water standard practice: velocity 1.2 to 2.4 m/s.
    // Let's pick the smallest pipe size where velocity is under 2.0 m/s, or if all are above, the largest.
    // For smaller flows, velocity can go down to 0.9 m/s to prevent high pressure drop.
    let recommendedPipe = sizingOptions.find((opt) => opt.velocityMs < 2.0 && opt.velocityMs > 0.8);
    
    // Fallback in case flow is extremely large or small
    if (!recommendedPipe) {
      recommendedPipe = sizingOptions.find((opt) => opt.velocityMs < 2.5);
    }
    if (!recommendedPipe) {
      recommendedPipe = sizingOptions[sizingOptions.length - 1]; // pick largest
    }

    return {
      loadKw,
      loadTr,
      flowLps,
      flowLpm,
      flowM3h,
      flowGpm,
      sizingOptions,
      recommendedPipe,
    };
  }, [loadVal, loadUnit, deltaTVal, roughnessC]);

  // Selected pipe for detailed view (manual click or recommended)
  const selectedPipe = useMemo(() => {
    if (!calculation) return null;
    if (customPipeId) {
      return calculation.sizingOptions.find((p) => p.dn === customPipeId) || calculation.recommendedPipe;
    }
    return calculation.recommendedPipe;
  }, [calculation, customPipeId]);

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00c2ff] to-[#0073ea] flex items-center justify-center text-white">
              <PipetteIcon size={16} />
            </div>
            <div>
              <h1 className="text-xs font-black text-[#323338] uppercase tracking-wide leading-none">
                Chilled Water
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
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-[#323338] uppercase tracking-tight">
            Sizing Pipa Chilled Water
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Hitung flow rate air, laju kecepatan, dan pressure drop berdasarkan beban chiller
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          
          {/* Left Panel: Inputs */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Parameter Input
              </p>

              {/* Cooling Load */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5">
                    <Droplets size={12} className="text-[#0073ea]" />
                    Kapasitas Pendinginan
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold">
                    <button
                      onClick={() => setLoadUnit("TR")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        loadUnit === "TR"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      TR
                    </button>
                    <button
                      onClick={() => setLoadUnit("KW")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        loadUnit === "KW"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      kW
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={loadVal}
                    onChange={(e) => setLoadVal(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {loadUnit}
                  </span>
                </div>
              </div>

              {/* Delta T */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5">
                    <Thermometer size={12} className="text-[#0073ea]" />
                    Delta T (Chilled Water)
                  </label>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    BEDA SUHU
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={deltaTVal}
                    step="0.5"
                    onChange={(e) => setDeltaTVal(e.target.value)}
                    placeholder="5.0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    °C
                  </span>
                </div>
                <p className="text-[9px] font-medium text-slate-400 leading-normal mt-1.5 italic">
                  * Standar HVAC: ΔT = 5°C (Inlet 12°C, Outlet 7°C) atau ΔT = 5.5°C (10°F).
                </p>
              </div>

              {/* Pipe Material selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] block mb-2">
                  Material Pipa
                </label>
                <div className="grid grid-cols-3 bg-slate-100 rounded-xl p-0.5 text-[9px] font-black uppercase tracking-wider">
                  {(["STEEL", "COPPER", "PVC"] as const).map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setMaterial(mat)}
                      className={`py-2 rounded-lg transition-all ${
                        material === mat
                          ? "bg-[#0073ea] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {mat === "STEEL" ? "Steel" : mat === "COPPER" ? "Copper" : "PVC / Plastic"}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Engineering Guidelines */}
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-xs leading-relaxed text-[#676879] space-y-2">
              <div className="flex items-center gap-2 text-[#0073ea] mb-2">
                <Info size={14} className="shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Aturan Desain Pipa</h4>
              </div>
              <ul className="space-y-1.5 font-medium">
                <li>• <strong>Kecepatan Maksimal:</strong> Di bawah 2.4 m/s untuk mencegah erosi dan kebisingan pada baja. Di bawah 1.5 m/s pada pipa tembaga/PVC.</li>
                <li>• <strong>Pressure Drop:</strong> Target pressure drop optimal 100 - 400 Pa/m (10 - 40 kPa/100m) untuk menghemat daya pompa.</li>
                <li>• <strong>Roughness (C):</strong> Steel = 120, Copper = 140, PVC = 150. Pipa plastik memiliki rugi gesek terkecil.</li>
              </ul>
            </div>

          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            {!calculation ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 h-[400px] flex flex-col items-center justify-center text-center p-8">
                <Droplets size={48} className="text-slate-300 mb-4 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Masukkan Parameter Input
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Nilai Kapasitas dan Beda Suhu harus lebih besar dari 0 untuk menampilkan kalkulasi real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Flow Rates Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-100 bg-[#0073ea]/5 p-5 col-span-2 md:col-span-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0073ea]">
                      Total Flow Rate
                    </p>
                    <p className="text-2xl font-black text-[#0073ea] mt-1.5">
                      {calculation.flowGpm.toFixed(1)}{" "}
                      <span className="text-xs font-bold">GPM</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      Galon per Menit
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Flow Liters
                    </p>
                    <p className="text-xl font-black text-[#323338] mt-1.5">
                      {calculation.flowLpm.toFixed(1)}{" "}
                      <span className="text-xs font-bold text-slate-400">LPM</span>
                    </p>
                    <p className="text-[10px] font-bold text-[#0073ea] uppercase mt-0.5">
                      {calculation.flowLps.toFixed(2)} L/s
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Volume Rate
                    </p>
                    <p className="text-xl font-black text-[#323338] mt-1.5">
                      {calculation.flowM3h.toFixed(2)}{" "}
                      <span className="text-xs font-bold text-slate-400">m³/h</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      Meter Kubik / Jam
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Rekomendasi Pipa
                    </p>
                    <p className="text-xl font-black text-[#00c875] mt-1.5">
                      {calculation.recommendedPipe.dn}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">
                      Ukuran {calculation.recommendedPipe.inch}
                    </p>
                  </div>
                </div>

                {/* Sizing Recommendations Table */}
                <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Pilihan Sizing Pipa Standard
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-2">
                          <th className="py-3 pr-4">Ukuran Pipa</th>
                          <th className="py-3 px-4">Velocity Air</th>
                          <th className="py-3 px-4">Pressure Drop / 100m</th>
                          <th className="py-3 px-4">Turbulensi (Reynolds)</th>
                          <th className="py-3 pl-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.sizingOptions.map((opt) => {
                          const isRecommended = calculation.recommendedPipe.dn === opt.dn;
                          const isSelected = selectedPipe?.dn === opt.dn;

                          // Velocity status coloring
                          let velocityColor = "text-slate-600";
                          let velocityNote = "";
                          if (opt.velocityMs > 2.4) {
                            velocityColor = "text-red-500 font-bold";
                            velocityNote = "Terlalu Cepat (Erosi)";
                          } else if (opt.velocityMs < 0.6) {
                            velocityColor = "text-amber-500";
                            velocityNote = "Terlalu Lambat (Sedimentasi)";
                          } else {
                            velocityColor = "text-[#323338] font-bold";
                            velocityNote = "Optimal";
                          }

                          return (
                            <tr
                              key={opt.dn}
                              className={`border-b border-slate-50 transition-all ${
                                isSelected
                                  ? "bg-blue-50/40 text-[#0073ea]"
                                  : "text-slate-600 hover:bg-slate-50/50"
                              }`}
                            >
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm text-[#323338]">
                                    {opt.dn}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    ({opt.inch})
                                  </span>
                                  {isRecommended && (
                                    <span className="px-1.5 py-0.5 bg-[#00c875]/10 text-[#00c875] text-[7px] font-black rounded uppercase tracking-wider">
                                      Direkomendasikan
                                    </span>
                                  )}
                                </div>
                                <span className="block text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                                  Diameter Dalam: {opt.idMm} mm
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={velocityColor}>
                                  {opt.velocityMs.toFixed(2)} m/s
                                </span>
                                <span className="block text-[8px] font-semibold text-slate-400 mt-0.5">
                                  {opt.velocityFps.toFixed(1)} fps · {velocityNote}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-bold text-[#323338]">
                                {opt.pressureDropKpa100m.toFixed(1)}{" "}
                                <span className="text-[9px] font-bold text-slate-400">kPa</span>
                                <span className="block text-[8px] font-semibold text-slate-400 mt-0.5">
                                  {opt.pressureDropPam.toFixed(0)} Pa/meter
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-semibold text-slate-600">
                                  {opt.re.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                                <span className="block text-[8px] font-black text-[#0073ea] uppercase tracking-wider mt-0.5">
                                  {opt.re > 4000 ? "Highly Turbulent" : opt.re < 2300 ? "Laminar" : "Transition"}
                                </span>
                              </td>
                              <td className="py-4 pl-4 text-right">
                                <button
                                  onClick={() => setCustomPipeId(opt.dn)}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                    isSelected
                                      ? "bg-[#0073ea] text-white shadow-sm shadow-blue-100"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                >
                                  Pilih
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Pipe Details & Diagram */}
                {selectedPipe && (
                  <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                      Detail Analisis Hidrolik: Pipa {selectedPipe.dn} ({selectedPipe.inch})
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                              Kecepatan Aliran
                            </span>
                            <span className="text-base font-black text-[#323338]">
                              {selectedPipe.velocityMs.toFixed(2)} m/s
                            </span>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                              {selectedPipe.velocityFps.toFixed(1)} FPS
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                              Tekanan Hilang
                            </span>
                            <span className="text-base font-black text-red-500">
                              {selectedPipe.pressureDropKpa100m.toFixed(1)} kPa
                            </span>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                              Per 100 Meter Pipa
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                            Evaluasi Karakteristik Aliran
                          </span>
                          <p className="text-xs text-[#676879] font-medium leading-relaxed">
                            Pipa {selectedPipe.dn} memiliki luas area penampang internal{" "}
                            <strong>{(selectedPipe.area * 10000).toFixed(1)} cm²</strong>. Kecepatan aliran air pada beban <strong>{loadVal} {loadUnit}</strong> mencapai{" "}
                            <strong>{selectedPipe.velocityMs.toFixed(2)} m/s</strong>. 
                            {selectedPipe.velocityMs > 2.4 ? (
                              <span className="text-red-500 font-bold block mt-1">
                                Peringatan: Kecepatan terlalu tinggi! Ini akan menimbulkan getaran bising dan mempercepat korosi dinding dalam pipa.
                              </span>
                            ) : selectedPipe.velocityMs < 0.6 ? (
                              <span className="text-amber-500 font-bold block mt-1">
                                Peringatan: Kecepatan terlalu rendah. Kotoran dalam air chiller bisa mengendap dan menyumbat pipa dari waktu ke waktu.
                              </span>
                            ) : (
                              <span className="text-[#00c875] font-bold block mt-1">
                                Bagus! Kecepatan air optimal untuk operasional komersil jangka panjang.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Visual Pipe Cross Section drawing */}
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-4">
                          Representasi Fisik Penampang Pipa
                        </span>
                        
                        <div className="relative w-28 h-28 rounded-full border-[10px] border-slate-300 flex items-center justify-center shadow-inner bg-white mb-2">
                          {/* Inner water flow circle representation */}
                          <div 
                            className="rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-[#0073ea]"
                            style={{ 
                              width: "80%", 
                              height: "80%",
                              opacity: 0.85
                            }}
                          >
                            H₂O
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#323338]">
                          Diameter Luar Nominal: {selectedPipe.dn}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          Bahan: Pipa {material === "STEEL" ? "Baja" : material === "COPPER" ? "Tembaga" : "PVC"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
