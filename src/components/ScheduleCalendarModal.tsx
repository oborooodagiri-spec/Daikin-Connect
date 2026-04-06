"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, 
  getDay, isToday, parseISO
} from "date-fns";
import { 
  X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User as UserIcon, Trash2, MapPin 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectSchedules } from "@/app/actions/project_targets";
import { deleteSchedule } from "@/app/actions/schedules";
import ScheduleInputForm from "./dashboard/ScheduleInputForm";

interface ScheduleCalendarModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleCalendarModal({ projectId, projectName, isOpen, onClose }: ScheduleCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await getProjectSchedules(projectId);
    if (res.success) setSchedules(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen, projectId]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handleAddSchedule = (day: Date) => {
    setSelectedDate(day);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this schedule?")) return;
    startTransition(async () => {
      const res = await deleteSchedule(id);
      if (res.success) fetchSchedules();
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left side: Calendar */}
            <div className="flex-1 p-8 flex flex-col border-r border-slate-100 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#003366] tracking-tight">{projectName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Operational Scheduler</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronLeft size={16}/></button>
                  <span className="text-xs font-black uppercase tracking-widest px-4 font-mono">{format(currentDate, "MMMM yyyy")}</span>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronRight size={16}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 flex-1 relative isolate">
                {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                  <div key={`p-${i}`} className="aspect-square bg-slate-50/50 rounded-2xl border border-transparent"></div>
                ))}
                
                {days.map(day => {
                  const daySchedules = schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), day));
                  const isCurToday = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <motion.div 
                      key={day.toString()}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddSchedule(day)}
                      className={`relative aspect-square p-2 group cursor-pointer border transition-all rounded-3xl
                        ${isSelected ? 'bg-[#003366] border-[#003366] shadow-lg' : isCurToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'}`}
                    >
                      <span className={`text-xs font-black ${isSelected ? 'text-white' : isCurToday ? 'text-blue-600' : 'text-slate-400'}`}>
                        {format(day, "d")}
                      </span>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {daySchedules.map((s) => (
                          <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${s.type === 'Preventive' ? 'bg-indigo-500' : s.type === 'Corrective' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Sidebar */}
            <div className="w-full md:w-80 lg:w-96 bg-slate-50 p-1 flex flex-col overflow-hidden shadow-inner">
               <AnimatePresence mode="wait">
                 {showForm ? (
                    <ScheduleInputForm 
                      selectedDate={selectedDate}
                      projectId={projectId}
                      onSuccess={() => {
                        setShowForm(false);
                        fetchSchedules();
                      }}
                      onCancel={() => setShowForm(false)}
                    />
                 ) : (
                    <motion.div 
                      key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col h-full p-6 overflow-hidden"
                    >
                       <div className="flex justify-between items-center mb-6">
                         <h4 className="text-sm font-black uppercase tracking-widest text-[#003366]">
                            {format(selectedDate, "dd MMM yyyy")}
                         </h4>
                         <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                           <X size={20} />
                         </button>
                       </div>

                       <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                          {loading ? (
                            <div className="space-y-4 opacity-50">
                               {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />)}
                            </div>
                          ) : schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), selectedDate)).length > 0 ? (
                            schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), selectedDate)).map(s => (
                              <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative group overflow-hidden">
                                 <div className={`absolute top-0 left-0 w-1.5 h-full ${s.type === 'Preventive' ? 'bg-indigo-500' : s.type === 'Corrective' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                 <div className="flex justify-between items-start">
                                   <div className="text-left">
                                     <p className="text-sm font-black text-slate-800 leading-tight mb-1 uppercase italic tracking-tight">{s.title}</p>
                                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                       <Clock size={12} /> {format(parseISO(s.start_at.toString()), "HH:mm")} - {format(parseISO(s.end_at.toString()), "HH:mm")}
                                     </div>
                                   </div>
                                   <button onClick={() => handleDelete(s.id)} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                     <Trash2 size={14} />
                                   </button>
                                 </div>
                                 <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl w-max">
                                   <UserIcon size={12} className="text-slate-400" />
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.users?.name || "Unassigned"}</span>
                                 </div>
                                 {s.units?.tag_number && (
                                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl w-max">
                                      <MapPin size={12} className="text-[#00a1e4]" />
                                      <div>
                                        <span className="text-[10px] font-black text-[#003366] uppercase tracking-tight">{s.units.tag_number}</span>
                                        {s.units.room_tenant && <span className="text-[9px] font-bold text-[#00a1e4] ml-1">{s.units.room_tenant}</span>}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                               <CalendarIcon size={40} className="text-slate-300 mb-4" />
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No jobs scheduled</p>
                               <button onClick={() => setShowForm(true)} className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-4">Add First Job</button>
                            </div>
                          )}
                       </div>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
