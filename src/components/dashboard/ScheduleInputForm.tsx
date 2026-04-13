"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Calendar, Clock, User, ClipboardList, 
  Activity, Search, MapPin, Building2, Check, 
  ChevronDown, Hash, UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getScheduleFormOptions, createSchedule } from "@/app/actions/schedules";
import TimePickerDrum from "./TimePickerDrum";

interface Props {
  selectedDate: Date;
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ScheduleInputForm({ selectedDate, projectId: initialProjectId, onSuccess, onCancel }: Props) {
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
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    loadOptions();
    const hours = new Date().getHours();
    const startTime = `${String(hours).padStart(2, '0')}:00`;
    const endTime = `${String(hours + 1).padStart(2, '0')}:00`;
    
    setFormData(prev => ({ 
      ...prev, 
      start_at: startTime, 
      end_at: endTime,
      project_id: initialProjectId || "",
      unit_id: "",
      assignee_id: ""
    }));
  }, [selectedDate, initialProjectId]);

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
    
    const query = searchUnit.toLowerCase();
    return list.filter(u => 
      u.tag_number?.toLowerCase().includes(query) ||
      u.code?.toLowerCase().includes(query) ||
      u.room_tenant?.toLowerCase().includes(query) ||
      u.model?.toLowerCase().includes(query) ||
      u.serial_number?.toLowerCase().includes(query) ||
      u.area?.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [options.units, formData.project_id, searchUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
        alert("Please select a project.");
        return;
    }
    setLoading(true);
    
    // Combine date and time (Timezone Safe)
    const [startH, startM] = formData.start_at.split(":").map(Number);
    const [endH, endM] = formData.end_at.split(":").map(Number);
    
    const startAt = new Date(selectedDate);
    startAt.setHours(startH, startM, 0, 0);
    
    const endAt = new Date(selectedDate);
    endAt.setHours(endH, endM, 0, 0);

    const fullData = {
        ...formData,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString()
    };

    try {
      const res = await createSchedule(fullData);
      if (res && 'success' in res && res.success) {
        onSuccess();
      } else {
        alert("Fail: " + ('error' in res ? res.error : "Unknown error"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white rounded-3xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <h2 className="text-sm font-black text-[#003366] uppercase tracking-[0.2em]">{format(selectedDate, "dd MMM yyyy")}</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define New Schedule Activity</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
          <X size={18} />
        </button>
      </div>

      <AnimatePresence>
        {activePicker && (
            <TimePickerDrum 
                initialTime={activePicker === "start" ? formData.start_at : formData.end_at}
                onSave={(time) => {
                    setFormData({ ...formData, [activePicker === "start" ? "start_at" : "end_at"]: time });
                    setActivePicker(null);
                }}
                onCancel={() => setActivePicker(null)}
            />
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar flex flex-col justify-between">
        <div className="space-y-4 sm:space-y-5">
            {/* Job Title */}
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Job Title</label>
                <div className="relative group">
                    <ClipboardList size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00a1e4] transition-colors" />
                    <input 
                        required
                        type="text"
                        placeholder="Description of work"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#003366] placeholder:text-slate-300 focus:border-[#00a1e4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Type</label>
                <div className="grid grid-cols-3 gap-2">
                    {["Preventive", "Corrective", "Audit"].map((t) => (
                        <div 
                            key={t}
                            onClick={() => setFormData({ ...formData, type: t as any })}
                            className={`p-2.5 rounded-xl border-2 cursor-pointer text-center group transition-all ${
                                formData.type === t 
                                ? 'bg-[#003366] border-[#003366] text-white shadow-lg shadow-blue-900/10' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-normal">{t}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Start</label>
                    <button 
                        type="button"
                        onClick={() => setActivePicker("start")}
                        className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#003366] flex items-center justify-between hover:border-[#00a1e4] hover:shadow-lg hover:shadow-blue-500/10 transition-all outline-none"
                    >
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-[#00a1e4]" />
                            <span>{formData.start_at}</span>
                        </div>
                    </button>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">End</label>
                    <button 
                        type="button"
                        onClick={() => setActivePicker("end")}
                        className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#003366] flex items-center justify-between hover:border-[#00a1e4] hover:shadow-lg hover:shadow-blue-500/10 transition-all outline-none"
                    >
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-[#00a1e4]" />
                            <span>{formData.end_at}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assignee</label>
                <div className="relative">
                    <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                        required
                        className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#003366] focus:border-[#00a1e4] transition-all outline-none appearance-none"
                        value={formData.assignee_id}
                        onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    >
                        <option value="">Select Engineer...</option>
                        {options.users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
            </div>

            {/* Unit Search (SMART) */}
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Smart Unit Selection</label>
                {!formData.project_id ? (
                    <select 
                       required
                       className="w-full px-3 sm:px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] sm:text-xs font-bold text-[#003366] uppercase"
                       value={formData.project_id}
                       onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    >
                        <option value="">Select Project First...</option>
                        {options.projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                ) : (
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsUnitSelectOpen(!isUnitSelectOpen)}
                            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#003366] text-left flex justify-between items-center transition-all shadow-sm"
                        >
                            <span className="truncate">{formData.unit_id ? options.units.find(u => u.id === parseInt(formData.unit_id))?.tag_number : "Search Tag, Code, or Tenant..."}</span>
                            <ChevronDown size={14} className={`transition-transform text-[#00a1e4] ${isUnitSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isUnitSelectOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute left-0 right-0 bottom-full mb-3 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[300px]"
                                >
                                    <div className="p-3 border-b border-slate-50 relative">
                                        <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input 
                                            type="text"
                                            placeholder="Unit ID, Code, Tenant..."
                                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:bg-white transition-all shadow-inner"
                                            value={searchUnit}
                                            onChange={(e) => setSearchUnit(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {filteredUnits.map(u => (
                                            <button 
                                                key={u.id}
                                                type="button"
                                                className="w-full text-left p-3 hover:bg-blue-50 rounded-2xl transition-colors group flex flex-col gap-0.5"
                                                onClick={() => { 
                                                    setFormData({ ...formData, unit_id: u.id.toString() }); 
                                                    setIsUnitSelectOpen(false); 
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-[#003366] uppercase group-hover:text-[#00a1e4]">{u.tag_number}</span>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{u.code}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase line-clamp-1 italic">
                                                        {u.room_tenant} • {u.area}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-between gap-4">
            <button 
                type="button" 
                onClick={onCancel}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#003366] transition-colors pl-2"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="px-6 sm:px-10 py-4 bg-[#003366] text-white text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
                {loading ? "SAVING..." : "SCHEDULE"}
                {!loading && <Check size={14} className="text-[#00a1e4]" />}
            </button>
        </div>
      </form>
    </div>
  );
}
