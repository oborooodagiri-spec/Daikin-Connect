"use client";

import { useState, useTransition } from "react";
import { 
  X, Target, TrendingUp, Save, 
  Settings2, Activity, Wrench, ShieldCheck, Clock, Calendar as CalendarIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setProjectTarget } from "@/app/actions/project_targets";

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
  const [formData, setFormData] = useState({
    Preventive: { daily: 0, monthly: 0, yearly: 0 },
    Audit: { daily: 0, monthly: 0, yearly: 0, duration: 12 }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Save ONLY for the active type
      const res = await setProjectTarget({ 
        projectId, 
        type: activeTab, 
        daily: formData[activeTab].daily, 
        monthly: formData[activeTab].monthly, 
        yearly: formData[activeTab].yearly 
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-200">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#003366] tracking-tight">{projectName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Operational Targets</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors" type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-8 pt-4">
                 <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                   {(["Preventive", "Audit"] as const).map(tab => (
                     <button
                       key={tab}
                       type="button"
                       onClick={() => setActiveTab(tab)}
                       className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-[#003366] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                     >
                       {tab} Task
                     </button>
                   ))}
                 </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl text-blue-500 shadow-sm"><Settings2 size={18}/></div>
                  <p className="text-xs font-bold text-blue-700 leading-relaxed">
                    Set work targets for <span className="uppercase font-black">{activeTab}</span>. Corrective targets are now calculated automatically.
                  </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  <TargetInputField 
                    icon={<Clock size={16}/>} label="Daily Target" 
                    value={formData[activeTab].daily} color="indigo"
                    onChange={(v: number) => setFormData({...formData, [activeTab]: {...formData[activeTab], daily: v}})}
                    helper="Average units per day"
                  />
                  <TargetInputField 
                    icon={<CalendarIcon size={16}/>} label="Monthly Target" 
                    value={formData[activeTab].monthly} color="blue"
                    onChange={(v: number) => setFormData({...formData, [activeTab]: {...formData[activeTab], monthly: v}})}
                    onAuto={() => {
                        const monthly = unitCount;
                        const daily = Math.ceil(unitCount / 20);
                        const dur = activeTab === 'Audit' ? (formData.Audit.duration || 12) : 12;
                        setFormData({...formData, [activeTab]: { daily, monthly, yearly: monthly * dur, ...(activeTab === 'Audit' ? { duration: dur } : {}) }});
                    }}
                  />

                  {activeTab === 'Audit' && (
                    <div className="bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100 space-y-4">
                        <TargetInputField 
                            icon={<CalendarIcon size={16}/>} label="Target Duration" 
                            value={formData.Audit.duration} color="amber"
                            onChange={(v: number) => {
                                const newDuration = v || 1;
                                setFormData({
                                    ...formData, 
                                    Audit: { 
                                        ...formData.Audit, 
                                        duration: newDuration,
                                        yearly: formData.Audit.monthly * newDuration
                                    }
                                });
                            }}
                            helper="Months involved in the campaign"
                            placeholder="Months"
                            unit="Months"
                        />
                        <div className="px-2 border-t border-slate-100 pt-4">
                            <TargetInputField 
                                icon={<TrendingUp size={16}/>} label="Final Target" 
                                value={formData.Audit.yearly} color="emerald"
                                onChange={(v: number) => setFormData({...formData, Audit: {...formData.Audit, yearly: v}})}
                                helper={`Total target for ${formData.Audit.duration} months`}
                            />
                        </div>
                    </div>
                  )}

                  {activeTab === 'Preventive' && (
                    <TargetInputField 
                        icon={<TrendingUp size={16}/>} label="Yearly Target" 
                        value={formData.Preventive.yearly} color="emerald"
                        onChange={(v: number) => setFormData({...formData, Preventive: {...formData.Preventive, yearly: v}})}
                    />
                  )}
              </div>

              {/* Corrective Info Card */}
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64}/></div>
                 <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Activity size={14}/> Corrective Performance
                 </h4>
                 <p className="text-[11px] font-bold text-rose-800/70 leading-relaxed">
                   Target and performance for Corrective tasks are derived from the ratio of <span className="text-rose-900">Created Cases</span> vs <span className="text-rose-900">Resolved Repairs</span>.
                 </p>
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                 <button type="submit" disabled={isPending} className="flex-[2] py-4 bg-[#003366] hover:bg-[#002244] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3">
                    {isPending ? "Applying..." : `Set ${activeTab} Targets`}
                    {!isPending && <Save size={16} />}
                 </button>
              </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TargetInputField({ label, value, onChange, icon, color, helper, onAuto, placeholder, unit = "Units Target" }: any) {
  const colors: any = {
    indigo: "text-indigo-600 bg-indigo-50",
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:border-slate-300 transition-colors group">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl icon ${colors[color] || colors.blue}`}>{icon}</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
         </div>
         {onAuto && (
           <button type="button" onClick={onAuto} className="text-[9px] font-black text-[#00a1e4] uppercase tracking-widest hover:underline">
             Smart Fill
           </button>
         )}
      </div>
      <div className="flex items-center gap-4">
         <input 
           type="number" min="0" value={value === 0 ? "" : value} 
           onChange={e => onChange(parseInt(e.target.value) || 0)}
           placeholder={placeholder || "0"}
           className="w-24 text-center py-2 bg-slate-50 border border-slate-100 rounded-xl text-lg font-black text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
         />
         <div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">{unit}</span>
            {helper && <p className="text-[9px] font-bold text-slate-400 italic leading-snug mt-1">{helper}</p>}
         </div>
      </div>
    </div>
  );
}
