// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { getAllSchedules, getScheduleFormOptions, createSchedule, updateScheduleStatus, getSchedulesByProject, deleteSchedule } from "@/app/actions/schedules";
import { Plus, MapPin, CheckCircle2, XCircle, Search, Clock, CalendarIcon, FolderGit2, X, Save, ChevronLeft, ChevronRight, Activity, Pencil, Trash2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import QuickInputModal from "@/components/dashboard/QuickInputModal";
import ThreadModal from "@/components/dashboard/ThreadModal";
import ScheduleInputForm from "@/components/dashboard/ScheduleInputForm";
import { getSession } from "@/app/actions/auth";

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const filterProjectId = searchParams.get("projectId");
  const [selectedDayMobile, setSelectedDayMobile] = useState(new Date());
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  // Form & Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [options, setOptions] = useState({ projects: [], units: [], users: [] });
  const [formData, setFormData] = useState<any>({
    title: "", description: "", type: "Preventive", start_at: "", end_at: "", project_id: "", unit_id: "", assignee_id: ""
  });

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Quick Input logic
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [passedUnit, setPassedUnit] = useState<any | null>(null);

  // Meeting Management (Admin)
  const [session, setSession] = useState<any>(null);
  const [managingSchedule, setManagingSchedule] = useState<any>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    let res;
    if (filterProjectId) {
      res = await getSchedulesByProject(filterProjectId);
    } else {
      res = await getAllSchedules();
    }
    
    if (res && "success" in res && res.success) setSchedules(res.data);
    setLoading(false);
  };

  const fetchOptions = async () => {
    const res = await getScheduleFormOptions();
    if (res && "success" in res && res.success) setOptions(res.data);
  };

  useEffect(() => {
    fetchSchedules();
    fetchOptions();
    getSession().then(setSession);
  }, [filterProjectId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.start_at || !formData.end_at) return alert("Required fields missing");

    startTransition(async () => {
      const res = await createSchedule(formData.project_id, formData);
      if ("success" in res && res.success) {
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
      if ("success" in res && res.success) fetchSchedules();
    });
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    const res = await deleteSchedule(id);
    if (res && "success" in res && res.success) {
      fetchSchedules();
    } else {
      alert("Failed to delete schedule");
    }
  };

  const handleOpenForm = (s: any) => {
    // Priority 1: Direct Redirection if unit has token
    const unit = s.unit || options.units.find(u => u.id === (s.unitId || s.unit_id));
    if (unit?.qr_code_token) {
        const type = s.type?.toLowerCase() || "preventive";
        const formType = type === "dailylog" ? "daily" : type;
        router.push(`/passport/${unit.qr_code_token}/${formType}`);
        return;
    }

    // Priority 2: Fallback to QuickInputModal for unit selection
    if (unit) {
        setPassedUnit(unit);
    } else if (s.unitId || s.unit_id) {
        const foundUnit = options.units.find(u => u.id === (s.unitId || s.unit_id));
        setPassedUnit(foundUnit || {
          id: s.unitId || s.unit_id,
          tag_number: s.unitTag || "Assigned Unit",
          area: s.unitArea || "",
          model: s.unitModel || ""
        });
    } else {
      setPassedUnit(null);
    }
    setIsInputModalOpen(true);
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
      </div>

      {/* Mobile Day Selector - Sticky Header for Mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{format(selectedDayMobile, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
                <button onClick={() => setSelectedDayMobile(addDays(selectedDayMobile, -1))} className="p-1 hover:bg-white rounded-lg border border-slate-200 transition-all"><ChevronLeft size={16} /></button>
                <button onClick={() => setSelectedDayMobile(addDays(selectedDayMobile, 1))} className="p-1 hover:bg-white rounded-lg border border-slate-200 transition-all"><ChevronRight size={16} /></button>
            </div>
        </div>
        <div className="flex justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {weekDays.map((date, i) => {
            const isSelected = isSameDay(date, selectedDayMobile);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={i}
                onClick={() => setSelectedDayMobile(date)}
                className={`flex-1 min-w-[45px] flex flex-col items-center py-3 rounded-2xl transition-all ${
                  isSelected 
                    ? "bg-[#003366] text-white shadow-lg shadow-blue-900/20 scale-105" 
                    : "bg-white text-slate-400 hover:bg-slate-100"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60">
                   {format(date, 'EEE')}
                </span>
                <span className={`text-sm font-black ${isToday && !isSelected ? "text-[#00a1e4]" : ""}`}>
                   {format(date, 'd')}
                </span>
                {isToday && isSelected && <div className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-orange-400 border-2 border-[#003366]"></div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-sm">
        {/* Desktop View - Grid */}
        <div className="hidden md:block">
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
                        {daySchedules.map((s) => {
                          const roles = session?.roles || [];
                          const userRole = session?.role_name?.toLowerCase() || "";
                          const canEditOrDelete = userRole.includes("admin") || userRole.includes("engineer") || roles.some(r => r.toLowerCase().includes("admin") || r.toLowerCase().includes("engineer"));
                          const isActuallyInternal = session?.isInternal || roles.some((r: string) => 
                            ["admin", "super", "internal", "management", "engineer"].some(kw => r.toLowerCase().includes(kw))
                          );

                          return (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                key={s.id} 
                                onClick={() => handleOpenForm(s)}
                                className={`p-3 rounded-xl border ${getTypeStyle(s.type)} shadow-sm relative group cursor-pointer hover:scale-105 hover:shadow-md transition-all active:scale-95`}
                            >
                                <p className="font-black text-xs tracking-tight mb-1">{s.title}</p>
                                <p className="text-[9px] font-bold opacity-70 flex items-center gap-1 mb-1">
                                <FolderGit2 size={10} /> {s.project?.name || "Unknown"}
                                </p>
                                <p className="text-[9px] font-bold opacity-70 flex items-center gap-1">
                                <Clock size={10} /> {format(new Date(s.start_at), 'HH:mm')} - {format(new Date(s.end_at), 'HH:mm')}
                                </p>

                                <div className="mt-3 pt-2 border-t border-black/5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                            s.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                                            s.status === 'Missed' ? 'bg-rose-500 text-white' : 'bg-black/10'
                                        }`}>
                                            {s.status}
                                        </span>
                                    </div>
                                    
                                    {isActuallyInternal && (
                                        <div className="flex flex-col gap-1.5 min-w-0">
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setManagingSchedule(s);
                                              }}
                                              className="w-full py-1.5 bg-black/5 hover:bg-black hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                              <div className="flex items-center justify-center gap-1.5">
                                                <MessageSquare size={10} />
                                                Collaboration Thread
                                              </div>
                                            </button>

                                            {canEditOrDelete && (
                                                <div className="flex gap-1">
                                                    <button 
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingSchedule(s);
                                                      }}
                                                      className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Pencil size={10} /> Edit
                                                    </button>
                                                    <button 
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSchedule(s.id);
                                                      }}
                                                      className="flex-1 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 size={10} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                          );
                        })}
                    </div>
                </div>
            );
            })}
        </div>
        )}
    </div>

        {/* Mobile View - Single Day List */}
        <div className="md:hidden flex flex-col min-h-[300px] p-4 bg-slate-50/30">
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Tasks...</div>
            ) : schedules.filter(s => isSameDay(new Date(s.start_at), selectedDayMobile)).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale text-center">
                    <Activity size={48} className="text-slate-300 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No activities scheduled for this day</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {schedules.filter(s => isSameDay(new Date(s.start_at), selectedDayMobile)).map((s) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            key={s.id}
                            onClick={() => handleOpenForm(s)}
                            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                s.type === 'Preventive' ? 'bg-indigo-500' : 
                                s.type === 'Corrective' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${getTypeStyle(s.type)} border-0`}>
                                            {s.type}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                            s.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 
                                            s.status === 'Missed' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {s.status}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight">{s.title}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#00a1e4]">{format(new Date(s.start_at), 'HH:mm')} - {format(new Date(s.end_at), 'HH:mm')}</p>
                                    <div className="flex gap-2 mt-2">
                                        {(() => {
                                            const roles = session?.roles || [];
                                            const userRole = session?.role_name?.toLowerCase() || "";
                                            const canEditOrDelete = userRole.includes("admin") || userRole.includes("engineer") || roles.some(r => r.toLowerCase().includes("admin") || r.toLowerCase().includes("engineer"));
                                            if (canEditOrDelete) {
                                                return (
                                                    <>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setEditingSchedule(s); }}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(s.id); }}
                                                            className="p-2 bg-rose-50 text-rose-600 rounded-lg"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                                    <MapPin size={12} className="text-[#00a1e4]" />
                                    <span>{s.project?.name || "Global Project"}</span>
                                </div>
                                {(() => {
                                   const roles = session?.roles || [];
                                   const isActuallyInternal = session?.isInternal || roles.some((r: string) => 
                                     ["admin", "super", "internal", "management", "engineer"].some(kw => r.toLowerCase().includes(kw))
                                   );
                                   
                                   if (isActuallyInternal) {
                                     return (
                                       <button 
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setManagingSchedule(s);
                                         }}
                                         className="px-4 py-2 bg-[#003366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-2"
                                       >
                                         <MessageSquare size={12} />
                                         Collaboration Thread
                                       </button>
                                     );
                                   }
                                   return null;
                                 })()}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
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

      <QuickInputModal 
        isOpen={isInputModalOpen} 
        onClose={() => setIsInputModalOpen(false)} 
        unit={passedUnit} 
      />

      <AnimatePresence>
        {editingSchedule && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    onClick={() => setEditingSchedule(null)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-10 w-full max-w-lg h-[80vh] overflow-hidden"
                >
                    <ScheduleInputForm 
                        selectedDate={new Date(editingSchedule.start_at)}
                        scheduleId={editingSchedule.id}
                        initialData={editingSchedule}
                        onSuccess={() => {
                            setEditingSchedule(null);
                            fetchSchedules();
                        }}
                        onCancel={() => setEditingSchedule(null)}
                    />
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <ThreadModal 
        isOpen={!!managingSchedule}
        schedule={managingSchedule}
        onClose={() => setManagingSchedule(null)}
        currentUser={{
          id: session?.userId ? parseInt(session.userId) : 0,
          role: session?.roles?.[0] || "Guest"
        }}
      />
    </div>
  );
}
