"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Info, Thermometer, User, Monitor, Sun, Layout } from "lucide-react";

export default function HeatLoadClient() {
  // Input states
  const [area, setArea] = useState<string>("20"); // Room Area (m2)
  const [height, setHeight] = useState<string>("3.0"); // Ceiling height (m)
  const [people, setPeople] = useState<string>("3"); // Number of people
  const [computers, setComputers] = useState<string>("2"); // Active workstations
  const [otherEquipment, setOtherEquipment] = useState<string>("100"); // Other load in Watts
  const [lightingDensity, setLightingDensity] = useState<string>("12"); // W/m2
  const [wallType, setWallType] = useState<"LIGHT" | "MEDIUM" | "HEAVY">("MEDIUM");
  const [windowArea, setWindowArea] = useState<string>("3"); // m2
  const [windowGlazing, setWindowGlazing] = useState<"SINGLE" | "DOUBLE">("SINGLE");
  const [orientation, setOrientation] = useState<"N" | "S" | "E" | "W">("E");
  const [tempOutdoor, setTempOutdoor] = useState<string>("35"); // °C
  const [tempIndoor, setTempIndoor] = useState<string>("24"); // °C

  // Core sensible and latent heat load calculations
  const calculation = useMemo(() => {
    const rawArea = parseFloat(area) || 0;
    const rawHeight = parseFloat(height) || 0;
    const rawPeople = parseFloat(people) || 0;
    const rawComputers = parseFloat(computers) || 0;
    const rawOtherEquip = parseFloat(otherEquipment) || 0;
    const rawLightDensity = parseFloat(lightingDensity) || 0;
    const rawWindowArea = parseFloat(windowArea) || 0;
    const rawTempOut = parseFloat(tempOutdoor) || 0;
    const rawTempIn = parseFloat(tempIndoor) || 0;

    if (rawArea <= 0 || rawHeight <= 0) return null;

    const deltaT = Math.max(0, rawTempOut - rawTempIn);

    // 1. Envelope Load: Wall Heat Gain
    // Assume exterior wall is roughly length of one side * height.
    // Let's estimate exterior wall area = 0.6 * sqrt(floor_area) * 4 * height
    const estWallArea = Math.max(0, 0.6 * Math.sqrt(rawArea) * 4 * rawHeight - rawWindowArea);
    const uWall = wallType === "LIGHT" ? 2.0 : wallType === "MEDIUM" ? 1.0 : 0.5;
    const qWall = uWall * estWallArea * deltaT;

    // 2. Envelope Load: Roof Heat Gain
    // Assuming heat gains from the roof/ceiling
    // Delta T roof is typically higher because of solar radiation (add +8°C solar heat gain index)
    const qRoof = 1.2 * rawArea * (deltaT + 8);

    // 3. Envelope Load: Window Glass Conduction
    const uGlass = windowGlazing === "SINGLE" ? 5.8 : 2.8;
    const qGlassCond = uGlass * rawWindowArea * deltaT;

    // 4. Solar Radiation Glass Load
    const solarFactor = orientation === "E" || orientation === "W" ? 450 : 250;
    const shadingCoeff = 0.65; // standard blinds
    const qGlassSolar = rawWindowArea * solarFactor * shadingCoeff;

    // 5. Internal Load: Occupants (People)
    const occupantSensible = rawPeople * 75; // 75W sensible per person
    const occupantLatent = rawPeople * 55; // 55W latent per person

    // 6. Internal Load: Equipment
    const equipmentSensible = rawComputers * 250 + rawOtherEquip; // 250W per workstation

    // 7. Internal Load: Lighting
    const lightingSensible = rawArea * rawLightDensity;

    // 8. Fresh Air Ventilation / Infiltration
    // 7.5 Liters/sec per person of ventilation air
    const ventFlowLps = rawPeople * 7.5;
    const qVentSensible = 1.2 * ventFlowLps * deltaT; // 1.2 W/(L/s.K) density * Cp factor
    const qVentLatent = rawPeople * 45; // Latent fresh air load (~45W per person in hot humid area)

    // Totals calculations
    const sensibleTotal = qWall + qRoof + qGlassCond + qGlassSolar + occupantSensible + equipmentSensible + lightingSensible + qVentSensible;
    const latentTotal = occupantLatent + qVentLatent;

    // Apply safety margin (15% standard safety factor)
    const safetyMargin = 0.15;
    const grandTotalW = (sensibleTotal + latentTotal) * (1 + safetyMargin);
    const grandTotalBtu = grandTotalW * 3.412142; // 1 Watt = 3.412 Btu/hr
    const grandTotalKw = grandTotalW / 1000;
    const grandTotalTr = grandTotalKw / 3.51685;

    // CFM airflow calculation (based on cooling coil delta T of 10°C)
    // CFM = Sensible load (Btu/hr) / (1.08 * 18°F)
    const cfmRequired = sensibleTotal * 3.412142 / 19.44;
    const cmhRequired = cfmRequired * 1.69901;

    // Recommended AC Capacity (PK / Horsepower)
    let recommendedPk = "0.5 PK";
    let pkDescription = "Kamar Kecil / Ruang Tidur";
    if (grandTotalBtu <= 5500) {
      recommendedPk = "0.5 PK";
      pkDescription = "Ideal untuk Kamar Kecil / Kamar Tidur Utama Standard";
    } else if (grandTotalBtu <= 7500) {
      recommendedPk = "0.75 PK";
      pkDescription = "Ideal untuk Kamar Tidur Besar / Ruang Belajar";
    } else if (grandTotalBtu <= 9500) {
      recommendedPk = "1.0 PK";
      pkDescription = "Ideal untuk Living Room Kecil / Kantor Pribadi";
    } else if (grandTotalBtu <= 13000) {
      recommendedPk = "1.5 PK";
      pkDescription = "Ideal untuk Ruang Tamu / Kamar Tidur Utama Besar";
    } else if (grandTotalBtu <= 19000) {
      recommendedPk = "2.0 PK";
      pkDescription = "Ideal untuk Ruang Kelas / Kantor Studio Kecil";
    } else if (grandTotalBtu <= 25000) {
      recommendedPk = "2.5 PK";
      pkDescription = "Ideal untuk Toko / Ruko / Ruang Pertemuan Sedang";
    } else if (grandTotalBtu <= 30000) {
      recommendedPk = "3.0 PK";
      pkDescription = "Ideal untuk Aula Kecil / Minimarket";
    } else {
      recommendedPk = "Multi-Split / VRV";
      pkDescription = "Beban melebihi kapasitas unit single. Rekomendasi sistem VRV / Multi-Split.";
    }

    // Pie chart / breakdown percentages
    const envTotal = qWall + qRoof + qGlassCond + qGlassSolar;
    const intTotal = occupantSensible + equipmentSensible + lightingSensible;
    const ventTotal = qVentSensible + latentTotal; // group latent with ventilation for simple groupings
    const sum = envTotal + intTotal + ventTotal;

    const envPct = sum > 0 ? (envTotal / sum) * 100 : 0;
    const intPct = sum > 0 ? (intTotal / sum) * 100 : 0;
    const ventPct = sum > 0 ? (ventTotal / sum) * 100 : 0;

    return {
      qWall,
      qRoof,
      qGlassCond,
      qGlassSolar,
      occupantSensible,
      occupantLatent,
      equipmentSensible,
      lightingSensible,
      qVentSensible,
      qVentLatent,
      sensibleTotal,
      latentTotal,
      grandTotalW,
      grandTotalBtu,
      grandTotalKw,
      grandTotalTr,
      cfmRequired,
      cmhRequired,
      recommendedPk,
      pkDescription,
      breakdown: {
        envelope: { name: "Beban Dinding/Kaca (Envelope)", watts: envTotal, pct: envPct },
        internal: { name: "Beban Internal (Orang/Alat/Lampu)", watts: intTotal, pct: intPct },
        ventilation: { name: "Beban Ventilasi & Udara Luar", watts: ventTotal, pct: ventPct },
      },
    };
  }, [
    area,
    height,
    people,
    computers,
    otherEquipment,
    lightingDensity,
    wallType,
    windowArea,
    windowGlazing,
    orientation,
    tempOutdoor,
    tempIndoor,
  ]);

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff642e] to-[#fdab3d] flex items-center justify-center text-white">
              <Zap size={16} />
            </div>
            <div>
              <h1 className="text-xs font-black text-[#323338] uppercase tracking-wide leading-none">
                Heat Load Estimator
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
            Estimasi Cooling Load
          </h2>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          
          {/* Left Panel: Inputs Form (Scrollable Groups) */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 shadow-sm space-y-6 max-h-[750px] overflow-y-auto pr-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Konfigurasi Parameter Ruangan
              </p>

              {/* 1. ROOM SPECIFICATIONS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0073ea]">
                  <Layout size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Spesifikasi Ruangan
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Luas Area (m²)
                    </label>
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tinggi Plafon (m)
                    </label>
                    <input
                      type="number"
                      value={height}
                      step="0.1"
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. OCCUPANTS & EQUIPMENT */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0073ea]">
                  <User size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Hunian & Beban Internal
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jumlah Orang
                    </label>
                    <input
                      type="number"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Komputer / TV
                    </label>
                    <input
                      type="number"
                      value={computers}
                      onChange={(e) => setComputers(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Alat Lain (Watt)
                    </label>
                    <input
                      type="number"
                      value={otherEquipment}
                      onChange={(e) => setOtherEquipment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Daya Lampu (W/m²)
                    </label>
                    <input
                      type="number"
                      value={lightingDensity}
                      onChange={(e) => setLightingDensity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ENVELOPE & ORIENTATION */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0073ea]">
                  <Sun size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Selubung Bangunan & Solar
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Insulasi Dinding
                    </label>
                    <select
                      value={wallType}
                      onChange={(e: any) => setWallType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    >
                      <option value="LIGHT">Ringan (Tipis/No Insul)</option>
                      <option value="MEDIUM">Medium (Bata Standar)</option>
                      <option value="HEAVY">Tebal (Double Insulated)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Arah Jendela Utama
                    </label>
                    <select
                      value={orientation}
                      onChange={(e: any) => setOrientation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    >
                      <option value="N">Utara (North)</option>
                      <option value="S">Selatan (South)</option>
                      <option value="E">Timur (East) - Sunup</option>
                      <option value="W">Barat (West) - Sunset</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Luas Kaca Jendela (m²)
                    </label>
                    <input
                      type="number"
                      value={windowArea}
                      onChange={(e) => setWindowArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jenis Kaca Jendela
                    </label>
                    <select
                      value={windowGlazing}
                      onChange={(e: any) => setWindowGlazing(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    >
                      <option value="SINGLE">Single Glazed (Kaca Tunggal)</option>
                      <option value="DOUBLE">Double Glazed (Dua Lapis)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. DESIGN TEMPERATURES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0073ea]">
                  <Thermometer size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Kondisi Temperatur Desain
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Outdoor Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={tempOutdoor}
                      onChange={(e) => setTempOutdoor(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Indoor Setpoint (°C)
                    </label>
                    <input
                      type="number"
                      value={tempIndoor}
                      onChange={(e) => setTempIndoor(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-bold text-[#323338] outline-none focus:border-[#0073ea] transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: Results & AC Recommendations */}
          <div className="space-y-6">
            {!calculation ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 h-[450px] flex flex-col items-center justify-center text-center p-8">
                <Monitor size={48} className="text-slate-300 mb-4 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Menunggu Parameter Desain
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Silakan masukkan luas ruangan dan tinggi plafon yang valid pada panel sebelah kiri.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Top AC Recommendation banner */}
                <div className="rounded-[2rem] border border-[#00c875]/20 bg-[#00c875]/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <span className="px-2.5 py-1 bg-[#00c875] text-white rounded text-[8px] font-black uppercase tracking-widest">
                      Rekomendasi Kapasitas Daikin AC
                    </span>
                    <h3 className="text-3xl font-black text-[#323338] mt-2.5">
                      {calculation.recommendedPk}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase">
                      {calculation.pkDescription}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 border border-[#e6e9ef] text-right min-w-[140px] shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Total Beban Panas
                    </span>
                    <span className="text-xl font-black text-[#0073ea] block mt-1">
                      {calculation.grandTotalBtu.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      <span className="text-xs font-bold">BTU/hr</span>
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                      {calculation.grandTotalTr.toFixed(2)} TR ({calculation.grandTotalKw.toFixed(1)} kW)
                    </span>
                  </div>
                </div>

                {/* Heat Load Breakdown (Visual Horizontal Percentage Bar) */}
                <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Proporsi Beban Pendinginan Ruang (Total Load: {calculation.grandTotalW.toFixed(0)} W)
                  </p>

                  {/* Horizontal percentage stack bar */}
                  <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 mb-6">
                    <div 
                      className="bg-[#0073ea] h-full"
                      style={{ width: `${calculation.breakdown.envelope.pct}%` }}
                      title={`${calculation.breakdown.envelope.name}: ${calculation.breakdown.envelope.pct.toFixed(1)}%`}
                    />
                    <div 
                      className="bg-[#ff642e] h-full"
                      style={{ width: `${calculation.breakdown.internal.pct}%` }}
                      title={`${calculation.breakdown.internal.name}: ${calculation.breakdown.internal.pct.toFixed(1)}%`}
                    />
                    <div 
                      className="bg-[#fdab3d] h-full"
                      style={{ width: `${calculation.breakdown.ventilation.pct}%` }}
                      title={`${calculation.breakdown.ventilation.name}: ${calculation.breakdown.ventilation.pct.toFixed(1)}%`}
                    />
                  </div>

                  {/* Legend list */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-3 h-3 rounded bg-[#0073ea] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#323338] block">
                          Selubung (Envelope)
                        </span>
                        <span className="text-base font-black text-[#323338]">
                          {calculation.breakdown.envelope.pct.toFixed(1)}%
                        </span>
                        <span className="block text-[8px] font-medium text-slate-400 uppercase mt-0.5">
                          {calculation.breakdown.envelope.watts.toFixed(0)} Watts (Dinding & Kaca)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-3 h-3 rounded bg-[#ff642e] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#323338] block">
                          Beban Internal
                        </span>
                        <span className="text-base font-black text-[#323338]">
                          {calculation.breakdown.internal.pct.toFixed(1)}%
                        </span>
                        <span className="block text-[8px] font-medium text-slate-400 uppercase mt-0.5">
                          {calculation.breakdown.internal.watts.toFixed(0)} Watts (Orang, Lampu, PC)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-3 h-3 rounded bg-[#fdab3d] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#323338] block">
                          Ventilasi & Latent
                        </span>
                        <span className="text-base font-black text-[#323338]">
                          {calculation.breakdown.ventilation.pct.toFixed(1)}%
                        </span>
                        <span className="block text-[8px] font-medium text-slate-400 uppercase mt-0.5">
                          {calculation.breakdown.ventilation.watts.toFixed(0)} Watts (Udara luar & Kelembaban)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific Detailed Breakdown table */}
                <div className="rounded-[2rem] border border-[#e6e9ef] bg-white p-6 md:p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Detail Sensible & Latent Heat Load
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Sensible Heat Component Grid */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0073ea] border-b border-slate-100 pb-2">
                        Sensible Cooling Load (Beban Panas Kering)
                      </h4>
                      <div className="space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Konduksi Jendela Kaca</span>
                          <span className="text-[#323338]">{calculation.qGlassCond.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Radiasi Surya Jendela</span>
                          <span className="text-[#323338]">{calculation.qGlassSolar.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Konduksi Dinding Luar</span>
                          <span className="text-[#323338]">{calculation.qWall.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Konduksi Atap & Plafon</span>
                          <span className="text-[#323338]">{calculation.qRoof.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Panas Orang (Sensible)</span>
                          <span className="text-[#323338]">{calculation.occupantSensible.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Peralatan & Komputer</span>
                          <span className="text-[#323338]">{calculation.equipmentSensible.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span>Daya Lampu Penerangan</span>
                          <span className="text-[#323338]">{calculation.lightingSensible.toFixed(0)} W</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50 text-[#0073ea] font-black pt-2">
                          <span>Subtotal Sensible</span>
                          <span>{calculation.sensibleTotal.toFixed(0)} W</span>
                        </div>
                      </div>
                    </div>

                    {/* Latent & Air Flow Grid */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff642e] border-b border-slate-100 pb-2">
                          Latent Cooling Load (Beban Kelembaban)
                        </h4>
                        <div className="space-y-2 text-xs font-semibold text-slate-500">
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span>Respirasi Manusia (Latent)</span>
                            <span className="text-[#323338]">{calculation.occupantLatent.toFixed(0)} W</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span>Udara Ventilasi (Latent)</span>
                            <span className="text-[#323338]">{calculation.qVentLatent.toFixed(0)} W</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50 text-[#ff642e] font-black pt-2">
                            <span>Subtotal Latent</span>
                            <span>{calculation.latentTotal.toFixed(0)} W</span>
                          </div>
                        </div>
                      </div>

                      {/* Required Air Flow calculations */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#0073ea] block mb-3">
                          Estimasi Sirkulasi Air Flow Supply
                        </span>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-3 border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 block uppercase">
                              Volume CFM
                            </span>
                            <span className="text-base font-black text-[#323338] mt-1 block">
                              {calculation.cfmRequired.toFixed(0)}{" "}
                              <span className="text-[10px] font-bold text-slate-400">CFM</span>
                            </span>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 block uppercase">
                              Volume CMH
                            </span>
                            <span className="text-base font-black text-[#323338] mt-1 block">
                              {calculation.cmhRequired.toFixed(0)}{" "}
                              <span className="text-[10px] font-bold text-slate-400">m³/h</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
