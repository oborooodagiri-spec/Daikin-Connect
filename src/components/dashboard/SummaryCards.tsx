"use client";

import React, { useEffect, useState } from "react";
import { ClipboardCheck, Wrench, AlertTriangle, ChevronRight, Clock, Calendar, TrendingUp, Activity, Target } from "lucide-react";
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

    // Smoother and more efficient duration
    const totalDuration = 800;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Ease out expo for a more premium feel
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOutExpo * end);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

const TIMEFRAMES = [
  { id: 'daily', label: 'DAILY', icon: Clock },
  { id: 'monthly', label: 'MONTHLY', icon: Calendar },
  { id: 'total', label: 'YTD', icon: TrendingUp }
];

function CompactMetricCard({ title, icon: Icon, color, bg, metrics, onDetailClick, type }: any) {
  const [frameIndex, setFrameIndex] = useState(1); // Default to Monthly for better landing data

  const currentFrame = TIMEFRAMES[frameIndex];
  const currentMetric = metrics[frameIndex];
  const percentage = currentMetric.target > 0 ? Math.min(Math.round((currentMetric.actual / currentMetric.target) * 100), 100) : 0;

  const handleToggleFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrameIndex(prev => (prev + 1) % TIMEFRAMES.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onDetailClick({ title, metrics, color, icon: Icon })}
      className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:border-slate-200"
    >
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110`}>
          <Icon size={18} />
        </div>
        <div className="flex gap-1" onClick={handleToggleFrame}>
          {TIMEFRAMES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === frameIndex ? `w-4 ${color.replace('text-', 'bg-')}` : 'w-1 bg-slate-100'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">{title}</h2>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-black text-[#003366] tracking-tighter">
              <AnimatedNumber value={currentMetric.actual} />
           </div>
           <div className="text-[10px] font-black text-slate-300">
             / {currentMetric.target}
           </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div 
          onClick={handleToggleFrame}
          className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${color} hover:opacity-80 transition-opacity`}
        >
           <currentFrame.icon size={10} className="opacity-70" />
           {currentFrame.label} {percentage}%
        </div>
        <ChevronRight size={10} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           transition={{ duration: 1, ease: "circOut" }}
           className={`h-full ${color.replace('text-', 'bg-')} opacity-60`}
         />
      </div>
    </motion.div>
  );
}

function CompactCorrectiveCard({ title, icon: Icon, kpi, onDetailClick }: any) {
  const resolutionRate = (kpi && kpi.appeared > 0) ? Math.round((kpi.resolved / kpi.appeared) * 100) : 0;
  
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onDetailClick({ title, kpi, color: "text-rose-500", icon: Icon })}
      className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:border-slate-200"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500">
          <Icon size={18} />
        </div>
        <div className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">KPI {resolutionRate}%</div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">{title}</h2>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-black text-[#003366] tracking-tighter">
              <AnimatedNumber value={kpi.resolved} />
           </div>
           <div className="text-[10px] font-black text-slate-300">
             / {kpi.appeared}
           </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
           <Activity size={10} className="opacity-70" />
           RESOLVED LOGS
        </div>
        <ChevronRight size={10} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${resolutionRate}%` }}
           transition={{ duration: 1 }}
           className="h-full bg-rose-500 opacity-60"
         />
      </div>
    </motion.div>
  );
}

export default function SummaryCards({ data, onCardClick }: { data: any, onCardClick?: (metric: any) => void }) {
  if (!data) return null;

  const enabledForms = data.enabled_forms 
    ? data.enabled_forms.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean) 
    : [];
  
  const isEnabled = (type: string) => enabledForms.includes(type.toLowerCase());

  const activeCardsCount = [
    isEnabled("Audit"),
    isEnabled("Preventive"),
    isEnabled("DailyLog"),
    isEnabled("Corrective")
  ].filter(Boolean).length;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.max(Math.min(activeCardsCount, 4), 1)} gap-6 w-full py-4`}>
      {/* AUDIT CARD */}
      {isEnabled("Audit") && (
        <CompactMetricCard 
          title="AUDIT" 
          icon={ClipboardCheck} color="text-[#00A0E9]" bg="bg-[#00A0E9]/5" type="Audit"
          metrics={[
            { actual: data.audit.actual.daily, target: data.audit.target.daily },
            { actual: data.audit.actual.monthly, target: data.audit.target.monthly },
            { actual: data.audit.actual.total, target: data.audit.target.total }
          ]}
          onDetailClick={onCardClick}
        />
      )}

      {/* PM CARD */}
      {isEnabled("Preventive") && (
        <CompactMetricCard 
          title="PREVENTIVE" 
          icon={Wrench} color="text-emerald-500" bg="bg-emerald-50" type="Preventive"
          metrics={[
            { actual: data.preventive.actual.daily, target: data.preventive.target.daily },
            { actual: data.preventive.actual.monthly, target: data.preventive.target.monthly },
            { actual: data.preventive.actual.total, target: data.preventive.target.total }
          ]}
          onDetailClick={onCardClick}
        />
      )}

      {/* DAILY LOG CARD */}
      {isEnabled("DailyLog") && data.dailyLog && (
        <CompactMetricCard 
          title="DAILY LOG" 
          icon={Activity} color="text-indigo-500" bg="bg-indigo-50" type="DailyLog"
          metrics={[
            { actual: data.dailyLog.actual?.daily || 0, target: data.dailyLog.target?.daily || 0 },
            { actual: data.dailyLog.actual?.monthly || 0, target: data.dailyLog.target?.monthly || 0 },
            { actual: data.dailyLog.actual?.total || 0, target: data.dailyLog.target?.total || 0 }
          ]}
          onDetailClick={onCardClick}
        />
      )}

      {/* CORRECTIVE CARD */}
      {isEnabled("Corrective") && (
        <CompactCorrectiveCard 
          title="CORRECTIVE" 
          icon={AlertTriangle}
          kpi={data.corrective.kpi}
          onDetailClick={onCardClick}
        />
      )}
    </div>
  );
}
