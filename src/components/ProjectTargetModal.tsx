"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, X, Save, Clock, Calendar as CalendarIcon, 
  TrendingUp, Settings2, Activity, Info, 
  ArrowRight, CheckCircle2, AlertCircle,
  ClipboardList
} from "lucide-react";
import { setProjectTarget } from "@/app/actions/project_targets";
import { 
  differenceInDays, 
  addYears, 
  format, 
  differenceInMonths, 
  addMonths 
} from "date-fns";

interface ProjectTargetModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  unitCount: number;
}

export default function ProjectTargetModal({ projectId, projectName, isOpen, onClose, unitCount }: ProjectTargetModalProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"Preventive" | "Audit">("Preventive");
  
  // Logical Inputs
  const [auditDates, setAuditDates] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  });

  const [prevParams, setPrevParams] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    cycle: 4 // default 4x per year
  });

  // Calculated Outputs
  const [calculated, setCalculated] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
  });

  // Effect for Audit logic
  useEffect(() => {
    if (activeTab === "Audit") {
      const start = new Date(auditDates.start);
      const end = new Date(auditDates.end);
      const totalDays = Math.max(differenceInDays(end, start), 1);
      const totalMonths = Math.max(totalDays / 30, 1);

      const final = unitCount;
      const daily = Math.ceil(final / totalDays);
      const monthly = Math.ceil(final / totalMonths);

      setCalculated({ daily, monthly, yearly: final });
    }
  }, [auditDates, unitCount, activeTab]);

  // Effect for Preventive logic
  useEffect(() => {
    if (activeTab === "Preventive") {
      const yearly = unitCount * prevParams.cycle;
      const monthly = Math.ceil(yearly / 12);
      const daily = Math.ceil(monthly / 22); // Professional divisor: 22 working days

      setCalculated({ daily, monthly, yearly });
    }
  }, [prevParams, unitCount, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await setProjectTarget({ 
        projectId, 
        type: activeTab, 
        daily: calculated.daily, 
        monthly: calculated.monthly, 
        yearly: calculated.yearly 
      });
      
      if (res.success) {
        onClose();
      } else {
        alert(res.error || "Failed to save targets");
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl relative z-10 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Section: Inputs */}
            <div className="flex-1 p-8 md:p-10 bg-slate-50 border-r border-slate-100 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-[#003366] text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-900/20">
                   <Target size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-[#003366] tracking-tight truncate max-w-[250px]">{projectName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a1e4]">Set Smart Targets</p>
                 </div>
              </div>

              <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1 mb-8">
                 {(["Preventive", "Audit"] as const).map(tab => (
                   <button
                     key={tab}
                     type="button"
                     onClick={() => setActiveTab(tab)}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-[#003366] shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                   >
                     {tab} Task
                   </button>
                 ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Unit Count Info */}
                 <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><ClipboardList size={14}/></div>
                       <span className="text-[10px] font-black text-slate-500 uppercase">Base Units</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">{unitCount} Units</span>
                 </div>

                 {activeTab === "Audit" ? (
                   <div className="space-y-4">
                      <InputGroup label="Audit Start Date" icon={<CalendarIcon size={16}/>}>
                         <input 
                           type="date" value={auditDates.start}
                           onChange={e => setAuditDates({...auditDates, start: e.target.value})}
                           className="w-full bg-transparent outline-none text-sm font-bold text-slate-700" 
                         />
                      </InputGroup>
                      <InputGroup label="Campaign Deadline" icon={<Clock size={16}/>}>
                         <input 
                           type="date" value={auditDates.end}
                           onChange={e => setAuditDates({...auditDates, end: e.target.value})}
                           className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 font-sans" 
                         />
                      </InputGroup>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      <InputGroup label="Contract Start" icon={<CalendarIcon size={16}/>}>
                         <input 
                           type="date" value={prevParams.start}
                           onChange={e => setPrevParams({...prevParams, start: e.target.value})}
                           className="w-full bg-transparent outline-none text-sm font-bold text-slate-700" 
                         />
                      </InputGroup>
                      <div className="space-y-4">
                        <InputGroup label="Cycle Per Year" icon={<Activity size={16}/>}>
                           <input 
                             type="number" min="1" max="52" value={prevParams.cycle}
                             onChange={e => setPrevParams({...prevParams, cycle: parseInt(e.target.value) || 1})}
                             className="w-full bg-transparent outline-none text-sm font-bold text-slate-700"
                             placeholder="e.g. 4"
                           />
                        </InputGroup>
                      </div>
                   </div>
                 )}

                 <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 italic flex items-center gap-2">
                       <Info size={12}/> Calculations are based on your professional inputs above.
                    </p>
                 </div>
              </form>
            </div>

            {/* Right Section: Output / Results */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between bg-white">
              <div>
                <header className="mb-8 flex items-center justify-between">
                   <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Breakdown</h4>
                   <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={10}/> Data Validated
                   </div>
                </header>

                <div className="space-y-5">
                   <ResultSummaryCard 
                     label="Daily Target" value={calculated.daily} 
                     icon={<Clock size={18}/>} color="#6366f1"
                     desc={activeTab === "Preventive" ? "Based on 22 working days/mo" : "Average units per calendar day"}
                   />
                   <ResultSummaryCard 
                     label="Monthly Target" value={calculated.monthly} 
                     icon={<CalendarIcon size={18}/>} color="#00a1e4"
                     desc={`Distribution for ${projectName}`}
                   />
                   <ResultSummaryCard 
                     label={activeTab === "Audit" ? "Final Campaign Target" : "Total Yearly Target"} 
                     value={calculated.yearly} 
                     icon={<TrendingUp size={18}/>} color="#10b981"
                     desc="Total commitment for this period"
                   />
                </div>

                <div className="mt-8 p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
                   <div className="flex items-center gap-3 text-blue-600 mb-2">
                      <Settings2 size={16}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">Logic applied</span>
                   </div>
                   <p className="text-[11px] font-bold text-blue-800/70 leading-relaxed">
                     {activeTab === "Audit" 
                       ? "Calculating workload across the campaign timeline. Daily output is spread evenly over all calendar days."
                       : "Calculating contract workload based on service frequency. Daily output is optimized for working hours."
                     }
                   </p>
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                 <button 
                   onClick={onClose}
                   className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSubmit} disabled={isPending}
                   className="flex-[1.5] py-4 bg-[#003366] hover:bg-[#002244] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                 >
                    {isPending ? "Syncing..." : "Apply Targets"}
                    {!isPending && <Save size={18} />}
                 </button>
              </div>
            </div>

            <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all" type="button">
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputGroup({ label, children, icon }: any) {
  return (
    <div className="space-y-2">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</span>
       <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 focus-within:border-[#00a1e4] focus-within:ring-4 focus-within:ring-blue-500/5 transition-all group">
         <div className="text-slate-300 group-focus-within:text-[#00a1e4] transition-colors">{icon}</div>
         {children}
       </div>
    </div>
  );
}

function ResultSummaryCard({ label, value, icon, color, desc }: any) {
  return (
    <div className="group relative">
       <div 
         className="absolute inset-0 bg-slate-50 rounded-3xl -z-10 transition-transform group-hover:scale-105" 
         style={{ opacity: 0.4 }}
       />
       <div className="p-5 flex items-center gap-5">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
             {icon}
          </div>
          <div className="flex-1">
             <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-xl font-black text-slate-800 italic" style={{ color: color }}>{value}</span>
             </div>
             <p className="text-[9px] font-bold text-slate-400 mt-0.5">{desc}</p>
          </div>
       </div>
    </div>
  );
}
