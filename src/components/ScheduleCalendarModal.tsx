"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, 
  getDay, isToday, parseISO
} from "date-fns";
import { 
  X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Plus, Clock, User as UserIcon, Save, Trash2, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectSchedules } from "@/app/actions/project_targets";
import { createSchedule, deleteSchedule, getScheduleFormOptions } from "@/app/actions/schedules";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "Preventive",
    startTime: "09:00",
    endTime: "11:00",
    assigneeId: ""
  });

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await getProjectSchedules(projectId);
    if (res.success) setSchedules(res.data);
    setLoading(false);
  };

  const fetchOptions = async () => {
    const res = await getScheduleFormOptions();
    if (res.success) setEngineers(res.data.users);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
      fetchOptions();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    startTransition(async () => {
      const start = new Date(selectedDate);
      const [sh, sm] = formData.startTime.split(':');
      start.setHours(parseInt(sh), parseInt(sm));

      const end = new Date(selectedDate);
      const [eh, em] = formData.endTime.split(':');
      end.setHours(parseInt(eh), parseInt(em));

      const res = await createSchedule({
        title: formData.title,
        type: formData.type as any,
        start_at: start,
        end_at: end,
        project_id: projectId,
        assignee_id: formData.assigneeId ? parseInt(formData.assigneeId) : undefined
      });

      if (res.success) {
        setShowForm(false);
        fetchSchedules();
      }
    });
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
                  <span className="text-xs font-black uppercase tracking-widest px-4">{format(currentDate, "MMMM yyyy")}</span>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"><ChevronRight size={16}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 flex-1 relative isolate">
                {/* Empty cells for padding */}
                {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                  <div key={`p-${i}`} className="aspect-square bg-slate-50/50 rounded-2xl border border-transparent"></div>
                ))}
                
                {days.map(day => {
                  const daySchedules = schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), day));
                  const isCurToday = isToday(day);

                  return (
                    <motion.div 
                      key={day.toString()}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddSchedule(day)}
                      className={`relative aspect-square p-2 group cursor-pointer border transition-all rounded-3xl
                        ${isCurToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'}`}
                    >
                      <span className={`text-xs font-black ${isCurToday ? 'text-blue-600' : 'text-slate-400'}`}>
                        {format(day, "d")}
                      </span>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {daySchedules.map((s, idx) => (
                          <div key={s.id} className={`w-2 h-2 rounded-full ${s.type === 'Preventive' ? 'bg-indigo-500' : s.type === 'Corrective' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        ))}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Plus size={20} className="text-blue-500/20" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Sidebar (Daily view / Form) */}
            <div className="w-full md:w-80 lg:w-96 bg-slate-50 p-8 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-[#003366]">
                    {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Selected Date"}
                 </h4>
                 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                   <X size={20} />
                 </button>
               </div>

               <AnimatePresence mode="wait">
                 {showForm ? (
                    <motion.form 
                      key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSubmit} className="space-y-4 flex-1"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Description" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold">
                          <option value="Preventive">Preventive</option>
                          <option value="Corrective">Corrective</option>
                          <option value="Audit">Audit</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start</label>
                          <input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End</label>
                          <input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</label>
                        <select required value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold">
                          <option value="">Select Engineer...</option>
                          {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>

                      <div className="pt-4 flex gap-3">
                         <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-colors">Cancel</button>
                         <button type="submit" disabled={isPending} className="flex-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                           {isPending ? "..." : "Schedule"} <Save size={14} />
                         </button>
                      </div>
                    </motion.form>
                 ) : (
                    <motion.div 
                      key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="space-y-4 flex-1 overflow-y-auto"
                    >
                      {selectedDate ? (
                        schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), selectedDate)).length > 0 ? (
                          schedules.filter(s => isSameDay(parseISO(s.start_at.toString()), selectedDate)).map(s => (
                            <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative group overflow-hidden">
                               <div className={`absolute top-0 left-0 w-1.5 h-full ${s.type === 'Preventive' ? 'bg-indigo-500' : s.type === 'Corrective' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                               <div className="flex justify-between items-start">
                                 <div>
                                   <p className="text-sm font-black text-slate-800 leading-tight mb-1">{s.title}</p>
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                     <Clock size={12} /> {format(new Date(s.start_at), "HH:mm")} - {format(new Date(s.end_at), "HH:mm")}
                                   </div>
                                 </div>
                                 <button onClick={() => handleDelete(s.id)} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                               <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl w-max">
                                 <UserIcon size={12} className="text-slate-400" />
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.users?.name || "Unassigned"}</span>
                               </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                             <CalendarIcon size={40} className="text-slate-300 mb-4" />
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No jobs scheduled</p>
                             <button onClick={() => setShowForm(true)} className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Add First Job</button>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                           <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Pick a date to manage</p>
                        </div>
                      )}
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
