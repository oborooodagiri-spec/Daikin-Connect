"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, TrendingDown, DollarSign, ArrowRight, 
  ChevronRight, Activity, Calculator, PieChart,
  Download, Share2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoiCalculatorClient() {
  const router = useRouter();
  
  // Basic State for Demo
  const [kwPerTrOld, setKwPerTrOld] = useState(1.2);
  const [kwPerTrNew, setKwPerTrNew] = useState(0.6);
  const [tonnage, setTonnage] = useState(500);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [electricityRate, setElectricityRate] = useState(1444); // IDR/kWh

  // Calculations
  const kwOld = tonnage * kwPerTrOld;
  const kwNew = tonnage * kwPerTrNew;
  const savingKw = kwOld - kwNew;
  const monthlySavingIdr = savingKw * hoursPerDay * 30 * electricityRate;
  const annualSavingIdr = monthlySavingIdr * 12;

  return (
    <div className="min-h-screen bg-[#040814] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                 <ChevronRight className="rotate-180" />
              </button>
              <div>
                 <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Calculator className="text-blue-500" /> ROI & Cost Saving Calculator
                 </h1>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VES Tier 3 - Financial Optimization Module</p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                 <Download size={14} /> Export Proposal
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Inputs */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Parameter Input</h3>
                 
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Tonnage (TR)</label>
                       <input 
                         type="number"
                         value={tonnage}
                         onChange={e => setTonnage(Number(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black outline-none focus:border-blue-500/50 transition-all"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Baseline Eff. (kW/TR)</label>
                       <input 
                         type="number" step="0.1"
                         value={kwPerTrOld}
                         onChange={e => setKwPerTrOld(Number(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black outline-none focus:border-blue-500/50 transition-all"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Target Eff. (kW/TR)</label>
                       <input 
                         type="number" step="0.1"
                         value={kwPerTrNew}
                         onChange={e => setKwPerTrNew(Number(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black outline-none focus:border-blue-500/50 transition-all text-blue-400"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Op. Hours / Day</label>
                       <input 
                         type="number"
                         value={hoursPerDay}
                         onChange={e => setHoursPerDay(Number(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black outline-none focus:border-blue-500/50 transition-all"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Results Dashboard */}
           <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                 >
                    <Zap className="absolute top-8 right-8 text-white/20 w-16 h-16" />
                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2 block">Monthly Saving Potential</span>
                    <h4 className="text-4xl font-black mb-2">IDR {monthlySavingIdr.toLocaleString('id-ID')}</h4>
                    <p className="text-blue-200/60 text-xs font-bold flex items-center gap-2">
                       <TrendingDown size={14} /> Penghematan Biaya Listrik Bulanan
                    </p>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8"
                 >
                    <DollarSign className="absolute top-8 right-8 text-white/5 w-16 h-16" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Annual Saving Potential</span>
                    <h4 className="text-4xl font-black mb-2 text-emerald-400">IDR {annualSavingIdr.toLocaleString('id-ID')}</h4>
                    <p className="text-slate-500 text-xs font-bold">Proyeksi Penghematan 1 Tahun</p>
                 </motion.div>
              </div>

              {/* Chart/Visual Placeholder */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                 <div className="flex items-center justify-between mb-12">
                    <h3 className="text-lg font-black tracking-tight uppercase">Efficiency Comparison</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-700" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Baseline</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Target</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-end gap-12 h-64 px-12">
                    <div className="flex-1 flex flex-col items-center gap-4">
                       <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          className="w-full bg-slate-800 rounded-2xl relative"
                       >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black">{kwPerTrOld} kW/TR</div>
                       </motion.div>
                       <span className="text-[10px] font-black text-slate-500">KONDISI SAAT INI</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-4">
                       <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${(kwPerTrNew / kwPerTrOld) * 100}%` }}
                          className="w-full bg-blue-600 rounded-2xl relative shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                       >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black text-blue-400">{kwPerTrNew} kW/TR</div>
                       </motion.div>
                       <span className="text-[10px] font-black text-blue-400">TARGET VES TIER 3</span>
                    </div>
                 </div>
              </div>

              {/* Bottom Info */}
              <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center gap-6">
                 <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <PieChart size={28} />
                 </div>
                 <div>
                    <h5 className="font-black text-sm mb-1 uppercase tracking-tight">Financial Analysis Note</h5>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                       Perhitungan ini berdasarkan estimasi performa chiller baru atau hasil retrofit VFD. ROI tercapai melalui penghematan energi (kWh) dengan mengoptimalkan titik operasional unit sesuai beban pendinginan aktual.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
