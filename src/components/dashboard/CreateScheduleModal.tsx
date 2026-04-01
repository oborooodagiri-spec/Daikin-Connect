"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Calendar, Clock, User, ClipboardList, 
  ShieldCheck, Wrench, Activity, Search, 
  MapPin, Building2, Check, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getScheduleFormOptions, createSchedule } from "@/app/actions/schedules";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  projectId?: string;
  onSuccess: () => void;
}

export default function CreateScheduleModal({ isOpen, onClose, selectedDate, projectId: initialProjectId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Preventive" as "Preventive" | "Corrective" | "Audit",
    start_at: "",
    end_at: "",
    project_id: initialProjectId || "",
    unit_id: "",
    assignee_id: ""
  });

  const [options, setOptions] = useState<{ projects: any[], units: any[], users: any[] }>({
    projects: [],
    units: [],
    users: []
  });

  const [searchUnit, setSearchUnit] = useState("");
  const [isUnitSelectOpen, setIsUnitSelectOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      const hours = new Date().getHours();
      const start = `${format(selectedDate, "yyyy-MM-dd")}T${String(hours).padStart(2, '0')}:00`;
      const end = `${format(selectedDate, "yyyy-MM-dd")}T${String(hours + 1).padStart(2, '0')}:00`;
      setFormData(prev => ({ 
        ...prev, 
        start_at: start, 
        end_at: end,
        project_id: initialProjectId || "",
        unit_id: "",
        assignee_id: ""
      }));
    }
  }, [isOpen, selectedDate, initialProjectId]);

  const loadOptions = async () => {
    const res = await getScheduleFormOptions();
    if (res && 'success' in res && res.success) {
      setOptions(res.data);
    }
  };

  const filteredUnits = useMemo(() => {
    let list = options.units;
    if (formData.project_id) {
       list = list.filter(u => u.project_id === formData.project_id);
    }
    if (!searchUnit) return list.slice(0, 50);
    return list.filter(u => 
      u.tag_number?.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.area?.toLowerCase().includes(searchUnit.toLowerCase())
    ).slice(0, 50);
  }, [options.units, formData.project_id, searchUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
        alert("Please select a project.");
        return;
    }
    setLoading(true);
    try {
      const res = await createSchedule(formData);
      if (res && 'success' in res && res.success) {
        onSuccess();
        onClose();
      } else {
        alert("Fail: " + ('error' in res ? res.error : "Unknown error"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#003366] p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Calendar size={20} className="text-[#00a1e4]" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight italic leading-tight">Create Maintenance Schedule</h2>
                <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Target Date: {format(selectedDate, "eeee, dd MMMM yyyy")}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ClipboardList size={12} className="text-[#00a1e4]" /> Detail Pekerjaan / Title
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: AC Cleaning & Checkup Lantai 5"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:border-[#00a1e4] focus:ring-0 transition-all outline-none italic placeholder:not-italic"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Activity size={12} className="text-[#00a1e4]" /> Tipe Pekerjaan
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-[#00a1e4] transition-all outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="Preventive">Wrench • Preventive</option>
                  <option value="Corrective">Activity • Corrective</option>
                  <option value="Audit">Shield • Audit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={12} className="text-[#00a1e4]" /> Assigned Engineer
                </label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-[#00a1e4] transition-all outline-none"
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                >
                  <option value="">Select Assignee</option>
                  {options.users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock size={12} className="text-[#00a1e4]" /> Start Time
                </label>
                <input 
                  required
                  type="datetime-local"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-[#00a1e4] transition-all outline-none"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Clock size={12} className="text-slate-400" /> End Time
                </label>
                <input 
                  required
                  type="datetime-local"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-[#00a1e4] transition-all outline-none"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Building2 size={12} className="text-[#00a1e4]" /> Project / Unit Selection
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:border-[#00a1e4] transition-all outline-none truncate"
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value, unit_id: "" })}
                    >
                      <option value="">Select Project First</option>
                      {options.projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsUnitSelectOpen(!isUnitSelectOpen)}
                          className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight text-left flex justify-between items-center transition-all ${!formData.project_id && 'opacity-50 grayscale pointer-events-none'}`}
                        >
                          <span className="truncate">{formData.unit_id ? options.units.find(u => u.id === parseInt(formData.unit_id))?.tag_number : "Search & Select Unit"}</span>
                          <ChevronDown size={14} className={`transition-transform ${isUnitSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isUnitSelectOpen && (
                            <motion.div 
                               initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                               className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-3xl shadow-xl z-20 overflow-hidden flex flex-col"
                            >
                                <div className="p-3 border-b border-slate-100 relative">
                                    <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                      type="text"
                                      placeholder="Cari Unit..."
                                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:shadow-inner transition-all"
                                      value={searchUnit}
                                      onChange={(e) => setSearchUnit(e.target.value)}
                                      autoFocus
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                                    <button 
                                      type="button" 
                                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 italic"
                                      onClick={() => { setFormData({ ...formData, unit_id: "" }); setIsUnitSelectOpen(false); }}
                                    >
                                      None / General Work
                                    </button>
                                    {filteredUnits.map(u => (
                                      <button 
                                        key={u.id}
                                        type="button"
                                        className="w-full text-left p-2.5 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-colors"
                                        onClick={() => { 
                                          setFormData({ ...formData, unit_id: u.id.toString() }); 
                                          setIsUnitSelectOpen(false); 
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm">
                                                <MapPin size={12} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-[#003366] leading-none mb-1">{u.tag_number}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">{u.area}</p>
                                            </div>
                                        </div>
                                        {formData.unit_id === u.id.toString() && <Check size={14} className="text-[#10b981]" />}
                                      </button>
                                    ))}
                                    {filteredUnits.length === 0 && (
                                        <div className="p-4 text-center text-[10px] font-bold text-slate-300">No units found</div>
                                    )}
                                </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] py-4 bg-[#003366] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Assign Task Schedule"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
