"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, TrendingUp, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

interface SummaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onAnalyzeTrends?: () => void;
  onOpenReports?: (type: string) => void;
}

function MetricRow({ label, actual, target, color, icon: Icon }: any) {
  const percentage = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0;
  
  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 relative group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-white border border-slate-100 ${color} shadow-sm`}>
            <Icon size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{label}</p>
            <p className="text-xl font-black text-[#003366] mt-0.5">{actual} <span className="text-xs text-slate-300 font-bold tracking-normal">/ {target || "—"}</span></p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${percentage === 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
          {percentage}%
        </div>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color.replace('text-', 'bg-')} shadow-[0_0_8px_rgba(0,161,228,0.3)]`}
        />
      </div>
    </div>
  );
}

export default function SummaryDetailModal({ isOpen, onClose, data, onAnalyzeTrends, onOpenReports }: SummaryDetailModalProps) {
  if (!data) return null;

  const metricType = data.title.includes("AUDIT") ? "Audit" : data.title.includes("PM") ? "Preventive" : "Corrective";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className={`p-10 border-b border-slate-100 relative overflow-hidden flex justify-between items-center`}>
               <div className={`absolute -left-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-3xl ${data.color.replace('text-', 'bg-')}`} />
               
               <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-[2rem] ${data.bg} ${data.color} flex items-center justify-center shadow-xl shadow-blue-900/5`}>
                     <data.icon size={28} />
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">ANALYTICS LAYER</span>
                     </div>
                     <h2 className="text-3xl font-black text-[#003366] tracking-tighter italic uppercase">{data.title}</h2>
                  </div>
               </div>

               <button 
                 onClick={onClose}
                 className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-2xl transition-colors relative z-10"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Body */}
            <div className="p-10 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MetricRow label="Daily Activity" actual={data.metrics[0].actual} target={data.metrics[0].target} color={data.color} icon={Clock} />
                  <MetricRow label="Monthly Progress" actual={data.metrics[1].actual} target={data.metrics[1].target} color={data.color} icon={Calendar} />
               </div>

               <div className="bg-[#003366] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                  <div className="flex justify-between items-center relative z-10">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black tracking-widest text-[#00a1e4]">YEAR-TO-DATE PERFORMANCE</p>
                        <div className="flex items-end gap-2">
                           <span className="text-6xl font-black italic tracking-tighter">{data.metrics[2].actual}</span>
                           <span className="text-sm font-bold text-white/40 pb-2 uppercase tracking-widest">/ {data.metrics[2].target || "Unlimited"} Reports</span>
                        </div>
                     </div>
                     <div className="p-4 bg-white/10 rounded-3xl border border-white/10">
                        <TrendingUp size={32} className="text-[#00a1e4]" />
                     </div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                           <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs font-bold text-white/70">Efficiency Rating <span className="text-emerald-400">Stable</span></p>
                     </div>
                     <button 
                       onClick={() => { onClose(); onAnalyzeTrends?.(); }}
                       className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00a1e4] hover:text-white transition-colors"
                     >
                        ANALYZE TRENDS <ArrowRight size={14} />
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector {i+1}</p>
                       <p className="text-lg font-black text-[#003366]">{Math.floor(data.metrics[1].actual / (i+1))}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
               <button 
                 onClick={onClose}
                 className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
               >
                  Dismiss Focus
               </button>
               <button 
                 onClick={() => onOpenReports?.(metricType)}
                 className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 hover:scale-105 transition-all ${data.color.replace('text-', 'bg-')}`}
               >
                  Open {metricType} Reports
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
