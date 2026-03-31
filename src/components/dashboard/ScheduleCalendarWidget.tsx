"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCalendarSchedules } from "@/app/actions/schedules";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  ArrowRight, 
  Activity, 
  Wrench, 
  ShieldCheck,
  CheckCircle2,
  Circle
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleCalendarWidget({ projectId, isInternal = true }: { projectId?: string; isInternal?: boolean }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      const res = await getCalendarSchedules(month, year, projectId);
      if (res && 'success' in res && res.success) {
        setSchedules(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentMonth, projectId]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const schedulesByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    schedules.forEach(s => {
      if (!s.start_at) return;
      const dateKey = format(parseISO(s.start_at), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(s);
    });
    return map;
  }, [schedules]);

  const selectedDaySchedules = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return schedulesByDay[key] || [];
  }, [selectedDate, schedulesByDay]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Audit': return { icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' };
      case 'Preventive': return { icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' };
      case 'Corrective': return { icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-500' };
      default: return { icon: Circle, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-500' };
    }
  };

  const handleMasterTimelineClick = () => {
    if (isInternal) {
      router.push("/dashboard/schedules");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full min-h-[600px]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <h2 className="text-xs font-black italic tracking-[0.2em] text-[#003366] flex items-center gap-2">
            <CalendarIcon size={16} className="text-[#00a1e4]" /> OPERATION CALENDAR
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time Field Deployment Synchronization</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-[#003366]">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-black min-w-[120px] text-center text-[#003366] uppercase tracking-widest italic">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-[#003366]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        {/* CALENDAR GRID - 7 COLUMNS */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const daySchedules = schedulesByDay[dateKey] || [];

              return (
                <div 
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[60px] group
                    ${isSelected ? 'bg-[#003366] border-[#003366] shadow-lg shadow-blue-900/10' : 
                      isCurrentMonth ? 'bg-white border-transparent hover:border-blue-200 hover:bg-blue-50/30' : 
                      'bg-slate-50/30 border-transparent opacity-20 grayscale cursor-not-allowed'}
                  `}
                >
                  <span className={`text-xs font-black mb-1 ${isSelected ? 'text-white' : isCurrentMonth ? 'text-[#003366]' : 'text-slate-400'}`}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="flex gap-1">
                    {daySchedules.slice(0, 3).map((s, idx) => {
                      const style = getTypeStyle(s.type);
                      return (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${style.dot} shadow-sm`} />
                      );
                    })}
                    {daySchedules.length > 3 && (
                      <div className={`w-1.5 h-1.5 rounded-full bg-slate-300`} />
                    )}
                  </div>

                  {isSameDay(day, new Date()) && !isSelected && (
                    <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#00a1e4]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AGENDA SIDE PANEL - 5 COLUMNS */}
        <div className="col-span-12 lg:col-span-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-black text-[#00a1e4] leading-none uppercase">{format(selectedDate, "MMM")}</span>
                <span className="text-lg font-black text-[#003366] leading-none">{format(selectedDate, "dd")}</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Daily Agenda</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{format(selectedDate, "EEEE, yyyy")}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-[#003366] text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
              {selectedDaySchedules.length} TASKS
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-4 opacity-50">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : selectedDaySchedules.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-slate-400" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Free Schedule</p>
                <p className="text-[10px] font-bold text-slate-400 max-w-[150px] mt-2">No field operations planned for this day.</p>
              </div>
            ) : (
              selectedDaySchedules.map((s, idx) => {
                const style = getTypeStyle(s.type);
                return (
                  <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group border-l-4"
                    style={{ borderLeftColor: s.type === 'Audit' ? '#f59e0b' : s.type === 'Preventive' ? '#10b981' : '#f43f5e' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                          <style.icon size={12} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${style.color}`}>
                          {s.type} {s.status === 'Completed' && '• DONE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={10} />
                        <span className="text-[10px] font-black uppercase">{format(parseISO(s.start_at), "HH:mm")}</span>
                      </div>
                    </div>
                    
                    <h4 className="text-xs font-black text-[#003366] line-clamp-2 mb-1 group-hover:text-[#00a1e4] transition-colors uppercase italic tracking-tight">{s.title}</h4>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <User size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.assigneeName}</span>
                       </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
             {isInternal ? (
               <button 
                 onClick={handleMasterTimelineClick}
                 className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-[#003366] rounded-2xl shadow-lg shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
               >
                 Master Timeline View <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
               </button>
             ) : (
               <div className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-2 italic">
                 Project View Only
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
