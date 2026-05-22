"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Ruler, Wind, Gauge, Info } from "lucide-react";

export default function DuctSizerClient() {
  // Input states
  const [airflowVal, setAirflowVal] = useState<string>("1000");
  const [airflowUnit, setAirflowUnit] = useState<"CFM" | "CMH">("CFM");
  const [velocityVal, setVelocityVal] = useState<string>("800");
  const [velocityUnit, setVelocityUnit] = useState<"FPM" | "MS">("FPM");
  
  // Aspect ratio option state for drawing/detailed view
  const [selectedRatio, setSelectedRatio] = useState<number>(2); // 1, 1.5, 2, 3

  // Core calculations
  const results = useMemo(() => {
    const qRaw = parseFloat(airflowVal) || 0;
    const vRaw = parseFloat(velocityVal) || 0;

    if (qRaw <= 0 || vRaw <= 0) {
      return null;
    }

    // Convert Airflow to CMH and m3/s
    // 1 CFM = 1.69901 m3/h
    const qCmh = airflowUnit === "CFM" ? qRaw * 1.69901 : qRaw;
    const qCfm = airflowUnit === "CMH" ? qRaw / 1.69901 : qRaw;
    const qM3s = qCmh / 3600;

    // Convert Velocity to m/s and fpm
    // 1 m/s = 196.85 fpm
    const vMs = velocityUnit === "FPM" ? vRaw / 196.8504 : vRaw;
    const vFpm = velocityUnit === "MS" ? vRaw * 196.8504 : vRaw;

    // Area = Q / V (m²)
    const areaM2 = qM3s / vMs;
    const areaSqIn = areaM2 * 1550.003; // 1 m2 = 1550 sq inch

    // Round Duct Diameter D = sqrt(4 * Area / pi) in meters
    const diaM = Math.sqrt((4 * areaM2) / Math.PI);
    const diaMm = diaM * 1000;
    const diaInch = diaMm / 25.4;

    // Generate rectangular options for aspect ratios 1:1, 1.5:1, 2:1, 3:1
    const ratios = [1, 1.5, 2, 3];
    const rectangularOptions = ratios.map((r) => {
      // H = sqrt(Area / r)
      const hM = Math.sqrt(areaM2 / r);
      const wM = r * hM;

      const hMm = hM * 1000;
      const wMm = wM * 1000;

      // Rounded to nearest 25mm for real engineering applications
      const hMmRound = Math.max(75, Math.round(hMm / 25) * 25);
      const wMmRound = Math.max(75, Math.round(wMm / 25) * 25);

      // Re-calculate actual properties for rounded size
      const actualAreaM2 = (wMmRound / 1000) * (hMmRound / 1000);
      const actualVelocityMs = qM3s / actualAreaM2;
      const actualVelocityFpm = actualVelocityMs * 196.8504;

      // Huebscher formula for Equivalent Diameter (in mm)
      // De = 1.30 * ((a * b)^0.625) / ((a + b)^0.25)
      const eqDiaMm =
        1.3 * Math.pow(wMmRound * hMmRound, 0.625) / Math.pow(wMmRound + hMmRound, 0.25);
      const eqDiaInch = eqDiaMm / 25.4;

      return {
        ratio: r,
        wMm: wMmRound,
        hMm: hMmRound,
        wInch: wMmRound / 25.4,
        hInch: hMmRound / 25.4,
        eqDiaMm,
        eqDiaInch,
        actualVelocityMs,
        actualVelocityFpm,
        areaM2: actualAreaM2,
      };
    });

    return {
      qCmh,
      qCfm,
      vMs,
      vFpm,
      areaM2,
      areaSqIn,
      diaMm,
      diaInch,
      rectangularOptions,
    };
  }, [airflowVal, airflowUnit, velocityVal, velocityUnit]);

  // Selected aspect ratio duct dimensions for detailed layout & drawing
  const selectedDuct = useMemo(() => {
    if (!results) return null;
    return results.rectangularOptions.find((opt) => opt.ratio === selectedRatio) || results.rectangularOptions[0];
  }, [results, selectedRatio]);

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fdab3d] to-[#ffc107] flex items-center justify-center text-white">
              <Ruler size={16} />
            </div>
            <div>
              <h1 className="text-xs font-black text-[#323338] uppercase tracking-wide leading-none">
                Duct Sizer
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
            Kalkulasi Dimensi Duct
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Hitung diameter round duct & dimensi rectangular duct dengan standard increment 25mm
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Left Panel: Inputs */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Parameter Input
              </p>

              {/* Airflow Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5">
                    <Wind size={12} className="text-[#0073ea]" />
                    Laju Aliran Udara
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold">
                    <button
                      onClick={() => setAirflowUnit("CFM")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        airflowUnit === "CFM"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      CFM
                    </button>
                    <button
                      onClick={() => setAirflowUnit("CMH")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        airflowUnit === "CMH"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      CMH
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={airflowVal}
                    onChange={(e) => setAirflowVal(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {airflowUnit}
                  </span>
                </div>
              </div>

              {/* Velocity Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#323338] flex items-center gap-1.5">
                    <Gauge size={12} className="text-[#0073ea]" />
                    Target Kecepatan Udara
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold">
                    <button
                      onClick={() => setVelocityUnit("FPM")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        velocityUnit === "FPM"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      FPM
                    </button>
                    <button
                      onClick={() => setVelocityUnit("MS")}
                      className={`px-2 py-1 rounded-md transition-all ${
                        velocityUnit === "MS"
                          ? "bg-white text-[#0073ea] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      M/S
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={velocityVal}
                    onChange={(e) => setVelocityVal(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-base font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {velocityUnit === "FPM" ? "FPM" : "M/S"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Guidelines Card */}
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-xs">
              <div className="flex items-center gap-2 mb-3 text-[#0073ea]">
                <Info size={14} className="shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Target Velocity Acuan</h4>
              </div>
              <ul className="space-y-2 text-[#676879] font-medium leading-relaxed">
                <li>• <strong>Residensial:</strong> 600 - 800 FPM (3.0 - 4.0 m/s)</li>
                <li>• <strong>Komersial (Low Noise):</strong> 800 - 1200 FPM (4.0 - 6.0 m/s)</li>
                <li>• <strong>Komersial (Main Duct):</strong> 1200 - 1800 FPM (6.0 - 9.0 m/s)</li>
                <li>• <strong>Industri (High Speed):</strong> 1800 - 2500 FPM (9.0 - 12.5 m/s)</li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            {!results ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 h-[400px] flex flex-col items-center justify-center text-center p-8">
                <Ruler size={48} className="text-slate-300 mb-4 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Masukkan Parameter Input
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Nilai Airflow dan Target Velocity harus lebih besar dari 0 untuk menampilkan hasil kalkulasi real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Round Duct Results */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-[#0073ea]/5 p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0073ea]">
                      Area Duct Ideal
                    </p>
                    <p className="text-2xl font-black text-[#0073ea] mt-1.5">
                      {results.areaM2.toFixed(4)}{" "}
                      <span className="text-xs font-bold">m²</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      {results.areaSqIn.toFixed(1)} Sq. Inch
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Round Duct Diameter
                    </p>
                    <p className="text-2xl font-black text-[#323338] mt-1.5">
                      {results.diaMm.toFixed(0)}{" "}
                      <span className="text-xs font-bold text-slate-400">mm</span>
                    </p>
                    <p className="text-[10px] font-bold text-[#0073ea] uppercase mt-0.5">
                      {results.diaInch.toFixed(2)} inch
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Target Kecepatan
                    </p>
                    <p className="text-2xl font-black text-[#323338] mt-1.5">
                      {results.vMs.toFixed(2)}{" "}
                      <span className="text-xs font-bold text-slate-400">m/s</span>
                    </p>
                    <p className="text-[10px] font-bold text-[#0073ea] uppercase mt-0.5">
                      {results.vFpm.toFixed(0)} FPM
                    </p>
                  </div>
                </div>

                {/* Rectangular Duct Options Grid / Table */}
                <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Rekomendasi Rectangular Duct (W × H)
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-2">
                          <th className="py-3 pr-4">Aspect Ratio</th>
                          <th className="py-3 px-4">Dimensi (W × H)</th>
                          <th className="py-3 px-4">Equivalent Dia.</th>
                          <th className="py-3 px-4">Velocity Aktual</th>
                          <th className="py-3 pl-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.rectangularOptions.map((opt) => (
                          <tr
                            key={opt.ratio}
                            className={`border-b border-slate-50 transition-all ${
                              selectedRatio === opt.ratio
                                ? "bg-blue-50/40 text-[#0073ea]"
                                : "text-slate-600 hover:bg-slate-50/50"
                            }`}
                          >
                            <td className="py-4 pr-4 font-bold">
                              1 : {opt.ratio.toFixed(1)}
                            </td>
                            <td className="py-4 px-4 font-black text-sm">
                              {opt.wMm} × {opt.hMm}{" "}
                              <span className="text-[10px] font-bold text-slate-400">mm</span>
                              <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">
                                {opt.wInch.toFixed(1)}″ × {opt.hInch.toFixed(1)}″
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold">
                              {opt.eqDiaMm.toFixed(0)}{" "}
                              <span className="text-[10px] font-semibold text-slate-400">mm</span>
                              <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">
                                {opt.eqDiaInch.toFixed(1)}″ (Huebscher)
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold">
                              {opt.actualVelocityMs.toFixed(2)}{" "}
                              <span className="text-[10px] font-semibold text-slate-400">m/s</span>
                              <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">
                                {opt.actualVelocityFpm.toFixed(0)} FPM
                              </span>
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <button
                                onClick={() => setSelectedRatio(opt.ratio)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                  selectedRatio === opt.ratio
                                    ? "bg-[#0073ea] text-white shadow-sm shadow-blue-100"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                Pilih
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SVG Visualizer Card */}
                {selectedDuct && (
                  <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* SVG Canvas */}
                      <div className="relative w-48 h-48 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 p-4">
                        <svg className="w-full h-full" viewBox="0 0 160 160">
                          {/* Grid background */}
                          <defs>
                            <pattern
                              id="grid"
                              width="16"
                              height="16"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 16 0 L 0 0 0 16"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="1"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />

                          {/* Round duct equivalent circle (dash border) */}
                          <circle
                            cx="80"
                            cy="80"
                            r="42"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                          />

                          {/* Rectangular Duct */}
                          {/* Aspect ratio width & height calculated dynamically inside a max width of 110px */}
                          {(() => {
                            const maxCanvasDim = 100;
                            const ratio = selectedDuct.ratio;
                            let rectW, rectH;
                            if (ratio >= 1) {
                              rectW = maxCanvasDim;
                              rectH = maxCanvasDim / ratio;
                            } else {
                              rectH = maxCanvasDim;
                              rectW = maxCanvasDim * ratio;
                            }
                            const x = 80 - rectW / 2;
                            const y = 80 - rectH / 2;
                            return (
                              <rect
                                x={x}
                                y={y}
                                width={rectW}
                                height={rectH}
                                rx="4"
                                fill="rgba(0,115,234,0.06)"
                                stroke="#0073ea"
                                strokeWidth="2.5"
                              />
                            );
                          })()}

                          {/* Center reference cross */}
                          <line
                            x1="80"
                            y1="75"
                            x2="80"
                            y2="85"
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                          <line
                            x1="75"
                            y1="80"
                            x2="85"
                            y2="80"
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                        </svg>
                      </div>

                      {/* Visualizer specs info */}
                      <div className="flex-1 space-y-4 text-xs">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#0073ea]">
                            Visualisasi Duct & Detail Desain
                          </p>
                          <h4 className="text-base font-black text-[#323338] uppercase mt-0.5">
                            Duct Rectangular {selectedDuct.wMm} × {selectedDuct.hMm} mm
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            Rekomendasi untuk Aspect Ratio 1 : {selectedDuct.ratio}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                              Kecepatan Aktual
                            </span>
                            <span className="text-sm font-bold text-[#323338]">
                              {selectedDuct.actualVelocityMs.toFixed(2)} m/s
                            </span>
                            <span className="text-[10px] font-medium text-[#676879] block mt-0.5">
                              {selectedDuct.actualVelocityFpm.toFixed(0)} FPM
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                              Cross-Sec Area
                            </span>
                            <span className="text-sm font-bold text-[#323338]">
                              {selectedDuct.areaM2.toFixed(4)} m²
                            </span>
                            <span className="text-[10px] font-medium text-[#676879] block mt-0.5">
                              {(selectedDuct.areaM2 * 1550.003).toFixed(1)} sq. in
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic border-t border-slate-100 pt-3">
                          * Diagram di atas menunjukkan visualisasi perbandingan duct rectangular terpilih (biru solid) dengan diameter round duct ideal yang ekuivalen (lingkaran abu-abu putus-putus).
                        </p>
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
