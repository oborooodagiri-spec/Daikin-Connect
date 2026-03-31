"use client";

import { useState, useTransition } from "react";
import { 
  X, Target, TrendingUp, Save, 
  Settings2, Activity, Wrench, ShieldCheck 
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
  const [formData, setFormData] = useState({
    Preventive: unitCount,
    Corrective: 5,
    Audit: unitCount
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Save for each type
      await Promise.all([
        setProjectTarget({ projectId, type: "Preventive", target: formData.Preventive }),
        setProjectTarget({ projectId, type: "Corrective", target: formData.Corrective }),
        setProjectTarget({ projectId, type: "Audit", target: formData.Audit }),
      ]);
      onClose();
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
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 mb-2">
                 <div className="bg-white p-2.5 rounded-xl text-blue-500 shadow-sm"><Settings2 size={18}/></div>
                 <p className="text-xs font-bold text-blue-700 leading-relaxed">
                   Setting monthly targets helps calculate the completion percentage across all dashboards.
                 </p>
              </div>

              <div className="space-y-4">
                 <TargetInput 
                   icon={<Wrench size={16}/>} label="Preventive Target" 
                   value={formData.Preventive} color="indigo"
                   onChange={(v: number) => setFormData({...formData, Preventive: v})}
                   helper={`Auto-set to ${unitCount} Units (All Assets)`}
                   onAuto={() => setFormData({...formData, Preventive: unitCount})}
                 />
                 <TargetInput 
                   icon={<Activity size={16}/>} label="Corrective Allocation" 
                   value={formData.Corrective} color="rose"
                   onChange={(v: number) => setFormData({...formData, Corrective: v})}
                 />
                 <TargetInput 
                   icon={<ShieldCheck size={16}/>} label="Audit Target" 
                   value={formData.Audit} color="emerald"
                   onChange={(v: number) => setFormData({...formData, Audit: v})}
                   onAuto={() => setFormData({...formData, Audit: unitCount})}
                 />
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                 <button type="submit" disabled={isPending} className="flex-[2] py-4 bg-[#003366] hover:bg-[#002244] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3">
                    {isPending ? "Applying..." : "Save Targets"}
                    {!isPending && <Save size={16} />}
                 </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TargetInput({ label, value, onChange, icon, color, helper, onAuto }: any) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50",
    rose: "text-rose-600 bg-rose-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-slate-300 transition-colors group">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl icon ${colors[color as keyof typeof colors]}`}>{icon}</div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
         </div>
         {onAuto && (
           <button type="button" onClick={onAuto} className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">
             Smart Fill
           </button>
         )}
      </div>
      <div className="flex items-end gap-4">
         <input 
           type="number" min="0" value={value} onChange={e => onChange(parseInt(e.target.value))}
           className="flex-1 text-center py-4 bg-slate-50 border border-slate-100 rounded-2xl text-2xl font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
         />
         <div className="pb-3"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Units</span></div>
      </div>
      {helper && <p className="text-[9px] font-bold text-slate-400 mt-2 pl-1 italic">{helper}</p>}
    </div>
  );
}
