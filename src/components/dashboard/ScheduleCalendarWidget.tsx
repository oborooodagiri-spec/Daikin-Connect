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
  X,
  ArrowRight, 
  Activity, 
  Wrench, 
  ShieldCheck,
  CheckCircle2,
  Circle,
  PlusCircle,
  Layout,
  MapPin,
  Building,
  Info,
  FileText
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
import ScheduleInputForm from "./ScheduleInputForm";
import QuickInputModal from "./QuickInputModal";

export default function ScheduleCalendarWidget({ projectId, isInternal = true }: { projectId?: string; isInternal?: boolean }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [passedUnit, setPassedUnit] = useState<any | null>(null);

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

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsCreating(true);
  };

  const handleOpenForm = (s: any) => {
    if (s.unitId) {
      setPassedUnit({
        id: s.unitId,
        tag_number: s.unitTag,
        area: s.unitArea,
        model: s.unitModel,
        qr_code_token: s.unitToken
      });
    } else {
      setPassedUnit(null);
    }
    setIsInputModalOpen(true);
    setSelectedSchedule(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col min-h-[600px] max-h-[850px]">
      <QuickInputModal 
        isOpen={isInputModalOpen} 
        onClose={() => setIsInputModalOpen(false)} 
        unit={passedUnit} 
      />

      <AnimatePresence>
        {selectedSchedule && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setSelectedSchedule(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className={`p-6 text-white`} style={{ backgroundColor: selectedSchedule.type === 'Audit' ? '#f59e0b' : selectedSchedule.type === 'Preventive' ? '#10b981' : '#f43f5e' }}>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-md border border-white/10 mb-2 inline-block">
                      {selectedSchedule.type} • {selectedSchedule.status}
                    </span>
                    <h3 className="text-xl font-black tracking-tight leading-tight uppercase italic">{selectedSchedule.title}</h3>
                  </div>
                  <button onClick={() => setSelectedSchedule(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time & Date</p>
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase">
                      <Clock size={14} className="text-[#00a1e4]" />
                      <span>{format(parseISO(selectedSchedule.start_at), "EEEE, dd MMM HH:mm")}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Assignee</p>
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase">
                      <User size={14} className="text-[#00a1e4]" />
                      <span>{selectedSchedule.assigneeName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Project / Location</p>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <Building size={16} className="text-slate-400" />
                    <div>
                      <p className="text-[10px] font-black text-[#003366] uppercase tracking-tight leading-none">{selectedSchedule.projectName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{selectedSchedule.customerName}</p>
                    </div>
                  </div>
                </div>

                {selectedSchedule.unitTag && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Assigned Unit</p>
                    <div className="flex items-center gap-2 text-slate-700 bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <MapPin size={16} className="text-[#00a1e4]" />
                      <div>
                        <p className="text-[10px] font-black text-[#003366] uppercase tracking-tight leading-none">{selectedSchedule.unitTag}</p>
                        {selectedSchedule.unitRoom && <p className="text-[9px] font-bold text-[#00a1e4] uppercase tracking-tighter mt-1">{selectedSchedule.unitRoom}</p>}
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{selectedSchedule.unitArea}{selectedSchedule.unitModel ? ` • ${selectedSchedule.unitModel}` : ''}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => handleOpenForm(selectedSchedule)}
                    className="flex-1 py-3 bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> Open Input Form
                  </button>
                  <button 
                    onClick={() => setSelectedSchedule(null)}
                    className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      <div className="grid grid-cols-12 gap-6 lg:gap-8 flex-1 overflow-hidden">
        <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
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
                  onClick={() => handleDayClick(day)}
                  className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[60px] group
                    ${isSelected ? 'bg-[#003366] border-[#003366] shadow-lg shadow-blue-900/10' : 
                      isCurrentMonth ? 'bg-white border-transparent hover:border-blue-200 hover:bg-blue-50/30' : 
                      'bg-slate-50/30 border-transparent opacity-20 grayscale cursor-not-allowed group-hover:opacity-100 transition-opacity'}
                  `}
                >
                  <span className={`text-xs font-black mb-1 ${isSelected ? 'text-white' : isCurrentMonth ? 'text-[#003366]' : 'text-slate-400'}`}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="flex gap-1">
                    {daySchedules.slice(0, 3).map((s, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getTypeStyle(s.type).dot} shadow-sm`} />
                    ))}
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

        <div className="col-span-12 lg:col-span-4 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-1 flex flex-col overflow-hidden h-full shadow-inner">
          {isCreating ? (
            <ScheduleInputForm 
              selectedDate={selectedDate}
              projectId={projectId}
              onSuccess={() => {
                setIsCreating(false);
                fetchSchedules();
              }}
              onCancel={() => setIsCreating(false)}
            />
          ) : (
            <div className="flex flex-col h-full p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                            <span className="text-[10px] font-black text-[#003366] uppercase leading-none">{format(selectedDate, "MMM")}</span>
                            <span className="text-sm font-black text-[#00a1e4] leading-none mt-0.5">{format(selectedDate, "dd")}</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest leading-none">{format(selectedDate, "eeee")}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{selectedDaySchedules.length} TASKS PLANNED</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-2 hover:bg-[#003366] hover:text-white rounded-xl text-[#003366] transition-all bg-white border border-slate-100 shadow-sm"
                    >
                        <PlusCircle size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar text-left">
                    {loading ? (
                        <div className="space-y-4 opacity-50">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-white border border-slate-50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : selectedDaySchedules.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale p-10 text-center uppercase text-[10px] font-black tracking-widest border-2 border-dashed border-slate-200 rounded-[2rem]">
                            <Layout size={32} className="mb-4" />
                            <p>No Schedules for this day</p>
                            <button onClick={() => setIsCreating(true)} className="mt-4 text-[#00a1e4] underline">Quick Add</button>
                        </div>
                    ) : (
                    selectedDaySchedules.map((s, i) => {
                            const { bg, color, icon } = getTypeStyle(s.type);
                            const IconComp = icon;
                            return (
                                <motion.div 
                                    key={s.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedSchedule(s)}
                                    className="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden active:scale-95 text-left"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: s.type === 'Audit' ? '#f59e0b' : s.type === 'Preventive' ? '#10b981' : '#f43f5e' }}></div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
                                                <IconComp size={10} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-[#003366] line-clamp-1 truncate max-w-[120px] uppercase tracking-tight leading-tight">{s.title}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.projectName}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                            s.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                            s.status === 'InProgress' ? 'bg-amber-50 text-amber-600' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>{s.status}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Clock size={8} className="text-slate-400" />
                                                <span className="text-[8px] font-black text-slate-400">{format(parseISO(s.start_at), "HH:mm")}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={8} className="text-slate-400" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{s.unitRoom || s.unitArea || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <User size={8} className="text-slate-400 shrink-0" />
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[60px]">{s.assigneeName}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
                
                {isInternal && !isCreating && (
                   <div className="mt-4 pt-4 border-t border-slate-100">
                       <button 
                        onClick={() => router.push("/dashboard/schedules")}
                        className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-[#003366] rounded-2xl shadow-lg shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                       >
                         Master Timeline View <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                   </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
