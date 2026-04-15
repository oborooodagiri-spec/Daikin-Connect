"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Activity, CheckCircle2, Settings, AlertTriangle, 
  TrendingUp, ArrowRight, Zap, Thermometer, Wind,
  PieChart as PieIcon, BarChart3, Clock, MapPin, 
  ChevronRight, BrainCircuit, ShieldAlert, MessageSquare, Wrench
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import Portal from "../Portal";
import { generateTechnicalInsightAction } from "@/app/actions/ai_analysis";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'vitality' | 'achievement' | 'volume' | 'pareto' | null;
  data: any;
}

export default function PresentationModal({ isOpen, onClose, type, data }: PresentationModalProps) {
  const [aiInsight, setAiInsight] = React.useState<string | null>(null);
  const [mitigation, setMitigation] = React.useState<string | null>(null);
  const [priority, setPriority] = React.useState<number>(3);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState<'id' | 'en' | 'ja'>('id');

  React.useEffect(() => {
    async function loadAIInsight() {
      if (isOpen && type && data) {
        setIsGenerating(true);
        setAiInsight(null);
        setMitigation(null);
        try {
          const res = await generateTechnicalInsightAction(data, type, selectedLang);
          if (res.success && res.insight) {
            setAiInsight(res.insight);
            setMitigation(res.mitigation);
            setPriority(res.priority || 3);
          } else {
            setAiInsight(`Analysis Error: ${res.error || "Generation mismatch"}`);
          }
        } catch (err: any) {
          console.error("Analytic Engine error:", err);
          setAiInsight("System error while connecting to Analytic Engine.");
        }
        setIsGenerating(false);
      }
    }
    loadAIInsight();
  }, [isOpen, type, data, selectedLang]);

  if (!type || !data) return null;

  const renderContent = () => {
    switch (type) {
      case 'vitality': return <VitalityDetail data={data} aiInsight={aiInsight} mitigation={mitigation} priority={priority} isGenerating={isGenerating} language={selectedLang} onLangChange={setSelectedLang} />;
      case 'achievement': return <AchievementDetail data={data} aiInsight={aiInsight} mitigation={mitigation} priority={priority} isGenerating={isGenerating} language={selectedLang} onLangChange={setSelectedLang} />;
      case 'volume': return <VolumeDetail data={data} aiInsight={aiInsight} mitigation={mitigation} priority={priority} isGenerating={isGenerating} language={selectedLang} onLangChange={setSelectedLang} />;
      case 'pareto': return <ParetoDetail data={data} aiInsight={aiInsight} mitigation={mitigation} priority={priority} isGenerating={isGenerating} language={selectedLang} onLangChange={setSelectedLang} />;
      default: return null;
    }
  };

  const config = {
    vitality: { title: "Vitality Score Insight", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
    achievement: { title: "Achievement Progress", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
    volume: { title: "Service Volume Audit", icon: Settings, color: "text-indigo-500", bg: "bg-indigo-50" },
    pareto: { title: "Issue Pareto Breakdown", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white border border-white/20 rounded-[3.5rem] shadow-2xl relative z-10 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
                <div className={`absolute -left-10 -top-10 w-64 h-64 rounded-full opacity-5 blur-3xl ${config.bg}`} />
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className={`w-20 h-20 rounded-[2.5rem] ${config.bg} ${config.color} flex items-center justify-center shadow-2xl shadow-slate-200/50`}>
                    <config.icon size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">Executive Summary Layer</span>
                       <span className={`px-3 py-1 ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest rounded-full`}>Live Data Verified</span>
                    </div>
                    <h2 className="text-4xl font-black text-[#003366] tracking-tighter italic uppercase">{config.title}</h2>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="p-4 bg-slate-100/50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-[2rem] transition-all relative z-10"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                {renderContent()}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-slate-400">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">D</div>
                      ))}
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest italic">Shared with Authorized Project Stakeholders</p>
                </div>
                <button 
                  onClick={onClose}
                  className={`px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all ${config.bg.replace('bg-', 'bg-').replace('50', '500') || 'bg-[#003366]'}`}
                  style={{ backgroundColor: config.color.includes('emerald') ? '#10B981' : config.color.includes('blue') ? '#3B82F6' : config.color.includes('indigo') ? '#6366F1' : '#EF4444' }}
                >
                   Close Executive Detail
                </button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

function VitalityDetail({ data, aiInsight, mitigation, priority, isGenerating, language, onLangChange }: { 
  data: any, aiInsight: string | null, mitigation: string | null, priority: number, isGenerating: boolean, language: string, onLangChange: (l: any) => void 
}) {
  const mix = [
    { name: "P3 (Healthy)", value: data.activities?.filter((a:any)=> (a.performance?.score || 0) >= 75).length || 0, color: '#00B06B' },
    { name: "P2 (Alert)", value: data.activities?.filter((a:any)=> (a.performance?.score || 0) < 75 && (a.performance?.score || 0) >= 54).length || 0, color: '#F59E0B' },
    { name: "P1 (Urgent)", value: data.activities?.filter((a:any)=> (a.performance?.score || 0) < 54).length || 0, color: '#EF4444' },
  ].filter(v => v.value > 0);

  const audits = data.activities?.filter((a: any) => a.type === 'Audit') || [];
  const criticals = audits.filter((a: any) => (a.performance?.score || 0) < 54).slice(0, 5);
  
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
           <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-emerald-500" /> Health Rating Distribution
           </h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts?.healthDistribution || []}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                    paddingAngle={8} dataKey="value"
                  >
                    {data.charts?.healthDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-center">
           <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <BrainCircuit size={32} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tight">Expert Insights</h3>
                <div className="flex items-center gap-2">
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      {['id', 'en', 'ja'].map((l) => (
                        <button 
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${language === l ? 'bg-[#003366] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {l}
                        </button>
                      ))}
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-[#003366] rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/20">
                      <BrainCircuit size={10} className="text-[#00a1e4]" />
                      <span>Smart Logic Engine</span>
                   </div>
                </div>
              </div>
              
              {isGenerating ? (
                <div className="space-y-3 animate-pulse">
                   <div className="h-3 bg-slate-200 rounded-full w-full" />
                   <div className="h-3 bg-slate-200 rounded-full w-[90%]" />
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-4 border-emerald-500 pl-6">
                    {aiInsight || `"Expert diagnostic results based on site parameters."`}
                  </p>
                  
                  {mitigation && (
                    <div className={`p-6 rounded-[2rem] border-2 transition-all ${priority === 1 ? 'bg-rose-50 border-rose-100' : 'bg-[#003366]/5 border-[#003366]/10'}`}>
                       <div className="flex items-center justify-between mb-3">
                          <h4 className={`text-xs font-black uppercase tracking-widest ${priority === 1 ? 'text-rose-600' : 'text-[#003366]'}`}>Recommended Mitigation</h4>
                          <ShieldAlert size={14} className={priority === 1 ? 'text-rose-500' : 'text-[#00a1e4]'} />
                       </div>
                       <p className="text-[11px] font-bold text-slate-600 mb-6">{mitigation}</p>
                       
                       {priority === 1 && (
                         <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 active:scale-95">
                           Initiate Immediate Corrective Action
                         </button>
                       )}
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Critical Assets Radar</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criticals.map((unit: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:border-rose-200 transition-all group">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Critical Grade</p>
                       <h4 className="text-lg font-black text-[#003366]">{unit.units?.tag_number}</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-rose-600 leading-none">{unit.performance?.score}%</p>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Health</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black rounded uppercase text-slate-500">Floor {unit.units?.building_floor}</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-[8px] font-black rounded uppercase text-rose-500">{unit.units?.unit_type}</span>
                 </div>
                 <p className="text-[10px] font-medium text-slate-500 italic mb-4 line-clamp-2">"{unit.engineer_note || 'Condition requires immediate inspection.'}"</p>
                 <button className="w-full py-2.5 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-[#003366] rounded-xl group-hover:bg-[#003366] group-hover:text-white transition-all">Inspect Report</button>
              </div>
            ))}
            {criticals.length === 0 && (
              <div className="col-span-full py-12 bg-emerald-50 rounded-3xl border border-dashed border-emerald-200 text-center">
                 <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">All Assets currently above Critical Threshold</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function AchievementDetail({ data, aiInsight, mitigation, priority, isGenerating, language, onLangChange }: { 
  data: any, aiInsight: string | null, mitigation: string | null, priority: number, isGenerating: boolean, language: string, onLangChange: (l: any) => void 
}) {
  return (
    <div className="space-y-12">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10">
             <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-8">Weekly Realization Burn-up</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts?.weeklyTrends || []}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a1e4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00a1e4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="actual" stroke="#00a1e4" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" />
                    <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-[#003366] rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a1e4]">Contractual Achievement</p>
                   <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      {['id', 'en', 'ja'].map((l) => (
                        <button 
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === l ? 'bg-[#00a1e4] text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                          {l}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="flex items-end gap-2">
                   <h3 className="text-7xl font-black italic tracking-tighter leading-none">{data.summary?.achievementRate}%</h3>
                </div>
                {isGenerating ? (
                   <div className="space-y-2 animate-pulse pt-4">
                      <div className="h-2 bg-white/10 rounded-full w-full" />
                      <div className="h-2 bg-white/10 rounded-full w-[80%]" />
                   </div>
                ) : (
                   <p className="text-sm font-medium text-white/40 leading-tight">
                     {aiInsight || `Project is currently ${data.summary?.achievementRate >= 100 ? 'ahead of' : 'tracking slightly behind'} the monthly realization schedule.`}
                   </p>
                )}
             </div>
             
             <div className="space-y-6 pt-10 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#00a1e4]">
                   <span>Success Factor</span>
                   <span>Status: Healthy</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-xl font-black">{data.summary?.totalActual}</p>
                      <p className="text-[8px] font-black uppercase text-white/40">Realized</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-xl font-black">{data.summary?.totalTarget}</p>
                      <p className="text-[8px] font-black uppercase text-white/40">Planned</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="space-y-6">
          <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Breakdown by Classification</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {data.summaryByType?.map((s: any) => (
               <div key={s.type} className="bg-white border border-slate-100 p-6 rounded-3xl group hover:shadow-lg transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.type}</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-2xl font-black text-[#003366]">{s.actual}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase">of {s.unitCount} units</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${s.achievement >= 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {s.achievement}%
                     </span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className={`h-full ${s.achievement >= 100 ? 'bg-emerald-500' : 'bg-[#00a1e4]'}`} style={{ width: `${Math.min(s.achievement, 100)}%` }} />
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function VolumeDetail({ data, aiInsight, mitigation, priority, isGenerating, language, onLangChange }: { 
  data: any, aiInsight: string | null, mitigation: string | null, priority: number, isGenerating: boolean, language: string, onLangChange: (l: any) => void 
}) {
  const mix = [
    { name: "Audit", value: data.activities?.filter((a:any)=>a.type === 'Audit').length || 0, color: '#00A0E9' },
    { name: "Preventive", value: data.activities?.filter((a:any)=>a.type === 'Preventive').length || 0, color: '#00B06B' },
    { name: "Corrective", value: data.activities?.filter((a:any)=>a.type === 'Corrective').length || 0, color: '#EF4444' },
  ].filter(v => v.value > 0);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="space-y-8">
            <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Operational Service Mix</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mix} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                      {mix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight">Volume Intensity (Weekly)</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts?.weeklyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="actual" fill="#003366" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
                <div className="flex items-center gap-4 mb-2">
                   <h4 className="text-xl font-black text-[#003366] uppercase tracking-tight italic flex items-center gap-3">
                      Expert Findings
                      <div className="px-2 py-0.5 bg-[#00a1e4] text-[8px] font-black text-white rounded uppercase tracking-tighter shadow-sm">Rule-Based Analysis</div>
                   </h4>
                   <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      {['id', 'en', 'ja'].map((l) => (
                        <button 
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === l ? 'bg-[#003366] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {l}
                        </button>
                      ))}
                   </div>
                </div>
                {isGenerating ? (
                   <div className="space-y-2 py-2">
                       <div className="h-2 bg-slate-200 rounded-full w-64 animate-pulse" />
                       <div className="h-2 bg-slate-100 rounded-full w-48 animate-pulse" />
                   </div>
                ) : (
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-none">
                      {aiInsight || 'Monthly engineer on-site analysis'}
                   </p>
                )}
            </div>
            <div className="flex gap-12 text-center">
               <div>
                  <p className="text-3xl font-black text-[#003366]">{data.summary?.totalActual}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
               </div>
               <div className="w-px h-12 bg-slate-200" />
               <div>
                  <p className="text-3xl font-black text-[#00a1e4]">{Array.from(new Set(data.activities?.map((a:any)=>a.engineer || 'N/A'))).length || 0}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technicians</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ParetoDetail({ data, aiInsight, mitigation, priority, isGenerating, language, onLangChange }: { 
  data: any, aiInsight: string | null, mitigation: string | null, priority: number, isGenerating: boolean, language: string, onLangChange: (l: any) => void 
}) {
  const complaints = data.complaints || [];
  const lowHealthUnits = data.activities?.filter((a:any) => a.performance?.score < 80) || [];
  
  return (
    <div className="space-y-12">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
             <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-3">
                <AlertTriangle className="text-rose-500" /> Attention Pareto Log
             </h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {complaints.map((c: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:border-amber-200 transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <MessageSquare size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Complaint</p>
                              <h4 className="text-sm font-black text-[#003366]">{c.units?.tag_number}</h4>
                           </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {c.status}
                        </span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 mb-1">{c.customer_name}</p>
                     <p className="text-[11px] font-medium text-slate-500 italic bg-slate-50 p-4 rounded-xl">"{c.description}"</p>
                  </div>
                ))}
                {complaints.length === 0 && (
                   <div className="py-20 text-center opacity-20 italic font-black text-slate-400 uppercase tracking-widest">No site complaints filed this period</div>
                )}
             </div>
          </div>

          <div className="space-y-8">
             <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center gap-3">
                <ShieldAlert className="text-rose-500" /> Root Cause Analysis (Pareto)
             </h3>
             <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100">
                <div className="space-y-8">
                   <div className="p-6 bg-white rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-4 bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Activity size={16} className="text-rose-400" />
                      </div>
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                            Fault Factor Distribution
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00a1e4]" />
                          </h4>
                          <div className="flex bg-rose-100/50 p-1 rounded-xl">
                            {['id', 'en', 'ja'].map((l) => (
                              <button 
                                key={l}
                                onClick={() => onLangChange(l)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === l ? 'bg-rose-900 text-white' : 'text-rose-900/40 hover:text-rose-900/60'}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                       </div>
                      {isGenerating ? (
                         <div className="space-y-3 animate-pulse pb-4">
                            <div className="h-2 bg-rose-200/50 rounded-full w-full" />
                            <div className="h-2 bg-rose-200/50 rounded-full w-[80%]" />
                         </div>
                      ) : (
                         <p className="text-xs font-medium text-rose-700 leading-relaxed mb-6 italic">
                           {aiInsight || "Berdasarkan data performa teknis, mayoritas unit bermasalah memiliki gejala penurunan efisiensi termal (ΔT rendah)."}
                         </p>
                      )}
                      <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                         <div className="h-full bg-rose-500" style={{ width: '65%' }} />
                      </div>
                      <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-rose-400">
                         <span>High Humidity/Airflow Issue</span>
                         <span>65% Impact</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
                         <p className="text-2xl font-black text-rose-600">{lowHealthUnits.length}</p>
                         <p className="text-[9px] font-black uppercase text-slate-400">Sub-Optimal Units</p>
                      </div>
                      <div className="bg-[#003366] p-6 rounded-3xl text-white shadow-xl shadow-blue-900/10">
                         <p className="text-2xl font-black text-rose-400">{complaints.filter((c:any)=>c.status !== 'Resolved').length}</p>
                         <p className="text-[9px] font-black uppercase text-white/40">Open Tickets</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
