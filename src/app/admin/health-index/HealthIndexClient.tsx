"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, ShieldCheck, AlertTriangle, 
  ChevronRight, ArrowUpRight, Gauge,
  Layers, Search, Settings, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HealthIndexClient() {
  const router = useRouter();

  // Mock Data for Demo
  const units = [
    { id: "CH-01", name: "Chiller Central 01", health: 92, status: "Healthy", trend: "+2%", color: "emerald" },
    { id: "CH-02", name: "Chiller Central 02", health: 78, status: "Attention", trend: "-5%", color: "amber" },
    { id: "AHU-12", name: "AHU Floor 12", health: 85, status: "Healthy", trend: "0%", color: "emerald" },
    { id: "CT-01", name: "Cooling Tower 01", health: 45, status: "Critical", trend: "-12%", color: "rose" },
  ];

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
              >
                 <ChevronRight className="rotate-180" />
              </button>
              <div>
                 <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Gauge className="text-blue-600" /> Live Health Index Dashboard
                 </h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VES Tier 2 - Proactive Monitoring Hub</p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input placeholder="Cari unit..." className="h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-200" />
              </div>
           </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <StatCard title="Overall Score" value="84%" icon={Activity} color="blue" />
           <StatCard title="Healthy Units" value="12" icon={ShieldCheck} color="emerald" />
           <StatCard title="Critical Alert" value="01" icon={AlertTriangle} color="rose" />
           <StatCard title="MTBF" value="1.2k Hrs" icon={Zap} color="amber" />
        </div>

        {/* Unit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {units.map((unit, i) => (
             <motion.div 
               key={unit.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
             >
                <div className="flex justify-between items-start mb-6">
                   <div className={`w-12 h-12 rounded-2xl bg-${unit.color}-50 flex items-center justify-center text-${unit.color}-600 border border-${unit.color}-100`}>
                      <Settings size={24} />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest text-${unit.color}-600`}>{unit.status}</span>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 mb-1">{unit.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">ID: {unit.id}</p>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-4xl font-black text-slate-800">{unit.health}%</span>
                      <span className={`text-xs font-bold ${unit.trend.startsWith('+') ? 'text-emerald-500' : unit.trend.startsWith('-') ? 'text-rose-500' : 'text-slate-400'}`}>
                         {unit.trend}
                      </span>
                   </div>
                   <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${unit.health}%` }}
                         className={`h-full bg-${unit.color}-500 rounded-full`}
                      />
                   </div>
                </div>

                <button className="w-full mt-8 py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                   Lihat Diagnostik <ArrowUpRight size={14} />
                </button>
             </motion.div>
           ))}
        </div>

        {/* Legend / Info */}
        <div className="mt-12 p-8 bg-white border border-slate-100 rounded-[2.5rem] flex items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Healthy (80-100%)</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attention (60-79%)</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical (&lt;60%)</span>
           </div>
           
           <div className="ml-auto flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Layers size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Algorithm: VES Diagnostic Engine v2.1</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
       <div className={`w-14 h-14 rounded-2xl bg-${color}-50 border border-${color}-100 flex items-center justify-center text-${color}-600`}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
       </div>
    </div>
  );
}
