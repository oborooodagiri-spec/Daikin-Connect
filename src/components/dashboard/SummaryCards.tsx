"use client";

import React, { useEffect, useState } from "react";
import { Users, LayoutGrid, Database, ClipboardCheck, Wrench, AlertTriangle, ChevronRight, Target, Clock, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

const TIMEFRAMES = [
  { id: 'daily', label: 'DAILY TARGET', icon: Clock },
  { id: 'monthly', label: 'MONTHLY PROGRESS', icon: Calendar },
  { id: 'total', label: 'YTD PERFORMANCE', icon: TrendingUp }
];

function RotatingMetricCard({ title, icon: Icon, color, bg, metrics, onDetailClick, type }: any) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % TIMEFRAMES.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  const currentFrame = TIMEFRAMES[frameIndex];
  const currentMetric = metrics[frameIndex];
  const percentage = currentMetric.target > 0 ? Math.min(Math.round((currentMetric.actual / currentMetric.target) * 100), 100) : 0;

  // Custom Label for Audit's Total Target
  const displayLabel = (type === 'Audit' && currentFrame.id === 'total') ? 'TARGET AKHIR' : currentFrame.label;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onDetailClick({ title, metrics, color, icon: Icon })}
      className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:bg-[#003366]/[0.02]"
    >
      <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-10 blur-3xl ${color.replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start mb-4 md:mb-8 isolate">
        <div className="space-y-1">
          <h2 className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{title}</h2>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
            <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">LIVE CONNECT</span>
          </div>
        </div>
        <div className={`p-2.5 md:p-3 rounded-2xl ${bg} ${color} shadow-lg shadow-blue-900/5`}>
          <Icon size={18} className="md:w-5 md:h-5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[100px] md:min-h-[140px] isolate">
        <AnimatePresence mode="wait">
          <motion.div 
            key={frameIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center text-center w-full"
          >
             <div className="text-6xl font-black text-[#003366] tracking-tighter mb-2 drop-shadow-sm">
                <AnimatedNumber value={currentMetric.actual} />
             </div>
             
             <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black tracking-widest ${color}`}>
                   <currentFrame.icon size={12} className="opacity-60" />
                   {displayLabel}
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                   {currentMetric.target > 0 ? `Target ${currentMetric.target}` : 'No Target Set'}
                </div>
             </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center opacity-5 -z-10 scale-125">
           <Icon size={120} className={color} strokeWidth={0.5} />
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center isolate">
         <div className="flex gap-1.5">
            {TIMEFRAMES.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === frameIndex ? `w-6 ${color.replace('text-', 'bg-')}` : 'w-1.5 bg-slate-100'}`} />
            ))}
         </div>
         <button className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 group-hover:text-blue-500 transition-colors">
            DETAILS <ChevronRight size={10} />
         </button>
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           transition={{ duration: 1 }}
           className={`h-full ${color.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(0,161,228,0.5)]`}
         />
      </div>
    </motion.div>
  );
}

function CorrectiveKpiCard({ title, icon: Icon, kpi, color, bg, onDetailClick }: any) {
  const resolutionRate = (kpi && kpi.appeared > 0) ? Math.round((kpi.resolved / kpi.appeared) * 100) : 0;
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onDetailClick({ title, kpi, color, icon: Icon })}
      className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:bg-[#003366]/[0.02]"
    >
      <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-10 blur-3xl bg-rose-500" />
      
      <div className="flex justify-between items-start mb-4 md:mb-6 isolate">
        <div className="space-y-1">
          <h2 className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{title}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-black text-rose-300 uppercase tracking-widest">RESOLUTION KPI</span>
          </div>
        </div>
        <div className="p-2.5 md:p-3 rounded-2xl bg-rose-50 text-rose-500 shadow-lg shadow-rose-900/5">
          <Icon size={18} className="md:w-5 md:h-5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative py-4 isolate">
        <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center">
            {/* Simple Gauge SVG */}
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="#F1F5F9" strokeWidth="8" fill="none" />
              <motion.circle 
                cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="none"
                strokeDasharray="100 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - resolutionRate }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-rose-500"
                strokeLinecap="round"
                style={{ strokeDasharray: "283", strokeDashoffset: 283 - (283 * resolutionRate / 100) }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#003366] leading-none">{resolutionRate}%</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Resolved</span>
            </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[14px] font-black text-[#003366]">{kpi.appeared}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Appeared</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[14px] font-black text-emerald-600">{kpi.resolved}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Finished</p>
            </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center isolate">
         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Resolution Health</span>
         <button className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 group-hover:text-rose-500 transition-colors">
            DETAILS <ChevronRight size={10} />
         </button>
      </div>
    </motion.div>
  );
}

function SimpleInfoCard({ title, value, icon: Icon, color, bg, subtext }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 border border-slate-50 flex flex-col justify-between h-full relative overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-3xl ${color.replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase leading-tight">{title}</h2>
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="mt-6">
        <div className="text-5xl font-black text-[#003366] tracking-tighter mb-1">
          <AnimatedNumber value={value} />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {subtext}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
         <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
         </div>
         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Reach</span>
      </div>
    </motion.div>
  );
}

export default function SummaryCards({ data, onCardClick }: { data: any, onCardClick?: (metric: any) => void }) {
  if (!data || !data.audit) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-100/50 rounded-[2.5rem] h-[320px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 w-full py-4">
      {/* AUDIT CARD */}
      <RotatingMetricCard 
        title="AUDIT PROGRESS" 
        icon={ClipboardCheck} color="text-[#00A0E9]" bg="bg-[#00A0E9]/5" type="Audit"
        metrics={[
          { actual: data.audit.actual.daily, target: data.audit.target.daily },
          { actual: data.audit.actual.monthly, target: data.audit.target.monthly },
          { actual: data.audit.actual.total, target: data.audit.target.total }
        ]}
        onDetailClick={onCardClick}
      />

      {/* PM CARD */}
      <RotatingMetricCard 
        title="PM COMPLIANCE" 
        icon={Wrench} color="text-emerald-500" bg="bg-emerald-50" type="Preventive"
        metrics={[
          { actual: data.preventive.actual.daily, target: data.preventive.target.daily },
          { actual: data.preventive.actual.monthly, target: data.preventive.target.monthly },
          { actual: data.preventive.actual.total, target: data.preventive.target.total }
        ]}
        onDetailClick={onCardClick}
      />

      {/* CORRECTIVE CARD */}
      <CorrectiveKpiCard 
        title="CORRECTIVE LOGS" 
        icon={AlertTriangle} color="text-rose-500" bg="bg-rose-50"
        kpi={data.corrective.kpi}
        onDetailClick={onCardClick}
      />

      {/* INFO CARDS */}
      <SimpleInfoCard title="TOTAL CUSTOMERS" value={data.totalCustomers} icon={Users} color="text-blue-500" bg="bg-blue-50" subtext="PARTNERS" />
      <SimpleInfoCard title="ACTIVE SITES" value={data.activeSites} icon={LayoutGrid} color="text-sky-500" bg="bg-sky-50" subtext="OPERATIONAL" />
      <SimpleInfoCard title="DATABASE ASSETS" value={data.databaseAssets} icon={Database} color="text-slate-600" bg="bg-slate-50" subtext="TOTAL UNITS" />
    </div>
  );
}
