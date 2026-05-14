"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ShieldCheck, Activity, Clock, Zap, Info, ChevronRight, GaugeCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ahi: any; // AHIResult
  metrics?: any; // CapacityResult (optional fallback)
  score: number;
}

export default function HealthExplanationModal({ isOpen, onClose, ahi, metrics, score }: Props) {
  if (!isOpen) return null;
  
  const currentScore = ahi?.totalScore ?? score ?? 0;
  const statusColor = currentScore >= 80 ? '#00c875' : currentScore >= 50 ? '#fdab3d' : '#e44258';
  const statusBg = currentScore >= 80 ? 'bg-emerald-50' : currentScore >= 50 ? 'bg-amber-50' : 'bg-rose-50';
  const statusText = currentScore >= 80 ? 'text-emerald-600' : currentScore >= 50 ? 'text-amber-600' : 'text-rose-600';
  const statusLabel = currentScore >= 80 ? 'Optimal' : currentScore >= 50 ? 'Warning' : 'Critical';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative z-10 flex flex-col max-h-[90vh] border border-white/20"
      >
        <div className="p-8 bg-gradient-to-br from-[#003366] to-[#001a33] text-white shrink-0 relative overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-12 -right-12 w-48 h-48 bg-[#00a1e4] rounded-full blur-[80px]"
          />
          <div className="relative z-10">
            <h1 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
              <GaugeCircle className="text-[#00a1e4]" /> Health <span className="text-[#00a1e4] not-italic">Analytics</span>
            </h1>
            <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em] mt-1">Daikin IQ Diagnostics Engine</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-slate-50/50">
          {/* Main Score Card */}
          <div className="p-7 bg-white rounded-[2.5rem] space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balanced Health Index</p>
                   <h2 className={`text-5xl font-black ${statusText} tracking-tighter`}>{currentScore}%</h2>
                </div>
                <div className={`px-4 py-2 rounded-2xl ${statusBg} ${statusText} text-[10px] font-black uppercase tracking-widest border border-current/5 shadow-sm`}>
                   {statusLabel}
                </div>
             </div>
             
             <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/40">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${currentScore}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] relative overflow-hidden" 
                        style={{ backgroundColor: statusColor }}
                    >
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-24"
                        />
                    </motion.div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed text-center px-4">
                    Deep analytics cross-referencing physical state, thermodynamic efficiency, and reliability metadata.
                </p>
             </div>
          </div>

          {/* Balanced Breakdown */}
          {ahi ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#003366]">Diagnostic Breakdown</h3>
                <Info size={14} className="text-slate-300" />
              </div>
              <div className="space-y-3">
                <AHIBreakdownRow 
                    label="Physical Integrity" 
                    score={ahi.conditionScore} 
                    weight={40} 
                    icon={ShieldCheck} 
                    color="#0073ea" 
                    subtext={`${ahi.breakdown.physical.count} inspection points verified`}
                />
                <AHIBreakdownRow 
                    label="Thermal Efficiency" 
                    score={ahi.performanceScore} 
                    weight={40} 
                    icon={Zap} 
                    color="#f59e0b" 
                    subtext={ahi.physics?.actualCapacitykW ? `${ahi.physics.actualCapacitykW}kW vs ${ahi.physics.designCapacitykW}kW` : "Physics-based enthalpy audit"}
                />
                <AHIBreakdownRow 
                    label="Reliability Factor" 
                    score={ahi.reliabilityScore} 
                    weight={20} 
                    icon={Clock} 
                    color="#64748b" 
                    subtext={`Unit Age: ${ahi.breakdown.reliability.age} Years`}
                />
              </div>
            </div>
          ) : null}

          {/* Technical Physics (if available) */}
          {(ahi?.physics || metrics) && (
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#003366] px-2">Performance Telemetry</h3>
               <div className="grid grid-cols-2 gap-3">
                  <MetricBox label="Actual Cap." value={`${(ahi?.physics || metrics).actualCapacitykW} kW`} color="#0073ea" icon={<Activity size={12}/>} />
                  <MetricBox label="Design Cap." value={`${(ahi?.physics || metrics).designCapacitykW} kW`} color="#64748b" icon={<Settings2 size={12}/>} />
                  <MetricBox label="Airflow" value={`${(ahi?.physics || metrics).airflow} m³/h`} color="#323338" icon={<Activity size={12}/>} />
                  <MetricBox label="Efficiency" value={`${(ahi?.physics || metrics).healthScore}%`} color="#00c875" icon={<Zap size={12}/>} />
               </div>
            </div>
          )}

          {/* Methodology Formula */}
          <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg"><Settings2 size={14} className="text-blue-400" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Algorithmic Base</p>
             </div>
             <div className="font-mono text-[10px] space-y-2 opacity-90">
                <div className="flex justify-between border-b border-white/5 pb-1">
                   <span className="text-slate-500">HI</span>
                   <span>(C×0.4) + (P×0.4) + (R×0.2)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                   <span className="text-slate-500">Eff</span>
                   <span>(Q_act / Q_std) × 100</span>
                </div>
             </div>
             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center pt-2">Standard: ISO 50001 & ASHRAE 1.1</p>
          </div>
        </div>

        <div className="p-8 pt-4 bg-white/50 shrink-0 border-t border-slate-100">
           <button 
              onClick={onClose} 
              className="w-full py-5 bg-[#003366] hover:bg-black text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_12px_24px_-8px_rgba(0,51,102,0.4)] transition-all active:scale-95"
           >
              Return to Passport
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function AHIBreakdownRow({ label, score, weight, icon: Icon, color, subtext }: any) {
  return (
    <div className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-4 group hover:border-blue-100 transition-all shadow-sm">
      <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50 transition-colors" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <span className="text-[11px] font-black" style={{ color }}>{score}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <p className="text-[9px] font-bold text-slate-300 truncate italic">{subtext}</p>
      </div>
      <div className="text-right shrink-0 border-l border-slate-50 pl-3">
        <p className="text-[8px] font-bold text-slate-300 uppercase">Weight</p>
        <p className="text-[10px] font-black text-slate-400">{weight}%</p>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color, icon }: any) {
   return (
      <div className="p-4 bg-white border border-slate-100 rounded-[1.75rem] space-y-1 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-center gap-1.5 opacity-40" style={{ color }}>
            {icon}
            <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
         </div>
         <p className="text-sm font-black tracking-tight" style={{ color }}>{value}</p>
      </div>
   );
}
