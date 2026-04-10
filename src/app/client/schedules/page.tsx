"use client";

import { useEffect, useState } from "react";
import { getClientSchedules, requestClientVisit } from "@/app/actions/client_dashboard";
import { 
  Calendar, Clock, MapPin, 
  ChevronRight, ArrowUpRight, CheckCircle2,
  CalendarCheck, Plus, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isAfter, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import ScheduleCalendarWidget from "@/components/dashboard/ScheduleCalendarWidget";

export default function ClientSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "success">("idle");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getClientSchedules();
    if (res.success) setSchedules(res.data);
    setLoading(false);
  };

  const handleRequestVisit = async () => {
    if (schedules.length === 0) return;
    setRequestStatus("sending");
    const res = await requestClientVisit(schedules[0].project_id);
    if (res.success) {
      setRequestStatus("success");
      loadData();
      setTimeout(() => setRequestStatus("idle"), 3000);
    }
  };

  const upcoming = schedules.filter(s => isAfter(new Date(s.start_at), new Date()));
  const past = schedules.filter(s => !isAfter(new Date(s.start_at), new Date()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30">
        <div className="w-12 h-12 border-4 border-t-[#00a1e4] border-slate-100 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Syncing Work Plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-[#00a1e4]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Service Schedule Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#003366] tracking-tighter leading-tight">
            Work Plan <br/>
            <span className="text-[#00a1e4]">& Service Log</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
           <button 
             onClick={handleRequestVisit}
             disabled={requestStatus !== 'idle'}
             className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
               requestStatus === 'success' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
               'bg-[#003366] text-white shadow-blue-900/20 hover:bg-blue-900 group'
             }`}
           >
              {/* ... button content stayed the same inner logic ... */}
              {requestStatus === 'idle' && <><Plus size={16} className="group-hover:rotate-90 transition-transform" /> Request Service Visit</>}
              {requestStatus === 'sending' && <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>}
              {requestStatus === 'success' && <><CheckCircle2 size={16} /> Sent Successfully</>}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 sm:gap-12">
        {/* Calendar Side */}
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white border border-slate-100 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] shadow-sm">
              <h3 className="text-sm font-black text-[#003366] mb-8 flex items-center gap-2 uppercase tracking-tight">
                 <CalendarCheck size={18} className="text-[#00a1e4]"/>
                 Maintenance Calendar
              </h3>
              <ScheduleCalendarWidget isInternal={false} />
           </div>

           <div className="space-y-6">
              <h3 className="text-sm font-black text-[#003366] px-4 flex items-center gap-2 uppercase tracking-tight">
                 <Clock size={18} className="text-slate-400"/>
                 Upcoming Visits
              </h3>
              
              <div className="space-y-4">
                 {upcoming.length === 0 ? (
                   <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center grayscale opacity-40 text-slate-300">
                      <Calendar size={40} />
                      <p className="text-xs font-bold mt-2 uppercase">No upcoming visits scheduled</p>
                   </div>
                 ) : (
                    upcoming.map((s, i) => (
                       <ScheduleItem key={s.id} schedule={s} isLast={i === upcoming.length - 1} />
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* History Side */}
        <div className="space-y-8">
           <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-8">
              <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                 <CheckCircle2 size={18} className="text-emerald-500"/>
                 Service History
              </h3>
              
              <div className="space-y-6">
                 {past.slice(0, 5).map((s, i) => (
                    <div key={s.id} className="relative pl-6 border-l-2 border-emerald-100 pb-6 group">
                       <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(s.start_at), "dd MMM yyyy")}</p>
                       <h4 className="text-xs font-black text-[#003366] mt-1 group-hover:text-emerald-600 transition-colors uppercase">{s.title}</h4>
                       <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    </div>
                 ))}

                 {past.length > 5 && (
                    <button 
                      onClick={() => router.push("/client/reports")}
                      className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#003366] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                       Load Full History <ChevronRight size={12}/>
                    </button>
                 )}

                 {past.length === 0 && (
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4">No service records yet</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: any }) {
   return (
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border border-slate-100 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:border-[#00a1e4] transition-all group flex flex-col md:flex-row md:items-center gap-4 sm:gap-6"
      >
         <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex flex-col items-center justify-center font-black">
               <span className="text-lg leading-none">{format(new Date(schedule.start_at), "dd")}</span>
               <span className="text-[9px] uppercase tracking-tighter">{format(new Date(schedule.start_at), "MMM")}</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-[#00a1e4] uppercase tracking-widest mb-0.5">{schedule.type}</p>
               <h4 className="text-lg font-black text-[#003366] tracking-tight">{schedule.title}</h4>
               <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12}/> {format(new Date(schedule.start_at), "HH:mm")} - {format(new Date(schedule.end_at), "HH:mm")}</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> {schedule.units?.tag_number || schedule.projects?.name}</span>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-3 pl-4 md:border-l border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
               <CalendarCheck size={20} className="text-slate-300" />
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black uppercase text-slate-400 leading-none">Status</p>
               <p className={`text-xs font-black uppercase tracking-tight mt-1 ${
                 schedule.status === 'Planned' ? 'text-amber-500' : 
                 schedule.status === 'InProgress' ? 'text-blue-500' : 'text-emerald-500'
               }`}>
                  {schedule.status}
               </p>
            </div>
         </div>
         
         <div className="p-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
            <ChevronRight size={20} />
         </div>
      </motion.div>
   );
}
