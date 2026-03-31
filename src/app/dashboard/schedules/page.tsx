// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { getAllSchedules, getScheduleFormOptions, createSchedule, updateScheduleStatus } from "@/app/actions/schedules";
import { Plus, MapPin, CheckCircle2, XCircle, Search, Clock, CalendarIcon, FolderGit2, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form & Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [options, setOptions] = useState({ projects: [], units: [], users: [] });
  const [formData, setFormData] = useState<any>({
    title: "", description: "", type: "Preventive", start_at: "", end_at: "", project_id: "", unit_id: "", assignee_id: ""
  });

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await getAllSchedules();
    if (res.success) setSchedules(res.data);
    setLoading(false);
  };

  const fetchOptions = async () => {
    const res = await getScheduleFormOptions();
    if (res.success) setOptions(res.data);
  };

  useEffect(() => {
    fetchSchedules();
    fetchOptions();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.start_at || !formData.end_at) return alert("Required fields missing");

    startTransition(async () => {
      const res = await createSchedule(formData.project_id, formData);
      if (res.success) {
        closeModal();
        fetchSchedules();
      } else {
        alert(res.error || "Error");
      }
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    startTransition(async () => {
      const res = await updateScheduleStatus(id, status);
      if (res.success) fetchSchedules();
    });
  };

  // Calendar Logic
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const getTypeStyle = (type: string) => {
    if (type === "Preventive") return "bg-indigo-50 border-indigo-200 text-indigo-700";
    if (type === "Corrective") return "bg-rose-50 border-rose-200 text-rose-700";
    return "bg-amber-50 border-amber-200 text-amber-700";
  };

  const currentProjectUnits = options.units.filter((u: any) => u.project_id === formData.project_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          Weekly Timeline
        </h2>
        <button 
          onClick={openModal}
          className="px-5 py-2.5 bg-[#00a1e4] hover:bg-[#008cc6] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Assign Task
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-sm">
        {/* Weekly Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekDays.map((date, i) => (
            <div key={i} className="p-4 text-center border-r border-slate-100 last:border-0 relative">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{format(date, 'EEE')}</p>
              <p className={`text-lg font-black mt-1 ${isSameDay(date, new Date()) ? 'text-[#00a1e4]' : 'text-slate-800'}`}>
                {format(date, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Weekly Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Calendar...</div>
        ) : (
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map((date, i) => {
              const daySchedules = schedules.filter(s => isSameDay(new Date(s.start_at), date));
              
              return (
                <div key={i} className="p-2 border-r border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-2">
                    {daySchedules.map((s) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        key={s.id} 
                        className={`p-3 rounded-xl border ${getTypeStyle(s.type)} shadow-sm relative group`}
                      >
                        <p className="font-black text-xs tracking-tight mb-1">{s.title}</p>
                        <p className="text-[9px] font-bold opacity-70 flex items-center gap-1 mb-1">
                          <FolderGit2 size={10} /> {s.project?.name || "Unknown"}
                        </p>
                        <p className="text-[9px] font-bold opacity-70 flex items-center gap-1">
                          <Clock size={10} /> {format(new Date(s.start_at), 'HH:mm')} - {format(new Date(s.end_at), 'HH:mm')}
                        </p>

                        <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-center">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            s.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                            s.status === 'Missed' ? 'bg-rose-500 text-white' : 'bg-black/10'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        {/* Hover Actions */}
                        {s.status === 'Planned' && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm">
                            <button onClick={() => handleStatusUpdate(s.id, 'Completed')} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                              <CheckCircle2 size={12} />
                            </button>
                            <button onClick={() => handleStatusUpdate(s.id, 'Missed')} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                              <XCircle size={12} />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- CRUD Form Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#003366] tracking-tight">Assign Operation Schedule</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">Plan Preventive, Corrective, or Audit Tasks.</p>
                </div>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="p-6 grid grid-cols-2 gap-5 bg-white">
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project / Site <span className="text-rose-500">*</span></label>
                    <select required value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value, unit_id: ""})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="">Select Project...</option>
                      {options.projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Unit (Optional)</label>
                    <select value={formData.unit_id} onChange={e => setFormData({...formData, unit_id: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" disabled={!formData.project_id}>
                      <option value="">Any Unit</option>
                      {currentProjectUnits.map((u: any) => <option key={u.id} value={u.id}>{u.tag_number}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time <span className="text-rose-500">*</span></label>
                    <input type="datetime-local" required value={formData.start_at} onChange={e => setFormData({...formData, start_at: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time <span className="text-rose-500">*</span></label>
                    <input type="datetime-local" required value={formData.end_at} onChange={e => setFormData({...formData, end_at: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="Preventive">Preventive Maintenance</option>
                      <option value="Corrective">Corrective Repair</option>
                      <option value="Audit">Audit</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</label>
                    <select value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="">Unassigned</option>
                      {options.users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>

                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Google Calendar Sync Ready</span>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2">
                      {isPending ? "Saving..." : "Save Schedule"}
                      {!isPending && <Save size={14} />}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
