"use client";

import React, { useEffect, useState } from "react";
import { ClipboardCheck, Wrench, AlertTriangle, ChevronRight, Clock, Calendar, TrendingUp, Activity, Target, MessageSquareWarning } from "lucide-react";
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
  const [frameIndex, setFrameIndex] = useState(1); // Default to Monthly

  const currentFrame = TIMEFRAMES[frameIndex];
  const currentMetric = metrics[frameIndex];
  const percentage = currentMetric.target > 0 ? Math.min(Math.round((currentMetric.actual / currentMetric.target) * 100), 100) : 0;

  const handleToggleFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrameIndex(prev => (prev + 1) % TIMEFRAMES.length);
  };

  const accentColor = color.replace('text-', 'bg-');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onDetailClick({ title, metrics, color, icon: Icon })}
      className="bg-white rounded-xl p-5 border border-[#e6e9ef] flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:border-[#0073ea]/30 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bg} ${color} transition-transform group-hover:scale-110`}>
          <Icon size={16} />
        </div>
        <div className="flex gap-1" onClick={handleToggleFrame}>
          {TIMEFRAMES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === frameIndex ? `w-4 ${accentColor}` : 'w-1 bg-slate-100'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">{title}</h2>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-bold text-[#323338] tracking-tight">
              <AnimatedNumber value={currentMetric.actual} />
           </div>
           <div className="text-xs font-medium text-slate-300">
             / {currentMetric.target}
           </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <div 
            onClick={handleToggleFrame}
            className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${color} hover:opacity-80 transition-opacity`}
          >
             <currentFrame.icon size={10} className="opacity-70" />
             {currentFrame.label} {percentage}%
          </div>
          <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
        
        <div className="h-1.5 bg-slate-50 rounded-full w-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${percentage}%` }}
             transition={{ duration: 1.2, ease: "circOut" }}
             className={`h-full ${accentColor} rounded-full`}
           />
        </div>
      </div>
    </motion.div>
  );
}

function CompactCorrectiveCard({ title, icon: Icon, kpi, onDetailClick }: any) {
  const resolutionRate = (kpi && kpi.appeared > 0) ? Math.round((kpi.resolved / kpi.appeared) * 100) : 0;
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => onDetailClick({ title, kpi, color: "text-[#e44258]", icon: Icon })}
      className="bg-white rounded-xl p-5 border border-[#e6e9ef] flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:border-[#e44258]/30 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg bg-rose-50 text-[#e44258]">
          <Icon size={16} />
        </div>
        <div className="text-[10px] font-bold text-[#e44258] bg-rose-50 px-2 py-0.5 rounded-lg border border-[#e44258]/10">KPI {resolutionRate}%</div>
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">{title}</h2>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-bold text-[#323338] tracking-tight">
              <AnimatedNumber value={kpi.resolved} />
           </div>
           <div className="text-xs font-medium text-slate-300">
             / {kpi.appeared}
           </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#e44258] flex items-center gap-1.5">
             <Activity size={10} className="opacity-70" />
             RESOLVED LOGS
          </div>
          <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>

        <div className="h-1.5 bg-slate-50 rounded-full w-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${resolutionRate}%` }}
             transition={{ duration: 1.2, ease: "circOut" }}
             className="h-full bg-[#e44258] rounded-full"
           />
        </div>
      </div>
    </motion.div>
  );
}

function CompactComplaintCard({ title, icon: Icon, data, onDetailClick }: any) {
  const kpi = data?.kpi || { appeared: 0, resolved: 0 };
  const actual = data?.actual || { daily: 0, monthly: 0, total: 0 };
  const resolutionRate = (kpi.appeared > 0) ? Math.round((kpi.resolved / kpi.appeared) * 100) : 0;
  const [frameIndex, setFrameIndex] = useState(1);
  const frames = [
    { label: 'TODAY', value: actual.daily },
    { label: 'THIS MONTH', value: actual.monthly },
    { label: 'YTD', value: actual.total }
  ];
  const currentFrame = frames[frameIndex];

  const handleToggleFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrameIndex(prev => (prev + 1) % frames.length);
  };
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => onDetailClick({ title, kpi, color: "text-[#ff9f1a]", icon: Icon })}
      className="bg-white rounded-xl p-5 border border-[#e6e9ef] flex flex-col h-full relative overflow-hidden group cursor-pointer transition-all hover:border-[#ff9f1a]/30 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg bg-amber-50 text-[#ff9f1a] transition-transform group-hover:scale-110">
          <Icon size={16} />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-[#ff9f1a] bg-amber-50 px-2 py-0.5 rounded-lg border border-[#ff9f1a]/10">
            KPI {resolutionRate}%
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">{title}</h2>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-bold text-[#323338] tracking-tight">
              <AnimatedNumber value={currentFrame.value} />
           </div>
           <div className="text-xs font-medium text-slate-300">
             {currentFrame.label}
           </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <div 
            onClick={handleToggleFrame}
            className="text-[9px] font-bold uppercase tracking-wider text-[#ff9f1a] flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
             <Activity size={10} className="opacity-70" />
             {kpi.resolved} / {kpi.appeared} RESOLVED
          </div>
          <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>

        <div className="h-1.5 bg-slate-50 rounded-full w-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${resolutionRate}%` }}
             transition={{ duration: 1.2, ease: "circOut" }}
             className="h-full bg-[#ff9f1a] rounded-full"
           />
        </div>
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
    isEnabled("DailyLog") && data.dailyLog && (data.dailyLog.actual?.total > 0),
    isEnabled("Corrective"),
    data.complaint && (data.complaint.actual?.total > 0 || data.complaint.kpi?.appeared > 0)
  ].filter(Boolean).length;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.max(Math.min(activeCardsCount, 4), 1)} gap-6 w-full py-2`}>
      {/* AUDIT CARD */}
      {isEnabled("Audit") && (
        <CompactMetricCard 
          title="AUDIT" 
          icon={ClipboardCheck} color="text-[#0073ea]" bg="bg-blue-50" type="Audit"
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
          icon={Wrench} color="text-[#00c875]" bg="bg-emerald-50" type="Preventive"
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
          icon={Activity} color="text-[#a25ddc]" bg="bg-purple-50" type="DailyLog"
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

      {/* COMPLAINT CARD */}
      {data.complaint && (data.complaint.actual?.total > 0 || data.complaint.kpi?.appeared > 0) && (
        <CompactComplaintCard 
          title="COMPLAINT" 
          icon={MessageSquareWarning}
          data={data.complaint}
          onDetailClick={onCardClick}
        />
      )}
    </div>
  );
}


