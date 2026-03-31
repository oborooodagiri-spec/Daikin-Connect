"use client";

import { useEffect, useState } from "react";
import { getUpcomingSchedules } from "@/app/actions/schedules";
import { Calendar, Clock, User, ArrowRight, Activity, Wrench, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export default function ScheduleDashboardWidget({ projectId }: { projectId?: string }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await getUpcomingSchedules(projectId);
    if (res.success) setSchedules(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div id="schedules" className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xs font-black italic tracking-[0.2em] text-[#003366] flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" /> OPERATION SCHEDULES
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Upcoming field deployments</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">
             {schedules.length} PLANNED
           </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 grayscale">
            <Calendar size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No Upcoming Tasks</p>
          </div>
        ) : (
          schedules.map((s, idx) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all group cursor-default"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    s.type === 'Preventive' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                    s.type === 'Corrective' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                    'bg-amber-50 border-amber-100 text-amber-500'
                  }`}>
                    {s.type === 'Preventive' ? <Wrench size={14}/> : s.type === 'Corrective' ? <Activity size={14}/> : <ShieldCheck size={14}/>}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#003366] leading-tight mb-0.5">{s.title || "No Description"}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {s.customerName} <span className="mx-1 text-slate-300">•</span> {s.projectName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800">{format(parseISO(s.start_at), "dd MMM")}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{format(parseISO(s.start_at), "HH:mm")}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
                  <User size={10} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.assigneeName}</span>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border
                  ${s.type === 'Preventive' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50' :
                    s.type === 'Corrective' ? 'bg-rose-500/10 text-rose-600 border-rose-200/50' :
                    'bg-amber-500/10 text-amber-600 border-amber-200/50'}`}>
                  {s.type}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-50">
         <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-[#00a1e4] hover:bg-[#00a1e4]/5 rounded-2xl transition-all border border-dashed border-slate-200 hover:border-[#00a1e4]/30 flex items-center justify-center gap-2 group">
           Explore Timeline <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
}
