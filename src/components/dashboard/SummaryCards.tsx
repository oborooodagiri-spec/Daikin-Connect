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

function RotatingMetricCard({ title, icon: Icon, color, bg, metrics, onDetailClick }: any) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % TIMEFRAMES.length);
    }, 6000); // 6 seconds rotation
    return () => clearInterval(interval);
  }, []);

  const currentFrame = TIMEFRAMES[frameIndex];
  const currentMetric = metrics[frameIndex];
  const percentage = currentMetric.target > 0 ? Math.min(Math.round((currentMetric.actual / currentMetric.target) * 100), 100) : 0;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onDetailClick({ title, metrics, color, icon: Icon })}
      className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:bg-[#003366]/[0.02]"
    >
      {/* Decorative Glow */}
      <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-10 blur-3xl ${color.replace('text-', 'bg-')}`} />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 isolate">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{title}</h2>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">LIVE CONNECT</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${bg} ${color} shadow-lg shadow-blue-900/5`}>
          <Icon size={20} />
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px] isolate">
        <AnimatePresence mode="wait">
          <motion.div 
            key={frameIndex}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -10 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="flex flex-col items-center text-center"
          >
             <div className="text-6xl font-black text-[#003366] tracking-tighter mb-2 drop-shadow-sm">
                <AnimatedNumber value={currentMetric.actual} />
             </div>
             
             <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black tracking-widest ${color}`}>
                   <currentFrame.icon size={12} className="opacity-60" />
                   {currentFrame.label}
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                   {currentMetric.target > 0 ? `Target ${currentMetric.target}` : 'No Target Set'}
                </div>
             </div>
          </motion.div>
        </AnimatePresence>

        {/* Circular Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 -z-10 scale-125">
           <Icon size={120} className={color} strokeWidth={0.5} />
        </div>
      </div>

      {/* Footer / Pagination Dots */}
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

      {/* Progress Line Bar at the very bottom */}
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

  const complexCards = [
    { 
      title: "AUDIT PROGRESS", 
      icon: ClipboardCheck, 
      color: "text-[#00A0E9]", 
      bg: "bg-[#00A0E9]/5",
      metrics: [
        { actual: data.audit.actual.daily, target: data.audit.target.daily },
        { actual: data.audit.actual.monthly, target: data.audit.target.monthly },
        { actual: data.audit.actual.total, target: data.audit.target.total }
      ]
    },
    { 
      title: "PM COMPLIANCE", 
      icon: Wrench, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50",
      metrics: [
        { actual: data.preventive.actual.daily, target: data.preventive.target.daily },
        { actual: data.preventive.actual.monthly, target: data.preventive.target.monthly },
        { actual: data.preventive.actual.total, target: data.preventive.target.total }
      ]
    },
    { 
      title: "CORRECTIVE LOGS", 
      icon: AlertTriangle, 
      color: "text-rose-500", 
      bg: "bg-rose-50",
      metrics: [
        { actual: data.corrective.actual.daily, target: 0 },
        { actual: data.corrective.actual.monthly, target: 0 },
        { actual: data.corrective.actual.total, target: 0 }
      ]
    }
  ];

  const infoCards = [
    { title: "TOTAL CUSTOMERS", value: data.totalCustomers, icon: Users, color: "text-blue-500", bg: "bg-blue-50", subtext: "PARTNERS" },
    { title: "ACTIVE SITES", value: data.activeSites, icon: LayoutGrid, color: "text-sky-500", bg: "bg-sky-50", subtext: "OPERATIONAL" },
    { title: "DATABASE ASSETS", value: data.databaseAssets, icon: Database, color: "text-slate-600", bg: "bg-slate-50", subtext: "TOTAL UNITS" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 w-full py-4">
      {complexCards.map((c, i) => (
        <RotatingMetricCard 
          key={i} 
          {...c} 
          onDetailClick={() => onCardClick?.(c)}
        />
      ))}
      {infoCards.map((c, i) => (
        <SimpleInfoCard key={i} {...c} />
      ))}
    </div>
  );
}
