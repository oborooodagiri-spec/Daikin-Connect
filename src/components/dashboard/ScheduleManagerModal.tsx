"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, FileText, CheckCircle2, Save, Plus, Trash2, Clock, MapPin, User as UserIcon } from "lucide-react";
import { getScheduleManagementData, updateAttendance, updateMoM } from "@/app/actions/schedules_admin";
import { format, parseISO } from "date-fns";

interface ScheduleManagerModalProps {
  schedule: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleManagerModal({ schedule, isOpen, onClose }: ScheduleManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "mom" | "info">("attendance");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Data States
  const [participants, setParticipants] = useState<any[]>([]);
  const [momContent, setMomContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (isOpen && schedule) {
      loadData();
    }
  }, [isOpen, schedule]);

  const loadData = async () => {
    setLoading(true);
    const res = await getScheduleManagementData(schedule.id.toString()) as any;
    if (res.success) {
      setParticipants(res.data.attendance || []);
      setMomContent(res.data.mom?.content || "");
    }
    setLoading(false);
  };

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: "", role: "Engineer", is_present: true }]);
  };

  const handleUpdateParticipant = (index: number, fields: any) => {
    const next = [...participants];
    next[index] = { ...next[index], ...fields };
    setParticipants(next);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSaveAttendance = () => {
    startTransition(async () => {
      setSaveStatus("saving");
      const res = await updateAttendance(schedule.id.toString(), participants);
      if (res.success) setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    });
  };

  const handleSaveMoM = async () => {
    setSaveStatus("saving");
    const res = await updateMoM(schedule.id.toString(), momContent);
    if (res.success) setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                schedule.type === 'Corrective' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                schedule.type === 'Preventive' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {schedule.type} Management
              </span>
              {saveStatus !== 'idle' && (
                <span className={`text-[9px] font-bold uppercase ${saveStatus === 'saving' ? 'text-blue-500 animate-pulse' : 'text-emerald-500 flex items-center gap-1'}`}>
                  {saveStatus === 'saving' ? "Saving Changes..." : <><CheckCircle2 size={10}/> All changes saved</>}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-[#003366] tracking-tight">{schedule.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1"><Clock size={14}/> {format(parseISO(schedule.start_at.toString()), "HH:mm")} - {format(parseISO(schedule.end_at.toString()), "HH:mm")}</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {schedule.projects?.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-2xl shadow-sm transition-all hover:scale-105">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-8 bg-slate-50/50 border-b border-slate-100">
           <TabButton active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} label="Attendance" icon={<Users size={14}/>} />
           <TabButton active={activeTab === "mom"} onClick={() => setActiveTab("mom")} label="Minutes of Meeting" icon={<FileText size={14}/>} />
           <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} label="Job Details" icon={<Clock size={14}/>} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                <div className="w-10 h-10 border-4 border-t-[#00a1e4] border-slate-100 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest font-mono">Syncing Management Data...</p>
              </motion.div>
            ) : (
              activeTab === "attendance" ? (
                <motion.div key="attendance" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                    <div>
                      <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight">Meeting Presence List</h4>
                      <p className="text-[10px] font-medium text-blue-600 mt-1 uppercase">Track participants and roles for this activity.</p>
                    </div>
                    <button onClick={handleAddParticipant} className="px-4 py-2 bg-[#00a1e4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-blue-600 transition-all">
                      <Plus size={14}/> Add Participant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {participants.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center grayscale opacity-40 text-slate-300">
                        <Users size={40} />
                        <p className="text-xs font-bold mt-2 uppercase">No participants listed</p>
                      </div>
                    ) : (
                      participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl group">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.is_present ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                              <UserIcon size={20} />
                           </div>
                           <div className="flex-1 grid grid-cols-2 gap-4">
                              <input 
                                type="text" placeholder="Full Name" value={p.name} 
                                onChange={e => handleUpdateParticipant(i, { name: e.target.value })}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]"
                              />
                              <input 
                                type="text" placeholder="Role / Company" value={p.role} 
                                onChange={e => handleUpdateParticipant(i, { role: e.target.value })}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00a1e4]"
                              />
                           </div>
                           <div className="flex items-center gap-3">
                              <div 
                                onClick={() => handleUpdateParticipant(i, { is_present: !p.is_present })}
                                className={`w-12 h-7 rounded-full relative cursor-pointer transition-all ${p.is_present ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                 <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${p.is_present ? 'left-6' : 'left-1'}`} />
                              </div>
                              <button onClick={() => handleRemoveParticipant(i)} className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={16}/>
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleSaveAttendance} disabled={isPending}
                      className="px-8 py-3.5 bg-[#003366] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50"
                    >
                      <Save size={16}/> {isPending ? "Syncing..." : "Update Attendance"}
                    </button>
                  </div>
                </motion.div>
              ) : activeTab === "mom" ? (
                <motion.div key="mom" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight">Minutes of Meeting (Real-time)</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">Document highlights, findings, and follow-up activities.</p>
                    </div>
                    <button 
                      onClick={handleSaveMoM}
                      className="px-6 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
                    >
                      <Save size={14}/> Save Log
                    </button>
                  </div>
                  
                  <textarea 
                    value={momContent}
                    onChange={e => setMomContent(e.target.value)}
                    placeholder="Start documenting the meeting here...
- Discussion:
- Action Items:
- Next Steps:"
                    className="flex-1 min-h-[300px] w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all custom-scrollbar leading-relaxed"
                  />
                  
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center italic">
                    All updates are saved locally and synced to the database on save.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="info" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                         <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Job Description</h5>
                         <p className="text-sm font-bold text-slate-700 leading-relaxed">{schedule.description || "No description provided."}</p>
                      </div>
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                         <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-3">Assigned Personnel</h5>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                               <UserIcon size={20}/>
                            </div>
                            <div>
                               <p className="text-sm font-black text-[#003366]">{schedule.users?.name || "Unassigned"}</p>
                               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">{schedule.users?.company_name || "Internal Team"}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                         <h5 className="text-[10px] font-black uppercase text-[#00a1e4] tracking-widest mb-3">Linked Assets</h5>
                         {schedule.units ? (
                            <div className="flex flex-col gap-1">
                               <p className="text-sm font-black text-[#003366]">{schedule.units.tag_number}</p>
                               <p className="text-xs font-bold text-slate-500">{schedule.units.brand} - {schedule.units.model}</p>
                               <p className="text-[10px] font-black uppercase text-[#00a1e4] mt-2 bg-white/50 px-2 py-1 rounded w-max">{schedule.units.area} · {schedule.units.room_tenant}</p>
                            </div>
                         ) : (
                            <p className="text-xs font-bold text-slate-400">No specific unit linked.</p>
                         )}
                      </div>
                   </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative border-b-4 ${
        active ? 'text-[#00a1e4] border-[#00a1e4] bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}
